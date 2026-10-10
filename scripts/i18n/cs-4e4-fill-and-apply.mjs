#!/usr/bin/env node
/**
 * Phase 4E.4 — build cs import packages from cs-4e4-translations-data.mjs and apply per namespace.
 * Mirrors it-4e2-fill-and-apply.mjs / es-4e1-fill-and-apply.mjs. Uses Safe APPLY only
 * (scripts/i18n/import.js, add-only / inherited-override; never --allow-updates).
 *
 * Flow per group: EXPORT (fresh) → build import package (MACHINE_DRAFT) → validate placeholders/plurals
 *                 → DRY-RUN → APPLY --namespace X → re-run APPLY to confirm idempotent noop.
 *
 * Only keys that are still missing or inherited are exported, so existing explicit CS values are
 * never overwritten (e.g. cs auth.ts / feed.ts own strings).
 *
 * Czech plurals: EN 2-form → CS 3-form (one | few | other); allowed by validateImport (+2 for cs).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const CS_MAP = (await import(`./cs-4e4-translations-data.mjs?t=${Date.now()}`)).default;

const LOCALE = "cs";
const EVIDENCE = "phase_4e4_cursor_ai_cs";

const GROUPS = [
  { namespace: "common", flags: ["--missing"], tag: "common" },
  { namespace: "subcategories", flags: ["--missing"], tag: "subcategories" },
  { namespace: "legal", flags: ["--missing"], tag: "legal" },
  { namespace: "posts", flags: ["--missing"], tag: "posts" },
  { namespace: "onboarding", flags: ["--missing"], tag: "onboarding" },
  { namespace: "notifications", flags: ["--missing"], tag: "notifications" },
  { namespace: "notifications", flags: ["--inherited"], tag: "notifications-inherited" },
  { namespace: "settings", flags: ["--missing"], tag: "settings" },
  { namespace: "settings", flags: ["--inherited"], tag: "settings-inherited" },
  { namespace: "profile", flags: ["--missing"], tag: "profile" },
  { namespace: "profile", flags: ["--inherited"], tag: "profile-inherited" },
  { namespace: "auth", flags: ["--inherited"], tag: "auth" },
  { namespace: "auth", flags: ["--missing"], tag: "auth-missing" },
  { namespace: "feed", flags: ["--missing"], tag: "feed" }
];

const PH_RE = /\{[a-zA-Z0-9_]+\}/g;

function placeholdersOf(text) {
  const m = text.match(PH_RE);
  return m ? [...new Set(m)].sort() : [];
}

function pluralCount(text) {
  return text.includes("|") ? text.split("|").length : 1;
}

function checkEntry(entry, tr) {
  const enPh = placeholdersOf(entry.sourceText);
  const csPh = placeholdersOf(tr);
  if (JSON.stringify(enPh) !== JSON.stringify(csPh)) {
    return `placeholder mismatch en=${enPh.join(",")} cs=${csPh.join(",")}`;
  }
  const enPl = pluralCount(entry.sourceText);
  const csPl = pluralCount(tr);
  // cs (like pl): equal count, or up to +2 extra CLDR forms for pluralised messages
  if (enPl === 1 ? csPl !== 1 : csPl < enPl || csPl > enPl + 2) {
    return `plural count en=${enPl} cs=${csPl}`;
  }
  return null;
}

function buildPackage(namespace, exportJson) {
  const problems = [];
  const entries = [];
  for (const entry of exportJson.entries) {
    const tr = CS_MAP[entry.keyPath];
    if (tr == null) {
      problems.push(`${entry.keyPath}: no translation`);
      continue;
    }
    const issue = checkEntry(entry, tr);
    if (issue) {
      problems.push(`${entry.keyPath}: ${issue}`);
      continue;
    }
    const { status, statusEvidence, ...rest } = entry;
    entries.push({
      ...rest,
      translation: tr,
      status: "MACHINE_DRAFT",
      statusEvidence: EVIDENCE
    });
  }
  if (problems.length) {
    throw new Error(`Invalid for ${namespace}:\n  ${problems.join("\n  ")}`);
  }
  return {
    kind: "dreamhubb-ui-translation-import",
    targetLocale: LOCALE,
    pilot: {
      phase: "4E.4",
      translator: "cursor_agent",
      reviewStatus: "MACHINE_DRAFT",
      notApproved: true
    },
    filters: { namespace },
    entryCount: entries.length,
    entries
  };
}

function run(cmd) {
  return execSync(cmd, { cwd: repoRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

const summary = [];
const failed = [];

for (const g of GROUPS) {
  const exportPath = path.join(repoRoot, `i18n-meta/packages/cs-4e4-export-${g.tag}.json`);
  const importPath = path.join(repoRoot, `i18n-meta/packages/cs-4e4-import-${g.tag}.json`);

  const exportJson = JSON.parse(
    run(
      `node scripts/i18n/export.js --locale ${LOCALE} ${g.flags.join(" ")} --namespace ${g.namespace} --json`
    )
  );

  if (!exportJson.entries?.length) {
    console.log(`Skip ${g.tag}: 0 export entries (already applied or none)`);
    summary.push({ group: g.tag, applied: 0, note: "0 export entries" });
    continue;
  }

  try {
    const pkg = buildPackage(g.namespace, exportJson);
    fs.writeFileSync(exportPath, JSON.stringify(exportJson, null, 2) + "\n", "utf8");
    fs.writeFileSync(importPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");

    console.log(`\n=== DRY-RUN ${g.tag} (${pkg.entryCount} entries) ===`);
    console.log(run(`node scripts/i18n/import.js --file "${importPath}" --dry-run --namespace ${g.namespace}`));

    const applyCmd = `node scripts/i18n/import.js --file "${importPath}" --apply --namespace ${g.namespace}`;
    console.log(`=== APPLY ${g.tag} ===`);
    console.log(run(applyCmd));
    console.log(`--- idempotency re-run ${g.tag} ---`);
    console.log(run(applyCmd));
    summary.push({ group: g.tag, applied: pkg.entryCount });
  } catch (err) {
    console.error(`FAILED ${g.tag}:`, err.stdout || err.message);
    failed.push({ group: g.tag, error: String(err.message).slice(0, 2000) });
  }
}

console.log("\n--- summary ---");
console.log(JSON.stringify(summary, null, 2));
console.log("\n--- inventory cs ---");
console.log(run(`node scripts/i18n/inventory.js --locale ${LOCALE}`));

if (failed.length) {
  console.error("\nFailures:", JSON.stringify(failed, null, 2));
  process.exit(1);
}
