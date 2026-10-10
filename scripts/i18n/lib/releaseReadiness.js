/**
 * Phase 4E.3 — Global localization release-readiness reporting.
 * Evidence-based statuses only. Never invents APPROVED / RELEASED.
 */

const fs = require("fs");
const path = require("path");
const { buildInventory } = require("./inventory");
const { META_DIR, readJsonSafe } = require("./catalog");

const COMPLETE_FE = new Set([
  "en-US",
  "sk",
  "de",
  "fr",
  "es",
  "pl",
  "it",
  "pt",
  "cs",
  "hu",
  "nl",
  "ro",
  "hr",
  "bg",
  "uk"
]);
const QUASAR_MAP = {
  "en-US": "en-US",
  sk: "sk",
  de: "de",
  fr: "fr",
  es: "es",
  pl: "pl",
  it: "it",
  pt: "pt-BR", // app code pt → Quasar pt-BR
  cs: "cs",
  hu: "hu",
  nl: "nl",
  ro: "ro",
  hr: "hr",
  bg: "bg",
  uk: "uk"
};
const HR_PACKAGES = {
  de: [
    "packages/de-4c2-human-review-workpackage.json",
    "packages/de-4c2-human-review-workpackage.csv"
  ],
  fr: [
    "packages/fr-4d-human-review-workpackage.json",
    "packages/fr-4d-human-review-workpackage.csv"
  ],
  es: [
    "packages/es-4e1-human-review-workpackage.json",
    "packages/es-4e1-human-review-workpackage.csv"
  ],
  pl: [
    "packages/pl-4e1-human-review-workpackage.json",
    "packages/pl-4e1-human-review-workpackage.csv"
  ],
  it: [
    "packages/it-4e2-human-review-workpackage.json",
    "packages/it-4e2-human-review-workpackage.csv"
  ],
  pt: [
    "packages/pt-4e2-human-review-workpackage.json",
    "packages/pt-4e2-human-review-workpackage.csv"
  ],
  cs: [
    "packages/cs-4e4-human-review-workpackage.json",
    "packages/cs-4e4-human-review-workpackage.csv"
  ],
  hu: [
    "packages/hu-4e4-human-review-workpackage.json",
    "packages/hu-4e4-human-review-workpackage.csv"
  ],
  nl: [
    "packages/nl-4e5-human-review-workpackage.json",
    "packages/nl-4e5-human-review-workpackage.csv"
  ],
  ro: [
    "packages/ro-4e5-human-review-workpackage.json",
    "packages/ro-4e5-human-review-workpackage.csv"
  ],
  hr: [
    "packages/hr-4e6-human-review-workpackage.json",
    "packages/hr-4e6-human-review-workpackage.csv"
  ],
  bg: [
    "packages/bg-4e6-human-review-workpackage.json",
    "packages/bg-4e6-human-review-workpackage.csv"
  ],
  uk: [
    "packages/uk-4e6-human-review-workpackage.json",
    "packages/uk-4e6-human-review-workpackage.csv"
  ]
};
const GLOSSARIES = {
  de: "glossary.de.json",
  fr: "glossary.fr.json",
  es: "glossary.es.json",
  pl: "glossary.pl.json",
  it: "glossary.it.json",
  pt: "glossary.pt.json",
  cs: "glossary.cs.json",
  hu: "glossary.hu.json",
  nl: "glossary.nl.json",
  ro: "glossary.ro.json",
  hr: "glossary.hr.json",
  bg: "glossary.bg.json",
  uk: "glossary.uk.json",
  "en-sk": "glossary.en-sk.json"
};
const PREFLIGHT = {
  de: "de-qa-preflight-4c1.json",
  fr: "fr-qa-preflight.json",
  es: "es-qa-preflight.json",
  pl: "pl-qa-preflight.json",
  it: "it-qa-preflight.json",
  pt: "pt-qa-preflight.json",
  cs: "cs-qa-preflight.json",
  hu: "hu-qa-preflight.json",
  nl: "nl-qa-preflight.json",
  ro: "ro-qa-preflight.json",
  hr: "hr-qa-preflight.json",
  bg: "bg-qa-preflight.json",
  uk: "uk-qa-preflight.json"
};

