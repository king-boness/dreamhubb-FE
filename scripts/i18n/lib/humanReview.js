/**
 * Human review workflow (Phase 4C.2).
 *
 * Separate from AI MACHINE_DRAFT import:
 * - Validates reviewer decisions on a filled review package
 * - DRY-RUN / APPLY with attestation gates
 * - Never invents REVIEWED/APPROVED without attested real reviewer
 *
 * Open QA findings (terminology, needs-context) are tracked separately
 * from primary translation status (MACHINE_DRAFT / REVIEWED / …).
 */

const fs = require("fs");
const path = require("path");
const {
  ROOT,
  META_DIR,
  REF_LOCALE,
  flatten,
  loadCatalogs,
  hashValue,
  extractPlaceholders,
  pluralPipeParts,
  namespaceOf,
  readJsonSafe
} = require("./catalog");
const { loadReviewOverrides, overrideKey } = require("./status");
const { loadSourceHashes, diffAgainstSnapshot } = require("./sourceHash");
const { resolveKeyTarget, isSupportedApplyKey } = require("./moduleTargets");
const { applyImportPlan } = require("./applyImport");

const REVIEWER_DECISIONS = new Set([
  "ACCEPT",
  "CORRECT",
  "REJECT",
  "NEEDS_CONTEXT",
  "NOT_REVIEWED"
]);

const FICTIONAL_REVIEWER_IDS = new Set([
  "",
  "ai",
  "cursor",
  "auto",
  "system",
  "fictional",
  "test",
  "placeholder",
  "todo",
  "tbd"
]);

const QA_FINDINGS_FILE = path.join(META_DIR, "qa-findings.json");

function hashTranslation(value) {
  return hashValue(value == null ? "" : String(value));
}

function loadQaFindings() {
  return readJsonSafe(QA_FINDINGS_FILE, {
    version: 1,
    locale: "de",
    note: "Open QA findings are NOT primary review statuses.",
    findings: {}
  });
}

function findingKey(locale, keyPath) {
  return `${locale}::${keyPath}`;
}

/**
 * Build / refresh the human-review work package (all 859 keys).
 */
