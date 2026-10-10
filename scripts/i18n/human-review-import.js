#!/usr/bin/env node
/**
 * Validate / DRY-RUN / APPLY a filled human-review package (Phase 4C.2).
 *
 *   node scripts/i18n/human-review-import.js --file result.json --validate
 *   node scripts/i18n/human-review-import.js --file result.json --dry-run
 *   node scripts/i18n/human-review-import.js --file result.json --apply
 *
 * Real APPLY requires package.attestation:
 *   { reviewerId, reviewedAt, confirmedRealReview: true }
 *
 * Fixture tests may pass --skip-attestation (never use for production DE).
 */

const fs = require("fs");
const {
  validateHumanReviewPackage,
  applyHumanReviewPackage
} = require("./lib/humanReview");

function parseArgs(argv) {
  const args = {
    file: null,
    validate: false,
    dryRun: false,
    apply: false,
    json: false,
    skipAttestation: false,
    help: false
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--file") args.file = argv[++i];
    else if (a === "--validate") args.validate = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--apply") args.apply = true;
    else if (a === "--json") args.json = true;
    else if (a === "--skip-attestation") args.skipAttestation = true;
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.file) {
    console.log(`Usage:
  node scripts/i18n/human-review-import.js --file <result.json>
      [--validate|--dry-run|--apply] [--json] [--skip-attestation]

Default mode: dry-run.
--apply requires attestation.confirmedRealReview=true and a real reviewerId.
--skip-attestation is for isolated fixture tests ONLY.`);
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
  const mode = args.apply ? "apply" : args.validate ? "validate" : "dry-run";

  let result;
  if (mode === "validate") {
    result = validateHumanReviewPackage(pkg, {
      requireAttestation: false,
      apply: false
    });
  } else if (mode === "dry-run") {
    result = applyHumanReviewPackage(pkg, {
      apply: false,
      dryRun: true,
      requireAttestation: true,
      skipAttestation: args.skipAttestation
    });
  } else {
    if (args.skipAttestation) {
      console.error(
        "Refusing --apply --skip-attestation against live catalogs. Use fixture tests only."
      );
      process.exit(1);
    }
    result = applyHumanReviewPackage(pkg, {
      apply: true,
      dryRun: false,
      requireAttestation: true,
      skipAttestation: false
    });
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\ni18n:human-review-import → ${result.mode} (${result.ok ? "OK" : "FAILED"})`);
    if (result.summary) {
      const s = result.summary;
      console.log(
        `Decisions: ACCEPT=${s.ACCEPT || 0} CORRECT=${s.CORRECT || 0} REJECT=${s.REJECT || 0} NEEDS_CONTEXT=${s.NEEDS_CONTEXT || 0} NOT_REVIEWED=${s.NOT_REVIEWED || 0}`
      );
      console.log(
        `Catalog updates=${s.catalogUpdates || 0} status-only=${s.statusOnly || 0} qaFindings=${s.qaFindings || 0}`
      );
      if (s.filesWouldTouch?.length) {
        console.log("Files:", s.filesWouldTouch.join(", "));
      }
    }
    if (result.diffPreview) {
      console.log("Diff preview:");
      for (const x of result.diffPreview.catalogUpdates || []) console.log(`  catalog: ${x}`);
      for (const x of result.diffPreview.reviewOverrides || []) console.log(`  reviewed: ${x}`);
      for (const x of result.diffPreview.qaFindings || []) console.log(`  qa: ${x}`);
    }
    if (result.errors?.length) {
      console.log("\nERRORS:");
      for (const e of result.errors) console.log(`  - ${e}`);
    }
    if (result.warnings?.length) {
      console.log("\nWARNINGS:");
      for (const w of result.warnings.slice(0, 20)) console.log(`  - ${w}`);
    }
    console.log("");
  }

  process.exit(result.ok ? 0 : 1);
}

try {
  main();
} catch (err) {
  console.error("human-review-import failed:", err && err.message ? err.message : err);
  process.exit(1);
}
