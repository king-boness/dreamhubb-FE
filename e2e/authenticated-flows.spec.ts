import { expect, test, type Page } from "@playwright/test";
import {
  apiBase,
  expectNoRawKeys,
  LANGUAGE_STORAGE_KEY,
  loadE2eFixtures,
  seedAuthenticatedSession,
  tokenFor,
  type E2eFixtures
} from "./helpers/fixtures";

const fixtures: E2eFixtures = loadE2eFixtures();

/** Local e2e: clear cache so dense API calls do not trip auth throttle (limits stay enabled). */
test.beforeEach(() => {
  if (process.env.E2E_CLEAR_CACHE === "0") return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execSync } = require("child_process") as typeof import("child_process");
    // Recreate file-cache parents after clear (Laravel FileStore race).
    execSync(
      "php artisan cache:clear && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs",
      {
        cwd: process.env.E2E_BE_ROOT || "/Users/husky/projects/dreamhubb-BE",
        stdio: "ignore",
        env: { ...process.env, DB_DATABASE: "dreamhubb_e2e" }
      }
    );
  } catch {
    // ignore
  }
});

async function openDonorFeed(page: Page) {
  await page.goto("/donor/posts", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-testid="dh-feed-container"]')).toBeVisible({
    timeout: 20000
  });
}

