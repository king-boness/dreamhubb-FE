#!/usr/bin/env node
/**
 * Batch EN→FR for fr-4d (machine draft). Uses gtx client; post-processes product terms.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const exportPath = path.join(repoRoot, "i18n-meta/packages/fr-4d-source-export.json");
const outDataPath = path.join(repoRoot, "scripts/i18n/fr-4d-translations-data.mjs");
const outMapPath = path.join(repoRoot, "i18n-meta/packages/fr-4d-en-fr-map.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translateEn(text) {
  if (!text || !text.trim()) return text;
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", "fr");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${text.slice(0, 40)}`);
  const data = await res.json();
  return data[0].map((p) => p[0]).join("");
}

function applyTerminology(fr, en, keyPath) {
  let s = fr;
  // Brand & product terms
  s = s.replace(/\bdreamhubb\b/gi, "dreamhubb");
  s = s.replace(/\bDonors\b/g, "Donors");
  s = s.replace(/\bDonor\b/g, "Donor");
  s = s.replace(/\bDonees\b/g, "Donees");
  s = s.replace(/\bDonee\b/g, "Donee");
  s = s.replace(/\bTokens\b/g, "Tokens");
  s = s.replace(/\btokens\b/g, "tokens");
  s = s.replace(/\bToken\b/g, "Token");

  // Post = Publication (not social "post" only when EN used Post/post for publication)
  if (/post/i.test(en) && !/postal/i.test(en)) {
    s = s.replace(/\bpublications\b/gi, (m) => m);
    s = s.replace(/\bPublication\b/g, "Publication");
    s = s.replace(/\bpublication\b/g, "publication");
    s = s.replace(/\bPost\b/g, "Publication");
    s = s.replace(/\bpost\b/g, "publication");
    s = s.replace(/\bposts\b/g, "publications");
    s = s.replace(/\bPosts\b/g, "Publications");
  }

  // Help = Aide (avoid "aider" as noun)
  if (/\bHelp\b/.test(en) || keyPath.includes("Help") || keyPath.includes("help")) {
    s = s.replace(/\bAide\b/g, "Aide");
  }

  // Token top-up: avoid charity "don"
  s = s.replace(/\bdons\b/gi, "recharges");
  s = s.replace(/\bdon\b/gi, (m, off) => {
    const ctx = s.slice(Math.max(0, off - 20), off + 20).toLowerCase();
    if (ctx.includes("token")) return "recharge";
    return m;
  });

  // Contribution vs publication
  if (en.includes("Contribution") || keyPath.includes("contribution")) {
    s = s.replace(/\bpublication\b/gi, "contribution");
  }

  // Vous form tweaks (gtx usually gives vous)
  s = s.replace(/\btu\b/g, "vous");
  s = s.replace(/\bton\b/g, "votre");
  s = s.replace(/\bta\b/g, "votre");
  s = s.replace(/\btes\b/g, "vos");

  return s;
}

async function translateWithPlurals(en) {
  if (!en.includes("|")) {
    return applyTerminology(await translateEn(en), en, "");
  }
  const parts = en.split("|").map((p) => p.trim());
  const out = [];
  for (const part of parts) {
    out.push(applyTerminology(await translateEn(part), part, ""));
    await sleep(120);
  }
  return out.join(" | ");
}

async function main() {
  const exp = JSON.parse(fs.readFileSync(exportPath, "utf8"));
  const enToKeys = new Map();
  for (const e of exp.entries) {
    if (!enToKeys.has(e.sourceText)) enToKeys.set(e.sourceText, []);
    enToKeys.get(e.sourceText).push(e.keyPath);
  }

  const enFr = {};
  const entries = [...enToKeys.keys()];
  console.log(`Translating ${entries.length} unique EN strings…`);
  let i = 0;
  for (const en of entries) {
    i++;
    if (i % 25 === 0) console.log(`  ${i}/${entries.length}`);
    let fr;
    try {
      fr = await translateWithPlurals(en);
    } catch (err) {
      console.error("FAIL", en.slice(0, 60), err.message);
      fr = en;
    }
    enFr[en] = applyTerminology(fr, en, enToKeys.get(en)[0]);
    await sleep(150);
  }

  fs.writeFileSync(outMapPath, JSON.stringify(enFr, null, 2) + "\n", "utf8");

  const keyMap = {};
  for (const e of exp.entries) {
    const fr = enFr[e.sourceText];
    keyMap[e.keyPath] = applyTerminology(fr, e.sourceText, e.keyPath);
  }

  const lines = ['/** Phase 4D EN→FR machine translations (keyPath → translation) */', "export default {"];
  for (const [k, v] of Object.entries(keyMap).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  }
  lines.push("};", "");
  fs.writeFileSync(outDataPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${Object.keys(keyMap).length} keys → ${outDataPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
