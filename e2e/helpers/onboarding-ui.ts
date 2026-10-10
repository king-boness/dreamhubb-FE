import { expect, type Page } from "@playwright/test";
import { LANGUAGE_STORAGE_KEY } from "./fixtures";

const PASSWORD = "TestPass1!";

export async function seedGuestLocale(page: Page, locale: string) {
  await page.addInitScript(
    ([key, value]) => {
      localStorage.setItem(key, value);
    },
    [LANGUAGE_STORAGE_KEY, locale] as const
  );
}

/** Open DOB wheel, scroll year column, wait for apply via scroll debounce. */
export async function setDobViaWheel(page: Page) {
  await page.locator(".who-input--date-trigger").click();
  await expect(page.locator(".who-date-inline-picker")).toBeVisible({ timeout: 10000 });
  const yearCol = page.locator(".who-date-inline-picker__column").nth(2);
  await yearCol.evaluate((el) => {
    el.scrollTop = Math.max(0, el.scrollHeight * 0.55);
  });
  await page.waitForTimeout(300);
  await page.locator(".who-date-inline-picker__backdrop").click({ force: true });
  await expect(page.locator(".who-date-inline-picker")).toBeHidden({ timeout: 5000 });
  const dob = await page.evaluate(() => {
    const app = (document.querySelector("#q-app") as any)?.__vue_app__;
    const store = app?.config?.globalProperties?.$pinia?._s?.get("onboarding");
    return store?.dateOfBirth || "";
  });
  expect(dob).toMatch(/^\d{4}-\d{2}-\d{2}$/);
}

export async function selectGender(page: Page) {
  await page.locator(".who-genderSelect").click();
  // Values are English: Male / Female / …
  await page.locator(".who-genderOption").filter({ hasText: /male|muž|mužské/i }).first().click();
  // Fallback: first option
  if (!(await page.evaluate(() => {
    const app = (document.querySelector("#q-app") as any)?.__vue_app__;
    return !!app?.config?.globalProperties?.$pinia?._s?.get("onboarding")?.gender;
  }))) {
    await page.locator(".who-genderSelect").click();
    await page.locator(".who-genderOption").first().click();
  }
}

async function pickSelectOptionExact(
  page: Page,
  select: ReturnType<Page["locator"]>,
  exactLabels: string[],
  filterText?: string
) {
  await select.click();
  const menu = page.locator(".q-menu").last();
  await menu.waitFor({ state: "visible", timeout: 15000 });
  if (filterText) {
    const input = select.locator("input");
    if (await input.count()) {
      await input.fill(filterText);
      await page.waitForTimeout(450);
    }
  }
  for (const label of exactLabels) {
    const item = menu.locator(".q-item").filter({ hasText: new RegExp(`^\\s*${label}\\s*$`, "i") });
    if ((await item.count()) > 0) {
      await item.first().click();
      await page.waitForTimeout(400);
      return;
    }
  }
  // Broader contains match (still prefer first exactLabels[0])
  const soft = menu.locator(".q-item").filter({ hasText: exactLabels[0] });
  expect(await soft.count(), `option not found: ${exactLabels.join("|")}`).toBeGreaterThan(0);
  await soft.first().click();
  await page.waitForTimeout(400);
}

/** Prefer Europe → Slovakia → Bratislava (seeded e2e geo). */
export async function selectProfileLocation(page: Page) {
  const selects = page.locator(".who-location .q-select");
  await expect(selects).toHaveCount(3, { timeout: 15000 });

  await pickSelectOptionExact(page, selects.nth(0), ["Europe", "Európa"]);
  await pickSelectOptionExact(page, selects.nth(1), ["Slovakia", "Slovensko"], "Slovak");
  await pickSelectOptionExact(page, selects.nth(2), ["Bratislava"], "Bratislava");

  const cityOk = await page.evaluate(() => {
    const app = (document.querySelector("#q-app") as any)?.__vue_app__;
    const s = app?.config?.globalProperties?.$pinia?._s?.get("onboarding");
    return !!(s?.profileCityId || s?.profileCity);
  });
  expect(cityOk, "profile city must be selected via UI").toBeTruthy();
}