async function openPostDetail(page: Page, postId: number) {
  await page.goto(`/donor/post-detail/${postId}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-testid="dh-post-detail-container"]')).toBeVisible({
    timeout: 25000
  });
}

async function openEarnTab(page: Page) {
  // Earn UI is a tab inside tokenshop / profile chrome (not /donor/tokens onboarding).
  await page.goto("/donor/tokenshop", { waitUntil: "domcontentloaded" });
  // Stay authenticated — if auth bounced to login, fail fast with a clear signal.
  if (page.url().includes("/login") || page.url().includes("/auth")) {
    throw new Error(`Lost auth before Earn tab (url=${page.url()})`);
  }
  const earnTab = page.getByRole("tab", { name: /earn|získaj|ziskaj/i }).first();
  await earnTab.waitFor({ state: "visible", timeout: 20000 });
  await earnTab.click();
  await expect(page.locator(".earn-page, .taskTitle").first()).toBeVisible({ timeout: 20000 });
}

test.describe("Phase 3D DONOR authenticated flows", () => {
  test("login form visible; JWT session loads seeded feed", async ({ browser, request }) => {
    // A) Login form chrome (isolated context; avoid auth throttle on UI submit).
    const formCtx = await browser.newContext();
    const formPage = await formCtx.newPage();
    await formPage.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(formPage.getByPlaceholder(/email/i)).toBeVisible({ timeout: 20000 });
    await expect(formPage.locator('[data-testid="dh-login-submit"]')).toBeVisible();
    await expectNoRawKeys(formPage);
    await formCtx.close();

    // B) Authenticated feed via fixture JWT (isolated e2e DB).
    const token = await tokenFor(request, fixtures, "donor");
    const authCtx = await browser.newContext();
    const page = await authCtx.newPage();
    await seedAuthenticatedSession(page, {
      token,
      userId: fixtures.donor.id,
      side: "donor",
      locale: "en-US"
    });
    await openDonorFeed(page);
    await expect(page.getByText(/E2E Dream Ocean Cleanup/i).first()).toBeVisible({
      timeout: 20000
    });
    await expect(page.getByText(/E2E Problem Housing Gap/i).first()).toBeVisible();
    await expect(page.getByText(/E2E Idea Community Library/i).first()).toBeVisible();
    await expectNoRawKeys(page);
    await authCtx.close();
  });

  test("open Dream / Problem / Idea details + comments chrome", async ({ page, request }) => {
    const token = await tokenFor(request, fixtures, "donor");
    await seedAuthenticatedSession(page, {
      token,
      userId: fixtures.donor.id,
      side: "donor",
      locale: "en-US"
    });

    for (const [id, title] of [
      [fixtures.posts.dream, /E2E Dream Ocean Cleanup/i],
      [fixtures.posts.problem, /E2E Problem Housing Gap/i],
      [fixtures.posts.idea, /E2E Idea Community Library/i]
    ] as const) {
      await openPostDetail(page, id);
      await expect(page.getByText(title).first()).toBeVisible({ timeout: 15000 });
      await expectNoRawKeys(page);
    }

    await openPostDetail(page, fixtures.posts.dream);
    const commentBtn = page.locator(".postDetail-commentBtn").first();
    if (await commentBtn.isVisible().catch(() => false)) {
      await commentBtn.click();
    }
    await expect(page.getByText(/volunteer weekends|I can volunteer/i).first()).toBeVisible({
      timeout: 20000
    });
  });

  test("search / filters / categories navigation", async ({ page, request }) => {
    const token = await tokenFor(request, fixtures, "donor");
    await seedAuthenticatedSession(page, {
      token,
      userId: fixtures.donor.id,
      side: "donor",
      locale: "en-US"
    });

    await page.goto("/donor/search", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expectNoRawKeys(page);

    await page.goto("/donor/filters", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    const filterText = await page.locator("body").innerText();
    expect(filterText).toMatch(/dream|problem|idea|filter|category|subcategor/i);
    await expectNoRawKeys(page);
  });

  test("notifications, earn, tokens, settings, help EN", async ({ page, request }) => {
    const token = await tokenFor(request, fixtures, "donor");
    await seedAuthenticatedSession(page, {
      token,
      userId: fixtures.donor.id,
      side: "donor",
      locale: "en-US"
    });

    await page.goto("/donor/notifications", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="dh-notifications-list"]')).toBeVisible({
      timeout: 20000
    });
    await expect(page.getByText(/Legacy English title|New reply|reply/i).first()).toBeVisible();

    await openEarnTab(page);
    // verify_email is shown in the free-tokens banner CTA; other tasks use .taskTitle
    await expect(
      page.getByText(/VERIFY EMAIL|Verify your email|Over e-mail|Overiť e-mail|Add bio|Pridaj bio/i).first()
    ).toBeVisible({ timeout: 20000 });
    await expect(page.locator(".taskTitle").first()).toBeVisible();

    await page.goto("/donor/tokenshop", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expectNoRawKeys(page);

    await page.goto("/donor/myprofile", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(fixtures.donor.username).first()).toBeVisible({
      timeout: 15000
    });

    await page.goto(`/donor/user/${fixtures.donee.id}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(fixtures.donee.username).first()).toBeVisible({
      timeout: 15000
    });

    await page.goto("/donor/settings", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText(/Account Settings|Nastavenia účtu|Language|Jazyk/i).first()
    ).toBeVisible({ timeout: 15000 });

    await page.goto("/support", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Help & Support|Pomoc a podpora/i })
    ).toBeVisible();
  });

  test("language Save en-US → sk without restart + Accept-Language Earn", async ({
    page,
    request
  }) => {
    const token = await tokenFor(request, fixtures, "donor");
    await seedAuthenticatedSession(page, {
      token,
      userId: fixtures.donor.id,
      side: "donor",
      locale: "en-US"
    });

    // Reset account preference so language names render from en-US catalog ("Slovak").
    await request.put(`${apiBase()}/user/update`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Language": "en-US"
      },
      data: { preferred_locale: "en-US" }
    });

    await page.goto("/donor/settings/language", { waitUntil: "domcontentloaded" });
    await page.locator(".confirmButton").first().waitFor({ state: "visible", timeout: 15000 });
    // Prefer code-based selection; fall back to localized autonym/exonym labels.
    let skRow = page.locator('.langCategory').filter({ has: page.locator('input[value="sk"]') });
    if ((await skRow.count()) === 0) {
      skRow = page
        .locator(".langCategory")
        .filter({ hasText: /Slovak|Slovenčina|Slovensky|Slowakisch/i });
    }
    await skRow.first().scrollIntoViewIfNeeded();
    await skRow.first().click();
    await page.locator(".confirmButton").click();
    // applyUiLocale writes storage before delayed router.back(); tolerate mid-navigation evaluate.
    await expect
      .poll(
        async () => {
          try {
            return await page.evaluate((k) => localStorage.getItem(k), LANGUAGE_STORAGE_KEY);
          } catch {
            return null;
          }
        },
        { timeout: 15000 }
      )
      .toBe("sk");
    await expect
      .poll(async () => page.locator("html").getAttribute("lang"), { timeout: 10000 })
      .toBe("sk");

    // Re-assert session token survived Save/back navigation.
    await expect
      .poll(
        async () => {
          try {
            return await page.evaluate(() => !!localStorage.getItem("token"));
          } catch {
            return false;
          }
        },
        { timeout: 10000 }
      )
      .toBeTruthy();

    await openEarnTab(page);
    await expect(page.locator(".taskTitle").first()).toBeVisible({ timeout: 20000 });
    const earnUi = await page.locator(".earn-page, .task-earn").first().innerText();
    expect(earnUi.length).toBeGreaterThan(10);
    await expectNoRawKeys(page);

    const earn = await request.get(`${apiBase()}/me/earn-tasks`, {
      headers: { Authorization: `Bearer ${token}`, "Accept-Language": "sk" }
    });
    expect(earn.ok()).toBeTruthy();
    const tasks = (await earn.json()).tasks as Array<{ key: string; title: string }>;
    expect(tasks.find((t) => t.key === "verify_email")?.title).toBe("Over e-mail");
    expect(tasks.find((t) => t.key === "add_bio")?.title).toBe("Pridaj bio");

    await page.goto("/donor/settings/language", { waitUntil: "domcontentloaded" });
    const enRow = page
      .locator(".langCategory")
      .filter({ hasText: /English \(US\)|Angličtina \(US\)/i })
      .first();
    await enRow.scrollIntoViewIfNeeded();
    await enRow.click();
    await page.locator(".confirmButton").click();
    await expect
      .poll(
        async () => {
          try {
            return await page.evaluate((k) => localStorage.getItem(k), LANGUAGE_STORAGE_KEY);
          } catch {
            return null;
          }
        },
        { timeout: 15000 }
      )
      .toBe("en-US");
  });
});