/** E2E coverage from existing specs — smoke ≠ full authenticated suite */
const E2E_SMOKE = {
  de: { donorFeed: "PASS", donee: "NOT RUN", publicLocale: "PASS", method: "E2E" },
  fr: { donorFeed: "PASS", donee: "PASS", publicLocale: "PASS", method: "E2E" },
  es: { donorFeed: "PASS", donee: "PASS", publicLocale: "PASS", method: "E2E" },
  pl: { donorFeed: "PASS", donee: "PASS", publicLocale: "NOT RUN", method: "E2E" },
  it: { donorFeed: "PASS", donee: "PASS", publicLocale: "NOT RUN", method: "E2E" },
  pt: { donorFeed: "PASS", donee: "PASS", publicLocale: "NOT RUN", method: "E2E" },
  cs: { donorFeed: "PASS", donee: "PASS", publicLocale: "NOT RUN", method: "E2E" },
  hu: { donorFeed: "PASS", donee: "PASS", publicLocale: "NOT RUN", method: "E2E" },
  nl: { donorFeed: "PASS", donee: "PASS", publicLocale: "NOT RUN", method: "E2E" },
  ro: { donorFeed: "PASS", donee: "PASS", publicLocale: "NOT RUN", method: "E2E" },
  hr: { donorFeed: "PASS", donee: "PASS", publicLocale: "NOT RUN", method: "E2E" },
  bg: { donorFeed: "PASS", donee: "PASS", publicLocale: "NOT RUN", method: "E2E" },
  uk: { donorFeed: "PASS", donee: "PASS", publicLocale: "NOT RUN", method: "E2E" },
  sk: { donorFeed: "PASS", donee: "PASS", publicLocale: "PASS", method: "E2E" },
  "en-US": { donorFeed: "PASS", donee: "PASS", publicLocale: "PASS", method: "E2E" }
};

const PRIMARY_STATUSES = [
  "MACHINE_DRAFT",
  "EXISTING_UNREVIEWED",
  "INTENTIONALLY_UNCHANGED",
  "NEEDS_REVIEW",
  "REVIEWED",
  "APPROVED",
  "MISSING"
];

function dim(status, reason, confidence = "EXACT") {
  return { status, reason, confidence };
}

function fileExists(...parts) {
  return fs.existsSync(path.join(META_DIR, ...parts));
}

function loadProductDecisions() {
  return readJsonSafe(path.join(META_DIR, "product-decisions.json"), {
    decisions: []
  });
}

function openQaForLocale(locale) {
  const findings = [];
  const pfName = PREFLIGHT[locale];
  if (pfName) {
    const pf = readJsonSafe(path.join(META_DIR, pfName), null);
    if (pf?.openQaFindings) {
      for (const f of pf.openQaFindings) {
        findings.push({
          source: "ai_preflight",
          severity: f.severity || "P2",
          note: f.note || String(f)
        });
      }
    }
  }
  const qa = readJsonSafe(path.join(META_DIR, "qa-findings.json"), { findings: {} });
  if (qa.locale === locale && qa.findings && typeof qa.findings === "object") {
    for (const [k, v] of Object.entries(qa.findings)) {
      findings.push({ source: "qa-findings", keyPath: k, ...(typeof v === "object" ? v : { note: v }) });
    }
  }
  const decisions = loadProductDecisions().decisions || [];
  for (const d of decisions) {
    if (d.status !== "OPEN") continue;
    const langs = d.languages || [];
    if (langs.includes(locale) || langs.includes("*")) {
      findings.push({
        source: "product-decisions",
        id: d.id,
        type: d.type,
        note: d.title
      });
    }
  }
  return findings;
}