function buildHumanReviewPackage(opts = {}) {
  const locale = opts.locale || "de";
  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(locale) || locale === "en-US" || locale === "sk") {
    throw new Error(`Human-review export refuses locale=${locale}`);
  }

  const catalogs = loadCatalogs();
  if (!catalogs.messages[locale]) {
    throw new Error(`No message pack for locale ${locale}`);
  }
  const overrides = loadReviewOverrides();
  const qaPreflight = readJsonSafe(
    path.join(META_DIR, `${locale}-qa-preflight.json`),
    readJsonSafe(path.join(META_DIR, "de-qa-preflight-4c1.json"), {})
  );
  const glossary = readJsonSafe(
    path.join(META_DIR, `glossary.${locale}.json`),
    readJsonSafe(path.join(META_DIR, "glossary.de.json"), { terms: [] })
  );
  const snapshot = loadSourceHashes();
  const sourceDiff = diffAgainstSnapshot(catalogs.refFlat, snapshot);
  const staleSet = new Set(sourceDiff.staleKeys);
  const flat = flatten(catalogs.messages[locale] || {});
  const skFlat = flatten(catalogs.messages.sk || {});

  const fixedSet = new Set(qaPreflight.fixesAppliedKeys || []);
  const intentionalSet = new Set(qaPreflight.intentionalIdenticalKeys || []);

  const { inferKeyStatus } = require("./status");
  const entries = [];
  const assigned = new Set();

  function priorityFor(keyPath, localValue, sourceText, status) {
    if (fixedSet.has(keyPath)) return "P0_FIXED_4C1";
    if (intentionalSet.has(keyPath)) return "P1_IDENTICAL_EN";
    const termHit =
      /Donor|Donee|Beitrag|Hilfeaktion|Auffüll|Spende|Token|Feed|Hilfe|Contribution|Donation|Post/i.test(
        String(localValue || "") + " " + String(sourceText || "")
      );
    const authCritical =
      /^(signIn|createAccount|password|email|legalNotice|welcome|register|explainer|contribute|help)/i.test(
        keyPath
      ) ||
      keyPath.startsWith("onboarding.") ||
      keyPath.startsWith("onboardingInfo.");
    const helpTokenRole =
      /contribute|donation|token|donor|donee|help|post|feed/i.test(keyPath) || termHit;
    if (termHit || helpTokenRole) return "P1_TERMINOLOGY";
    if (authCritical) return "P1_AUTH_ONBOARDING";
    if (status === "EXISTING_UNREVIEWED") return "P2_EXISTING_UNREVIEWED";
    return "P3_REMAINING";
  }

  for (const keyPath of catalogs.refKeys) {
    const sourceText = catalogs.refFlat[keyPath];
    if (typeof sourceText !== "string") continue;
    const currentDe = flat[keyPath];
    const missing = !(keyPath in flat);
    const statusInfo = inferKeyStatus({
      locale,
      keyPath,
      refValue: sourceText,
      localValue: currentDe,
      missing,
      stale: staleSet.has(keyPath),
      overrides
    });
    const target = resolveKeyTarget(keyPath);
    const priorityBucket = priorityFor(
      keyPath,
      currentDe,
      sourceText,
      statusInfo.status
    );
    assigned.add(keyPath);

    const termHints = [];
    for (const t of glossary.terms || []) {
      if (!t?.en) continue;
      const blob = `${sourceText} ${currentDe || ""}`;
      if (new RegExp(`\\b${t.en}\\b`, "i").test(blob) || (t.recommendedDe && String(currentDe || "").includes(t.recommendedDe))) {
        termHints.push({
          en: t.en,
          recommendedDe: t.recommendedDe || null,
          decision: t.decision || null,
          flag:
            String(t.decision || "").includes("REVIEW") ||
            String(t.decision || "").includes("PRODUCT")
              ? String(t.decision).includes("PRODUCT")
                ? "PRODUCT_DECISION_REQUIRED"
                : "LINGUISTIC_REVIEW_REQUIRED"
              : null
        });
      }
    }

    entries.push({
      targetLocale: locale,
      namespace: namespaceOf(keyPath),
      keyPath,
      ownershipFile: target?.file || null,
      sourceLocale: REF_LOCALE,
      sourceText,
      sourceHash: hashValue(sourceText),
      currentTranslation: missing ? null : currentDe,
      /** @deprecated use currentTranslation — kept for DE 4C.2 CSV compatibility */
      currentDe: missing ? null : currentDe,
      translationHash: missing ? null : hashTranslation(currentDe),
      skMeaning: skFlat[keyPath] || null,
      placeholders: extractPlaceholders(sourceText),
      pluralPipeParts: pluralPipeParts(sourceText),
      reviewStatus: statusInfo.status,
      statusEvidence: statusInfo.evidence,
      aiQaNote: fixedSet.has(keyPath)
        ? "Corrected in AI preflight 4C.1 — spot-check recommended."
        : intentionalSet.has(keyPath)
          ? "Identical to EN marked intentional in 4C.1 — confirm or keep."
          : "AI preflight 4C.1 — draft quality only; not human-approved.",
      aiQaSeverity: fixedSet.has(keyPath)
        ? "P0_FIXED"
        : intentionalSet.has(keyPath)
          ? "IDENTICAL_EN"
          : priorityBucket.startsWith("P1")
            ? "P1"
            : priorityBucket.startsWith("P2")
              ? "P2"
              : "P3",
      priorityBucket,
      previouslyFixedIn4C1: fixedSet.has(keyPath),
      identicalToEnIntentional: intentionalSet.has(keyPath),
      terminologyHints: termHints,
      productContext: target?.ownershipBucket || namespaceOf(keyPath),
      // Reviewer fillable fields (default empty)
      reviewerDecision: "NOT_REVIEWED",
      correctedTranslation: null,
      reviewerComment: null,
      terminologyDecision: null,
      followUpRequired: false,
      reviewCompleted: false
    });
  }

  entries.sort((a, b) => (a.keyPath < b.keyPath ? -1 : a.keyPath > b.keyPath ? 1 : 0));

  const priorityCounts = {};
  for (const e of entries) {
    priorityCounts[e.priorityBucket] = (priorityCounts[e.priorityBucket] || 0) + 1;
  }

  return {
    formatVersion: 2,
    kind: "dreamhubb-de-human-review-workpackage",
    phase: "4C.2",
    generatedAt: opts.deterministic ? null : new Date().toISOString(),
    targetLocale: locale,
    entryCount: entries.length,
    uniqueKeyCount: assigned.size,
    reviewStatusCounts: entries.reduce((acc, e) => {
      acc[e.reviewStatus] = (acc[e.reviewStatus] || 0) + 1;
      return acc;
    }, {}),
    priorityCounts,
    allowedReviewerDecisions: [...REVIEWER_DECISIONS],
    decisionSemantics: {
      ACCEPT: "Keep currentDe; may mark REVIEWED when attested.",
      CORRECT: "Replace with correctedTranslation; may mark REVIEWED when attested.",
      REJECT: "Keep current text; open QA finding; do not approve.",
      NEEDS_CONTEXT: "No approval; open QA finding for more product context.",
      NOT_REVIEWED: "No status or catalog change."
    },
    attestationRequiredForApply: true,
    glossaryPath: "i18n-meta/glossary.de.json",
    guidePath: "i18n-meta/human-review-guide.de.md",
    terminologyDecisionsPath: "i18n-meta/terminology-decisions.de.json",
    security: {
      containsUserData: false,
      containsSecrets: false,
      containsUgc: false,
      containsLegalBody: false,
      scope: "static_ui_catalog_human_review_only"
    },
    entries
  };
}

