#!/usr/bin/env node
/** Restore {placeholder} tokens from en-US source when MT translated brace labels. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const dataPath = path.join(__dirname, "fr-4d-translations-data.mjs");
const exportPath = path.join(repoRoot, "i18n-meta/packages/fr-4d-source-export.json");

const mod = await import(`./fr-4d-translations-data.mjs?ph=${Date.now()}`);
const map = { ...mod.default };
const exp = JSON.parse(fs.readFileSync(exportPath, "utf8"));

function extractPlaceholders(text) {
  const m = text.match(/\{[a-zA-Z0-9_]+\}/g);
  return m ? [...new Set(m)] : [];
}

function restorePlaceholders(fr, en) {
  const enPh = en.match(/\{[a-zA-Z0-9_]+\}/g);
  if (!enPh?.length) return fr;
  let i = 0;
  return fr.replace(/\{[^}]+\}/g, () => enPh[i++] ?? "");
}

const MANUAL = {
  "settingsPages.ban.userFallback": "Utilisateur #{id}",
};

for (const e of exp.entries) {
  const key = e.keyPath;
  if (MANUAL[key]) {
    map[key] = MANUAL[key];
    continue;
  }
  if (map[key]) map[key] = restorePlaceholders(map[key], e.sourceText);
}

const lines = [
  "/** Phase 4D EN→FR machine translations (keyPath → translation) */",
  "export default {",
];
for (const [k, v] of Object.entries(map).sort(([a], [b]) => a.localeCompare(b))) {
  lines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
}
lines.push("};", "");
fs.writeFileSync(dataPath, lines.join("\n"), "utf8");

// validate all placeholders
const missing = [];
for (const e of exp.entries) {
  const tr = map[e.keyPath];
  for (const ph of extractPlaceholders(e.sourceText).map((p) => p.slice(1, -1))) {
    if (!tr?.includes(`{${ph}}`)) missing.push(`${e.keyPath}:{${ph}}`);
  }
}
if (missing.length) {
  console.error("Still missing placeholders:", missing);
  process.exit(1);
}
console.log("Placeholders OK for", exp.entryCount, "keys");
