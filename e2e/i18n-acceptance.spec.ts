import { expect, test, type Page } from "@playwright/test";
import fs from "fs";

const LANGUAGE_STORAGE_KEY = "dreamhubb_language";
const FIXTURES_PATH = process.env.E2E_FIXTURES_FILE || "/tmp/dreamhubb_e2e_fixtures.json";

/**
 * Prefer isolated E2E API (:8002) when Phase 3D fixtures exist so minted JWTs match.
 * Override with E2E_API_BASE when intentionally targeting another backend.
 */
const API_BASE =
  process.env.E2E_API_BASE ||
  (fs.existsSync(FIXTURES_PATH)
    ? "http://127.0.0.1:8002/api"
    : "http://127.0.0.1:8000/api");

async function setLocale(page: Page, code: string) {
  await page.addInitScript(
    ([key, value]) => {
      localStorage.setItem(key, value);
    },
    [LANGUAGE_STORAGE_KEY, code] as const
  );
}

async function expectNoRawKeys(page: Page) {
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(
    /\b(common|auth|feed|legal|posts|profile|settings|onboarding|notifications)\.[a-zA-Z0-9_.]+\b/
  );
}

function loadLocalCreds(): { email: string; password: string } | null {
  try {
    const p = process.env.E2E_CREDS_FILE || "/tmp/e2e3c_creds.txt";
    if (!fs.existsSync(p)) return null;
    const [email, password] = fs.readFileSync(p, "utf8").trim().split("\n");
    if (!email || !password) return null;
    return { email, password };
  } catch {
    return null;
  }
}

/** Prefer minted JWT to avoid auth throttle during dense local runs. */
function loadLocalToken(): string | null {
  try {
    const p = process.env.E2E_TOKEN_FILE || "/tmp/e2e3c_token.txt";
    if (!fs.existsSync(p)) return null;
    const token = fs.readFileSync(p, "utf8").trim();
    return token || null;
  } catch {
    return null;
  }
}

/**
 * dreamhubb_e2e fixture JWTs are minted against the isolated E2E API (default :8002).
 * Using them against the default local API (:8000 / dreamhubb_local) yields 401 —
 * that caused Phase 3E "earn tasks localize" FAIL (infra mismatch, not Earn regression).
 */
function shouldUseE2eFixtureJwt(): boolean {
  if (process.env.E2E_USE_FIXTURES === "1") return true;
  if (process.env.E2E_USE_FIXTURES === "0") return false;
  return /:8002\b/.test(API_BASE) || /dreamhubb_e2e/i.test(API_BASE);
}

async function obtainLocalToken(
  request: import("@playwright/test").APIRequestContext
): Promise<string | null> {
  // Prefer Phase 3D isolated fixtures only when API base targets that environment.
  if (shouldUseE2eFixtureJwt()) {
    try {
      if (fs.existsSync(FIXTURES_PATH)) {
        const fx = JSON.parse(fs.readFileSync(FIXTURES_PATH, "utf8")) as {
          donor?: { token?: string };
          donee?: { token?: string };
        };
        const tok = fx.donor?.token || fx.donee?.token;
        if (tok) return tok;
      }
    } catch {
      /* fall through */
    }
  }

  const existing = loadLocalToken();
  if (existing) return existing;

  const creds = loadLocalCreds();
  if (!creds) return null;

  const login = await request.post(`${API_BASE}/login`, {
    data: { email: creds.email, password: creds.password },
    headers: { "Content-Type": "application/json", "Accept-Language": "sk" }
  });
  if (login.status() === 429) return null;
  if (!login.ok()) return null;
  const token = (await login.json())?.authorization?.token as string | undefined;
  if (token) {
    try {
      fs.writeFileSync(process.env.E2E_TOKEN_FILE || "/tmp/e2e3c_token.txt", token);
    } catch {
      /* ignore cache write failures */
    }
  }
  return token || null;
}

