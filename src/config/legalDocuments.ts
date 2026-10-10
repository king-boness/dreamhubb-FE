/**
 * Technical metadata for dreamhubb legal documents.
 *
 * Separates:
 * - UI chrome translations (vue-i18n legal.* keys)
 * - Canonical legal body content (currently EN-only in Vue pages + static-legal HTML)
 * - Versioning / effective dates / language availability
 *
 * Do NOT invent Slovak legal prose here. When counsel delivers approved SK text,
 * set `languages.sk.status` to "approved" and wire contentSource.sk to the
 * approved artifact path — until then UI shows englishOnlyNotice for non-EN locales.
 */

export type LegalDocId = "terms" | "privacy";

export type LegalLanguageStatus =
  | "published"
  | "pending_translation"
  | "pending_legal_review"
  | "approved"
  | "not_available";

export type LegalDocumentMeta = {
  id: LegalDocId;
  /** Stable product name — do not translate. */
  product: "dreamhubb";
  /** Human-facing document title keys live in i18n; this is the technical id. */
  titleEn: string;
  /** Semantic version of the published EN legal body (bump when counsel revises). */
  version: string;
  /** ISO date (YYYY-MM-DD) when the published EN text became effective. */
  effectiveDate: string;
  /** ISO date of last published update to the EN body. */
  lastUpdated: string;
  /** Display date string currently shown in the Vue legal pages (EN format kept for EN body). */
  lastUpdatedDisplayEn: string;
  /** Canonical in-app SPA paths (history mode). */
  routes: string[];
  /** Static HTML mirrors under public/ (served from dist after build). */
  staticPaths: string[];
  /** Public production URLs (App Store / web). */
  publicUrls: string[];
  languages: {
    en: { status: LegalLanguageStatus; contentSource: string };
    sk: { status: LegalLanguageStatus; contentSource: string | null };
  };
};

export const LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocumentMeta> = {
  terms: {
    id: "terms",
    product: "dreamhubb",
    titleEn: "Terms of Use",
    version: "2026.10.07",
    effectiveDate: "2026-10-07",
    lastUpdated: "2026-10-07",
    lastUpdatedDisplayEn: "October 7, 2026",
    routes: ["/terms", "/terms/", "/terms-of-use"],
    staticPaths: [
      "/static-legal/terms/index.html"
    ],
    publicUrls: [
      "https://dreamhubb.com/terms",
      "https://dreamhubb.com/terms/"
    ],
    languages: {
      en: {
        status: "published",
        contentSource: "src/pages/Public/TermsOfUsePage.vue (+ public/static-legal/terms)"
      },
      sk: {
        status: "not_available",
        contentSource: null
      }
    }
  },
  privacy: {
    id: "privacy",
    product: "dreamhubb",
    titleEn: "Privacy Policy",
    version: "2026.10.07",
    effectiveDate: "2026-10-07",
    lastUpdated: "2026-10-07",
    lastUpdatedDisplayEn: "October 7, 2026",
    routes: ["/privacy", "/privacy/", "/privacy-policy"],
    staticPaths: [
      "/static-legal/privacy/index.html",
      "/static-legal/privacy-policy/index.html"
    ],
    publicUrls: [
      "https://dreamhubb.com/privacy",
      "https://dreamhubb.com/privacy/",
      "https://dreamhubb.com/privacy-policy"
    ],
    languages: {
      en: {
        status: "published",
        contentSource: "src/pages/Public/PrivacyPolicyPage.vue (+ public/static-legal/privacy*)"
      },
      sk: {
        status: "not_available",
        contentSource: null
      }
    }
  }
};

/** True when an approved SK legal body is wired for the given document. */
export function hasApprovedSkLegalBody(doc: LegalDocId): boolean {
  return LEGAL_DOCUMENTS[doc].languages.sk.status === "approved";
}

/** Display date for the EN legal body chrome (not a machine translation of the body). */
export function legalLastUpdatedDisplay(doc: LegalDocId): string {
  return LEGAL_DOCUMENTS[doc].lastUpdatedDisplayEn;
}
