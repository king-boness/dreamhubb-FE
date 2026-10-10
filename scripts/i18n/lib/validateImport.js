const {
  flatten,
  extractPlaceholders,
  pluralPipeParts,
  namespaceOf,
  loadCatalogs,
  UI_ONLY_ALIASES,
  REF_LOCALE,
  hashValue
} = require("./catalog");
const { loadReviewOverrides, overrideKey } = require("./status");
const { loadSourceHashes, diffAgainstSnapshot } = require("./sourceHash");
const {
  applyImportPlan,
  isSupportedApplyKey,
  resolveKeyTarget,
  PROTECTED_LOCALES
} = require("./applyImport");
const { analyzeLocaleOwnership } = require("./sourceOwnership");

/**
 * Validate an import package without writing catalogs (VALIDATE / DRY-RUN).
 *
 * Expected package shape (compatible with export):
 * {
 *   targetLocale, entries: [{ keyPath, sourceText?, sourceHash?, translation|targetText, status? }]
 * }
 */
function validateImportPackage(pkg, opts = {}) {
  const catalogs = loadCatalogs();
  const overrides = loadReviewOverrides();
  const snapshot = loadSourceHashes();
  const sourceDiff = diffAgainstSnapshot(catalogs.refFlat, snapshot);
  const staleSet = new Set(sourceDiff.staleKeys);
  const errors = [];
  const warnings = [];
  const planned = [];
  const rejected = [];

  if (!pkg || typeof pkg !== "object") {
    return {
      ok: false,
      mode: opts.apply ? "APPLY_BLOCKED" : "VALIDATE",
      errors: ["Package must be a JSON object"],
      warnings: [],
      plannedChanges: [],
      rejected: []
    };
  }

  const locale = pkg.targetLocale || pkg.locale;
  if (!locale || typeof locale !== "string") {
    errors.push("Missing targetLocale");
  } else if (UI_ONLY_ALIASES.has(locale)) {
    errors.push(`Cannot import into UI alias locale ${locale}`);
  } else if (!catalogs.appLanguages.some((l) => l.code === locale)) {
    errors.push(`Unknown target locale: ${locale}`);
  } else if (!catalogs.messages[locale]) {
    errors.push(`No message pack registered for locale: ${locale}`);
  } else if (PROTECTED_LOCALES.has(locale) && opts.allowProtectedLocales !== true) {
    errors.push(`Refuses to import into protected locale: ${locale}`);
  }

  let inheritedSet = new Set();
  if (locale && catalogs.messages[locale]) {
    try {
      const ownership = analyzeLocaleOwnership(locale);
      inheritedSet = new Set(ownership.inheritedKeys || []);
    } catch {
      inheritedSet = new Set();
    }
  }

  const entries = Array.isArray(pkg.entries) ? pkg.entries : null;
  if (!entries) {
    errors.push("Package.entries must be an array");
  }

  const allowedNamespaces = normalizeAllowedNamespaces(pkg, opts);

  if (errors.length) {
    return {
      ok: false,
      mode: "VALIDATE",
      targetLocale: locale || null,
      errors,
      warnings,
      plannedChanges: [],
      rejected: [],
      summary: null
    };
  }

  const flat = flatten(catalogs.messages[locale]);
  const seen = new Set();
  const rejectStale = opts.rejectStale !== false;
  const allowUpdates = Boolean(opts.allowUpdates);

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i] || {};
    const keyPath = e.keyPath || e.key;
    const translation =
      e.translation != null
        ? e.translation
        : e.targetText != null
          ? e.targetText
          : e.value;

    const prefix = `entries[${i}]`;

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
      errors.push(`${prefix}: unknown keyPath not in en-US: ${keyPath}`);
      continue;
    }

    const ns = namespaceOf(keyPath);
    const target = resolveKeyTarget(keyPath);
    if (allowedNamespaces && allowedNamespaces.size) {
      const okNs =
        allowedNamespaces.has(ns) ||
        (target &&
          (allowedNamespaces.has(target.file) ||
            allowedNamespaces.has(target.ownershipBucket)));
      if (!okNs) {
        errors.push(
          `${prefix}: namespace/file ${ns} not allowed (allowed: ${[
            ...allowedNamespaces
          ].join(", ")})`
        );
        continue;
      }
    }

    if (opts.requireNestedModules && !isSupportedApplyKey(keyPath)) {
      errors.push(
        `${prefix}: keyPath ${keyPath} is not supported by safe APPLY`
      );
      continue;
    }

    if (translation == null || translation === "") {
      errors.push(`${prefix}: empty translation for ${keyPath}`);
      continue;
    }
    if (
      typeof translation !== "string" &&
      typeof translation !== "number" &&
      typeof translation !== "boolean"
    ) {
      errors.push(`${prefix}: invalid type for ${keyPath}`);
      continue;
    }

    const refValue = catalogs.refFlat[keyPath];
    if (typeof refValue === "string" && typeof translation === "string") {
      const rp = extractPlaceholders(refValue);
      const lp = extractPlaceholders(translation);
      if (rp.join(",") !== lp.join(",")) {
        errors.push(
          `${prefix}: placeholder mismatch for ${keyPath}: expected {${rp.join(
            ","
          )}} got {${lp.join(",")}}`
        );
      }
      const rPl = pluralPipeParts(refValue);
      const lPl = pluralPipeParts(translation);
      if (rPl) {
        // pl|cs|ro may need more CLDR forms than en-US pipe count.
        // Allow equal count always; allow more forms only for those locales (≤ +2).
        const allowExtraLocales = new Set(["pl", "cs", "ro", "hr", "uk"]);
        const allowExtra =
          allowExtraLocales.has(locale) &&
          lPl &&
          lPl.length > rPl.length &&
          lPl.length <= rPl.length + 2;
        if (!lPl || (lPl.length !== rPl.length && !allowExtra)) {
          errors.push(
            `${prefix}: plural pipe count mismatch for ${keyPath}: expected ${rPl.length} forms` +
              (allowExtraLocales.has(locale) ? ` (or up to +2 for ${locale})` : "")
          );
        }
      }
    }

    const currentHash = typeof refValue === "string" ? hashValue(refValue) : null;
    if (e.sourceText != null && e.sourceText !== refValue) {
      const msg = `${prefix}: sourceText differs from current en-US for ${keyPath} (stale source)`;
      if (rejectStale) errors.push(msg);
      else warnings.push(msg);
    }
    if (e.sourceHash != null && currentHash && e.sourceHash !== currentHash) {
      const msg = `${prefix}: sourceHash mismatch for ${keyPath} (stale source)`;
      if (rejectStale) errors.push(msg);
      else warnings.push(msg);
    }
    if (staleSet.has(keyPath)) {
      const msg = `${prefix}: key ${keyPath} is stale vs i18n-meta/source-hashes.json`;
      if (rejectStale && (e.sourceText != null || e.sourceHash != null)) {
        // already covered by pin checks; still warn
        warnings.push(msg);
      } else if (rejectStale && opts.rejectSnapshotStale === true) {
        errors.push(msg);
      } else {
        warnings.push(msg);
      }
    }

    const ov = overrides.entries?.[overrideKey(locale, keyPath)];
    const protectedStatus =
      (typeof ov === "string" && (ov === "APPROVED" || ov === "REVIEWED")) ||
      (ov &&
        typeof ov === "object" &&
        (ov.status === "APPROVED" || ov.status === "REVIEWED"));

    if (protectedStatus && opts.allowOverwriteApproved !== true) {
      errors.push(
        `${prefix}: refuses to overwrite ${
          (ov && ov.status) || ov
        } translation for ${keyPath}`
      );
      rejected.push({ keyPath, reason: "protected_review_status" });
      continue;
    }

    const status = e.status || "MACHINE_DRAFT";
    if (status === "APPROVED" || status === "REVIEWED") {
      errors.push(
        `${prefix}: import status ${status} is not allowed (use MACHINE_DRAFT / NEEDS_REVIEW)`
      );
      continue;
    }

    const current = flat[keyPath];
    // Inherited ...enUS values are present at runtime but not explicit OWN —
    // treating a German override as "add" (not "update") keeps allowUpdates=false safe.
    // Identical inherited strings are still materialized as explicit overrides so
    // ownership reaches full EXPLICIT OWN (e.g. brand taglines left in English).
    let action;
    if (current === undefined) action = "add";
    else if (current === translation && !inheritedSet.has(keyPath)) action = "noop";
    else if (inheritedSet.has(keyPath)) action = "add";
    else action = "update";

    if (action === "update" && !allowUpdates) {
      errors.push(
        `${prefix}: refuses to update existing translation for ${keyPath} (allowUpdates=false)`
      );
      rejected.push({ keyPath, reason: "existing_translation_protected" });
      continue;
    }

    planned.push({
      keyPath,
      namespace: ns,
      action,
      current: current === undefined ? null : current,
      next: translation,
      status,
      needsReview: Boolean(e.needsReview) || status === "NEEDS_REVIEW"
    });
  }

  const applyRequested = Boolean(opts.apply);
  const dryRunRequested = Boolean(opts.dryRun) || (!applyRequested && opts.planFiles === true);

  const base = {
    ok: errors.length === 0,
    mode: "VALIDATE",
    targetLocale: locale,
    sourceLocale: REF_LOCALE,
    errors,
    warnings,
    plannedChanges: planned,
    rejected,
    summary: {
      entryCount: entries.length,
      add: planned.filter((p) => p.action === "add").length,
      update: planned.filter((p) => p.action === "update").length,
      noop: planned.filter((p) => p.action === "noop").length,
      rejected: rejected.length,
      allowedNamespaces: allowedNamespaces ? [...allowedNamespaces] : null
    },
    applyNote: null
  };

  if (!base.ok) {
    if (applyRequested) base.mode = "APPLY_BLOCKED";
    return base;
  }

  // Optional file plan / apply
  if (applyRequested || dryRunRequested || opts.planFiles) {
    const applyResult = applyImportPlan(base, {
      ...opts,
      apply: applyRequested,
      dryRun: !applyRequested || opts.dryRun !== false
    });

    if (applyRequested && opts.dryRun === false) {
      return {
        ...base,
        mode: applyResult.mode,
        ok: applyResult.ok !== false && (applyResult.mode === "APPLY" || applyResult.mode === "NO_CHANGES"),
        errors: [...base.errors, ...(applyResult.errors || [])],
        filePlan: applyResult,
        applyNote:
          applyResult.mode === "APPLY"
            ? "Safe APPLY wrote nested namespace TypeScript modules + review-overrides MACHINE_DRAFT."
            : applyResult.mode === "NO_CHANGES"
              ? "APPLY idempotent: no file changes."
              : applyResult.applyNote || applyResult.errors?.join("; ") || null
      };
    }

    // DRY RUN
    return {
      ...base,
      mode: applyResult.ok === false ? "APPLY_BLOCKED" : "DRY_RUN",
      ok: applyResult.ok !== false,
      errors: [...base.errors, ...(applyResult.errors || [])],
      filePlan: applyResult,
      applyNote:
        applyResult.ok === false
          ? "DRY RUN / APPLY blocked — see errors."
          : "DRY RUN only — no catalog files were written."
    };
  }

  return base;
}

function normalizeAllowedNamespaces(pkg, opts) {
  if (opts.allowedNamespaces === null) return null;
  if (Array.isArray(opts.allowedNamespaces)) {
    return new Set(opts.allowedNamespaces);
  }
  if (typeof opts.allowedNamespaces === "string") {
    return new Set([opts.allowedNamespaces]);
  }
  const fromPkg =
    pkg.filters?.namespace ||
    pkg.namespace ||
    (pkg.allowedNamespaces
      ? Array.isArray(pkg.allowedNamespaces)
        ? pkg.allowedNamespaces[0]
        : pkg.allowedNamespaces
      : null);
  if (fromPkg) return new Set([fromPkg]);
  // When applying, require explicit namespace scope for safety
  if (opts.apply || opts.requireNamespaceScope) {
    return null; // caller should pass allowedNamespaces — if missing, do not invent
  }
  return null;
}

module.exports = {
  validateImportPackage
};
