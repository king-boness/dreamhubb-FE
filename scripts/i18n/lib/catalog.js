/**
 * Shared catalog loader for dreamhubb i18n tooling.
 * Source of truth remains src/i18n + src/config/languages.ts (Git).
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const esbuild = require("esbuild");

const ROOT = path.join(__dirname, "..", "..", "..");
const I18N_ENTRY = path.join(ROOT, "src", "i18n", "index.ts");
const LANGUAGES_ENTRY = path.join(ROOT, "src", "config", "languages.ts");
const META_DIR = path.join(ROOT, "i18n-meta");
const REF_LOCALE = "en-US";
const UI_ONLY_ALIASES = new Set(["en-GB"]);

function flatten(obj, prefix = "", out = {}) {
  if (obj == null) {
    if (prefix) out[prefix] = obj;
    return out;
  }
  if (typeof obj !== "object" || Array.isArray(obj)) {
    out[prefix] = obj;
    return out;
  }
  const keys = Object.keys(obj);
  if (keys.length === 0 && prefix) {
    out[prefix] = obj;
    return out;
  }
  for (const key of keys) {
    const next = prefix ? `${prefix}.${key}` : key;
    flatten(obj[key], next, out);
  }
  return out;
}

function shapeTree(obj) {
  if (obj == null) return "null";
  if (typeof obj !== "object" || Array.isArray(obj)) return typeof obj;
  const shape = {};
  for (const [k, v] of Object.entries(obj)) {
    shape[k] = shapeTree(v);
  }
  return shape;
}

function collectShapeConflicts(refShape, localeShape, prefix = "", out = []) {
  if (typeof refShape === "string" || typeof localeShape === "string") {
    if (refShape !== localeShape) {
      out.push({
        path: prefix || "(root)",
        expected: refShape,
        actual: localeShape
      });
    }
    return out;
  }
  if (typeof refShape !== "object" || typeof localeShape !== "object") {
    out.push({
      path: prefix || "(root)",
      expected: refShape,
      actual: localeShape
    });
    return out;
  }
  for (const key of Object.keys(refShape)) {
    const p = prefix ? `${prefix}.${key}` : key;
    if (!(key in localeShape)) continue;
    collectShapeConflicts(refShape[key], localeShape[key], p, out);
  }
  return out;
}

function loadTsModule(entryFile) {
  const outfile = path.join(
    os.tmpdir(),
    `dreamhubb-i18n-tool-${path.basename(entryFile)}-${process.pid}-${Date.now()}.cjs`
  );
  esbuild.buildSync({
    entryPoints: [entryFile],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile,
    logLevel: "silent",
    mainFields: ["module", "main"]
  });
  try {
    delete require.cache[require.resolve(outfile)];
    const mod = require(outfile);
    return mod.default || mod;
  } finally {
    try {
      fs.unlinkSync(outfile);
    } catch {
      /* ignore */
    }
  }
}

/** Extract vue-i18n style placeholders: {name}, {count}, etc. */
function extractPlaceholders(value) {
  if (typeof value !== "string") return [];
  const found = [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
  return [...new Set(found)].sort();
}

/** Detect pipe plural forms: "one | few | other" */
function pluralPipeParts(value) {
  if (typeof value !== "string") return null;
  if (!value.includes("|")) return null;
  return value.split("|").map((p) => p.trim());
}

function namespaceOf(keyPath) {
  const first = String(keyPath).split(".")[0] || "";
  return first || "(root)";
}

function hashValue(value) {
  return crypto.createHash("sha256").update(String(value), "utf8").digest("hex").slice(0, 16);
}

function loadCatalogs() {
  const messages = loadTsModule(I18N_ENTRY);
  const languagesMod = loadTsModule(LANGUAGES_ENTRY);
  const appLanguages = languagesMod.APP_LANGUAGES || languagesMod.default?.APP_LANGUAGES || [];
  if (!messages[REF_LOCALE]) {
    throw new Error(`Reference locale ${REF_LOCALE} missing from i18n messages`);
  }
  const refFlat = flatten(messages[REF_LOCALE]);
  return {
    ROOT,
    META_DIR,
    REF_LOCALE,
    UI_ONLY_ALIASES,
    messages,
    appLanguages,
    locales: Object.keys(messages),
    refFlat,
    refKeys: Object.keys(refFlat),
    refShape: shapeTree(messages[REF_LOCALE])
  };
}

function readJsonSafe(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

module.exports = {
  ROOT,
  META_DIR,
  REF_LOCALE,
  UI_ONLY_ALIASES,
  flatten,
  shapeTree,
  collectShapeConflicts,
  loadTsModule,
  extractPlaceholders,
  pluralPipeParts,
  namespaceOf,
  hashValue,
  loadCatalogs,
  readJsonSafe
};
