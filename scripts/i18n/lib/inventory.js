const path = require("path");
const {
  flatten,
  collectShapeConflicts,
  shapeTree,
  extractPlaceholders,
  pluralPipeParts,
  namespaceOf,
  loadCatalogs,
  UI_ONLY_ALIASES,
  REF_LOCALE,
  readJsonSafe,
  META_DIR
} = require("./catalog");
const { loadReviewOverrides, inferKeyStatus } = require("./status");
const { loadSourceHashes, diffAgainstSnapshot } = require("./sourceHash");
const { analyzeLocaleOwnership } = require("./sourceOwnership");

function loadLocaleNames() {
  return readJsonSafe(path.join(META_DIR, "locale-names.json"), { locales: {} });
}

/**
 * Readiness is advisory only — never gates releases automatically.
 * Uses explicit-own coverage (not inherited EN spreads) for "own" signal.
 */
function computeReadiness({
  isAlias,
  keyCoveragePct,
  explicitOwnPct,
  structuralErrors,
  missing,
  statusCounts
}) {
  if (isAlias) {
    return {
      status: "APPROVED",
      confidence: "EXACT",
      reason: "UI alias of en-US (no dedicated pack)"
    };
  }
  if (structuralErrors > 0) {
    return {
      status: "INCOMPLETE",
      confidence: "EXACT",
      reason: "structural conflicts present"
    };
  }
  if (missing > 0 || keyCoveragePct < 99.9) {
    return {
      status: "INCOMPLETE",
      confidence: "EXACT",
      reason: `missing ${missing} keys (availableCoverage ${keyCoveragePct}%)`
    };
  }
  if ((statusCounts.APPROVED || 0) === 0 && (statusCounts.REVIEWED || 0) === 0) {
    if (explicitOwnPct >= 99.9) {
      return {
        status: "READY_FOR_QA",
        confidence: "ESTIMATED",
        reason:
          "100% keys available with full explicit values; review coverage not evidenced → not APPROVED"
      };
    }
  }
  if ((statusCounts.APPROVED || 0) > 0 && missing === 0) {
    return {
      status: "IN_REVIEW",
      confidence: "ESTIMATED",
      reason: "partial explicit approvals exist; full APPROVED requires process evidence"
    };
  }
  return {
    status: "DRAFT",
    confidence: "ESTIMATED",
    reason: "pack present without complete review evidence"
  };
}