function normalizeDecision(raw) {
  if (raw == null || raw === "") return "NOT_REVIEWED";
  return String(raw).trim().toUpperCase();
}

function isAttestationValid(attestation, opts = {}) {
  if (opts.skipAttestation === true) return { ok: true, reason: "skipped_for_fixture" };
  if (!attestation || typeof attestation !== "object") {
    return { ok: false, reason: "missing attestation object" };
  }
  const id = String(attestation.reviewerId || "").trim().toLowerCase();
  if (!id || FICTIONAL_REVIEWER_IDS.has(id)) {
    return {
      ok: false,
      reason: "reviewerId missing or looks fictional/placeholder (refuse fake APPROVED/REVIEWED)"
    };
  }
  if (attestation.confirmedRealReview !== true) {
    return {
      ok: false,
      reason: "attestation.confirmedRealReview must be true for real APPLY"
    };
  }
  if (!attestation.reviewedAt) {
    return { ok: false, reason: "attestation.reviewedAt required" };
  }
  return { ok: true, reason: "ok" };
}

/**
 * Validate a filled human-review result package.
 */
function validateHumanReviewPackage(pkg, opts = {}) {
  const errors = [];
  const warnings = [];
  const catalogs = loadCatalogs();
  const overrides = loadReviewOverrides();
  const snapshot = loadSourceHashes();
  const sourceDiff = diffAgainstSnapshot(catalogs.refFlat, snapshot);
  const staleSet = new Set(sourceDiff.staleKeys);
  const flat = catalogs.messages.de ? flatten(catalogs.messages.de) : {};

  if (!pkg || typeof pkg !== "object") {
    return { ok: false, mode: "VALIDATE", errors: ["Package must be an object"], warnings: [], planned: [] };
  }
  if (pkg.targetLocale !== "de") {
    errors.push(`targetLocale must be de (got ${pkg.targetLocale})`);
  }
  const entries = Array.isArray(pkg.entries) ? pkg.entries : null;
  if (!entries) errors.push("entries must be an array");

  const seen = new Set();
  const planned = [];
  const counts = {
    ACCEPT: 0,
    CORRECT: 0,
    REJECT: 0,
    NEEDS_CONTEXT: 0,
    NOT_REVIEWED: 0
  };

  if (entries) {
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const prefix = `entries[${i}]`;
      if (!e || typeof e !== "object") {
        errors.push(`${prefix}: must be object`);
        continue;
      }
      const keyPath = e.keyPath;
      if (!keyPath || typeof keyPath !== "string") {
        errors.push(`${prefix}: missing keyPath`);
        continue;
      }
      if (seen.has(keyPath)) {
        errors.push(`${prefix}: duplicate keyPath ${keyPath}`);
        continue;
      }
      seen.add(keyPath);

      if (!(keyPath in catalogs.refFlat)) {
        errors.push(`${prefix}: unknown keyPath ${keyPath}`);
        continue;
      }

      const decision = normalizeDecision(e.reviewerDecision);
      if (!REVIEWER_DECISIONS.has(decision)) {
        errors.push(`${prefix}: invalid reviewerDecision ${e.reviewerDecision}`);
        continue;
      }
      counts[decision]++;

      const refValue = catalogs.refFlat[keyPath];
      const currentDe = flat[keyPath];
      const sourceHash = typeof refValue === "string" ? hashValue(refValue) : null;

      if (e.sourceHash != null && sourceHash && e.sourceHash !== sourceHash) {
        errors.push(`${prefix}: sourceHash mismatch / stale EN source for ${keyPath}`);
      }
      if (staleSet.has(keyPath) && decision !== "NOT_REVIEWED") {
        warnings.push(`${prefix}: ${keyPath} is stale vs source-hashes snapshot`);
      }

      // Protect already APPROVED / REVIEWED unless explicit allow
      const ov = overrides.entries?.[overrideKey("de", keyPath)];
      const st = typeof ov === "string" ? ov : ov && ov.status;
      if (
        (st === "APPROVED" || st === "REVIEWED") &&
        (decision === "CORRECT" || decision === "REJECT") &&
        opts.allowOverwriteApproved !== true
      ) {
        errors.push(`${prefix}: refuses to ${decision} protected ${st} key ${keyPath}`);
        continue;
      }

      if (decision === "CORRECT") {
        const next = e.correctedTranslation;
        if (next == null || String(next).trim() === "") {
          errors.push(`${prefix}: CORRECT requires non-empty correctedTranslation`);
          continue;
        }
        if (typeof refValue === "string" && typeof next === "string") {
          const rp = extractPlaceholders(refValue).join(",");
          const lp = extractPlaceholders(next).join(",");
          if (rp !== lp) {
            errors.push(`${prefix}: placeholder mismatch for ${keyPath}`);
          }
          const rPl = pluralPipeParts(refValue);
          const lPl = pluralPipeParts(next);
          if (rPl && (!lPl || rPl.length !== lPl.length)) {
            errors.push(`${prefix}: plural pipe count mismatch for ${keyPath}`);
          }
        }
        if (!isSupportedApplyKey(keyPath)) {
          errors.push(`${prefix}: keyPath ${keyPath} not supported by safe APPLY`);
          continue;
        }
        planned.push({
          keyPath,
          decision,
          action: currentDe === next ? "noop" : "update",
          current: currentDe ?? null,
          next,
          statusAfter: "REVIEWED",
          openQa: false
        });
      } else if (decision === "ACCEPT") {
        if (e.correctedTranslation != null && String(e.correctedTranslation).length) {
          warnings.push(
            `${prefix}: ACCEPT ignores correctedTranslation for ${keyPath}`
          );
        }
        if (e.translationHash != null && currentDe != null) {
          const th = hashTranslation(currentDe);
          if (e.translationHash !== th) {
            errors.push(
              `${prefix}: translationHash mismatch for ${keyPath} (text changed since export)`
            );
            continue;
          }
        }
        planned.push({
          keyPath,
          decision,
          action: "status_only",
          current: currentDe ?? null,
          next: currentDe ?? null,
          statusAfter: "REVIEWED",
          openQa: false
        });
      } else if (decision === "REJECT" || decision === "NEEDS_CONTEXT") {
        planned.push({
          keyPath,
          decision,
          action: "qa_finding",
          current: currentDe ?? null,
          next: currentDe ?? null,
          statusAfter: null, // do not auto-approve
          openQa: true,
          qaKind: decision
        });
      } else {
        // NOT_REVIEWED
        planned.push({
          keyPath,
          decision,
          action: "none",
          current: currentDe ?? null,
          next: currentDe ?? null,
          statusAfter: null,
          openQa: false
        });
      }
    }
  }

  const attestation = isAttestationValid(pkg.attestation, opts);
  if (opts.requireAttestation && !attestation.ok) {
    // Only error when applying; validate can warn
    if (opts.apply === true) errors.push(`attestation: ${attestation.reason}`);
    else warnings.push(`attestation: ${attestation.reason}`);
  }

  return {
    ok: errors.length === 0,
    mode: "VALIDATE",
    targetLocale: "de",
    errors,
    warnings,
    counts,
    planned,
    summary: {
      entryCount: entries ? entries.length : 0,
      ...counts,
      catalogUpdates: planned.filter((p) => p.action === "update").length,
      statusOnly: planned.filter((p) => p.action === "status_only").length,
      qaFindings: planned.filter((p) => p.openQa).length,
      noops: planned.filter((p) => p.action === "noop" || p.action === "none").length,
      attestationOk: attestation.ok
    }
  };
}

