#!/usr/bin/env node
/**
 * i18n:validate — VALIDATE import packages (no writes).
 * For DRY-RUN / APPLY use: npm run i18n:import -- --file … --dry-run|--apply
 *
 * Usage:
 *   node scripts/i18n/validate.js --file /tmp/de-pack.json
 *   node scripts/i18n/validate.js --file /tmp/de-pack.json --json
 */

const fs = require("fs");
const { validateImportPackage } = require("./lib/validateImport");

function parseArgs(argv) {
  const args = { file: null, json: false, help: false, namespace: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--file") args.file = argv[++i];
    else if (a === "--json") args.json = true;
    else if (a === "--namespace") args.namespace = argv[++i];
    else if (a === "--apply") {
      console.error("APPLY moved to: npm run i18n:import -- --file <pack> --apply --namespace <ns>");
      process.exit(2);
    } else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.file) {
    console.log("Usage: node scripts/i18n/validate.js --file <package.json> [--namespace <ns>] [--json]");
    process.exit(args.help ? 0 : 1);
  }

  if (!fs.existsSync(args.file)) {
    console.error(`File not found: ${args.file}`);
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(args.file, "utf8"));
  const result = validateImportPackage(pkg, {
    apply: false,
    dryRun: false,
    planFiles: false,
    allowedNamespaces: args.namespace
      ? [args.namespace]
      : pkg.filters?.namespace
        ? [pkg.filters.namespace]
        : undefined
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\ni18n:validate → ${result.mode} (${result.ok ? "OK" : "FAILED"})`);
    console.log(`Target: ${result.targetLocale}`);
    if (result.summary) {
      console.log(
        `Planned: add=${result.summary.add} update=${result.summary.update} noop=${result.summary.noop}`
      );
    }
    if (result.errors?.length) {
      console.log("\nERRORS:");
      for (const e of result.errors) console.log(`  - ${e}`);
    }
    if (result.warnings?.length) {
      console.log("\nWARNINGS:");
      for (const w of result.warnings) console.log(`  - ${w}`);
    }
    console.log("");
  }

  process.exit(result.ok ? 0 : 1);
}

try {
  main();
} catch (err) {
  console.error("i18n:validate failed:", err && err.message ? err.message : err);
  process.exit(1);
}
