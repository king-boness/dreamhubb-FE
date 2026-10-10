#!/usr/bin/env node
/**
 * i18n:export — prepare static UI translation packages for AI/human translators.
 *
 * Usage:
 *   node scripts/i18n/export.js --locale de --missing
 *   node scripts/i18n/export.js --locale de --inherited --namespace auth
 *   node scripts/i18n/export.js --locale fr --stale --json
 *   node scripts/i18n/export.js --locale de --namespace auth --out /tmp/de-auth.json
 *   node scripts/i18n/export.js --locale de --missing --csv --out /tmp/de-missing.csv
 */

const fs = require("fs");
const { buildExportPackage, exportToCsv } = require("./lib/exportPackage");

function parseArgs(argv) {
  const args = {
    locale: null,
    namespace: null,
    missing: false,
    inherited: false,
    identicalToEn: false,
    stale: false,
    needsReview: false,
    json: true,
    csv: false,
    out: null,
    help: false
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--locale") args.locale = argv[++i];
    else if (a === "--namespace") args.namespace = argv[++i];
    else if (a === "--missing") args.missing = true;
    else if (a === "--inherited") args.inherited = true;
    else if (a === "--identical-to-en") args.identicalToEn = true;
    else if (a === "--stale") args.stale = true;
    else if (a === "--needs-review") args.needsReview = true;
    else if (a === "--csv") {
      args.csv = true;
      args.json = false;
    }
    else if (a === "--json") args.json = true;
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.locale) {
    console.log(`Usage:
  node scripts/i18n/export.js --locale <code> [--missing] [--inherited] [--identical-to-en]
                              [--stale] [--needs-review]
                              [--namespace <ns|auth|common|subcategories>] [--csv] [--out file]

Exports static UI strings only (no UGC, secrets, or legal body text).
Use --inherited for AST ...enUS keys (present at runtime, not explicit OWN).`);
    process.exit(args.help ? 0 : 1);
  }

  const pkg = buildExportPackage({
    locale: args.locale,
    namespace: args.namespace,
    onlyMissing: args.missing,
    onlyInherited: args.inherited,
    onlyIdenticalToEn: args.identicalToEn,
    onlyStale: args.stale,
    onlyNeedsReview: args.needsReview
  });

  const output = args.csv ? exportToCsv(pkg) : JSON.stringify(pkg, null, 2) + "\n";

  if (args.out) {
    fs.writeFileSync(args.out, output, "utf8");
    console.error(`Wrote ${pkg.entryCount} entries → ${args.out}`);
  } else {
    process.stdout.write(output);
  }
}

try {
  main();
} catch (err) {
  console.error("i18n:export failed:", err && err.message ? err.message : err);
  process.exit(1);
}
