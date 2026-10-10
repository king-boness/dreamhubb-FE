/**
 * Phase 4E.2 — authenticated Portuguese (locale=pt) feed QA against dreamhubb_e2e.
 */
import { expect, test, type Page } from "@playwright/test";
import {
  LANGUAGE_STORAGE_KEY,
  expectNoRawKeys,
  loadE2eFixtures,
  seedAuthenticatedSession,
  tokenFor
} from "./helpers/fixtures";

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 }
] as const;

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  expect(overflow).toBe(false);
}

async function setPreferredLocaleApi(
  request: import("@playwright/test").APIRequestContext,
  token: string,
  locale: string
) {
  const api = process.env.E2E_API_BASE || "http://127.0.0.1:8002/api";
  const res = await request.put(`${api}/user/update`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Language": locale
    },
    data: { preferred_locale: locale }
  });
  expect(res.ok(), `preferred_locale update failed: ${res.status()}`).toBeTruthy();
}

test.describe("Phase 4E.2 authenticated PT feed", () => {
  test("donor PT feed: search, filters, locale switch, html lang, viewports", async ({
    page,
    request
  }) => {
    const fixtures = loadE2eFixtures();
    const token = await tokenFor(request, fixtures, "donor");
    await setPreferredLocaleApi(request, token, "pt");
    await seedAuthenticatedSession(page, {
      token,
      userId: fixtures.donor.id,
      side: "donor",
      locale: "pt"
    });

    await page.goto("/donor/posts", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="dh-feed-container"]')).toBeVisible({
      timeout: 30000
    });
    await expect
      .poll(async () => page.locator("html").getAttribute("lang"), { timeout: 10000 })
      .toBe("pt");
    await expectNoRawKeys(page);

    for (const [id, labelRe] of [
      [fixtures.posts.dream, /\bsonho\b|\bdream\b/i],
      [fixtures.posts.problem, /\bproblema\b|\bproblem\b/i],
      [fixtures.posts.idea, /\bideia\b|\bidea\b/i]
    ] as const) {
      await page.goto(`/donor/post-detail/${id}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator('[data-testid="dh-post-detail-container"]')).toBeVisible({
        timeout: 20000
      });
      await expectNoRawKeys(page);
      expect(await page.locator("body").innerText()).toMatch(labelRe);
    }

    await page.goto("/donor/search", { waitUntil: "domcontentloaded" });
    await expect(page.getByPlaceholder(/Pesquisar tudo/i)).toBeVisible({ timeout: 15000 });

    await page.goto("/donor/filters", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    expect(await page.locator("body").innerText()).toMatch(
      /escolher publicações|publicações|categoria/i
    );

    await setPreferredLocaleApi(request, token, "sk");
    await page.evaluate((k) => localStorage.setItem(k, "sk"), LANGUAGE_STORAGE_KEY);
    await page.goto("/donor/search", { waitUntil: "domcontentloaded" });
    await expect
      .poll(async () => page.locator("html").getAttribute("lang"), { timeout: 15000 })
      .toBe("sk");

    await setPreferredLocaleApi(request, token, "pt");
    await page.evaluate((k) => localStorage.setItem(k, "pt"), LANGUAGE_STORAGE_KEY);
    await page.goto("/donor/search", { waitUntil: "domcontentloaded" });
    await expect
      .poll(async () => page.locator("html").getAttribute("lang"), { timeout: 15000 })
      .toBe("pt");
    await expect(page.getByPlaceholder(/Pesquisar tudo/i)).toBeVisible({ timeout: 15000 });

    await page.goto("/donor/posts", { waitUntil: "domcontentloaded" });
    for (const vp of VIEWPORTS) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(250);
      await assertNoHorizontalOverflow(page);
    }
  });

  test("donee PT: feed + language chrome", async ({ page, request }) => {
    const fixtures = loadE2eFixtures();
    const token = await tokenFor(request, fixtures, "donee");
    await setPreferredLocaleApi(request, token, "pt");
    await seedAuthenticatedSession(page, {
      token,
      userId: fixtures.donee.id,
      side: "donee",
      locale: "pt"
    });
    await page.goto("/donee/posts", { waitUntil: "domcontentloaded" });
    await expect
      .poll(async () => page.locator("html").getAttribute("lang"), { timeout: 10000 })
      .toBe("pt");
    await expectNoRawKeys(page);
    await page.goto("/donee/settings/language", { waitUntil: "domcontentloaded" }).catch(async () => {
      await page.goto("/donor/settings/language", { waitUntil: "domcontentloaded" });
    });
    await page.waitForTimeout(400);
    expect(await page.locator("body").innerText()).toMatch(/idioma|Language|Jazyk/i);
    await expectNoRawKeys(page);
  });
});
