/**
 * Phase 4B.2 — authenticated German feed QA against isolated dreamhubb_e2e.
 *
 * Requires:
 *   FE http://127.0.0.1:9001 with VITE_API_BASE=http://127.0.0.1:8002/api
 *   BE http://127.0.0.1:8002 DB_DATABASE=dreamhubb_e2e
 *   Fixtures /tmp/dreamhubb_e2e_fixtures.json
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
  { width: 375, height: 812, name: "mobile" },
  { width: 390, height: 844, name: "iphone" },
  { width: 768, height: 1024, name: "tablet" },
  { width: 1440, height: 900, name: "desktop" }
] as const;

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 1;
  });
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

test.describe("Phase 4B.2 authenticated DE feed", () => {
  test("donor DE feed: types, search chrome, locale switch, html lang, viewports", async ({
    page,
    request
  }) => {
    const fixtures = loadE2eFixtures();
    expect(fixtures.database).toBe("dreamhubb_e2e");

    const token = await tokenFor(request, fixtures, "donor");
    await setPreferredLocaleApi(request, token, "de");

    await seedAuthenticatedSession(page, {
      token,
      userId: fixtures.donor.id,
      side: "donor",
      locale: "de"
    });

    await page.goto("/donor/posts", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="dh-feed-container"]')).toBeVisible({
      timeout: 30000
    });

    // HTML lang + storage
    await expect
      .poll(async () => page.locator("html").getAttribute("lang"), { timeout: 10000 })
      .toBe("de");
    await expect
      .poll(async () => page.evaluate((k) => localStorage.getItem(k), LANGUAGE_STORAGE_KEY))
      .toBe("de");

    await expectNoRawKeys(page);

    // Seeded post types visible (titles may be EN UGC)
    await expect(
      page.getByText(/E2E Idea Community Library|E2E Dream|E2E Problem/i).first()
    ).toBeVisible({
      timeout: 20000
    });

    // Open dream / problem / idea details — postType labels
    for (const [id, labelRe] of [
      [fixtures.posts.dream, /\btraum\b|\bdream\b/i],
      [fixtures.posts.problem, /\bproblem\b/i],
      [fixtures.posts.idea, /\bidee\b|\bidea\b/i]
    ] as const) {
      await page.goto(`/donor/post-detail/${id}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator('[data-testid="dh-post-detail-container"]')).toBeVisible({
        timeout: 20000
      });
      await expectNoRawKeys(page);
      const detail = await page.locator("body").innerText();
      expect(detail).toMatch(labelRe);
    }

    // Search page — feed.searchPlaceholder
    await page.goto("/donor/search", { waitUntil: "domcontentloaded" });
    await expect(page.getByPlaceholder(/Alles durchsuchen/i)).toBeVisible({
      timeout: 15000
    });
    await expect(page.getByText(/Gib ein Stichwort|Stichwort/i).first()).toBeVisible({
      timeout: 10000
    });
    await expectNoRawKeys(page);

    // Filters wizard step titles (filterStep* = select intent, DE wählen)
    await page.goto("/donor/filters", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const filterText = await page.locator("body").innerText();
    expect(filterText).toMatch(/Beiträge wählen/i);
    await expectNoRawKeys(page);

    // de → sk (API preferred_locale + storage; reload applies syncLocaleFromUser)
    await setPreferredLocaleApi(request, token, "sk");
    await page.evaluate((k) => localStorage.setItem(k, "sk"), LANGUAGE_STORAGE_KEY);
    await page.goto("/donor/search", { waitUntil: "domcontentloaded" });
    await expect
      .poll(async () => page.locator("html").getAttribute("lang"), { timeout: 15000 })
      .toBe("sk");
    await expect(page.getByPlaceholder(/Hľadať čokoľvek/i)).toBeVisible({
      timeout: 15000
    });
    await expectNoRawKeys(page);

    // sk → de
    await setPreferredLocaleApi(request, token, "de");
    await page.evaluate((k) => localStorage.setItem(k, "de"), LANGUAGE_STORAGE_KEY);
    await page.goto("/donor/search", { waitUntil: "domcontentloaded" });
    await expect
      .poll(async () => page.locator("html").getAttribute("lang"), { timeout: 15000 })
      .toBe("de");
    await expect(page.getByPlaceholder(/Alles durchsuchen/i)).toBeVisible({ timeout: 15000 });
    await expectNoRawKeys(page);

    // Return to feed for viewport checks
    await page.goto("/donor/posts", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="dh-feed-container"]')).toBeVisible({
      timeout: 30000
    });

    // Viewports
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(300);
      await assertNoHorizontalOverflow(page);
      await expect(page.locator('[data-testid="dh-feed-container"]')).toBeVisible();
    }
  });
});
