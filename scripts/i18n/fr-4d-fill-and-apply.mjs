#!/usr/bin/env node
/**
 * Build import packages from fr-4d-translations-data.mjs and apply per namespace.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const FR_MAP = (await import(`./fr-4d-translations-data.mjs?t=${Date.now()}`)).default;

const GROUPS = [
  { namespace: "common", flags: ["--missing"] },
  { namespace: "subcategories", flags: ["--missing"] },
  { namespace: "legal", flags: ["--missing"] },
  { namespace: "posts", flags: ["--missing"] },
  { namespace: "onboarding", flags: ["--missing"] },
  { namespace: "notifications", flags: ["--missing"] },
  { namespace: "settings", flags: ["--missing"] },
  { namespace: "profile", flags: ["--missing"] },
  { namespace: "auth", flags: ["--inherited"] },
];

function extractPlaceholders(text) {
  const m = text.match(/\{[a-zA-Z0-9_]+\}/g);
  return m ? [...new Set(m.map((p) => p.slice(1, -1)))] : [];
}

function buildPackage(namespace, exportJson) {
  const entries = exportJson.entries
    .map((entry) => {
      const tr = FR_MAP[entry.keyPath];
      if (tr == null) return { entry, missing: true };
      for (const ph of entry.placeholders ?? []) {
        if (!tr.includes(`{${ph}}`)) {
          return { entry, missing: `placeholder:${ph}` };
        }
      }
      const enParts = entry.sourceText.includes("|")
        ? entry.sourceText.split("|").map((s) => s.trim())
        : null;
      const frParts = tr.includes("|") ? tr.split("|").map((s) => s.trim()) : null;
      if (enParts && frParts && enParts.length !== frParts.length) {
        return { entry, missing: "plural" };
      }
      const { status, statusEvidence, ...rest } = entry;
      return {
        entry: {
          ...rest,
          translation: tr,
          status: "MACHINE_DRAFT",
          statusEvidence: "phase_4d_cursor_ai",
        },
        missing: false,
      };
    });

  const missing = entries.filter((e) => e.missing).map((e) => `${e.entry.keyPath}:${e.missing}`);
  if (missing.length) {
    throw new Error(`Missing/invalid for ${namespace}: ${missing.join(", ")}`);
  }

  return {
    kind: "dreamhubb-ui-translation-import",
    targetLocale: "fr",
    pilot: {
      phase: "4D",
      translator: "cursor_agent",
      reviewStatus: "MACHINE_DRAFT",
      notApproved: true,
    },
    filters: { namespace },
    entryCount: entries.length,
    entries: entries.map((e) => e.entry),
  };
}

const failed = [];

for (const g of GROUPS) {
  const exportPath = path.join(
    repoRoot,
    `i18n-meta/packages/fr-4d-export-${g.namespace}.json`
  );
  const importPath = path.join(
    repoRoot,
    `i18n-meta/packages/fr-4d-import-${g.namespace}.json`
  );

  const exportCmd = [
    "node",
    "scripts/i18n/export.js",
    "--locale",
    "fr",
    ...g.flags,
    "--namespace",
    g.namespace,
    "--json",
  ].join(" ");

  const exportJson = JSON.parse(
    execSync(exportCmd, { cwd: repoRoot, encoding: "utf8" })
  );

  if (!exportJson.entries?.length) {
    console.log(`Skip ${g.namespace}: 0 export entries`);
    continue;
  }

  try {
    const pkg = buildPackage(g.namespace, exportJson);
    fs.writeFileSync(importPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    fs.writeFileSync(exportPath, JSON.stringify(exportJson, null, 2) + "\n", "utf8");

    execSync(
      `node scripts/i18n/import.js --file "${importPath}" --apply --namespace ${g.namespace}`,
      { cwd: repoRoot, stdio: "inherit" }
    );
    console.log(`Applied ${g.namespace} (${pkg.entryCount} entries)`);
  } catch (err) {
    console.error(`FAILED ${g.namespace}:`, err.message);
    failed.push({ namespace: g.namespace, error: err.message });
  }
}

console.log("\n--- inventory fr ---");
execSync("node scripts/i18n/inventory.js --locale fr", {
  cwd: repoRoot,
  stdio: "inherit",
});

if (failed.length) {
  console.error("\nFailures:", JSON.stringify(failed, null, 2));
  process.exit(1);
}
