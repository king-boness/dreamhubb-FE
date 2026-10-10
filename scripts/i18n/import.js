#!/usr/bin/env node
/**
 * i18n:import — VALIDATE / DRY-RUN / safe APPLY for nested/flat/auth catalogs.
 *
 * Usage:
 *   node scripts/i18n/import.js --file pack.json --dry-run
 *   node scripts/i18n/import.js --file pack.json --apply --namespace feed
 *   node scripts/i18n/import.js --file pack.json --validate
 *
 * Safety defaults:
 * - dry-run unless --apply is set
 * - allowUpdates=false (missing keys only)
 * - protected locales en-US/sk refused
 * - namespace scope recommended via --namespace
 */

const fs = require("fs");
const { validateImportPackage } = require("./lib/validateImport");

function parseArgs(argv) {
  const args = {
    file: null,
    json: false,
    validate: false,
    dryRun: false,
    apply: false,
    namespace: null,
    allowUpdates: false,
    help: false
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--file") args.file = argv[++i];
    else if (a === "--json") args.json = true;
    else if (a === "--validate") args.validate = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--apply") args.apply = true;
    else if (a === "--namespace") args.namespace = argv[++i];
    else if (a === "--allow-updates") args.allowUpdates = true;
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.file) {
    console.log(`Usage:
  node scripts/i18n/import.js --file <package.json> [--validate|--dry-run|--apply]
                              [--namespace <ns>] [--allow-updates] [--json]

Modes:
  --validate   Structural validation only (no file plan)
  --dry-run    Validation + file plan (default if neither validate nor apply)
  --apply      Write nested namespace TS modules (requires clean validation)

Never writes en-US/sk. Default refuses updates to existing explicit translations.
Inherited ...enUS keys may receive explicit overrides without --allow-updates.
Supports nestedRoot, flat (common/subcategories), and authSpread modules.`);
    process.exit(args.help ? 0 : 1);
  }

  if (!fs.existsSync(args.file)) {
    console.error(`File not found: ${args.file}`);
    process.exit(1);
  }

  if (args.apply && args.dryRun) {
    console.error("Use either --apply or --dry-run, not both.");
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(args.file, "utf8"));
  const mode = args.apply
    ? "apply"
    : args.validate
      ? "validate"
      : "dry-run";

  const opts = {
    allowUpdates: args.allowUpdates,
    rejectStale: true,
    requireNestedModules: mode !== "validate",
    allowedNamespaces: args.namespace
      ? [args.namespace]
      : pkg.filters?.namespace
        ? [pkg.filters.namespace]
        : undefined
  };

  if (mode === "validate") {
    opts.apply = false;
    opts.dryRun = false;
    opts.planFiles = false;
  } else if (mode === "dry-run") {
    opts.apply = false;
    opts.dryRun = true;
    opts.planFiles = true;
  } else {
    opts.apply = true;
    opts.dryRun = false;
    opts.planFiles = true;
    if (!opts.allowedNamespaces) {
      console.error(
        "Refusing APPLY without --namespace (or package.filters.namespace) scope."
      );
      process.exit(1);
    }
  }

  const result = validateImportPackage(pkg, opts);

  if (args.json) {
    // Strip previousContent from file plan for smaller JSON
    if (result.filePlan?.files) {
      result.filePlan = {
        ...result.filePlan,
        files: result.filePlan.files.map((f) => ({
          relativePath: f.relativePath,
          kind: f.kind,
          contentChanged: f.contentChanged,
          keyDiffs: f.keyDiffs,
          indexChanges: f.indexChanges || undefined
        }))
      };
    }
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\ni18n:import → ${result.mode} (${result.ok ? "OK" : "FAILED"})`);
    console.log(`Target: ${result.targetLocale}`);
    if (result.summary) {
      console.log(
        `Planned: add=${result.summary.add} update=${result.summary.update} noop=${result.summary.noop} rejected=${result.summary.rejected}`
      );
    }
    if (result.filePlan?.summary) {
      const s = result.filePlan.summary;
      console.log(
        `Files: touched=${s.filesTouched} examined=${s.filesExamined} namespaces=${(s.namespaces || []).join(",") || "-"} noChanges=${s.noChanges}`
      );
      if (result.filePlan.touchedFiles?.length) {
        console.log("Touched:");
        for (const f of result.filePlan.touchedFiles) console.log(`  - ${f}`);
      }
      if (result.filePlan.diffPreview?.length) {
        console.log("Diff plan:");
        for (const d of result.filePlan.diffPreview) {
          console.log(`  ${d.file} (${d.kind})`);
          for (const k of d.keys || []) console.log(`    ${k}`);
          for (const c of d.indexChanges || []) console.log(`    index:${c}`);
        }
      }
    }
    if (result.errors?.length) {
      console.log("\nERRORS:");
      for (const e of result.errors) console.log(`  - ${e}`);
    }
    if (result.warnings?.length) {
      console.log("\nWARNINGS:");
      for (const w of result.warnings.slice(0, 20)) console.log(`  - ${w}`);
      if (result.warnings.length > 20) {
        console.log(`  … +${result.warnings.length - 20} more`);
      }
    }
    if (result.applyNote) console.log(`\n${result.applyNote}`);
    console.log("");
  }

  process.exit(result.ok ? 0 : 1);
}

try {
  main();
} catch (err) {
  console.error("i18n:import failed:", err && err.message ? err.message : err);
  process.exit(1);
}
