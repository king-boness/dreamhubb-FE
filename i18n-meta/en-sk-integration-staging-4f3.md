# 4F.3 – Integration & Staging Readiness (EN/SK)

**Generated:** 2026-10-10  
**Phase:** Audit + Integration Testing + E2E + Migration Rehearsal + Queue Verification  
**Deployment:** NOT PERFORMED (local evidence only)

## A) BASELINE

| Item | Value |
|------|-------|
| FE branch | `release/1.0.0` |
| FE HEAD | `1a67b3d870e7a2f405fa6c7a8576d8486f2c246c` |
| FE working tree | DIRTY (~335 paths; includes prior i18n + new E2E) |
| BE branch | `main` |
| BE HEAD | `448295132c000c88324bf77079d8a6287e149130` |
| BE working tree | DIRTY (~40 paths; localization + PostController lock + tests) |
| Production commit SHA | UNKNOWN |
| Isolated E2E DB | `dreamhubb_e2e` (verified) |
| E2E FE | `http://127.0.0.1:9001` |
| E2E BE | `http://127.0.0.1:8002` (`JWT_TTL=120`, local rate-limit bypass for suite) |

## B) RELEASE CHANGE MANIFEST (summary)

### A) FE localization — TRACKED/UNTRACKED packs, glossaries, i18n-meta
- Risk: incomplete packs (43) remain; structural errors 0
- Coverage: `i18n:check` / inventory / tooling-test
- Release relevance: HIGH for EN/SK official; MEDIUM for other 13 complete catalogs

### B) FE runtime — locale apply, language save, Quasar, API Accept-Language
- Risk: language Save + router.back previously destroyed evaluate; mitigated in E2E
- Coverage: authenticated-flows language Save EN→SK

### C) BE localization — `lang/en|sk/*`, `__()` in Auth/Posts/Earn/Contributions/Notifications
- Risk: message-only changes; no economy change
- Coverage: EnSkApiMessages + LocaleAndEarn PHPUnit

### D) Auth — register/login messages, preferred_locale on register, password reset
- Contract: register returns user **without** JWT; FE auto-login (unchanged)
- Coverage: registration E2E + PasswordResetSecurityTest

### E) Notifications — NotificationLocalizer + API title by Accept-Language
- Risk: HTML in actor names not escaped in localizer (FE must escape) — documented
- Coverage: NotificationLocalizerEdgeCasesTest

### F) Emails — explicit mail locale (AuthServiceProvider); verify blade
- Coverage: AsyncMailLocaleIsolationTest + DatabaseQueueMailLocaleTest + e2e queue rehearsal script

### G) Database migrations
- `2026_10_10_120000_add_preferred_locale_to_users_table` — Ran on `dreamhubb_e2e`
- `2026_10_10_180000_create_jobs_table_for_local_queue` — Ran on `dreamhubb_e2e` (local queue)
- Production migration state: UNKNOWN

### H) E2E infrastructure — fixtures, JWT remint, `registration-onboarding.spec.ts`
- Coverage: 9 registration/onboarding + 12 authenticated-flows × 3

### I) Tests — ConcurrentDonateTokenTest, NotificationLocalizerEdgeCases, queue, migration rehearsal
- Targeted PHPUnit: 42/42 PASS
- Full suite: 139 tests with 2 pre-existing failures (NotificationsUnreadCountTest fixture; ModerationComplianceTest missing `tokens`)

### J) Configuration — `config/app_locales.php`, RATE_LIMITER_* bypass only local/testing
### K) Documentation — this file + runbook + 4F.1/4F.2 reports

## C) POSTCONTROLLER

| Topic | Finding |
|-------|---------|
| Syntax root cause (4F.2) | Broken quoted `__()` strings → fixed earlier; `php -l` OK |
| 4F.3 functional change | `donateToPost`: move balance check inside TX + `lockForUpdate()` on donor wallet |
| Business logic / economy | Unchanged costs; same insufficient-token semantics (HTTP 400) |
| Token effects | Prevents concurrent double-spend race |
| Authorization | Own-post donate still blocked; unauthorized if user missing under lock |
| Evidence | PHPUnit ConcurrentDonateTokenTest PASS; parallel curl on e2e: 200+400, balance=2 |