function humanReviewArtifacts(locale) {
  const packs = HR_PACKAGES[locale] || [];
  const glossary = GLOSSARIES[locale];
  const preflight = PREFLIGHT[locale];
  return {
    jsonPackage: packs[0] ? fileExists(packs[0]) : false,
    csvPackage: packs[1] ? fileExists(packs[1]) : false,
    glossary: glossary ? fileExists(glossary) : false,
    qaPreflight: preflight ? fileExists(preflight) : false,
    paths: {
      json: packs[0] || null,
      csv: packs[1] || null,
      glossary: glossary || null,
      preflight: preflight || null
    }
  };
}

function backendDims(locale) {
  // Read-only evidence from BE config knowledge (FE tooling cannot import PHP).
  // System locales: en|sk only. UI codes accepted on preferred_locale but system texts fall back to en.
  if (locale === "sk") {
    return {
      backendLocaleSupport: dim("PARTIAL", "systemLocale→sk; UI preference stored"),
      backendApiMessages: dim("PARTIAL", "lang/sk/messages.php + earn/auth present"),
      validationMessages: dim("PARTIAL", "lang/sk/validation.php"),
      earnLocalization: dim("PARTIAL", "lang/sk/earn.php"),
      notificationLocalization: dim("NOT READY", "No dedicated multi-locale notification catalog beyond EN/SK system"),
      verificationEmails: dim("PARTIAL", "lang/sk/mail.php + verify blade"),
      passwordResetEmails: dim("PARTIAL", "lang/sk/mail.php + reset blade")
    };
  }
  if (locale === "en-US" || locale === "en-GB") {
    return {
      backendLocaleSupport: dim("PARTIAL", "systemLocale→en"),
      backendApiMessages: dim("PARTIAL", "lang/en/*"),
      validationMessages: dim("PARTIAL", "lang/en/validation.php"),
      earnLocalization: dim("PARTIAL", "lang/en/earn.php"),
      notificationLocalization: dim("PARTIAL", "EN system texts"),
      verificationEmails: dim("PARTIAL", "lang/en/mail.php"),
      passwordResetEmails: dim("PARTIAL", "lang/en/mail.php")
    };
  }
  // All other UI locales: preference stored; system texts EN fallback
  return {
    backendLocaleSupport: dim(
      "PARTIAL",
      "preferred_locale accepted; UserLocale::systemLocale → en fallback"
    ),
    backendApiMessages: dim("NOT READY", "No BE lang pack; EN fallback"),
    validationMessages: dim("NOT READY", "EN validation fallback"),
    earnLocalization: dim("NOT READY", "EN earn fallback"),
    notificationLocalization: dim("NOT READY", "EN notification fallback"),
    verificationEmails: dim("NOT READY", "EN mail fallback (no locale pack)"),
    passwordResetEmails: dim("NOT READY", "EN mail fallback (no locale pack)")
  };
}

function legalDims(locale) {
  // Static legal bodies are EN; FE legal.* UI chrome may be translated for complete catalogs.
  const chromeReady = COMPLETE_FE.has(locale) && locale !== "en-US" && locale !== "en-GB";
  return {
    termsOfUse: dim(
      chromeReady ? "PARTIAL" : locale === "en-US" || locale === "en-GB" ? "PARTIAL" : "NOT READY",
      chromeReady
        ? "UI chrome may be localized; legal body remains EN — not legally approved"
        : locale.startsWith("en")
          ? "EN legal body present; legal approval status UNKNOWN/not evidenced here"
          : "No dedicated legal body translation"
    ),
    privacyPolicy: dim(
      chromeReady ? "PARTIAL" : locale === "en-US" || locale === "en-GB" ? "PARTIAL" : "NOT READY",
      chromeReady
        ? "UI chrome may be localized; privacy body remains EN — not legally approved"
        : "EN body or missing"
    ),
    legalApproval: dim("NOT READY", "No evidenced independent legal approval for localized bodies")
  };
}