export async function fillWhoAreYouUi(
  page: Page,
  opts: { username: string; email: string; password?: string }
) {
  const password = opts.password || PASSWORD;
  await expect(page.locator(".whoAreYou")).toBeVisible({ timeout: 20000 });
  const inputs = page.locator(".whoAreYou .who-input input");
  await inputs.nth(0).fill(opts.username);
  await setDobViaWheel(page);
  await selectGender(page);
  await inputs.nth(1).fill(opts.email);
  await inputs.nth(1).blur();
  await page.waitForTimeout(600);
  await inputs.nth(2).fill(password);
  await inputs.nth(3).fill(password);
  await selectProfileLocation(page);

  await expect
    .poll(
      async () => {
        const cls = (await page.locator("button.who-finishBtn").getAttribute("class")) || "";
        return !cls.includes("who-finishBtn--inactive");
      },
      { timeout: 15000 }
    )
    .toBeTruthy();

  await page.locator("button.who-finishBtn").click();
}

export async function clickOnboardingNext(page: Page) {
  // Prefer class selectors — button copy is localized (NEXT STEP / ĎALŠÍ KROK / …)
  const btn = page
    .locator(
      "button.pick-nextBtn:not([disabled]), button.goal-nextBtn, button.dream-nextBtn, button.location-nextBtn"
    )
    .first();
  await btn.waitFor({ state: "visible", timeout: 15000 });
  await expect(btn).toBeEnabled({ timeout: 10000 });
  await btn.scrollIntoViewIfNeeded();
  // Swiper/Quasar transitions can detach the node mid-click under load.
  await expect(btn).toBeVisible();
  await btn.click({ timeout: 15000 });
}

export async function advanceSwiperSteps(page: Page, role: "donor" | "donee") {
  await expect(page.locator(".pickYourSide")).toBeVisible({ timeout: 15000 });
  if (role === "donee") {
    const swiper = page.locator(".pick-swiper");
    await swiper.evaluate((el) => {
      const inst = (el as any).swiper;
      if (inst?.slideTo) inst.slideTo(0);
    });
    await page.waitForTimeout(450);
  }
  await clickOnboardingNext(page);

  await expect(page.locator(".whatIsYourGoal")).toBeVisible({ timeout: 15000 });
  await clickOnboardingNext(page);

  await expect(page.locator(".whatKindOfDream")).toBeVisible({ timeout: 15000 });
  await clickOnboardingNext(page);
}

export async function completeWhereAreYou(page: Page) {
  await expect(page.locator(".whereAreYou")).toBeVisible({ timeout: 15000 });
  const locSelects = page.locator(".whereAreYou .location-select");
  await pickSelectOptionExact(page, locSelects.nth(0), ["Europe", "Európa"]);
  await pickSelectOptionExact(page, locSelects.nth(1), ["Slovakia", "Slovensko"], "Slovak");
  await pickSelectOptionExact(page, locSelects.nth(2), ["Bratislava"], "Bratislava");

  // Terms checkbox — Quasar: click inner box (input is visually hidden)
  await page.locator(".location-terms").scrollIntoViewIfNeeded();
  const inner = page.locator(".location-terms-checkbox .q-checkbox__inner");
  await inner.click({ force: true });
  await expect
    .poll(
      async () => {
        const aria = await page
          .locator(".location-terms-checkbox")
          .getAttribute("aria-checked")
          .catch(() => null);
        const cls =
          (await page.locator(".location-terms-checkbox").getAttribute("class")) || "";
        const storeOk = await page.evaluate(() => {
          const app = (document.querySelector("#q-app") as any)?.__vue_app__;
          return !!app?.config?.globalProperties?.$pinia?._s?.get("onboarding")?.acceptedTerms;
        });
        return aria === "true" || cls.includes("q-checkbox--truthy") || storeOk;
      },
      { timeout: 10000 }
    )
    .toBeTruthy();

  await expect
    .poll(
      async () => {
        const cls = (await page.locator("button.location-nextBtn").getAttribute("class")) || "";
        return !cls.includes("location-nextBtn--inactive");
      },
      { timeout: 15000 }
    )
    .toBeTruthy();
  await page.locator("button.location-nextBtn").click();
}

export { PASSWORD };
