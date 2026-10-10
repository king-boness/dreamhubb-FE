const path = require("path");
const {
  flatten,
  extractPlaceholders,
  pluralPipeParts,
  namespaceOf,
  loadCatalogs,
  UI_ONLY_ALIASES,
  REF_LOCALE,
  hashValue,
  META_DIR,
  readJsonSafe
} = require("./catalog");
const { loadReviewOverrides, inferKeyStatus } = require("./status");
const { loadSourceHashes, diffAgainstSnapshot } = require("./sourceHash");
const { analyzeLocaleOwnership } = require("./sourceOwnership");
const { resolveKeyTarget } = require("./moduleTargets");

function loadGlossary() {
  return readJsonSafe(path.join(META_DIR, "glossary.en-sk.json"), { terms: [] });
}

function terminologyHintsFor(sourceText, glossary) {
  if (typeof sourceText !== "string" || !glossary?.terms?.length) return null;
  const lower = sourceText.toLowerCase();
  const hits = [];
  for (const t of glossary.terms) {
    if (!t?.en) continue;
    const en = String(t.en);
    if (lower.includes(en.toLowerCase())) {
      hits.push({
        en: t.en,
        sk: t.sk || null,
        meaning: t.meaning || null,
        notes: t.notes || null
      });
    }
  }
  return hits.length ? hits : null;
}

/**
 * Build an AI/translator export package (static UI keys only).
 *
 * Filters:
 * - locale (required)
 * - namespace (optional)
 * - onlyMissing
 * - onlyInherited (AST ...enUS inherited; runtime present but not explicit OWN)
 * - onlyIdenticalToEn (available values equal to en-US; optional + onlyExplicit)
 * - onlyStale
 * - onlyNeedsReview
 * - keys (optional allowlist array)
 *
 * Determinism: entries sorted by keyPath. generatedAt is the only volatile field
 * unless opts.deterministic=true (then generatedAt=null).
 * Does NOT rewrite i18n-meta/source-hashes.json.
 */