function feCatalogDims(localeRow) {
  if (localeRow.isAlias) {
    return dim("READY", "en-GB alias → en-US pack", "EXACT");
  }
  const ref = localeRow.referenceKeys ?? localeRow.referenceKeyCount;
  if (
    localeRow.missing === 0 &&
    localeRow.inheritedSourceKeys === 0 &&
    localeRow.explicitOwnKeys === ref
  ) {
    return dim(
      "READY",
      `CATALOG COMPLETE ${localeRow.explicitOwnKeys}/${ref} explicit own; not language-approved`,
      "EXACT"
    );
  }
  if (localeRow.hasMessagePack) {
    return dim(
      "NOT READY",
      `CATALOG INCOMPLETE missing=${localeRow.missing} inherited=${localeRow.inheritedSourceKeys} explicit=${localeRow.explicitOwnKeys}`,
      "EXACT"
    );
  }
  return dim("NOT READY", "No message pack", "EXACT");
}

function reviewDims(locale, statusCounts, openQa) {
  const reviewed = statusCounts.REVIEWED || 0;
  const approved = statusCounts.APPROVED || 0;
  const artifacts = humanReviewArtifacts(locale);
  if (approved > 0 && approved === 859) {
    return dim("READY", "All keys APPROVED", "EXACT");
  }
  if (reviewed > 0 || approved > 0) {
    return dim("PARTIAL", `REVIEWED=${reviewed} APPROVED=${approved}`, "EXACT");
  }
  if (COMPLETE_FE.has(locale) && locale !== "en-US" && locale !== "sk") {
    const readyPkg = artifacts.jsonPackage && artifacts.csvPackage;
    return dim(
      readyPkg ? "PARTIAL" : "NOT READY",
      readyPkg
        ? `Workpackage ready; REVIEWED=0 APPROVED=0; openQa=${openQa.length}; AI preflight ≠ human approval`
        : "No HR workpackage",
      "EXACT"
    );
  }
  if (locale === "sk" || locale === "en-US") {
    return dim(
      "PARTIAL",
      "Source locales — EXISTING_UNREVIEWED/NEEDS_REVIEW; not machine-draft pipeline",
      "ESTIMATED"
    );
  }
  return dim("NOT READY", "Incomplete catalog — human review not started", "EXACT");
}

function e2eDims(locale) {
  const smoke = E2E_SMOKE[locale];
  if (!smoke) {
    return dim("NOT TESTED", "No dedicated locale E2E smoke evidenced", "EXACT");
  }
  if (smoke.donorFeed === "PASS" && smoke.donee === "PASS") {
    return dim(
      "PARTIAL",
      "Language smoke PASS (feed/search/filters/settings); full DONOR/DONEE suite NOT RUN",
      "EXACT"
    );
  }
  if (smoke.donorFeed === "PASS" || smoke.publicLocale === "PASS") {
    return dim("PARTIAL", "Partial language smoke only", "EXACT");
  }
  return dim("NOT TESTED", "Coverage incomplete", "ESTIMATED");
}

function quasarDims(locale) {
  if (locale === "en-GB") return dim("READY", "Aliases to en-US Quasar pack", "EXACT");
  const pack = QUASAR_MAP[locale];
  if (pack) {
    const note =
      locale === "pt"
        ? "App pt → Quasar pt-BR (PRODUCT_DECISION_REQUIRED for regional norm)"
        : `Quasar pack ${pack}`;
    return dim("READY", note, "EXACT");
  }
  return dim("NOT READY", "Falls back to en-US Quasar pack", "EXACT");
}

function htmlLangDims(locale) {
  if (COMPLETE_FE.has(locale) || locale === "en-GB") {
    return dim("READY", `syncDocumentHtmlLang → ${locale}`, "EXACT");
  }
  return dim("PARTIAL", "Runtime sets html lang to preference; catalog incomplete", "ESTIMATED");
}