test.describe("Phase 3D DONEE authenticated flows", () => {
  test("donee feed/profile/tokens + seeded posts visible", async ({ page, request }) => {
    const token = await tokenFor(request, fixtures, "donee");
    await seedAuthenticatedSession(page, {
      token,
      userId: fixtures.donee.id,
      side: "donee",
      locale: "en-US"
    });

    await page.goto("/donee/posts", { waitUntil: "domcontentloaded" });
    // Donee home may render chrome before feed cards; wait for seeded content or post chrome.
    await expect
      .poll(async () => page.locator("body").innerText(), { timeout: 25000 })
      .toMatch(/E2E Dream Ocean Cleanup|E2E Problem|E2E Idea|Dream|Problem|Idea|posts|Príspev/i);
    await expectNoRawKeys(page);

    await page.goto("/donee/myprofile", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(fixtures.donee.username).first()).toBeVisible({
      timeout: 15000
    });

    await page.goto("/donee/tokens", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expectNoRawKeys(page);

    await page.goto("/donee/notifications", { waitUntil: "domcontentloaded" });
    await expect(
      page.locator('[data-testid="dh-notifications-list"], [data-testid="dh-notifications-empty"]')
    ).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/New Comment|Legacy|Comment|Koment/i).first()).toBeVisible();
  });

  test("donee create Dream via API write on isolated DB", async ({ page, request }) => {
    const token = await tokenFor(request, fixtures, "donee");
    await seedAuthenticatedSession(page, {
      token,
      userId: fixtures.donee.id,
      side: "donee",
      locale: "en-US"
    });

    // Multi-step UI creation is covered by route smoke; deterministic write uses API on e2e DB.
    await page.goto("/donee/postCreation/category", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expectNoRawKeys(page);

    const res = await request.post(`${apiBase()}/post-create`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        title: "E2E Created Dream Via API",
        description: "Created only inside dreamhubb_e2e isolated database.",
        category: "dream",
        subcategory: "other",
        tokens: "3"
      }
    });
    expect(res.ok(), await res.text()).toBeTruthy();
    const json = await res.json();
    expect(json.status).toBe("success");
    const newId = Number(json.post_id);
    expect(newId).toBeGreaterThan(0);

    const detail = await request.get(`${apiBase()}/posts/${newId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(detail.ok(), await detail.text()).toBeTruthy();
    expect(JSON.stringify(await detail.json())).toMatch(/E2E Created Dream Via API/);
  });

  test("donee SK locale chrome on settings + notifications mapping", async ({ page, request }) => {
    const token = await tokenFor(request, fixtures, "donee");

    // Account preferred_locale is source of truth after auth boot (Phase 3E).
    // Persist sk on the isolated donee account so syncLocaleFromUser does not
    // reset seeded localStorage sk → en-US when preferred_locale is null.
    const saveLocale = await request.put(`${apiBase()}/user/update`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Language": "sk"
      },
      data: { preferred_locale: "sk" }
    });
    expect(saveLocale.ok()).toBeTruthy();

    await seedAuthenticatedSession(page, {
      token,
      userId: fixtures.donee.id,
      side: "donee",
      locale: "sk"
    });

    await page.goto("/donee/settings", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Nastavenia|Jazyk|Účet/i).first()).toBeVisible({
      timeout: 15000
    });
    await expect(page.locator("html")).toHaveAttribute("lang", "sk");
    await expectNoRawKeys(page);

    await page.goto("/donee/notifications", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expectNoRawKeys(page);
  });
});

test.describe("Phase 3D help flow + locale extras", () => {
  test("donor can open help action on donee dream (localized CTA)", async ({ page, request }) => {
    const token = await tokenFor(request, fixtures, "donor");
    await seedAuthenticatedSession(page, {
      token,
      userId: fixtures.donor.id,
      side: "donor",
      locale: "sk"
    });

    await openPostDetail(page, fixtures.posts.dream);
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/volunteer weekends|pomôc|help|prispie|contribute|koment/i);
    await expectNoRawKeys(page);

    const res = await request.post(`${apiBase()}/posts/${fixtures.posts.dream}/contributions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Language": "sk"
      },
      data: {
        contribution_type: "help",
        message: "E2E second help offer from donor in Slovak session.",
        return_message: "",
        is_private: false
      }
    });
    expect(res.ok(), await res.text()).toBeTruthy();
    const created = await res.json();
    expect(created.status).toBe("success");
    expect(String(created.contribution?.message || "")).toMatch(/E2E second help offer/i);

    // UI: help/contribute chrome + prior seeded comment remain visible after write
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText(/CONTRIBUTE|PRISPIE|POMÔC|Help|Pomoc/i).first()).toBeVisible({
      timeout: 15000
    });
    const commentBtn = page.locator(".postDetail-commentBtn").first();
    if (await commentBtn.isVisible().catch(() => false)) {
      await commentBtn.click();
    }
    await expect(page.getByText(/volunteer weekends|I can volunteer/i).first()).toBeVisible({
      timeout: 20000
    });
  });

  test("en-GB + de Accept-Language earn fallback", async ({ request }) => {
    const token = await tokenFor(request, fixtures, "donor");
    for (const [al, title] of [
      ["en-GB", "Verify your email"],
      ["de", "Verify your email"],
      ["sk", "Over e-mail"]
    ] as const) {
      const res = await request.get(`${apiBase()}/me/earn-tasks`, {
        headers: { Authorization: `Bearer ${token}`, "Accept-Language": al }
      });
      expect(res.ok()).toBeTruthy();
      const tasks = (await res.json()).tasks as Array<{ key: string; title: string }>;
      expect(tasks.find((t) => t.key === "verify_email")?.title).toBe(title);
    }
  });

  test("viewport SK donor feed no horizontal overflow", async ({ page, request }) => {
    const token = await tokenFor(request, fixtures, "donor");
    await seedAuthenticatedSession(page, {
      token,
      userId: fixtures.donor.id,
      side: "donor",
      locale: "sk"
    });

    for (const size of [
      { w: 375, h: 812 },
      { w: 390, h: 844 },
      { w: 768, h: 1024 },
      { w: 1440, h: 900 }
    ]) {
      await page.setViewportSize({ width: size.w, height: size.h });
      await openDonorFeed(page);
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > doc.clientWidth + 2;
      });
      expect(overflow, `overflow at ${size.w}x${size.h}`).toBeFalsy();
    }
  });
});

test.describe("Phase 3D legal routes regression", () => {
  test("terms/privacy direct + trailing slash + aliases", async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, "sk"), LANGUAGE_STORAGE_KEY);

    for (const path of [
      "/terms",
      "/terms/",
      "/privacy",
      "/privacy/",
      "/privacy-policy",
      "/terms-of-use"
    ]) {
      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(res?.status() ?? 200, path).toBeLessThan(400);
      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
      const notice = page.locator(".legal-page__notice");
      if (await notice.count()) {
        await expect(notice.first()).toContainText(/angličtine|English/i);
      }
      await expect(page.locator("body")).toContainText(
        /Overview|Who We Are|Privacy|Terms|Zásady|Podmienky/i
      );
    }
  });
});