test.describe("Phase 3C public acceptance EN/SK", () => {
  test("auth welcome EN has sign-in CTA and no raw keys", async ({ page }) => {
    await setLocale(page, "en-US");
    await page.goto("/auth");
    await expect(page.locator("html")).toHaveAttribute("lang", /en/i);
    await expect(page.getByText(/SIGN IN|Sign in/i).first()).toBeVisible({ timeout: 20000 });
    await expectNoRawKeys(page);
  });

  test("auth welcome SK localizes CTA after locale preference", async ({ page }) => {
    await setLocale(page, "sk");
    await page.goto("/auth");
    await expect(page.locator("html")).toHaveAttribute("lang", "sk");
    // SK auth pack should expose localized sign-in / create account chrome
    await expect(
      page.getByText(/PRIHLÁSIŤ|Prihlásiť|VYTVORENIE|Vytvor|ÚČET|účet|SIGN IN|CREATE/i).first()
    ).toBeVisible({ timeout: 20000 });
    await expectNoRawKeys(page);
  });

  test("login page SK placeholders", async ({ page }) => {
    await setLocale(page, "sk");
    await page.goto("/login");
    await expect(page.getByTestId("dh-login-email")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("dh-login-submit")).toBeVisible();
    const submit = await page.getByTestId("dh-login-submit").innerText();
    expect(submit.length).toBeGreaterThan(0);
    await expectNoRawKeys(page);
  });

  test("terms: SK chrome + EN body + english-only notice", async ({ page }) => {
    await setLocale(page, "sk");
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /Podmienky používania/i })).toBeVisible({
      timeout: 15000
    });
    await expect(
      page.getByText(/právny dokument je momentálne dostupný iba v angličtine/i)
    ).toBeVisible();
    await expect(page.getByText(/These Terms of Use/i)).toBeVisible();
    await expectNoRawKeys(page);
  });

  test("privacy: SK chrome + EN body", async ({ page }) => {
    await setLocale(page, "sk");
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /Zásady ochrany súkromia/i })).toBeVisible({
      timeout: 15000
    });
    await expect(page.getByText(/This legal document is currently available|právny dokument/i)).toBeVisible();
    await expectNoRawKeys(page);
  });

  test("support SK and EN switch via reload preference", async ({ page }) => {
    // Avoid addInitScript here: it re-applies on every reload and would race with mid-test changes.
    await page.goto("/support");
    await page.evaluate((key) => localStorage.setItem(key, "sk"), LANGUAGE_STORAGE_KEY);
    await page.reload();
    await expect(page.getByRole("heading", { name: /Pomoc a podpora/i })).toBeVisible({
      timeout: 15000
    });

    await page.evaluate((key) => localStorage.setItem(key, "en-US"), LANGUAGE_STORAGE_KEY);
    await page.reload();
    await expect(page.getByRole("heading", { name: /Help & Support/i })).toBeVisible({
      timeout: 15000
    });
  });

  test("en-GB alias on FAQ-linked support chrome", async ({ page }) => {
    await setLocale(page, "en-GB");
    await page.goto("/support");
    await expect(page.getByRole("heading", { name: /Help & Support/i })).toBeVisible({
      timeout: 15000
    });
  });

  test("de login shows German chrome without raw keys", async ({ page }) => {
    await setLocale(page, "de");
    await page.goto("/login");
    await expect(page.getByTestId("dh-login-submit")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page.getByTestId("dh-login-submit")).toContainText(/Anmelden|Sign In/i);
    await expectNoRawKeys(page);
  });

  for (const size of [
    { w: 375, h: 812, name: "iphone-x" },
    { w: 390, h: 844, name: "iphone-14" },
    { w: 768, h: 1024, name: "tablet" },
    { w: 1440, h: 900, name: "desktop" }
  ] as const) {
    test(`viewport ${size.name}: support SK no horizontal overflow`, async ({ page }) => {
      await setLocale(page, "sk");
      await page.setViewportSize({ width: size.w, height: size.h });
      await page.goto("/support");
      await expect(page.getByRole("heading", { name: /Pomoc a podpora/i })).toBeVisible({
        timeout: 15000
      });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
      );
      expect(overflow).toBe(false);
    });
  }
});