function planHumanReviewApply(validation, opts = {}) {
  if (!validation.ok) {
    return {
      ok: false,
      mode: "APPLY_BLOCKED",
      errors: validation.errors,
      summary: null
    };
  }

  const attestation = isAttestationValid(opts.pkg?.attestation, opts);
  if (opts.apply === true && opts.requireAttestation !== false && !attestation.ok) {
    return {
      ok: false,
      mode: "APPLY_BLOCKED",
      errors: [`Refuse APPLY without valid attestation: ${attestation.reason}`],
      summary: null
    };
  }

  const catalogChanges = validation.planned
    .filter((p) => p.action === "update")
    .map((p) => ({
      keyPath: p.keyPath,
      namespace: namespaceOf(p.keyPath),
      action: "update",
      current: p.current,
      next: p.next,
      status: "MACHINE_DRAFT" // catalog write via applyImport; status upgraded separately to REVIEWED
    }));

  const metaPlan = {
    reviewed: validation.planned.filter((p) => p.statusAfter === "REVIEWED"),
    qaFindings: validation.planned.filter((p) => p.openQa),
    untouched: validation.planned.filter((p) => p.action === "none")
  };

  return {
    ok: true,
    mode: opts.apply ? "APPLY_PLAN" : "DRY_RUN",
    catalogChanges,
    metaPlan,
    summary: {
      ...validation.summary,
      filesWouldTouch: [
        ...new Set(
          catalogChanges
            .map((c) => resolveKeyTarget(c.keyPath))
            .filter(Boolean)
            .map((t) => `src/i18n/de/${t.file}.ts`)
        )
      ],
      reviewOverridesWouldWrite: metaPlan.reviewed.length,
      qaFindingsWouldWrite: metaPlan.qaFindings.length
    },
    wrote: false
  };
}