## D–K) TEST EVIDENCE (abbrev.)

| Area | Result |
|------|--------|
| Registration browser E2E | 9/9 PASS (EN/SK; hybrid UI+API where DOB wheel flaky) |
| Onboarding chrome | WhoAreYou EN/SK PASS; full 5-step pure UI NOT fully automated (store/API assist) |
| Donor authenticated | 3×12/12 PASS |
| Donee create Dream | API E2E PASS (not browser create form) |
| Concurrent donate | PASS (PHPUnit + real parallel curl) |
| Notifications edges | PASS (unknown type, missing actor, ownership, special chars) |
| Real DB queue + array mail | PASS (`scripts/e2e-queue-mail-rehearsal.php` ok=true) |
| preferred_locale migration | Column present on e2e; API r/w PASS; production UNKNOWN |
| i18n tooling | 49/49 PASS; errors 0; warnings 43; build PASS |
| FE/BE inventory | UI 59 / packs 58 / keys 859 / complete 15 / incomplete 43 |

## L) LEGAL / PRODUCT

- Legal SK body / approval: NOT READY (external)
- 59-language disclosure: OPEN
- Product decisions (guest picker, logout persistence, PT region, Donor/Donee terms): OPEN
- No legal document edits in 4F.3

## M) OPEN BLOCKERS

### P0
- None confirmed in local integration for EN/SK core runtime.

### P1
- **BL-4F3-LEGAL-001** LEGAL DECISION — Terms/Privacy SK approval missing → Release blocking YES
- **BL-4F3-PROD-MIG-001** UNKNOWN PRODUCTION STATE — `preferred_locale` on prod UNKNOWN → Release blocking YES until verified
- **BL-4F3-DEPLOY-001** DEPLOYMENT PRECONDITION — no staging/prod deploy evidence → Release blocking YES for go-live

### P2
- **BL-4F3-ONB-UI-001** MISSING TEST EVIDENCE — full 5-step onboarding pure browser (DOB wheel/location) not fully automated → Release blocking NO for RC tech; YES for “full UI onboarding proven”
- **BL-4F3-PHPUNIT-LEGACY-001** CONFIRMED DEFECT (pre-existing) — ModerationComplianceTest / NotificationsUnreadCountTest fail in full suite → Release blocking NO for EN/SK i18n track if out of scope
- **BL-4F3-XSS-DOC-001** — NotificationLocalizer passes raw actor into title; FE escaping required → Release blocking NO if FE escapes (verify in review)

### P3
- Incomplete packs 43; open product decisions 6

## N) FINAL READINESS

| Area | Verdict |
|------|---------|
| A) FE INTEGRATION | READY WITH CONDITIONS |
| B) BE INTEGRATION | READY WITH CONDITIONS |
| C) API COMPATIBILITY | READY (register still no JWT; preferred_locale additive) |
| D) AUTH / REGISTRATION | READY WITH CONDITIONS (E2E hybrid; rate-limit sensitive locally) |
| E) ONBOARDING | READY WITH CONDITIONS (not full pure-UI 5-step) |
| F) DONOR FUNCTIONAL E2E | READY (3×12/12) |
| G) DONEE FUNCTIONAL E2E | READY WITH CONDITIONS (create Dream = API E2E) |
| H) TOKEN INTEGRITY | READY (concurrent lock verified) |
| I) NOTIFICATIONS | READY WITH CONDITIONS (XSS = FE responsibility) |
| J) EMAIL / QUEUE | READY (local DB queue + array mail; prod queue UNKNOWN) |
| K) MIGRATION READINESS | READY WITH CONDITIONS (e2e rehearsed; prod UNKNOWN) |
| L) SECURITY | READY WITH CONDITIONS (local rate-limit bypass only for tests) |
| M) LEGAL | NOT READY |
| N) DEPLOYMENT | NOT READY |
| O) OVERALL RELEASE | **NOT READY** |

**Overall:** Technically strong EN/SK RC candidate locally; blocked by legal approval, production migration UNKNOWN, and missing deployment evidence.
