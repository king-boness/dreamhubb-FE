#!/usr/bin/env node
/**
 * i18n:inventory — central language inventory + readiness metrics.
 *
 * Usage:
 *   node scripts/i18n/inventory.js
 *   node scripts/i18n/inventory.js --json
 *   node scripts/i18n/inventory.js --write-hashes
 *   node scripts/i18n/inventory.js --locale de
 */

const { buildInventory } = require("./lib/inventory");
const {
  buildSourceHashes,
  writeSourceHashes,
  loadSourceHashes
} = require("./lib/sourceHash");
const { loadCatalogs } = require("./lib/catalog");

function parseArgs(argv) {
  const args = { json: false, writeHashes: false, locale: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") args.json = true;
    else if (a === "--write-hashes") args.writeHashes = true;
    else if (a === "--locale") args.locale = argv[++i];
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`Usage: node scripts/i18n/inventory.js [--json] [--locale CODE] [--write-hashes]`);
    process.exit(0);
  }

  if (args.writeHashes) {
    const { refFlat } = loadCatalogs();
    const snap = buildSourceHashes(refFlat);
    const pathWritten = writeSourceHashes(snap);
    console.log(`Wrote source hashes (${snap.keyCount} keys) → ${pathWritten}`);
  }

  const inventory = buildInventory();
  let locales = inventory.locales;
  if (args.locale) {
    locales = locales.filter((l) => l.locale === args.locale);
    if (!locales.length) {
      console.error(`Unknown locale: ${args.locale}`);
      process.exit(1);
    }
  }

  if (args.json) {
    console.log(JSON.stringify({ ...inventory, locales }, null, 2));
    process.exit(0);
  }

  console.log("\n============================================================");
  console.log("  dreamhubb i18n inventory");
  console.log("============================================================\n");
  console.log(`Reference: ${inventory.referenceLocale} (${inventory.referenceKeyCount} keys)`);
  console.log(`UI languages: ${inventory.uiLanguageCount}`);
  console.log(`Message packs: ${inventory.messagePackCount}`);
  console.log(
    `Source hash snapshot: ${
      inventory.sourceHash.hasSnapshot
        ? `yes (stale=${inventory.sourceHash.staleKeyCount}, new=${inventory.sourceHash.newKeyCount})`
        : "MISSING — run with --write-hashes"
    }`
  );
  console.log("");

  const header = [
    "locale".padEnd(10),
    "avail%".padStart(7),
    "expl%".padStart(6),
    "inh".padStart(5),
    "miss".padStart(5),
    "==en".padStart(5),
    "rev%".padStart(6),
    "own?".padStart(5),
    "ready".padEnd(14),
    "name"
  ].join(" ");
  console.log(header);
  console.log("-".repeat(100));

  for (const r of locales) {
    if (r.isAlias) {
      console.log(
        [
          r.locale.padEnd(10),
          "alias".padStart(7),
          "-".padStart(6),
          "-".padStart(5),
          "-".padStart(5),
          "-".padStart(5),
          "-".padStart(6),
          "-".padStart(5),
          String(r.readiness.status).padEnd(14),
          r.nativeName || ""
        ].join(" ")
      );
      continue;
    }
    console.log(
      [
        r.locale.padEnd(10),
        String(r.availableKeyCoveragePct ?? r.keyCoveragePct).padStart(7),
        String(r.explicitOwnCoveragePct ?? r.ownTranslationCoveragePct).padStart(6),
        String(r.inheritedSourceKeys ?? 0).padStart(5),
        String(r.missing).padStart(5),
        String(r.identicalToEnExplicitCount ?? r.identicalToEnCount).padStart(5),
        String(r.reviewCoveragePct ?? 0).padStart(6),
        String(r.ownership?.confidence || "?").padStart(5),
        String(r.readiness.status).padEnd(14),
        r.nativeName || r.englishName || ""
      ].join(" ")
    );
  }

  console.log("\nNotes:");
  console.log("  avail% = AVAILABLE KEY COVERAGE (pack keys incl. ...enUS inherited) [EXACT]");
  console.log("  expl%  = EXPLICIT OWN VALUES written in locale TS (AST) — not review quality");
  console.log("  inh    = INHERITED SOURCE VALUES from ...enUS spreads (AST)");
  console.log("  miss   = RUNTIME FALLBACK keys (vue-i18n fallbackLocale en-US) [EXACT]");
  console.log("  ==en   = EXPLICIT values identical to en-US (intent UNKNOWN without overrides)");
  console.log("  rev%   = REVIEWED+APPROVED from review-overrides only");
  console.log("  own?   = AST ownership confidence (EXACT|UNKNOWN)");
  console.log("  Readiness NEVER auto-marks APPROVED for unverified packs.\n");

  const snap = loadSourceHashes();
  if (!snap.generatedAt) {
    console.log("Tip: node scripts/i18n/inventory.js --write-hashes\n");
  }
}

try {
  main();
} catch (err) {
  console.error("i18n:inventory failed:", err && err.message ? err.message : err);
  process.exit(1);
}
