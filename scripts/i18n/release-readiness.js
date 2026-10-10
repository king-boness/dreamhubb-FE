#!/usr/bin/env node
/**
 * Global localization release-readiness report (Phase 4E.3).
 *
 *   node scripts/i18n/release-readiness.js
 *   node scripts/i18n/release-readiness.js --json
 *   node scripts/i18n/release-readiness.js --out i18n-meta/release-readiness.json
 */

const fs = require("fs");
const path = require("path");
const {
  buildReleaseReadinessReport,
  formatReleaseReadinessText
} = require("./lib/releaseReadiness");
const { META_DIR } = require("./lib/catalog");

function parseArgs(argv) {
  const args = { json: false, out: null, help: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") args.json = true;
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`Usage:
  node scripts/i18n/release-readiness.js [--json] [--out file.json]

Evidence-based readiness matrix for all UI locales.
Never marks languages APPROVED/RELEASED from FE coverage alone.`);
    process.exit(0);
  }

  const report = buildReleaseReadinessReport();
  const outJson =
    args.out || path.join(META_DIR, "release-readiness.json");

  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n", "utf8");

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatReleaseReadinessText(report));
    console.error(`\nWrote JSON → ${outJson}`);
  }
}

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
