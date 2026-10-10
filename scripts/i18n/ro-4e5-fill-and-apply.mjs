#!/usr/bin/env node
/**
 * Phase 4E.5 — build ro import packages from ro-4e5-translations-data.mjs and apply per namespace.
 * Mirrors nl-4e5 / cs-4e4-fill-and-apply.mjs / it-4e2-fill-and-apply.mjs. Uses Safe APPLY only
 * (scripts/i18n/import.js, add-only / inherited-override; never --allow-updates).
 *
 * Flow per group: EXPORT (fresh) → build import package (MACHINE_DRAFT) → validate placeholders/plurals
 *                 → VALIDATE → DRY-RUN → APPLY --namespace X → re-run APPLY to confirm idempotent noop.
 *
 * Only keys that are still missing or inherited are exported, so existing explicit RO values
 * (e.g. ro auth.ts own strings) are never overwritten.
 *
 * Romanian plurals (CLDR one/few/other; romanianPluralRule in src/boot/i18n.ts):
 *   EN 2-form (one | other)        → RO 3-form (one | few | other)
 *   EN 3-form (zero | one | other) → RO 4-form (zero | one | few | other) preferred, 3-form accepted
 *   Singular placeholders/non-pipe strings are unchanged.
 *
 * Usage:
 *   node scripts/i18n/ro-4e5-fill-and-apply.mjs              # all groups
 *   node scripts/i18n/ro-4e5-fill-and-apply.mjs --only feed  # pilot (group tag or namespace)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const RO_MAP = (await import(`./ro-4e5-translations-data.mjs?t=${Date.now()}`)).default;

const LOCALE = "ro";
const EVIDENCE = "phase_4e5_cursor_ai_ro";

const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

const GROUPS = [
  { namespace: "feed", flags: ["--missing"], tag: "feed" },
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
  { namespace: "auth", flags: ["--missing"], tag: "auth-missing" }
].filter((g) => !ONLY || g.tag === ONLY || g.namespace === ONLY);

const PH_RE = /\{[a-zA-Z0-9_]+\}/g;

function placeholdersOf(text) {
  const m = text.match(PH_RE);
  return m ? [...new Set(m)].sort() : [];
}

function pluralCount(text) {
  return text.includes("|") ? text.split("|").length : 1;
}

function checkEntry(entry, tr) {
  if (typeof tr !== "string" || !tr.trim()) return "empty translation";
  const enPh = placeholdersOf(entry.sourceText);
  const roPh = placeholdersOf(tr);
  if (JSON.stringify(enPh) !== JSON.stringify(roPh)) {
    return `placeholder mismatch en=${enPh.join(",")} ro=${roPh.join(",")}`;
  }
  // Also check raw token counts so duplicated slots are not silently dropped
  const enRaw = (entry.sourceText.match(PH_RE) || []).length;
  const roRaw = (tr.match(PH_RE) || []).length;
  // Plural strings: RO has more forms (few) so raw occurrence totals legitimately differ.
  if (!entry.sourceText.includes("|") && enRaw !== roRaw) return `placeholder occurrence count en=${enRaw} ro=${roRaw}`;
  const enPl = pluralCount(entry.sourceText);
  const roPl = pluralCount(tr);
  // ro: EN 2-form → 3-form (one|few|other); EN 3-form → 4-form (or 3-form)
  if (enPl > 1) {
    const allowed = enPl === 2 ? [3] : enPl === 3 ? [4, 3] : [enPl];
    if (!allowed.includes(roPl)) return `plural count en=${enPl} ro=${roPl} (expected ${allowed.join("|")})`;
  } else if (roPl !== 1) {
    return `plural count en=${enPl} ro=${roPl}`;
  }
  return null;
}

function buildPackage(namespace, exportJson) {
  const problems = [];
  const entries = [];
  for (const entry of exportJson.entries) {
    const tr = RO_MAP[entry.keyPath];
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
      phase: "4E.5",
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
  const exportPath = path.join(repoRoot, `i18n-meta/packages/ro-4e5-export-${g.tag}.json`);
  const importPath = path.join(repoRoot, `i18n-meta/packages/ro-4e5-import-${g.tag}.json`);

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

    console.log(`\n=== VALIDATE ${g.tag} (${pkg.entryCount} entries) ===`);
    console.log(run(`node scripts/i18n/import.js --file "${importPath}" --validate --namespace ${g.namespace}`));

    console.log(`=== DRY-RUN ${g.tag} ===`);
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
console.log("\n--- inventory ro ---");
console.log(run(`node scripts/i18n/inventory.js --locale ${LOCALE}`));

if (failed.length) {
  console.error("\nFailures:", JSON.stringify(failed, null, 2));
  process.exit(1);
}
