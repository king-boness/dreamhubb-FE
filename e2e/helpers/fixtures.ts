import fs from "fs";
import type { APIRequestContext, Page } from "@playwright/test";

export const LANGUAGE_STORAGE_KEY = "dreamhubb_language";

export type E2eUser = {
  id: number;
  email: string;
  username: string;
  token?: string;
};

export type E2eFixtures = {
  password: string;
  donor: E2eUser;
  donee: E2eUser;
  peer: E2eUser;
  posts: { dream: number; problem: number; idea: number };
  geo: { continent_id: number; country_id: number; city_id: number | null };
  contribution_id: number;
  database?: string;
};

const DEFAULT_FIXTURES_PATH = "/tmp/dreamhubb_e2e_fixtures.json";

export function loadE2eFixtures(): E2eFixtures {
  const path = process.env.E2E_FIXTURES_FILE || DEFAULT_FIXTURES_PATH;
  if (!fs.existsSync(path)) {
    throw new Error(
      `Missing E2E fixtures at ${path}. Run: DB_DATABASE=dreamhubb_e2e php artisan dreamhubb:e2e-prepare --force`
    );
  }
  const data = JSON.parse(fs.readFileSync(path, "utf8")) as E2eFixtures;
  if (data.database && data.database !== "dreamhubb_e2e") {
    throw new Error(`Fixture database guard failed: ${data.database}`);
  }
  return data;
}

export function apiBase(): string {
  return process.env.E2E_API_BASE || "http://127.0.0.1:8002/api";
}

/** Prefer minted fixture JWT to avoid auth throttle during dense suites. */
export async function loginApi(
  request: APIRequestContext,
  email: string,
  password: string,
  preferredToken?: string
): Promise<string> {
  if (preferredToken) return preferredToken;

  const res = await request.post(`${apiBase()}/login`, {
    data: { email, password },
    headers: { "Content-Type": "application/json", "Accept-Language": "en-US" }
  });
  if (res.status() === 429) {
    throw new Error("Login throttled (429). Re-run dreamhubb:e2e-prepare or mint JWTs into fixtures.");
  }
  if (!res.ok()) {
    throw new Error(`Login failed (${res.status()}): ${await res.text()}`);
  }
  const token = (await res.json())?.authorization?.token as string | undefined;
  if (!token) throw new Error("Login response missing JWT");
  return token;
}

export async function tokenFor(
  _request: APIRequestContext,
  fixtures: E2eFixtures,
  role: "donor" | "donee" | "peer"
): Promise<string> {
  // Re-read fixtures file so reminted JWTs are picked up without restarting the worker.
  const fresh = loadE2eFixtures();
  const user = fresh[role] || fixtures[role];
  // Prefer minted fixture JWT. Local JWT_TTL may be very short (1m in .env);
  // E2E BE should be started with JWT_TTL>=60. Avoid login fallback under throttle.
  if (!user.token) {
    throw new Error(
      `Missing ${role} JWT in fixtures. Re-run DB_DATABASE=dreamhubb_e2e php artisan dreamhubb:e2e-prepare --force`
    );
  }
  // Keep in-memory fixtures in sync for subsequent reads of email/ids.
  fixtures[role].token = user.token;
  return user.token;
}

/** Inject JWT + optional side/locale before first navigation. */
export async function seedAuthenticatedSession(
  page: Page,
  opts: {
    token: string;
    userId: number;
    side: "donor" | "donee";
    locale?: string;
  }
) {
  const locale = opts.locale || "en-US";
  await page.addInitScript(
    ([token, userId, side, langKey, localeValue]) => {
      localStorage.setItem("token", token);
      localStorage.setItem(langKey, localeValue);
      const prefKey = `preferences_store_${userId}`;
      localStorage.setItem(
        prefKey,
        JSON.stringify({
          currentSide: side,
          onboardingInitialSide: side,
          preferredPostType: null,
          preferredSubcategory: null,
          preferredFeedLocation: {
            continentId: null,
            countryId: null,
            cityId: null
          },
          lastUsedFeedFilters: null
        })
      );
    },
    [opts.token, opts.userId, opts.side, LANGUAGE_STORAGE_KEY, locale] as const
  );
}

export async function expectNoRawKeys(page: Page) {
  const { expect } = await import("@playwright/test");
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(
    /\b(common|auth|feed|legal|posts|profile|settings|onboarding|notifications)\.[a-zA-Z0-9_.]+\b/
  );
}