function overallForLocale(dims) {
  const blockers = [];
  if (dims.feCatalogCoverage.status === "NOT READY") blockers.push("FE_CATALOG");
  if (dims.humanLinguisticReview.status === "NOT READY") blockers.push("HUMAN_REVIEW");
  if (dims.backendLocaleSupport.status === "NOT READY") blockers.push("BACKEND");
  if (dims.termsOfUse.status === "NOT READY") blockers.push("LEGAL");
  if (dims.authenticatedE2eCoverage.status === "NOT TESTED") blockers.push("E2E");
  if (dims.productionDeploymentState.status !== "READY") blockers.push("DEPLOYMENT");

  // Never READY overall without human review + legal + backend for non-source locales
  if (dims.feCatalogCoverage.status === "READY" && dims.humanLinguisticReview.status === "PARTIAL") {
    return {
      overall: dim(
        "NOT READY",
        "FE catalog complete but human review / BE / legal not release-ready",
        "EXACT"
      ),
      blockers
    };
  }
  if (dims.feCatalogCoverage.status !== "READY") {
    return {
      overall: dim("NOT READY", "Frontend catalog incomplete", "EXACT"),
      blockers
    };
  }
  return {
    overall: dim("NOT READY", "Release blocked — see releaseBlockers", "EXACT"),
    blockers
  };
}

function proposedRolloutStage(locale, localeRow, dims) {
  // Internal evidence-only stage — does NOT gate UI
  if (localeRow.isAlias) return "RELEASED"; // en-GB alias of EN — treat as available
  if (localeRow.missing > 0) return "IN_DEVELOPMENT";
  const ref = localeRow.referenceKeys ?? localeRow.referenceKeyCount;
  if ((localeRow.statusCounts.APPROVED || 0) === ref) return "REVIEWED";
  if ((localeRow.statusCounts.REVIEWED || 0) > 0) return "REVIEW_IN_PROGRESS";
  if (COMPLETE_FE.has(locale) && dims.humanLinguisticReview.status === "PARTIAL") {
    return "AWAITING_REVIEW";
  }
  if (COMPLETE_FE.has(locale)) return "TECHNICALLY_COMPLETE";
  return "IN_DEVELOPMENT";
}

