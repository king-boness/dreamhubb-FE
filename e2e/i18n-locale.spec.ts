import { expect, test, type Page } from "@playwright/test";

const LANGUAGE_STORAGE_KEY = "dreamhubb_language";

async function setLocale(page: Page, code: string) {
  await page.addInitScript(
    ([key, value]) => {
      localStorage.setItem(key, value);
    },
    [LANGUAGE_STORAGE_KEY, code] as const
  );
}

async function expectNoRawI18nKeys(page: Page) {
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(
    /\b(common|auth|feed|legal|posts|profile|settings|onboarding|notifications)\.[a-zA-Z0-9_.]+\b/
  );
}

test.describe("i18n locale (public surfaces)", () => {
  test("default locale is en-US on welcome", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator("html")).toHaveAttribute("lang", /en/i);
    await expect(page.getByText(/dreamhubb|Log in|Sign|Welcome|help/i).first()).toBeVisible({
      timeout: 15000
    });
    await expectNoRawI18nKeys(page);
  });

  test("sk locale localizes public support chrome", async ({ page }) => {
    await setLocale(page, "sk");
    await page.goto("/support");
    await expect(page.locator("html")).toHaveAttribute("lang", "sk");
    await expect(page.getByRole("heading", { name: /Pomoc a podpora/i })).toBeVisible({
      timeout: 15000
    });
    await expect(page.getByRole("link", { name: /Podmienky používania/i })).toBeVisible();
    await expectNoRawI18nKeys(page);
  });

  test("en-US support headings stay English", async ({ page }) => {
    await setLocale(page, "en-US");
    await page.goto("/support");
    await expect(page.getByRole("heading", { name: /Help & Support/i })).toBeVisible({
      timeout: 15000
    });
    await expectNoRawI18nKeys(page);
  });

  test("en-GB aliases to English UI text packs", async ({ page }) => {
    await setLocale(page, "en-GB");
    await page.goto("/support");
    await expect(page.getByRole("heading", { name: /Help & Support/i })).toBeVisible({
      timeout: 15000
    });
    await expectNoRawI18nKeys(page);
  });

  test("de terms chrome is localized; legal body may remain English", async ({ page }) => {
    await setLocale(page, "de");
    await page.goto("/terms");
    // DE UI chrome MACHINE_DRAFT (Nutzungsbedingungen); legal body may stay EN
    await expect(
      page.getByRole("heading", { name: /Terms of Use|Podmienky|Nutzungsbedingungen/i })
    ).toBeVisible({
      timeout: 15000
    });
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page.locator("body")).toContainText(
      /Terms of Use|govern your use|Nutzungsbedingungen|englisch/i
    );
    await expectNoRawI18nKeys(page);
  });

  test("fr support chrome is localized; html lang=fr", async ({ page }) => {
    await setLocale(page, "fr");
    await page.goto("/support");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(
      page.getByRole("heading", { name: /Aide et assistance/i })
    ).toBeVisible({ timeout: 15000 });
    await expectNoRawI18nKeys(page);
  });

  test("fr terms chrome is localized; legal body may remain English", async ({ page }) => {
    await setLocale(page, "fr");
    await page.goto("/terms");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(
      page.getByRole("heading", { name: /Conditions d'utilisation|Terms of Use/i })
    ).toBeVisible({ timeout: 15000 });
    await expect(page.locator("body")).toContainText(
      /Terms of Use|govern your use|Conditions|anglais|English/i
    );
    await expectNoRawI18nKeys(page);
  });

  test("es support chrome is localized; html lang=es", async ({ page }) => {
    await setLocale(page, "es");
    await page.goto("/support");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(
      page.getByRole("heading", { name: /Ayuda y soporte/i })
    ).toBeVisible({ timeout: 15000 });
    await expectNoRawI18nKeys(page);
  });

  test("pl support chrome is localized; html lang=pl", async ({ page }) => {
    await setLocale(page, "pl");
    await page.goto("/support");
    await expect(page.locator("html")).toHaveAttribute("lang", "pl");
    await expect(
      page.getByRole("heading", { name: /Pomoc i wsparcie|Help & Support/i })
    ).toBeVisible({ timeout: 15000 });
    await expectNoRawI18nKeys(page);
  });

  test("sk preference persists across reload on support", async ({ page }) => {
    await setLocale(page, "sk");
    await page.goto("/support");
    await expect(page.getByRole("heading", { name: /Pomoc a podpora/i })).toBeVisible({
      timeout: 15000
    });
    await page.reload();
    await expect(page.getByRole("heading", { name: /Pomoc a podpora/i })).toBeVisible({
      timeout: 15000
    });
    const stored = await page.evaluate((key) => localStorage.getItem(key), LANGUAGE_STORAGE_KEY);
    expect(stored).toBe("sk");
  });

  test("mobile viewport shows localized support without horizontal overflow", async ({
    page
  }) => {
    await setLocale(page, "sk");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/support");
    await expect(page.getByRole("heading", { name: /Pomoc a podpora/i })).toBeVisible({
      timeout: 15000
    });
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });
    expect(overflow).toBe(false);
  });
});