function analyzeLocale(ctx, locale) {
  const {
    messages,
    refFlat,
    refKeys,
    refShape,
    staleSet,
    overrides,
    localeNames,
    ownershipByLocale
  } = ctx;

  const isAlias = UI_ONLY_ALIASES.has(locale);
  const names = localeNames.locales?.[locale] || {};

  if (isAlias) {
    return {
      locale,
      englishName: names.english || "English (UK)",
      nativeName: names.native || "English (UK)",
      hasMessagePack: false,
      isAlias: true,
      aliasOf: REF_LOCALE,
      referenceKeys: refKeys.length,
      availableKeys: 0,
      explicitOwnKeys: 0,
      inheritedSourceKeys: 0,
      missing: 0,
      extra: 0,
      empty: 0,
      structuralConflicts: 0,
      placeholderMismatches: 0,
      pluralMismatches: 0,
      availableKeyCoveragePct: 100,
      explicitOwnCoveragePct: 0,
      // legacy aliases for older consumers
      keyCoveragePct: 100,
      ownKeys: 0,
      ownTranslationCoveragePct: 0,
      identicalToEnCount: 0,
      identicalToEnExplicitCount: 0,
      differentFromEnCount: 0,
      estimatedRuntimeFallbackKeys: 0,
      statusCounts: { INTENTIONALLY_UNCHANGED: 0 },
      readiness: computeReadiness({
        isAlias: true,
        keyCoveragePct: 100,
        explicitOwnPct: 0,
        structuralErrors: 0,
        missing: 0,
        statusCounts: {}
      }),
      metricsConfidence: {
        availableKeyCoverage: "EXACT",
        explicitOwnValues: "EXACT",
        inheritedSourceValues: "EXACT",
        estimatedFallback: "EXACT",
        reviewCoverage: "EXACT"
      }
    };
  }

  const tree = messages[locale];
  const ownership = ownershipByLocale[locale] || {
    confidence: "UNKNOWN",
    explicitKeys: [],
    inheritedKeys: [],
    unknownReasons: ["ownership_not_computed"]
  };
  const explicitSet = new Set(ownership.explicitKeys || []);
  const inheritedSet = new Set(ownership.inheritedKeys || []);

  if (!tree) {
    return {
      locale,
      englishName: names.english || locale,
      nativeName: names.native || locale,
      hasMessagePack: false,
      isAlias: false,
      referenceKeys: refKeys.length,
      availableKeys: 0,
      explicitOwnKeys: 0,
      inheritedSourceKeys: 0,
      missing: refKeys.length,
      extra: 0,
      empty: 0,
      structuralConflicts: 0,
      placeholderMismatches: 0,
      pluralMismatches: 0,
      availableKeyCoveragePct: 0,
      explicitOwnCoveragePct: 0,
      keyCoveragePct: 0,
      ownKeys: 0,
      ownTranslationCoveragePct: 0,
      identicalToEnCount: 0,
      identicalToEnExplicitCount: 0,
      differentFromEnCount: 0,
      estimatedRuntimeFallbackKeys: refKeys.length,
      statusCounts: { MISSING: refKeys.length },
      readiness: computeReadiness({
        isAlias: false,
        keyCoveragePct: 0,
        explicitOwnPct: 0,
        structuralErrors: 0,
        missing: refKeys.length,
        statusCounts: { MISSING: refKeys.length }
      }),
      metricsConfidence: {
        availableKeyCoverage: "EXACT",
        explicitOwnValues: ownership.confidence || "UNKNOWN",
        inheritedSourceValues: ownership.confidence || "UNKNOWN",
        estimatedFallback: "EXACT",
        reviewCoverage: "UNKNOWN"
      }
    };
  }

  const flat = flatten(tree);
  const localKeys = Object.keys(flat);
  const missingKeys = refKeys.filter((k) => !(k in flat));
  const availableKeysList = refKeys.filter((k) => k in flat);
  const extraKeys = localKeys.filter((k) => !(k in refFlat));
  const emptyKeys = localKeys.filter(
    (k) => typeof flat[k] === "string" && flat[k].trim() === ""
  );
  const shapeConflicts = collectShapeConflicts(refShape, shapeTree(tree));

  // Ownership intersected with keys that actually exist in the runtime pack
  const explicitOwnKeysList = availableKeysList.filter((k) => explicitSet.has(k));
  const inheritedSourceKeysList = availableKeysList.filter((k) => inheritedSet.has(k));

  let identicalToEn = 0;
  let identicalToEnExplicit = 0;
  let differentFromEn = 0;
  let placeholderMismatches = 0;
  let pluralMismatches = 0;
  const statusCounts = {};

  for (const k of refKeys) {
    const refV = refFlat[k];
    const locV = flat[k];
    const missing = !(k in flat);
    const stale = staleSet.has(k) && !missing;

    if (!missing && typeof locV === "string" && typeof refV === "string") {
      if (locV === refV) {
        identicalToEn++;
        if (explicitSet.has(k)) identicalToEnExplicit++;
      } else {
        differentFromEn++;
      }

      const rp = extractPlaceholders(refV);
      const lp = extractPlaceholders(locV);
      if (rp.join(",") !== lp.join(",")) placeholderMismatches++;

      const rPl = pluralPipeParts(refV);
      const lPl = pluralPipeParts(locV);
      if (rPl && lPl && rPl.length !== lPl.length) pluralMismatches++;
      if (rPl && !lPl) pluralMismatches++;
    }

    const { status } = inferKeyStatus({
      locale,
      keyPath: k,
      refValue: refV,
      localValue: locV,
      missing,
      stale,
      overrides
    });
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  const availableCount = availableKeysList.length;
  const availableKeyCoveragePct = Number(
    ((availableCount / refKeys.length) * 100).toFixed(1)
  );
  const explicitOwnCoveragePct = Number(
    ((explicitOwnKeysList.length / refKeys.length) * 100).toFixed(1)
  );
  const estimatedRuntimeFallbackKeys = missingKeys.length;

  const reviewed =
    (statusCounts.REVIEWED || 0) + (statusCounts.APPROVED || 0);
  const reviewCoveragePct = Number(((reviewed / refKeys.length) * 100).toFixed(1));

  const ownershipConfidence = ownership.confidence || "UNKNOWN";

  return {
    locale,
    englishName: names.english || locale,
    nativeName: names.native || locale,
    hasMessagePack: true,
    isAlias: false,
    referenceKeys: refKeys.length,
    availableKeys: availableCount,
    explicitOwnKeys: explicitOwnKeysList.length,
    inheritedSourceKeys: inheritedSourceKeysList.length,
    // legacy field: previously counted all pack keys including inherited spreads
    ownKeys: availableCount,
    missing: missingKeys.length,
    extra: extraKeys.length,
    empty: emptyKeys.length,
    structuralConflicts: shapeConflicts.length,
    placeholderMismatches,
    pluralMismatches,
    availableKeyCoveragePct,
    explicitOwnCoveragePct,
    keyCoveragePct: availableKeyCoveragePct,
    // legacy own% previously equaled key%; now own% = explicit own
    ownTranslationCoveragePct: explicitOwnCoveragePct,
    identicalToEnCount: identicalToEn,
    identicalToEnExplicitCount: identicalToEnExplicit,
    differentFromEnCount: differentFromEn,
    estimatedRuntimeFallbackKeys,
    reviewCoveragePct,
    statusCounts,
    ownership: {
      confidence: ownershipConfidence,
      unknownReasons: ownership.unknownReasons || [],
      modules: ownership.modules || {}
    },
    readiness: computeReadiness({
      isAlias: false,
      keyCoveragePct: availableKeyCoveragePct,
      explicitOwnPct: explicitOwnCoveragePct,
      structuralErrors: shapeConflicts.length,
      missing: missingKeys.length,
      statusCounts
    }),
    metricsConfidence: {
      availableKeyCoverage: "EXACT",
      explicitOwnValues: ownershipConfidence,
      inheritedSourceValues: ownershipConfidence,
      estimatedFallback: "EXACT",
      identicalToEnIntent: "UNKNOWN",
      reviewCoverage:
        reviewed > 0 || Object.keys(overrides.entries || {}).length > 0
          ? "EXACT"
          : "UNKNOWN"
    },
    sampleMissing: missingKeys.slice(0, 5),
    // Open QA findings (human REJECT / NEEDS_CONTEXT) — NOT a primary review status
    openQaFindings: 0
  };
}

function buildInventory(/* options reserved for future filters */) {
  const catalogs = loadCatalogs();
  const overrides = loadReviewOverrides();
  const localeNames = loadLocaleNames();
  let openQaByLocale = {};
  try {
    const { countOpenQaFindings, loadQaFindings } = require("./humanReview");
    const qa = loadQaFindings();
    for (const f of Object.values(qa.findings || {})) {
      if (!f || !f.open) continue;
      const loc = f.locale || "de";
      openQaByLocale[loc] = (openQaByLocale[loc] || 0) + 1;
    }
    void countOpenQaFindings;
  } catch {
    openQaByLocale = {};
  }
  const snapshot = loadSourceHashes();
  const sourceDiff = diffAgainstSnapshot(catalogs.refFlat, snapshot);
  const staleSet = new Set(sourceDiff.staleKeys);

  const ownershipByLocale = {};
  for (const loc of catalogs.locales) {
    ownershipByLocale[loc] = analyzeLocaleOwnership(loc);
  }

  const ctx = {
    ...catalogs,
    overrides,
    localeNames,
    staleSet,
    sourceDiff,
    ownershipByLocale
  };

  const uiCodes = catalogs.appLanguages.map((l) => l.code);
  const locales = [];

  for (const code of uiCodes) {
    const row = analyzeLocale(ctx, code);
    row.openQaFindings = openQaByLocale[code] || 0;
    locales.push(row);
  }

  for (const loc of catalogs.locales) {
    if (!uiCodes.includes(loc) && !UI_ONLY_ALIASES.has(loc)) {
      locales.push({
        ...analyzeLocale(ctx, loc),
        note: "message_pack_not_in_APP_LANGUAGES"
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    referenceLocale: REF_LOCALE,
    referenceKeyCount: catalogs.refKeys.length,
    uiLanguageCount: uiCodes.length,
    messagePackCount: catalogs.locales.length,
    metricDefinitions: {
      availableKeyCoverage:
        "Keys present in the runtime message pack (includes values inherited via ...enUS spreads).",
      explicitOwnValues:
        "Leaf keys written as PropertyAssignments in locale TS modules (AST). Not proof of correct translation.",
      inheritedSourceValues:
        "Leaf keys introduced only by spreading en-US source modules (AST).",
      runtimeFallback:
        "Keys absent from the pack; vue-i18n fallbackLocale (en-US) at runtime.",
      identicalToEn:
        "Available string values equal to en-US (includes inherited). identicalToEnExplicitCount = among explicit only.",
      reviewedApproved: "Only from i18n-meta/review-overrides.json evidence."
    },
    sourceHash: {
      hasSnapshot: sourceDiff.hasSnapshot,
      staleKeyCount: sourceDiff.staleKeys.length,
      newKeyCount: sourceDiff.newKeys.length,
      removedKeyCount: sourceDiff.removedKeys.length,
      sampleStale: sourceDiff.staleKeys.slice(0, 10)
    },
    locales,
    namespaces: [...new Set(catalogs.refKeys.map(namespaceOf))].sort()
  };
}

module.exports = {
  buildInventory,
  analyzeLocale,
  computeReadiness
};