function buildReleaseReadinessReport() {
  const inv = buildInventory();
  const productDecisions = loadProductDecisions();
  const ptRegional = readJsonSafe(path.join(META_DIR, "pt-regional-analysis.json"), null);
  const generatedAt = new Date().toISOString();

  const locales = inv.locales.map((l) => {
    const statusCounts = { ...l.statusCounts };
    for (const s of PRIMARY_STATUSES) {
      if (statusCounts[s] == null) statusCounts[s] = 0;
    }
    const statusSum = PRIMARY_STATUSES.reduce((a, k) => a + (statusCounts[k] || 0), 0);
    const openQa = openQaForLocale(l.locale);
    const hr = humanReviewArtifacts(l.locale);
    const be = backendDims(l.locale);
    const legal = legalDims(l.locale);

    const dims = {
      feCatalogCoverage: feCatalogDims(l),
      feReviewCoverage: reviewDims(l.locale, statusCounts, openQa),
      quasarLocale: quasarDims(l.locale),
      htmlLang: htmlLangDims(l.locale),
      ...be,
      ...legal,
      humanLinguisticReview: reviewDims(l.locale, statusCounts, openQa),
      authenticatedE2eCoverage: e2eDims(l.locale),
      productionDeploymentState: dim(
        "UNKNOWN",
        "Production deploy/migration state not verifiable from local workspace",
        "UNKNOWN"
      )
    };

    const { overall, blockers } = overallForLocale(dims);
    dims.overallReadiness = overall;
    dims.releaseBlockers = blockers;

    const aiPrechecked =
      Boolean(PREFLIGHT[l.locale]) && fileExists(PREFLIGHT[l.locale]);

    return {
      locale: l.locale,
      nativeName: l.nativeName || l.locale,
      hasMessagePack: l.hasMessagePack,
      isAlias: Boolean(l.isAlias),
      confidence: "EXACT",
      referenceKeyCount: inv.referenceKeyCount,
      availableKeys: l.availableKeys,
      explicitOwnValues: l.explicitOwnKeys,
      inheritedSourceValues: l.inheritedSourceKeys,
      runtimeMissingValues: l.missing,
      identicalToEn: l.identicalToEnExplicitCount ?? l.identicalToEnCount ?? null,
      statusCounts,
      statusSum,
      statusSumOk: statusSum === inv.referenceKeyCount || l.isAlias,
      openQaFindingsCount: openQa.length,
      openQaFindings: openQa,
      aiPrechecked: aiPrechecked
        ? { status: "AI_PRECHECKED", note: "AI preflight file present — NOT human APPROVED" }
        : { status: "NOT_APPLICABLE", note: "No AI preflight artifact" },
      humanReviewArtifacts: hr,
      dimensions: dims,
      proposedRolloutStage: proposedRolloutStage(l.locale, l, dims),
      e2eSmoke: E2E_SMOKE[l.locale] || null
    };
  });

  const pt = locales.find((x) => x.locale === "pt");

  return {
    version: 1,
    phase: "4E.3",
    generatedAt,
    methodology: {
      note: "Statuses are evidence-based. FE 859/859 ≠ LANGUAGE APPROVED ≠ RELEASED.",
      primaryStatusesExclusive: PRIMARY_STATUSES,
      confidenceValues: ["EXACT", "ESTIMATED", "UNKNOWN"],
      dimensionStatuses: [
        "READY",
        "PARTIAL",
        "NOT READY",
        "NOT TESTED",
        "UNKNOWN",
        "NOT APPLICABLE"
      ]
    },
    totals: {
      uiLanguages: inv.uiLanguageCount,
      messagePacks: inv.messagePackCount,
      referenceKeys: inv.referenceKeyCount,
      technicallyCompletePacks: locales.filter(
        (l) => !l.isAlias && l.hasMessagePack && l.runtimeMissingValues === 0 && l.inheritedSourceValues === 0
      ).length,
      incompletePacks: locales.filter(
        (l) => !l.isAlias && l.hasMessagePack && l.runtimeMissingValues > 0
      ).length,
      reviewedTotal: locales.reduce((a, l) => a + (l.statusCounts.REVIEWED || 0), 0),
      approvedTotal: locales.reduce((a, l) => a + (l.statusCounts.APPROVED || 0), 0),
      machineDraftTotal: locales.reduce((a, l) => a + (l.statusCounts.MACHINE_DRAFT || 0), 0)
    },
    productDecisionsOpen: (productDecisions.decisions || []).filter((d) => d.status === "OPEN"),
    ptRegionalAnalysis: ptRegional,
    ptExactReviewInventory: pt
      ? {
          MACHINE_DRAFT: pt.statusCounts.MACHINE_DRAFT,
          EXISTING_UNREVIEWED: pt.statusCounts.EXISTING_UNREVIEWED,
          INTENTIONALLY_UNCHANGED: pt.statusCounts.INTENTIONALLY_UNCHANGED,
          NEEDS_REVIEW: pt.statusCounts.NEEDS_REVIEW,
          REVIEWED: pt.statusCounts.REVIEWED,
          APPROVED: pt.statusCounts.APPROVED,
          sum: pt.statusSum,
          expected: inv.referenceKeyCount,
          sumOk: pt.statusSumOk,
          openQaFindingsCount: pt.openQaFindingsCount,
          regionalDecision: "PRODUCT_DECISION_REQUIRED"
        }
      : null,
    releasePolicyDefinitions: {
      TECHNICAL_CATALOG_READY: "explicit own = ref, inherited 0, missing 0, structural errors 0",
      AI_QA_READY: "AI preflight artifact exists; does not imply human approval",
      HUMAN_REVIEW_READY: "HR workpackage exported; REVIEWED/APPROVED require attested import",
      BACKEND_READY: "Dedicated BE lang pack for system texts (currently en|sk only)",
      LEGAL_READY: "Translated legal body + independent legal approval evidenced",
      E2E_READY: "Full DONOR+DONEE authenticated suite PASS in isolated env",
      DEPLOYMENT_READY: "Production migration/deploy checklist verified (local → UNKNOWN)",
      FULL_LANGUAGE_READY: "All of the above READY — never auto from FE coverage alone"
    },
    proposedRolloutStages: [
      "IN_DEVELOPMENT",
      "TECHNICALLY_COMPLETE",
      "AWAITING_REVIEW",
      "REVIEW_IN_PROGRESS",
      "REVIEWED",
      "RELEASE_CANDIDATE",
      "RELEASED"
    ],
    locales
  };
}