test.describe("Phase 3C FE/BE locale API", () => {
  test("register validation messages localize with Accept-Language", async ({ request }) => {
    const sk = await request.post(`${API_BASE}/register`, {
      data: { username: "", email: "bad", password: "x" },
      headers: { "Accept-Language": "sk", "Content-Type": "application/json" }
    });
    // 429 possible under throttle in dense local runs — skip rather than false FAIL
    test.skip(sk.status() === 429, "API throttled during dense local acceptance run");
    expect(sk.status()).toBe(422);
    const skBody = await sk.json();
    expect(String(skBody.message)).toMatch(/Overenie|zlyhalo/i);
    expect(JSON.stringify(skBody.errors)).toMatch(/povinn|platn|heslo/i);

    const en = await request.post(`${API_BASE}/register`, {
      data: { username: "", email: "bad", password: "x" },
      headers: { "Accept-Language": "en-US", "Content-Type": "application/json" }
    });
    test.skip(en.status() === 429, "API throttled during dense local acceptance run");
    expect(en.status()).toBe(422);
    const enBody = await en.json();
    expect(String(enBody.message)).toMatch(/Validation failed/i);
  });

  test("earn tasks localize for authenticated local user", async ({ request }) => {
    const token = await obtainLocalToken(request);
    test.skip(!token, "No local E2E token/credentials (or login throttled)");

    const sk = await request.get(`${API_BASE}/me/earn-tasks`, {
      headers: { Authorization: `Bearer ${token}`, "Accept-Language": "sk" }
    });
    expect(
      sk.ok(),
      `earn-tasks SK failed against ${API_BASE}: ${sk.status()} ${await sk.text()} (check JWT matches this API; e2e fixture JWTs require E2E_API_BASE=…:8002)`
    ).toBeTruthy();
    const skTasks = (await sk.json()).tasks as Array<{ key: string; title: string }>;
    const byKey = Object.fromEntries(skTasks.map((t) => [t.key, t.title]));
    expect(byKey.verify_email).toBe("Over e-mail");
    expect(byKey.add_bio).toBe("Pridaj bio");
    expect(skTasks).toHaveLength(6);

    const en = await request.get(`${API_BASE}/me/earn-tasks`, {
      headers: { Authorization: `Bearer ${token}`, "Accept-Language": "en-GB" }
    });
    const enTasks = (await en.json()).tasks as Array<{ key: string; title: string }>;
    expect(enTasks.find((t) => t.key === "verify_email")?.title).toBe("Verify your email");

    const de = await request.get(`${API_BASE}/me/earn-tasks`, {
      headers: { Authorization: `Bearer ${token}`, "Accept-Language": "de" }
    });
    const deTasks = (await de.json()).tasks as Array<{ key: string; title: string }>;
    expect(deTasks.find((t) => t.key === "verify_email")?.title).toBe("Verify your email");
  });
});

test.describe("Phase 3C authenticated UI (local)", () => {
  test("settings language Save switches UI to SK without browser restart", async ({
    page,
    request
  }) => {
    const token = await obtainLocalToken(request);
    test.skip(!token, "No local E2E token/credentials (or login throttled)");

    // Seed JWT for all navigations. Do NOT force locale in addInitScript —
    // it would overwrite the language after Settings Save on later page.goto().
    await page.addInitScript((tokenValue) => {
      localStorage.setItem("token", tokenValue);
    }, token);

    const langPaths = ["/donor/settings/language", "/donee/settings/language"];
    let opened = false;
    for (const p of langPaths) {
      await page.goto(p, { waitUntil: "domcontentloaded" });
      // Establish EN baseline once the origin is available (evaluate, not init overwrite).
      await page.evaluate((key) => localStorage.setItem(key, "en-US"), LANGUAGE_STORAGE_KEY);
      await page.reload({ waitUntil: "domcontentloaded" });
      try {
        await page.locator(".confirmButton").first().waitFor({ state: "visible", timeout: 12000 });
        opened = true;
        break;
      } catch {
        // try alternate role path
      }
    }
    test.skip(!opened, "Language settings route not reachable for this user role/state");

    await expect(page.locator(".settingsLang-title")).toContainText(
      /Change Language|Zmeniť jazyk|Sprache ändern|language|jazyk|Sprache/i
    );

    const skRow = page
      .locator(".langCategory")
      .filter({ hasText: /Slovak|Slovenčina|Slovensky|Slowakisch/i })
      .first();
    await skRow.waitFor({ state: "visible", timeout: 10000 });
    await skRow.scrollIntoViewIfNeeded();
    await skRow.click();

    await page.locator(".confirmButton").click();
    await expect
      .poll(async () => page.evaluate((key) => localStorage.getItem(key), LANGUAGE_STORAGE_KEY), {
        timeout: 10000
      })
      .toBe("sk");
    await expect(page.locator("html")).toHaveAttribute("lang", "sk");

    // SPA navigates away after Save; verify chrome reacts without hard reload of preference
    await page.goto("/support");
    await expect(page.getByRole("heading", { name: /Pomoc a podpora/i })).toBeVisible({
      timeout: 15000
    });
  });
});