function writeReviewEvidence(plannedReviewed, pkg, opts = {}) {
  const metaDir = opts.metaDir || META_DIR;
  const file = path.join(metaDir, "review-overrides.json");
  const data = opts.metaDir
    ? readJsonSafe(file, { version: 1, entries: {} })
    : loadReviewOverrides();
  if (!data.entries) data.entries = {};
  const catalogs = loadCatalogs();
  const flat = flatten(catalogs.messages.de || {});
  const now = new Date().toISOString();
  const attestation = pkg.attestation || {};
  let written = 0;

  for (const p of plannedReviewed) {
    const key = overrideKey("de", p.keyPath);
    const existing = data.entries[key];
    const st = typeof existing === "string" ? existing : existing && existing.status;
    if (st === "APPROVED" && opts.allowOverwriteApproved !== true) {
      throw new Error(`Refuse to downgrade APPROVED for ${key}`);
    }
    const translation = p.next != null ? p.next : flat[p.keyPath];
    data.entries[key] = {
      status: "REVIEWED",
      evidence: "human_review_package_4c2",
      updatedAt: now,
      review: {
        reviewerId: attestation.reviewerId,
        reviewedAt: attestation.reviewedAt || now,
        decision: p.decision,
        reviewedSourceHash: hashValue(catalogs.refFlat[p.keyPath]),
        reviewedTranslationHash: hashTranslation(translation),
        scope: attestation.scope || "de_ui_catalog",
        note: null
      }
    };
    written++;
  }

  if (!opts.dryRun) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  }
  return { file, written, dryRun: Boolean(opts.dryRun) };
}

