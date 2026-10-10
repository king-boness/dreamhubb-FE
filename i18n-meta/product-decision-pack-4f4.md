# Product Decision Pack — 4F.4 (owner confirmation required)

**Status:** All decisions remain **OPEN** unless owner marks APPROVED.  
**AI does not approve.**  
**First release scope (technical recommendation):** official `en-US` + `sk`; `en-GB` → en-US messages.

---

## Release-blocking vs non-blocking

| ID | Area | Blocking for EN/SK staging? | Class |
|----|------|------------------------------|-------|
| PD-LEGAL-SK-001 | SK legal body vs EN+notice | **YES** (legal gate) | RELEASE BLOCKING |
| PD-LANG-DISCLOSURE-001 | 59-language disclosure | YES for store copy / marketing | RELEASE BLOCKING for public claims |
| PD-GUEST-LANG-001 | Guest language picker / browser default | NO for internal staging | NON-BLOCKING |
| PD-LOGOUT-LANG-001 | Logout language persistence | NO for staging | NON-BLOCKING |
| PD-ROLE-DONOR-DONEE-001 | Donor/Donee labels | NO if EN labels kept | LATER / NON-BLOCKING for EN/SK |
| PD-TERM-TOKEN-001 | Token wording | Soft — align with legal | LEGAL+PRODUCT |
| PD-TERM-CONTRIBUTION-001 | Contribution/Donation | NO for EN/SK if EN kept | LATER LANGUAGE ROLLOUT |
| PD-TERM-POST-001 | Post terminology | NO | LATER |
| PD-TERM-FEED-001 | Feed label | NO | LATER |
| PD-PT-REGION-001 | PT regional variant | NO for EN/SK | LATER LANGUAGE ROLLOUT |

---

## Decision cards

### PD-LEGAL-SK-001 — SK legal language
- **Current:** EN body + SK `englishOnlyNotice`; SK status `not_available`
- **Options:** (A) Ship EN+notice (B) Wait for approved SK body
- **Recommendation:** Do not invent SK legal text; counsel decides A vs B before public SK marketing as fully localized legal
- **Owner confirmation:** REQUIRED — currently OPEN

### PD-LANG-DISCLOSURE-001 — Official vs experimental languages
- **Current:** 59 UI languages selectable; 15 technically complete; only EN/SK intended official
- **Options:** (A) Label non-official as Experimental/Beta in About/Settings (B) Hide incomplete from selector (C) Keep selector, document support matrix externally only
- **Recommendation:** A — keep selector, add clear “Official: EN, SK” disclosure; do not claim 59 fully supported
- **Tech impact:** copy/settings only if approved; **do not change selector without approval**
- **Owner confirmation:** REQUIRED — OPEN

### PD-GUEST-LANG-001 — Guest / browser default
- **Current:** guest uses `dreamhubb_language` / browser heuristics (existing)
- **Options:** keep / force en-US until login / detect browser
- **Recommendation:** keep current; document behavior
- **Blocking:** NON-BLOCKING

### PD-LOGOUT-LANG-001 — Logout persistence
- **Current:** language in localStorage survives logout
- **Options:** persist / reset to en-US / reset to preferred_locale
- **Recommendation:** persist guest choice (current)
- **Blocking:** NON-BLOCKING

### PD-ROLE-DONOR-DONEE-001 / terminology set
- See `product-decisions.json` — keep English product terms for EN/SK first release
- **Blocking:** NON-BLOCKING for EN/SK if EN labels retained

### PD-PT-REGION-001
- Defer; not in EN/SK official scope

---

## Official language policy (draft for owner)

| Tier | Locales | Meaning |
|------|---------|---------|
| OFFICIALLY_SUPPORTED | en-US, sk | QA + legal chrome + support commitment |
| ALIAS | en-GB → en-US | Message fallback |
| TECHNICALLY_COMPLETE | 13 others (de, fr, …) | Catalog complete; not official |
| IN_DEVELOPMENT / INCOMPLETE | 43 | Fallback to en-US |

**Recommendation for Settings/About:**  
“Official languages: English (US), Slovak. Other languages may be incomplete or experimental.”

**PRODUCT_APPROVAL:** OPEN (not granted by this document)
