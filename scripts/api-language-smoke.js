#!/usr/bin/env node
/**
 * Smoke-check resolveAcceptLanguageHeader mapping (Phase 3B).
 */
const path = require("path");
const os = require("os");
const esbuild = require("esbuild");

const outfile = path.join(os.tmpdir(), `api-lang-${process.pid}.cjs`);
esbuild.buildSync({
  entryPoints: [path.join(__dirname, "..", "src", "utils", "apiLanguage.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile,
  logLevel: "silent"
});

const { resolveAcceptLanguageHeader } = require(outfile);

global.localStorage = {
  _d: {},
  getItem(k) {
    return this._d[k] ?? null;
  },
  setItem(k, v) {
    this._d[k] = String(v);
  }
};

const cases = [
  ["sk", "sk"],
  ["en-US", "en-US"],
  ["en-GB", "en-US"],
  ["de", "de"],
  [null, "en-US"]
];

let failed = 0;
for (const [stored, expected] of cases) {
  global.localStorage._d = {};
  if (stored != null) global.localStorage.setItem("dreamhubb_language", stored);
  const got = resolveAcceptLanguageHeader();
  const ok = got === expected;
  console.log(`${stored} → ${got}${ok ? "" : ` ✗ expected ${expected}`}`);
  if (!ok) failed++;
}

console.log(failed === 0 ? "\nPASS" : `\nFAIL (${failed})`);
process.exit(failed === 0 ? 0 : 1);