function writeQaFindings(plannedFindings, pkg, opts = {}) {
  const metaDir = opts.metaDir || META_DIR;
  const file = path.join(metaDir, "qa-findings.json");
  const data = opts.metaDir
    ? readJsonSafe(file, { version: 1, findings: {} })
    : loadQaFindings();
  if (!data.findings) data.findings = {};
  const now = new Date().toISOString();
  let written = 0;
  for (const p of plannedFindings) {
    const key = findingKey("de", p.keyPath);
    data.findings[key] = {
      locale: "de",
      keyPath: p.keyPath,
      kind: p.qaKind,
      open: true,
      updatedAt: now,
      reviewerId: pkg.attestation?.reviewerId || null,
      note: null
    };
    written++;
  }
  if (!opts.dryRun) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  }
  return { file, written, dryRun: Boolean(opts.dryRun) };
}

/**
 * Apply attested human review. Fixture tests may set skipAttestation + root.
 */
function applyHumanReviewPackage(pkg, opts = {}) {
  const requireAttestation = opts.requireAttestation !== false && opts.skipAttestation !== true;
  const validation = validateHumanReviewPackage(pkg, {
    ...opts,
    requireAttestation,
    apply: opts.apply === true
  });
  if (!validation.ok) {
    return { ...validation, mode: "APPLY_BLOCKED", wrote: false };
  }

  const plan = planHumanReviewApply(validation, {
    ...opts,
    pkg,
    requireAttestation,
    apply: opts.apply === true
  });
  if (!plan.ok) return { ...plan, wrote: false };

  const dryRun = !(opts.apply === true && opts.dryRun === false);
  if (dryRun) {
    return {
      ok: true,
      mode: "DRY_RUN",
      wrote: false,
      counts: validation.counts,
      summary: plan.summary,
      errors: [],
      warnings: validation.warnings,
      diffPreview: {
        catalogUpdates: plan.catalogChanges.map((c) => `${c.action} ${c.keyPath}`),
        reviewOverrides: plan.metaPlan.reviewed.map((p) => p.keyPath),
        qaFindings: plan.metaPlan.qaFindings.map((p) => `${p.qaKind}:${p.keyPath}`)
      }
    };
  }

  // Catalog CORRECT updates via existing Safe APPLY
  let catalogResult = null;
  if (plan.catalogChanges.length) {
    const importValidation = {
      ok: true,
      targetLocale: "de",
      plannedChanges: plan.catalogChanges
    };
    catalogResult = applyImportPlan(importValidation, {
      root: opts.root || ROOT,
      apply: true,
      dryRun: false,
      allowUpdates: true,
      skipReviewOverrides: true // we write REVIEWED evidence ourselves
    });
    if (!catalogResult.ok) {
      return {
        ok: false,
        mode: "APPLY_BLOCKED",
        errors: catalogResult.errors || ["catalog APPLY failed"],
        wrote: false,
        catalogResult
      };
    }
  }

  const reviewMeta = writeReviewEvidence(plan.metaPlan.reviewed, pkg, {
    dryRun: false,
    allowOverwriteApproved: opts.allowOverwriteApproved,
    metaDir: opts.metaDir
  });
  const qaMeta = writeQaFindings(plan.metaPlan.qaFindings, pkg, {
    dryRun: false,
    metaDir: opts.metaDir
  });

  return {
    ok: true,
    mode: "APPLY",
    wrote: true,
    counts: validation.counts,
    summary: plan.summary,
    reviewMeta,
    qaMeta,
    catalogResult: catalogResult
      ? { mode: catalogResult.mode, touched: catalogResult.touchedFiles }
      : { mode: "NO_CATALOG_CHANGES", touched: [] },
    errors: [],
    warnings: validation.warnings
  };
}

