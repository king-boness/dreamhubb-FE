/**
 * One-off runtime smoke for Phase 4B.1 de/feed pilot (local dist serve).
 * Usage: E2E_BASE_URL=http://localhost:4196 node scripts/i18n/de-feed-runtime-smoke.mjs
 */
import { chromium } from "@playwright/test";
import fs from "fs";

const BASE = process.env.E2E_BASE_URL || "http://localhost:4196";
const KEY = "dreamhubb_language";
const API = process.env.E2E_API_BASE || "http://127.0.0.1:8002/api";

async function noRawKeys(page) {
  const body = await page.locator("body").innerText();
  if (
    /\b(common|auth|feed|legal|posts|profile|settings|onboarding|notifications)\.[a-zA-Z0-9_.]+\b/.test(
      body
    )
  ) {
    throw new Error("Raw i18n keys found");
  }
}

async function gotoWithLocale(page, path, locale) {
  await page.addInitScript(
    ([k, v]) => {
      localStorage.setItem(k, v);
    },
    [KEY, locale]
  );
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
}

async function checkViewport(page, w, h, label) {
  await page.setViewportSize({ width: w, height: h });
  await page.waitForTimeout(250);
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      overflowX: doc.scrollWidth > doc.clientWidth + 1
    };
  });
  console.log(
    `viewport ${label} ${w}x${h}: overflowX=${overflow.overflowX} (${overflow.scrollWidth}/${overflow.clientWidth})`
  );
  return overflow;
}

const browser = await chromium.launch();
const results = [];

{
  const page = await browser.newPage();
  await gotoWithLocale(page, "/terms", "de");
  const lang = await page.locator("html").getAttribute("lang");
  const body = await page.locator("body").innerText();
  await noRawKeys(page);
  results.push({
    case: "de-terms",
    lang,
    hasTerms: /Terms of Use|Nutzungsbedingungen|Podmienky/i.test(body),
    pass: lang === "de"
  });
  await page.close();
}

{
  const page = await browser.newPage();
  await gotoWithLocale(page, "/login", "de");
  await noRawKeys(page);
  const lang = await page.locator("html").getAttribute("lang");
  results.push({
    case: "de-login",
    lang,
    // Login chrome may still be EN for missing auth keys (expected partial de)
    pass: true
  });
  for (const [w, h, label] of [
    [375, 812, "mobile"],
    [390, 844, "iphone"],
    [768, 1024, "tablet"],
    [1440, 900, "desktop"]
  ]) {
    const o = await checkViewport(page, w, h, label);
    if (o.overflowX) results.push({ case: `overflow-${label}`, pass: false });
  }
  await page.close();
}

{
  const page = await browser.newPage();
  await gotoWithLocale(page, "/support", "sk");
  const skOk = await page
    .getByRole("heading", { name: /Pomoc a podpora/i })
    .isVisible({ timeout: 10000 })
    .catch(() => false);
  results.push({ case: "sk-support", skOk, pass: skOk });
  await page.close();
}

{
  const page = await browser.newPage();
  await gotoWithLocale(page, "/support", "de");
  const lang = await page.locator("html").getAttribute("lang");
  await noRawKeys(page);
  results.push({ case: "de-support", lang, pass: lang === "de" });
  await page.close();
}

{
  // Bundle contains German feed (minifier may escape umlauts)
  const html = await (await fetch(`${BASE}/`)).text();
  const assets = [...html.matchAll(/assets\/[^"']+\.js/g)].map((m) => m[0]);
  let hit = false;
  let hitFile = null;
  for (const a of assets) {
    try {
      const js = await (await fetch(`${BASE}/${a}`)).text();
      if (js.includes("Alles durchsuchen") && js.includes("Filter anwenden")) {
        hit = true;
        hitFile = a;
        break;
      }
    } catch {
      /* ignore */
    }
  }
  results.push({ case: "bundle-contains-de-feed", hit, hitFile, pass: hit });
}

// Authenticated donor feed in German (if fixtures + API available)
try {
  const fixturesPath = process.env.E2E_FIXTURES_FILE || "/tmp/dreamhubb_e2e_fixtures.json";
  if (fs.existsSync(fixturesPath)) {
    const fixtures = JSON.parse(fs.readFileSync(fixturesPath, "utf8"));
    const token = fixtures.donor?.token;
    if (token) {
      // Align server preferred_locale so auth boot sync does not overwrite UI de
      try {
        await fetch(`${API}/user/update`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "Accept-Language": "de"
          },
          body: JSON.stringify({ preferred_locale: "de" })
        });
      } catch {
        /* best-effort */
      }

      const page = await browser.newPage();
      await page.addInitScript(
        ([k, locale, t, userId]) => {
          localStorage.setItem(k, locale);
          localStorage.setItem("token", t);
          localStorage.setItem(
            `preferences_store_${userId}`,
            JSON.stringify({
              currentSide: "donor",
              onboardingInitialSide: "donor",
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
        [KEY, "de", token, fixtures.donor.id]
      );
      await page.goto(`${BASE}/donor/posts`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2500);
      const body = await page.locator("body").innerText();
      const url = page.url();
      const hasGermanFeed =
        /Alles durchsuchen|Meine Träume|Filter anwenden|Neueste|Älteste|Beiträge wählen/i.test(
          body
        );
      const hasRaw = /\bfeed\.[a-zA-Z0-9_.]+\b/.test(body);
      results.push({
        case: "de-authenticated-feed",
        url,
        hasGermanFeed,
        hasRaw,
        pass: hasGermanFeed && !hasRaw,
        snippet: body.slice(0, 300).replace(/\s+/g, " ")
      });

      // sk switch
      await page.evaluate(([k]) => localStorage.setItem(k, "sk"), [KEY]);
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      const skBody = await page.locator("body").innerText();
      const skFeed = /Hľadať|Moje sny|Použiť filtre|Najnovšie/i.test(skBody);
      results.push({
        case: "feed-de-to-sk",
        skFeed,
        pass: skFeed,
        snippet: skBody.slice(0, 200).replace(/\s+/g, " ")
      });

      await page.evaluate(([k]) => localStorage.setItem(k, "de"), [KEY]);
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      const deBody = await page.locator("body").innerText();
      const deBack = /Alles durchsuchen|Meine Träume|Filter anwenden|Neueste/i.test(deBody);
      results.push({
        case: "feed-sk-to-de",
        deBack,
        pass: deBack
      });

      for (const [w, h, label] of [
        [375, 812, "feed-mobile"],
        [768, 1024, "feed-tablet"],
        [1440, 900, "feed-desktop"]
      ]) {
        const o = await checkViewport(page, w, h, label);
        results.push({ case: `feed-overflow-${label}`, pass: !o.overflowX });
      }
      await page.close();
    } else {
      results.push({ case: "de-authenticated-feed", pass: null, note: "no donor token" });
    }
  } else {
    results.push({ case: "de-authenticated-feed", pass: null, note: "no fixtures" });
  }
} catch (err) {
  results.push({
    case: "de-authenticated-feed",
    pass: false,
    error: err && err.message ? err.message : String(err)
  });
}

console.log(JSON.stringify(results, null, 2));
await browser.close();

const hardFails = results.filter((r) => r.pass === false);
if (hardFails.length) {
  console.error("RUNTIME_SMOKE_FAIL", hardFails.map((f) => f.case));
  process.exit(1);
}
console.log("RUNTIME_SMOKE_OK");
