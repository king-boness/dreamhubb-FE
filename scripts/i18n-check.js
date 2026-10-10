#!/usr/bin/env node

/**
 * i18n structural audit for dreamhubb locale packs.
 *
 * ERROR   – structural problems that can break runtime i18n
 * WARNING – incomplete translations (fallback to en-US still works)
 * INFO    – coverage / informational stats
 *
 * Exit code is non-zero only when ERROR findings exist.
 *
 * Usage:
 *   npm run i18n:check
 *   node scripts/i18n-check.js
 *   node scripts/i18n-check.js --json
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const esbuild = require("esbuild");

const ROOT = path.join(__dirname, "..");
const I18N_ENTRY = path.join(ROOT, "src", "i18n", "index.ts");
const LANGUAGES_ENTRY = path.join(ROOT, "src", "config", "languages.ts");
const REF_LOCALE = "en-US";
const UI_ONLY_ALIASES = new Set(["en-GB"]); // UI preference codes without own message packs

const wantJson = process.argv.includes("--json");

function flatten(obj, prefix = "", out = {}) {
  if (obj == null) {
    if (prefix) out[prefix] = obj;
    return out;
  }
  if (typeof obj !== "object" || Array.isArray(obj)) {
    out[prefix] = obj;
    return out;
  }
  const keys = Object.keys(obj);
  if (keys.length === 0 && prefix) {
    out[prefix] = obj;
    return out;
  }
  for (const key of keys) {
    const next = prefix ? `${prefix}.${key}` : key;
    flatten(obj[key], next, out);
  }
  return out;
}

function shapeTree(obj) {
  if (obj == null) return "null";
  if (typeof obj !== "object" || Array.isArray(obj)) return typeof obj;
  const shape = {};
  for (const [k, v] of Object.entries(obj)) {
    shape[k] = shapeTree(v);
  }
  return shape;
}

function collectShapeConflicts(refShape, localeShape, prefix = "", out = []) {
  if (typeof refShape === "string" || typeof localeShape === "string") {
    if (refShape !== localeShape) {
      out.push({
        path: prefix || "(root)",
        expected: refShape,
        actual: localeShape
      });
    }
    return out;
  }
  if (typeof refShape !== "object" || typeof localeShape !== "object") {
    out.push({
      path: prefix || "(root)",
      expected: refShape,
      actual: localeShape
    });
    return out;
  }
  for (const key of Object.keys(refShape)) {
    const p = prefix ? `${prefix}.${key}` : key;
    if (!(key in localeShape)) continue; // missing keys handled separately as WARNING
    collectShapeConflicts(refShape[key], localeShape[key], p, out);
  }
  return out;
}

function loadTsModule(entryFile) {
  const outfile = path.join(
    os.tmpdir(),
    `dreamhubb-i18n-${path.basename(entryFile)}-${process.pid}.cjs`
  );
  esbuild.buildSync({
    entryPoints: [entryFile],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile,
    logLevel: "silent",
    // Keep TS/ESM interop simple for message catalogs
    mainFields: ["module", "main"]
  });
  try {
    delete require.cache[require.resolve(outfile)];
    const mod = require(outfile);
    return mod.default || mod;
  } finally {
    try {
      fs.unlinkSync(outfile);
    } catch {
      // ignore temp cleanup failures
    }
  }
}

function primaryTag(code) {
  return String(code || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .split("-")[0];
}

function loadBeSupportedLanguages() {
  const beConfig = path.join(
    ROOT,
    "..",
    "dreamhubb-BE",
    "config",
    "translation.php"
  );
  if (!fs.existsSync(beConfig)) {
    return { available: false, languages: [] };
  }
  const text = fs.readFileSync(beConfig, "utf8");
  const match = text.match(/supported_languages'\s*=>\s*\[([\s\S]*?)\],/);
  if (!match) return { available: true, languages: [], parseError: true };
  const languages = [...match[1].matchAll(/'([a-z]{2,3})'/g)].map((m) => m[1]);
  return { available: true, languages };
}

function main() {
  const messages = loadTsModule(I18N_ENTRY);
  const languagesMod = loadTsModule(LANGUAGES_ENTRY);
  const appLanguages = languagesMod.APP_LANGUAGES || languagesMod.default?.APP_LANGUAGES || [];

  const locales = Object.keys(messages);
  if (!messages[REF_LOCALE]) {
    console.error(`ERROR: reference locale ${REF_LOCALE} missing from i18n messages`);
    process.exit(1);
  }

  const ref = messages[REF_LOCALE];
  const refFlat = flatten(ref);
  const refKeys = Object.keys(refFlat);
  const refShape = shapeTree(ref);

  const errors = [];
  const warnings = [];
  const infos = [];
  const reports = [];

  // UI vs packs
  const uiCodes = appLanguages.map((l) => l.code);
  for (const code of uiCodes) {
    if (UI_ONLY_ALIASES.has(code)) {
      infos.push(`UI alias ${code} maps to ${REF_LOCALE} (no dedicated pack; expected)`);
      continue;
    }
    if (!locales.includes(code)) {
      errors.push(`UI language "${code}" has no i18n message pack`);
    }
  }
  for (const loc of locales) {
    if (!uiCodes.includes(loc) && !UI_ONLY_ALIASES.has(loc)) {
      warnings.push(`Message pack "${loc}" is not listed in APP_LANGUAGES`);
    }
  }

  for (const loc of locales.sort()) {
    const tree = messages[loc];
    const flat = flatten(tree);
    const keys = Object.keys(flat);

    const missing = refKeys.filter((k) => !(k in flat));
    const extra = keys.filter((k) => !(k in refFlat));
    const empty = keys.filter((k) => {
      const v = flat[k];
      return typeof v === "string" && v.trim() === "";
    });
    const invalid = keys.filter((k) => {
      const v = flat[k];
      return typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean";
    });

    const shapeConflicts = collectShapeConflicts(refShape, shapeTree(tree));

    // Values identical to en-US among overlapping string keys (informational only)
    let inheritedFromEn = 0;
    let localizedDifferent = 0;
    for (const k of refKeys) {
      if (!(k in flat)) continue;
      if (typeof flat[k] !== "string" || typeof refFlat[k] !== "string") continue;
      if (flat[k] === refFlat[k]) inheritedFromEn++;
      else localizedDifferent++;
    }

    const presentCount = refKeys.length - missing.length;
    const coveragePct = ((presentCount / refKeys.length) * 100).toFixed(1);

    const row = {
      locale: loc,
      referenceKeys: refKeys.length,
      localKeys: keys.length,
      missing: missing.length,
      extra: extra.length,
      empty: empty.length,
      invalid: invalid.length,
      structuralConflicts: shapeConflicts.length,
      coveragePct: Number(coveragePct),
      sameAsEnUS: inheritedFromEn,
      differentFromEnUS: localizedDifferent,
      translationQuality: "unverified"
    };
    reports.push(row);

    // ERRORS: structural / invalid
    for (const c of shapeConflicts) {
      errors.push(
        `[${loc}] type conflict at "${c.path}": expected ${JSON.stringify(c.expected)}, got ${JSON.stringify(c.actual)}`
      );
    }
    for (const k of empty) {
      errors.push(`[${loc}] empty translation value at "${k}"`);
    }
    for (const k of invalid) {
      errors.push(`[${loc}] invalid non-primitive leaf at "${k}" (${typeof flat[k]})`);
    }

    // WARNING: incomplete packs (expected today for most locales)
    if (missing.length > 0 && loc !== REF_LOCALE) {
      warnings.push(
        `[${loc}] incomplete pack: ${missing.length} missing key(s) vs ${REF_LOCALE} (fallback OK) — coverage ${coveragePct}%`
      );
    }
    if (extra.length > 0) {
      warnings.push(`[${loc}] ${extra.length} extra key(s) not in ${REF_LOCALE}`);
    }

    infos.push(
      `[${loc}] keys ${keys.length}/${refKeys.length} (${coveragePct}%), sameAsEn=${inheritedFromEn}, different=${localizedDifferent}, quality=unverified`
    );
  }

  // FE/BE primary-tag alignment (best-effort if BE repo is present)
  const be = loadBeSupportedLanguages();
  if (be.parseError) {
    warnings.push("Could not parse BE supported_languages from translation.php");
  } else if (be.available) {
    const beSet = new Set(be.languages);
    const fePrimaries = new Set(
      [...uiCodes, ...locales].map(primaryTag).filter(Boolean)
    );
    for (const tag of [...fePrimaries].sort()) {
      if (!beSet.has(tag)) {
        errors.push(
          `FE language primary tag "${tag}" missing from BE config/translation.php supported_languages`
        );
      }
    }
    for (const tag of be.languages) {
      if (!fePrimaries.has(tag)) {
        infos.push(`BE allowlist has "${tag}" with no FE UI/pack primary (informational)`);
      }
    }
    infos.push(`BE supported_languages count: ${be.languages.length}`);
  } else {
    infos.push("BE translation.php not found beside FE repo — skipped FE/BE allowlist check");
  }

  // en-GB alias sanity
  if (!uiCodes.includes("en-GB")) {
    errors.push('UI is missing expected alias "en-GB"');
  }
  if (locales.includes("en-GB")) {
    warnings.push("Unexpected dedicated en-GB message pack (alias mode expected)");
  }

  // Lightweight hardcoded-UI heuristic (INFO only — false positives expected)
  // Catalog completeness ≠ UI wiring. This only flags a small known leftover set.
  const hardcodedHints = [
    { file: "src/pages/Public/SupportPage.vue", re: />Help &amp; Support</ },
    { file: "src/pages/DonorPages/TokensOnboardingPage.vue", re: />Introducing Currency Tokens</ },
    { file: "src/pages/DoneePages/AccomplishedDreamPage.vue", re: />Congratulations!</ },
    { file: "src/pages/Common/OpenSharePage.vue", re: />Opening\.\.\.</ },
    { file: "src/components/Public/LegalPageShell.vue", re: /aria-label="Back"/ }
  ];
  let hardcodedHits = 0;
  for (const hint of hardcodedHints) {
    const abs = path.join(ROOT, hint.file);
    if (!fs.existsSync(abs)) continue;
    const text = fs.readFileSync(abs, "utf8");
    if (hint.re.test(text)) {
      hardcodedHits++;
      infos.push(`hardcoded-ui hint: ${hint.file} still matches ${hint.re}`);
    }
  }
  infos.push(
    `hardcoded-ui scan: ${hardcodedHits}/${hardcodedHints.length} known leftovers (heuristic; false positives possible)`
  );
  infos.push(
    "Note: 100% catalog coverage does not guarantee 100% UI wiring or translation quality."
  );

  if (wantJson) {
    console.log(
      JSON.stringify(
        {
          reference: REF_LOCALE,
          uiLanguages: uiCodes.length,
          messagePacks: locales.length,
          reports,
          errors,
          warnings,
          infos
        },
        null,
        2
      )
    );
  } else {
    console.log("\n============================================================");
    console.log("  dreamhubb i18n check");
    console.log("============================================================\n");
    console.log(`Reference: ${REF_LOCALE}`);
    console.log(`UI languages: ${uiCodes.length}`);
    console.log(`Message packs: ${locales.length}`);
    console.log("");
    console.log(
      [
        "locale".padEnd(10),
        "ref".padStart(5),
        "local".padStart(6),
        "miss".padStart(5),
        "extra".padStart(6),
        "empty".padStart(6),
        "struct".padStart(7),
        "cover%".padStart(7),
        "sameEn".padStart(7),
        "diffEn".padStart(7),
        "quality"
      ].join(" ")
    );
    console.log("-".repeat(90));
    for (const r of reports) {
      console.log(
        [
          r.locale.padEnd(10),
          String(r.referenceKeys).padStart(5),
          String(r.localKeys).padStart(6),
          String(r.missing).padStart(5),
          String(r.extra).padStart(6),
          String(r.empty).padStart(6),
          String(r.structuralConflicts).padStart(7),
          String(r.coveragePct).padStart(7),
          String(r.sameAsEnUS).padStart(7),
          String(r.differentFromEnUS).padStart(7),
          r.translationQuality
        ].join(" ")
      );
    }

    const printSection = (title, items, color) => {
      console.log(`\n${title} (${items.length})`);
      if (items.length === 0) {
        console.log("  (none)");
        return;
      }
      for (const item of items) {
        console.log(`  ${color}${item}\x1b[0m`);
      }
    };

    printSection("ERRORS", errors, "\x1b[31m");
    // Truncate very long warning lists for readability; header shows TRUE total.
    // (Previously printing warnPreview.length made WARNINGS appear as 40 instead of 56.)
    const warnPreview = warnings.slice(0, 40);
    console.log(`\nWARNINGS (${warnings.length})`);
    if (warnings.length === 0) {
      console.log("  (none)");
    } else {
      for (const item of warnPreview) {
        console.log(`  \x1b[33m${item}\x1b[0m`);
      }
      if (warnings.length > warnPreview.length) {
        console.log(
          `  … +${warnings.length - warnPreview.length} more (use --json for full list)`
        );
      }
    }
    printSection("INFO", infos.slice(0, 20), "\x1b[36m");
    if (infos.length > 20) {
      console.log(`  … +${infos.length - 20} more (use --json for full list)`);
    }

    console.log("\nNotes:");
    console.log("  - Missing keys are WARNING (vue-i18n fallbackLocale en-US).");
    console.log("  - sameAsEn / diffEn compare string equality only; quality is unverified.");
    console.log("  - Exit code != 0 only when ERROR count > 0.\n");
  }

  if (errors.length > 0) {
    process.exit(1);
  }
  process.exit(0);
}

try {
  main();
} catch (err) {
  console.error("i18n:check failed:", err && err.message ? err.message : err);
  process.exit(1);
}
