/**
 * Translation status inference — evidence-based, never invents APPROVED/MACHINE_DRAFT.
 *
 * Statuses:
 * - MISSING
 * - EXISTING_UNREVIEWED
 * - MACHINE_DRAFT (only if review-overrides says so)
 * - REVIEWED (only if review-overrides says so)
 * - APPROVED (only if review-overrides says so)
 * - INTENTIONALLY_UNCHANGED (only if review-overrides or brand allowlist exact match)
 * - NEEDS_REVIEW (stale vs source hash, or same-as-EN without allowlist)
 */

const path = require("path");
const { META_DIR, readJsonSafe } = require("./catalog");

const BRAND_ALLOWLIST = new Set([
  "dreamhubb",
  "Dreamhubb",
  "Token",
  "Tokens",
  "OK",
  "FAQ",
  "URL",
  "API",
  "JWT",
  "iOS",
  "Android",
  "App Store",
  "Google Play"
]);

function loadReviewOverrides() {
  return readJsonSafe(path.join(META_DIR, "review-overrides.json"), {
    version: 1,
    /**
     * Map: `${locale}::${keyPath}` → status
     * Only explicit human/AI-workflow evidence may set MACHINE_DRAFT/REVIEWED/APPROVED/
     * INTENTIONALLY_UNCHANGED here.
     */
    entries: {}
  });
}

function overrideKey(locale, keyPath) {
  return `${locale}::${keyPath}`;
}

/**
 * @returns {{ status: string, evidence: string, confidence: "EXACT"|"ESTIMATED"|"UNKNOWN" }}
 */
function inferKeyStatus({
  locale,
  keyPath,
  refValue,
  localValue,
  missing,
  stale,
  overrides
}) {
  const ov = overrides.entries?.[overrideKey(locale, keyPath)];
  if (ov && typeof ov === "string") {
    return { status: ov, evidence: "review-overrides", confidence: "EXACT" };
  }
  if (ov && typeof ov === "object" && ov.status) {
    return {
      status: ov.status,
      evidence: ov.evidence || "review-overrides",
      confidence: "EXACT"
    };
  }

  if (missing || localValue === undefined) {
    return { status: "MISSING", evidence: "absent_in_locale_pack", confidence: "EXACT" };
  }

  if (stale) {
    return {
      status: "NEEDS_REVIEW",
      evidence: "en_source_hash_changed",
      confidence: "EXACT"
    };
  }

  if (typeof localValue === "string" && typeof refValue === "string" && localValue === refValue) {
    if (BRAND_ALLOWLIST.has(localValue) || localValue.toLowerCase() === "dreamhubb") {
      return {
        status: "INTENTIONALLY_UNCHANGED",
        evidence: "brand_or_proper_noun_allowlist",
        confidence: "ESTIMATED"
      };
    }
    return {
      status: "NEEDS_REVIEW",
      evidence: "identical_to_en_us_unknown_intent",
      confidence: "UNKNOWN"
    };
  }

  return {
    status: "EXISTING_UNREVIEWED",
    evidence: "present_in_locale_pack_unknown_origin",
    confidence: "EXACT"
  };
}

function summarizeStatuses(statusCounts) {
  return { ...statusCounts };
}

module.exports = {
  BRAND_ALLOWLIST,
  loadReviewOverrides,
  inferKeyStatus,
  summarizeStatuses,
  overrideKey
};