function formatReleaseReadinessText(report) {
  const lines = [];
  lines.push(`dreamhubb i18n release-readiness — ${report.phase}`);
  lines.push(`generatedAt: ${report.generatedAt}`);
  lines.push(
    `UI=${report.totals.uiLanguages} packs=${report.totals.messagePacks} ref=${report.totals.referenceKeys} complete=${report.totals.technicallyCompletePacks} incomplete=${report.totals.incompletePacks}`
  );
  lines.push(
    `MACHINE_DRAFT_total=${report.totals.machineDraftTotal} REVIEWED_total=${report.totals.reviewedTotal} APPROVED_total=${report.totals.approvedTotal}`
  );
  lines.push("");
  if (report.ptExactReviewInventory) {
    const p = report.ptExactReviewInventory;
    lines.push("PT exact review inventory:");
    lines.push(
      `  MD=${p.MACHINE_DRAFT} EU=${p.EXISTING_UNREVIEWED} IU=${p.INTENTIONALLY_UNCHANGED} NR=${p.NEEDS_REVIEW} REV=${p.REVIEWED} APP=${p.APPROVED} sum=${p.sum}/${p.expected} ok=${p.sumOk}`
    );
    lines.push(`  regional=${p.regionalDecision} openQa=${p.openQaFindingsCount}`);
    lines.push("");
  }
  lines.push(
    "locale | pack | expl/miss/inh | MD/EU/IU/NR/REV/APP | FE | Review | BE | Legal | E2E | Overall | stage"
  );
  for (const l of report.locales) {
    if (l.isAlias) {
      lines.push(
        `${l.locale.padEnd(8)} | alias | — | — | READY | N/A | PARTIAL | PARTIAL | PARTIAL | NOT READY | ${l.proposedRolloutStage}`
      );
      continue;
    }
    const s = l.statusCounts;
    lines.push(
      `${l.locale.padEnd(8)} | ${l.hasMessagePack ? "yes" : "no "} | ${l.explicitOwnValues}/${l.runtimeMissingValues}/${l.inheritedSourceValues} | ${s.MACHINE_DRAFT}/${s.EXISTING_UNREVIEWED}/${s.INTENTIONALLY_UNCHANGED}/${s.NEEDS_REVIEW}/${s.REVIEWED}/${s.APPROVED} | ${l.dimensions.feCatalogCoverage.status} | ${l.dimensions.humanLinguisticReview.status} | ${l.dimensions.backendLocaleSupport.status} | ${l.dimensions.termsOfUse.status} | ${l.dimensions.authenticatedE2eCoverage.status} | ${l.dimensions.overallReadiness.status} | ${l.proposedRolloutStage}`
    );
  }
  lines.push("");
  lines.push(`Open product decisions: ${report.productDecisionsOpen.length}`);
  for (const d of report.productDecisionsOpen) {
    lines.push(`  - [${d.type}] ${d.id}: ${d.title}`);
  }
  lines.push("");
  lines.push("NOTE: FE catalog READY ≠ human APPROVED ≠ FULL_LANGUAGE_READY ≠ RELEASED.");
  return lines.join("\n");
}

module.exports = {
  buildReleaseReadinessReport,
  formatReleaseReadinessText,
  openQaForLocale,
  humanReviewArtifacts,
  PRIMARY_STATUSES,
  COMPLETE_FE,
  QUASAR_MAP
};
