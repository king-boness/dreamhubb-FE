# External Legal Review Package — dreamhubb EN/SK (4F.4)

**Status:** LEGAL_REVIEW_REQUIRED  
**AI legal approval:** NOT GRANTED (this is not LEGAL_APPROVED)  
**Prepared:** 2026-10-10  
**Audience:** External counsel / compliance reviewer

---

## A) Legal documents list

| ID | Title | In-app routes | Static mirror | Public URLs |
|----|-------|---------------|---------------|-------------|
| terms | Terms of Use | `/terms`, `/terms/`, `/terms-of-use` | `public/static-legal/terms/index.html` | dreamhubb.com/terms |
| privacy | Privacy Policy | `/privacy`, `/privacy/`, `/privacy-policy` | `public/static-legal/privacy/index.html` | dreamhubb.com/privacy |

Technical metadata: `src/config/legalDocuments.ts`

## B) Current versions (EN body)

| Doc | Version | Effective | Last updated | EN status |
|-----|---------|-----------|--------------|-----------|
| Terms | 2026.10.07 | 2026-10-07 | 2026-10-07 | published |
| Privacy | 2026.10.07 | 2026-10-07 | 2026-10-07 | published |

## C) Available languages

| Lang | Terms body | Privacy body | UI chrome | Notice |
|------|------------|--------------|-----------|--------|
| en-US / en-GB | EN body shown | EN body shown | localized titles/nav | no englishOnlyNotice |
| sk | **not_available** | **not_available** | SK titles + `englishOnlyNotice` | EN body still displayed under notice |
| Other UI locales | EN body + localized notice | same | partial chrome | same pattern |

**SK approved legal prose:** none in repo (`contentSource: null`).

## D) Product functions (code-backed inventory for counsel)

| Area | Code support | Documented in EN legal | Consistency |
|------|--------------|------------------------|-------------|
| User accounts / registration | SUPPORTED BY CODE | DOCUMENTED | ALIGNED (high level) |
| Email verification | SUPPORTED BY CODE | DOCUMENTED | ALIGNED |
| Onboarding + roles Donor/Donee | SUPPORTED BY CODE | DOCUMENTED (roles/help) | MISMATCH RISK — terminology OPEN (product) |
| Dreams / Problems / Ideas posts | SUPPORTED BY CODE | DOCUMENTED (UGC) | ALIGNED |
| UGC + AI translation | SUPPORTED BY CODE | DOCUMENTED | ALIGNED (feature exists) |
| Community help / contributions | SUPPORTED BY CODE | DOCUMENTED | ALIGNED |
| Virtual tokens / earn | SUPPORTED BY CODE | DOCUMENTED | UNKNOWN — counsel must validate token wording vs non-money framing |
| Purchases / Stripe | PARTIAL / CODE PRESENT | DOCUMENTED | UNKNOWN — confirm live payment status before claim |
| Notifications | SUPPORTED BY CODE | PARTIAL | UNKNOWN |
| Moderation / report / block | SUPPORTED BY CODE | DOCUMENTED | ALIGNED |
| Account deletion | SUPPORTED BY CODE | DOCUMENTED | ALIGNED |
| Personal data processing | SUPPORTED BY CODE | DOCUMENTED | LEGAL_REVIEW_REQUIRED |
| Data retention | UNKNOWN (ops) | DOCUMENTED | LEGAL_REVIEW_REQUIRED |
| Age / eligibility | SUPPORTED BY CODE (DOB) | DOCUMENTED | LEGAL_REVIEW_REQUIRED |

## E) Identified mismatches / gaps

1. **SK body missing** while SK UI is first-class release language → `englishOnlyNotice` only.  
2. **Token economics** — product uses spendable virtual tokens; legal framing needs counsel confirmation.  
3. **Stripe/purchases** — code paths exist; live production payment posture UNKNOWN.  
4. **59 UI languages** vs official EN/SK — disclosure not finalized (product).  
5. Consent: registration requires `accepted_terms`; storage of versioned consent artifact UNKNOWN.

## F) Open legal questions (all LEGAL_REVIEW_REQUIRED)

1. May first EN/SK release ship **EN legal body + SK notice**, or is **approved SK body** mandatory?  
2. Are token mechanics correctly characterized (not e-money / not investment)?  
3. Is UGC moderation / report / block wording sufficient under applicable law?  
4. Personal data categories, bases, retention, transfers — complete?  
5. Registration roles Donor/Donee — disclosure adequate?  
6. App Store / Play publishing disclosures aligned with in-app legal?  
7. AI-assisted translation of UGC — notice / DPIA needs?  
8. Effective date / version change process for dual-language publish?

## G) SK language decision — implementation options (no AI decision)

### Option 1 — EN body + SK `englishOnlyNotice` (current code)
- Pros: no invented SK legal prose; already implemented  
- Cons: SK users read EN legalese; may be insufficient depending on counsel  
- Tech: no change; keep `languages.sk.status = not_available`

### Option 2 — Approved SK body after counsel delivery
- Pros: full SK legal experience  
- Cons: requires counsel draft + approval + engineering wire-up  
- Tech: set `approved`, add SK content source, hide notice via `hasApprovedSkLegalBody`

**AI must not choose.** Owner + counsel decide.

## H–L) Question packs for counsel

See sections F; plus token (H), UGC/moderation (I), personal data (J), registration/roles (K), store publishing (L).

## Approval status

| Gate | Status |
|------|--------|
| Legal review package prepared | YES |
| LEGAL_APPROVED | **NOT READY** |
| SK body approved | **NOT READY** |
| External counsel sign-off | OPEN |
