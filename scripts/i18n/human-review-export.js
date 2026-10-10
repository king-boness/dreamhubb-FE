#!/usr/bin/env node
/**
 * Export DE human-review work package (Phase 4C.2).
 *
 *   node scripts/i18n/human-review-export.js
 *   node scripts/i18n/human-review-export.js --out i18n-meta/packages/de-human-review.json
 */

const fs = require("fs");
const path = require("path");
const {
  buildHumanReviewPackage,
  exportHumanReviewCsv
} = require("./lib/humanReview");
const { META_DIR } = require("./lib/catalog");

function parseArgs(argv) {
  const args = { out: null, csv: null, locale: "de", help: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") args.out = argv[++i];
    else if (a === "--csv") args.csv = argv[++i];
    else if (a === "--locale") args.locale = argv[++i];
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`Usage:
  node scripts/i18n/human-review-export.js [--locale de|fr] [--out file.json] [--csv file.csv]

Writes a full-key work package with empty reviewer fields (NOT_REVIEWED).
Does NOT mark any string REVIEWED/APPROVED.`);
    process.exit(0);
  }

  const locale = args.locale || "de";
  const pkg = buildHumanReviewPackage({ locale });
  const stamp = locale === "de" ? "de-4c2" : `${locale}-4d`;
  const outJson =
    args.out ||
    path.join(META_DIR, "packages", `${stamp}-human-review-workpackage.json`);
  const outCsv =
    args.csv ||
    path.join(META_DIR, "packages", `${stamp}-human-review-workpackage.csv`);

  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(outJson, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  fs.writeFileSync(outCsv, exportHumanReviewCsv(pkg), "utf8");

  console.error(`Wrote ${pkg.entryCount} entries (${locale}) → ${outJson}`);
  console.error(`Wrote CSV → ${outCsv}`);
  console.error("Priority counts:", JSON.stringify(pkg.priorityCounts));
  console.error(
    "Reviewer fields default to NOT_REVIEWED — fill before import."
  );
}

try {
  main();
} catch (err) {
  console.error("human-review-export failed:", err && err.message ? err.message : err);
  process.exit(1);
}