function buildExportPackage(opts = {}) {
  const locale = opts.locale;
  if (!locale) throw new Error("--locale is required");
  if (UI_ONLY_ALIASES.has(locale)) {
    throw new Error(
      `Locale ${locale} is a UI alias of ${REF_LOCALE} and has no dedicated pack to export`
    );
  }

  const catalogs = loadCatalogs();
  if (!catalogs.locales.includes(locale) && opts.allowMissingPack !== true) {
    if (!catalogs.appLanguages.some((l) => l.code === locale)) {
      throw new Error(`Unknown locale: ${locale}`);
    }
  }

  const overrides = loadReviewOverrides();
  const snapshot = loadSourceHashes();
  const sourceDiff = diffAgainstSnapshot(catalogs.refFlat, snapshot);
  const staleSet = new Set(sourceDiff.staleKeys);
  const flat = catalogs.messages[locale] ? flatten(catalogs.messages[locale]) : {};
  const glossary = loadGlossary();
  let ownership = { inheritedKeys: [], explicitKeys: [] };
  try {
    ownership = analyzeLocaleOwnership(locale);
  } catch {
    /* optional for export filters */
  }
  const inheritedSet = new Set(ownership.inheritedKeys || []);
  const explicitSet = new Set(ownership.explicitKeys || []);

  const nsFilter = opts.namespace || null;
  const keyAllow = opts.keys ? new Set(opts.keys) : null;
  const onlyMissing = Boolean(opts.onlyMissing);
  const onlyInherited = Boolean(opts.onlyInherited);
  const onlyIdenticalToEn = Boolean(opts.onlyIdenticalToEn);
  const onlyStale = Boolean(opts.onlyStale);
  const onlyNeedsReview = Boolean(opts.onlyNeedsReview);

  const entries = [];

  for (const keyPath of catalogs.refKeys) {
    if (nsFilter) {
      const target = resolveKeyTarget(keyPath);
      const ns = namespaceOf(keyPath);
      const ok =
        ns === nsFilter ||
        (target &&
          (target.file === nsFilter || target.ownershipBucket === nsFilter));
      if (!ok) continue;
    }
    if (keyAllow && !keyAllow.has(keyPath)) continue;

    const refValue = catalogs.refFlat[keyPath];
    if (typeof refValue !== "string") continue;

    const missing = !(keyPath in flat);
    const localValue = missing ? null : flat[keyPath];
    const inherited = inheritedSet.has(keyPath);
    const explicit = explicitSet.has(keyPath);
    const identicalToEn = !missing && localValue === refValue;
    const stale = staleSet.has(keyPath);
    const statusInfo = inferKeyStatus({
      locale,
      keyPath,
      refValue,
      localValue,
      missing,
      stale,
      overrides
    });

    if (onlyMissing && !missing) continue;
    if (onlyInherited && !inherited) continue;
    if (onlyIdenticalToEn) {
      if (!identicalToEn) continue;
      if (opts.identicalExplicitOnly && !explicit) continue;
    }
    if (onlyStale && !stale) continue;
    if (onlyNeedsReview && statusInfo.status !== "NEEDS_REVIEW" && !stale) continue;

    let ownershipType = "unknown";
    if (missing) ownershipType = "RUNTIME_MISSING";
    else if (inherited) ownershipType = "INHERITED_EN";
    else if (explicit) ownershipType = "EXPLICIT_OWN";

    entries.push({
      targetLocale: locale,
      keyPath,
      namespace: namespaceOf(keyPath),
      ownershipType,
      sourceLocale: REF_LOCALE,
      sourceText: refValue,
      sourceHash: hashValue(refValue),
      existingTranslation: missing ? null : localValue,
      translation: null,
      placeholders: extractPlaceholders(refValue),
      pluralPipeParts: pluralPipeParts(refValue),
      status: statusInfo.status,
      statusEvidence: statusInfo.evidence,
      statusConfidence: statusInfo.confidence,
      staleCandidate: stale,
      identicalToEn,
      needsReview: statusInfo.status === "NEEDS_REVIEW" || stale,
      notes: null,
      terminologyHints: terminologyHintsFor(refValue, glossary)
    });
  }

  entries.sort((a, b) => (a.keyPath < b.keyPath ? -1 : a.keyPath > b.keyPath ? 1 : 0));

  return {
    formatVersion: 1,
    kind: "dreamhubb-ui-translation-export",
    generatedAt: opts.deterministic ? null : new Date().toISOString(),
    targetLocale: locale,
    sourceLocale: REF_LOCALE,
    filters: {
      namespace: nsFilter,
      onlyMissing,
      onlyInherited,
      onlyIdenticalToEn,
      onlyStale,
      onlyNeedsReview,
      keyCountAllowlist: keyAllow ? keyAllow.size : null
    },
    entryCount: entries.length,
    entries,
    security: {
      containsUserData: false,
      containsSecrets: false,
      containsUgc: false,
      scope: "static_ui_catalog_only"
    },
    sourceHashBaseline: {
      compared: sourceDiff.hasSnapshot,
      staleKeyCount: sourceDiff.staleKeys.length,
      note: "Export never rewrites i18n-meta/source-hashes.json; baseline updates are a separate conscious step."
    }
  };
}

/** Optional CSV for human translators */
function exportToCsv(pkg) {
  const header = [
    "targetLocale",
    "keyPath",
    "namespace",
    "sourceText",
    "sourceHash",
    "existingTranslation",
    "placeholders",
    "status",
    "staleCandidate"
  ];
  const escape = (v) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const rows = pkg.entries.map((e) =>
    [
      e.targetLocale,
      e.keyPath,
      e.namespace,
      e.sourceText,
      e.sourceHash,
      e.existingTranslation,
      (e.placeholders || []).join("|"),
      e.status,
      e.staleCandidate
    ]
      .map(escape)
      .join(",")
  );
  return [header.join(","), ...rows].join("\n") + "\n";
}

module.exports = {
  buildExportPackage,
  exportToCsv,
  terminologyHintsFor
};