function exportHumanReviewCsv(pkg) {
  const header = [
    "keyPath",
    "namespace",
    "priorityBucket",
    "sourceText",
    "currentDe",
    "skMeaning",
    "reviewStatus",
    "aiQaSeverity",
    "aiQaNote",
    "sourceHash",
    "translationHash",
    "reviewerDecision",
    "correctedTranslation",
    "reviewerComment",
    "terminologyDecision",
    "followUpRequired",
    "reviewCompleted"
  ];
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = (pkg.entries || []).map((e) => header.map((h) => esc(e[h])).join(","));
  return [header.join(","), ...rows].join("\n") + "\n";
}

function countOpenQaFindings(locale = "de") {
  const data = loadQaFindings();
  return Object.values(data.findings || {}).filter(
    (f) => f && f.open && (locale == null || f.locale === locale)
  ).length;
}

/**
 * Detect REVIEWED entries whose source or translation hash no longer matches.
 */
function detectStaleReviews(locale = "de") {
  const overrides = loadReviewOverrides();
  const catalogs = loadCatalogs();
  const flat = flatten(catalogs.messages[locale] || {});
  const stale = [];
  for (const [key, val] of Object.entries(overrides.entries || {})) {
    if (!key.startsWith(`${locale}::`)) continue;
    const obj = typeof val === "object" && val ? val : null;
    if (!obj || (obj.status !== "REVIEWED" && obj.status !== "APPROVED")) continue;
    const review = obj.review;
    if (!review) continue;
    const keyPath = key.slice(locale.length + 2);
    const src = catalogs.refFlat[keyPath];
    const loc = flat[keyPath];
    if (typeof src === "string" && review.reviewedSourceHash && review.reviewedSourceHash !== hashValue(src)) {
      stale.push({ keyPath, reason: "source_changed" });
    }
    if (
      typeof loc === "string" &&
      review.reviewedTranslationHash &&
      review.reviewedTranslationHash !== hashTranslation(loc)
    ) {
      stale.push({ keyPath, reason: "translation_changed" });
    }
  }
  return stale;
}

module.exports = {
  REVIEWER_DECISIONS,
  FICTIONAL_REVIEWER_IDS,
  buildHumanReviewPackage,
  exportHumanReviewCsv,
  validateHumanReviewPackage,
  planHumanReviewApply,
  applyHumanReviewPackage,
  loadQaFindings,
  countOpenQaFindings,
  detectStaleReviews,
  hashTranslation,
  isAttestationValid
};
