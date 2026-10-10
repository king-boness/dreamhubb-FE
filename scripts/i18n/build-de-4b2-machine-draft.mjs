import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DE_4B2 } from "./de-4b2-translations-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const exportPath = path.join(
  repoRoot,
  "i18n-meta/packages/de-4b2-missing-export.json"
);
const outPath = path.join(
  repoRoot,
  "i18n-meta/packages/de-4b2-machine-draft.json"
);

const exp = JSON.parse(fs.readFileSync(exportPath, "utf8"));

function extractPlaceholders(text) {
  const m = text.match(/\{[a-zA-Z0-9_]+\}/g);
  return m ? [...new Set(m.map((p) => p.slice(1, -1)))] : [];
}

const missing = [];
const pluralMismatch = [];

const entries = exp.entries.map((entry) => {
  const key = entry.keyPath;
  const tr = DE_4B2[key];
  if (tr == null) missing.push(key);

  const enParts = entry.sourceText.includes("|")
    ? entry.sourceText.split("|").map((s) => s.trim())
    : null;
  const deParts = tr && tr.includes("|") ? tr.split("|").map((s) => s.trim()) : null;
  if (enParts && deParts && enParts.length !== deParts.length) {
    pluralMismatch.push({ key, en: enParts.length, de: deParts.length });
  }

  for (const ph of entry.placeholders ?? []) {
    const token = `{${ph}}`;
    if (tr && !tr.includes(token)) {
      missing.push(`${key}:placeholder:${ph}`);
    }
  }

  const { status, statusEvidence, ...rest } = entry;
  return {
    ...rest,
    translation: tr,
    status: "MACHINE_DRAFT",
    statusEvidence: "phase_4b2_cursor_ai",
  };
});

if (missing.length) {
  console.error("Missing translations or placeholders:", missing);
  process.exit(1);
}
if (pluralMismatch.length) {
  console.error("Plural segment mismatch:", pluralMismatch);
  process.exit(1);
}

const out = {
  kind: "dreamhubb-ui-translation-import",
  targetLocale: "de",
  pilot: {
    phase: "4B.2",
    translator: "cursor_agent",
    reviewStatus: "MACHINE_DRAFT",
    notApproved: true,
  },
  entryCount: entries.length,
  entries,
};

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ entryCount: entries.length, path: outPath }));
