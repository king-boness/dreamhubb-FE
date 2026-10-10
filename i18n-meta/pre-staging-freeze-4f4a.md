# 4F.4A – Pre-Staging Release Freeze Preparation

**Generated:** 2026-10-10  
**Commit / push / deploy:** NOT PERFORMED  
**VERSIONED ARTIFACT:** **NOT READY**

---

## A) BASELINE

| | FE (`dreamhubb-FE`) | BE (`dreamhubb-BE`) |
|--|---------------------|---------------------|
| Branch | `release/1.0.0` | `main` |
| HEAD | `1a67b3d870e7a2f405fa6c7a8576d8486f2c246c` | `448295132c000c88324bf77079d8a6287e149130` |
| vs origin | tracks `origin/release/1.0.0` | tracks `origin/main` |
| Staged | **0** | **0** |
| Dirty (porcelain) | **336** | **45** |
| Unstaged modified/deleted | 173 | 19 |
| Untracked (status lines) | incl. `i18n-meta/` dir + e2e + packs | 37 |
| Lockfile | `package-lock.json` (npm) | `composer.lock` |
| Runtime | Node ≥20 / npm ≥10 (local: v22.23.2 / 10.9.8) | PHP ^8.1 (local: 8.3.30) |

---

## B) RELEASE FILE CLASSIFICATION

### Legend
A REQUIRED FOR RELEASE · B TESTS · C BUILD · D DOCS · E GENERATED · F LOCAL CONFIG · G SECRET · H UNRELATED · I MANUAL REVIEW

### BE (45) — precise

| Path | Type | Class | Risk | Coverage |
|------|------|-------|------|----------|
| `app/Http/Controllers/{Auth,User,Post,Notification,Contribution,EarnTask}Controller.php` | M | A | Medium | PHPUnit + E2E |
| `app/Http/Controllers/PasswordResetController.php` | ?? | A | Medium | PasswordResetSecurityTest |
| `app/Support/{NotificationLocalizer,UserLocale}.php` | ?? | A | Medium | Edge + XSS contract |
| `app/Http/Middleware/SetLocaleFromAcceptLanguage.php` | ?? | A | Low | Locale tests |
| `app/Providers/{Auth,Route}ServiceProvider.php` | M | A | Medium | Mail + rate-limit |
| `app/Models/User.php` | M | A | Low | preferred_locale |
| `app/Http/Kernel.php`, `CapacitorCors.php`, `Handler.php` | M | A | Low–Med | Integration |
| `app/Services/EarnTaskService.php`, `ContentModeration.php` | M | A | Low | Earn/moderation |
| `config/app_locales.php`, `config/translation.php` | ??/M | A | Low | Locale |
| `lang/` (en+sk) | ?? | A | Low | EnSkApiMessages |
| `routes/api.php` | M | A | Medium | API E2E |
| `resources/views/email/{verify,reset}.blade.php` | M/?? | A | Low | Mail tests |
| `database/migrations/2026_10_10_120000_add_preferred_locale_to_users_table.php` | ?? | A | **High** (deploy order) | Migration rehearsal |
| `database/migrations/2026_10_10_180000_create_jobs_table_for_local_queue.php` | ?? | A* | Medium | Queue rehearsal; *optional if Redis/SQS |
| `tests/Feature/*` (locale, concurrent, rate limit, XSS, fixes) | M/?? | B | Low | PHPUnit |
| `database/seeders/E2eScenarioSeeder.php`, `PrepareE2eDatabaseCommand.php`, `scripts/e2e-*` | ?? | B | Low | Local E2E only |

### FE (336) — aggregated

| Group | Approx | Class | Notes |
|-------|-------:|-------|-------|
| `src/i18n/**`, `src/boot/*`, `src/utils/{applyLocale,apiLanguage,quasarLang}*`, stores, pages, components, router, layouts | ~300 | A | Core EN/SK + 15 catalogs runtime |
| `src/config/legalDocuments.ts`, Public legal pages, `AuthLegalNotice` | few | A | Legal chrome (body EN unchanged) |
| `public/static-legal/**` | ?? | A | Static mirrors |
| `D public/{terms,privacy,privacy-policy}/index.html` | 3 | I | Moved/replaced by static-legal — verify redirects |
| `package.json`, `index.html` | M | A/C | Build entry |
| `e2e/**`, `scripts/i18n*`, `scripts/api-language-smoke.js` | ~25 | B | Release regression tests |
| `i18n-meta/` (381 files under tree; status shows dir) | large | D + E | Keep slim reports; **exclude** `packages/*` bulk from first freeze unless owner wants |
| `.env` | M + `H` assume-unchanged | **G** | **NEVER commit** |

### Explicit EXCLUDE from any future `git add`
- FE/BE `.env*` (values never in report)
- `i18n-meta/packages/**` bulk export/import (unless intentional docs commit)
- `.tmp-uk/**`, `test-results/`, `playwright-report/`, `dist/`
- Local DB dumps / logs

---

## C) SECURITY / SECRETS

| Finding | Path / type | Action |
|---------|-------------|--------|
| FE `.env` tracked historically + **assume-unchanged (`H`)** + locally modified | SECRET / SENSITIVE | Do not stage; confirm not in future commit |
| BE `.env` present locally, gitignored | SECRET | Keep ignored |
| `.env.example` documents key names only (empty secrets) | OK | Safe to version |
| Stripe / JWT / SMTP / DB password slots | in local env only | Staging must use **separate** secrets |
| No secret values printed in this audit | — | — |

**Git ignore:** FE/BE ignore `.env` / `.env.*`. Risk remains if someone `git add -f .env` or clears assume-unchanged.  
**Proposed rule:** never `git add -A`; use explicit path lists from this manifest.

---

## D) FE/BE DEPLOY DEPENDENCIES (order)

1. **DB:** apply `preferred_locale` (nullable) before BE that writes it  
2. **BE:** deploy localized API + NotificationLocalizer + mail builders  
3. **Queue workers:** same BE build (explicit mail locale; optional `jobs` table if `database` queue)  
4. **FE:** deploy language Save / Accept-Language / onboarding  

| Flow | FE dep | BE dep | Migration |
|------|--------|--------|-----------|
| Auth / register / login | stores, pages | AuthController, lang | — |
| preferred_locale | SettingsLanguage, register payload | User model/update, UserLocale | **required** |
| Onboarding | WhoAreYou…WhereAreYou | register + locations | — |
| Posts / help / tokens | pages/components | PostController locks | — |
| Notifications | NotificationComponent | NotificationLocalizer | — |
| Earn | EarnPage | EarnTaskService + lang/earn | — |
| Verify / reset mail | — | AuthServiceProvider + views | — |
| Queue | — | jobs migration if database driver | optional |

**Production migration state:** **UNKNOWN** (no prod evidence in this phase).

---

## E) STAGING PREFLIGHT

### Infrastructure evidence in repo
| Item | Evidence | Verdict |
|------|----------|---------|
| Staging FE host | none dedicated | **NOT CONFIGURED** |
| Staging BE service | `render.yaml` → `dreamhubb-be-php` only (prod-like name) | **UNKNOWN** / no separate staging service |
| Staging DB | not defined in repo | **NOT CONFIGURED** |
| Staging env vars | not in repo | **UNKNOWN** |
| Staging queue | `.env.example` default `sync` | **UNKNOWN** |
| Test SMTP / mail sink | example points 127.0.0.1:1025 | **NOT CONFIGURED** for remote staging |
| Health checks | `/api/health` exists (used locally) | PASS locally; staging **UNKNOWN** |
| Access restrictions | none documented for staging | **UNKNOWN** |
| Monitoring | not in freeze scope | **UNKNOWN** |
| Rollback | runbook 4F.3 prepared; not rehearsed on staging | **UNKNOWN** |

### Isolation checklist (private staging prerequisites)

| Requirement | Status |
|-------------|--------|
| Oddelená DB | **UNKNOWN** / NOT CONFIGURED |
| No production writes | **UNKNOWN** until staging URL/DB proven |
| No production queue | **UNKNOWN** |
| No production SMTP | **UNKNOWN** |
| No real payments | **UNKNOWN** (Stripe test mode must be forced) |
| No production accounts | **UNKNOWN** |
| Controlled access | **UNKNOWN** |
| External services test mode | **UNKNOWN** |
| Safe secrets | **UNKNOWN** |
| Rollback possible | **UNKNOWN** (plan exists on paper) |

---

## F) TWO RELEASE TYPES

### A) PRIVATE STAGING RELEASE
**Purpose:** internal technical validation of EN/SK RC.

Minimum blockers (current):
1. **VERSIONED ARTIFACT NOT READY** (uncommitted dirty trees)
2. **Staging environment NOT CONFIGURED / UNKNOWN isolation**
3. Explicit owner approval to create commits + deploy to a proven isolated staging
4. Migration applied on **that** staging DB (not prod)
5. Mail/queue pointed at non-prod sinks

Legal/product for **public** store claims are **not** automatic blockers for a locked-down private staging — but staging must not be public/indexed as production.

**Private staging readiness:** **NOT READY**

### B) PUBLIC PRODUCTION RELEASE
All private staging items **plus**:
- LEGAL_APPROVED (SK body decision)
- PRODUCT_APPROVED (official language disclosure)
- Production `preferred_locale` state verified
- Production env/queue/mail/Stripe live posture approved
- Go-live approval

**Public release readiness:** **NOT READY**

---

## G) LANGUAGE POLICY (options only — not implemented)

| | Option A (recommended for first **public** release) | Option B |
|--|------------------------------------------------------|----------|
| Selector | Official en-US + sk only | Keep 59 with Experimental labels |
| UX | Clear expectations | Risk of incomplete UX |
| Tech | Filter `APP_LANGUAGES` / settings list | Copy-only disclosure |
| Fallback | en-US | en-US |
| Risk | Lower support load | Users believe full support |
| FE change | Requires **owner approval** | Requires **owner approval** |
| This phase | **NOT IMPLEMENTED** | **NOT IMPLEMENTED** |

Working recommendation remains A for public; **PRODUCT_APPROVAL: OPEN**.

---

## H) LEGAL GATE

- Package: `legal-review-package-4f4.md` — sufficient for external counsel handoff  
- EN body published; SK `not_available` + notice  
- **LEGAL_APPROVED: NOT READY**  
- Checklist for counsel: SK body vs EN+notice; tokens; UGC; personal data; roles; store publishing  

---

## I) REPRODUCIBILITY (local evidence)

| Check | Result |
|-------|--------|
| `npm run i18n:check` | 0 ERRORS / 43 WARNINGS |
| Targeted PHPUnit (locale/token/rate) | 16/16 PASS |
| Prior 4F.4 full PHPUnit | 144/144 PASS |
| Prior FE build | PASS |
| Versioned commit SHA for RC | **NOT READY** |

---

## J) PROPOSED VERSIONING PLAN (do not execute)

### BE commits (suggested split)
1. `feat(i18n): preferred_locale + EN/SK API/mail localization` — migrations, lang, controllers, UserLocale, NotificationLocalizer, routes, views, config  
2. `fix(tokens): lockForUpdate on donate and post top-up` — PostController concurrency  
3. `test: locale, mail queue, concurrent tokens, rate limit, PHPUnit fixture fixes`  
4. Optional: `chore(e2e): prepare command + seeders` (can stay local if staging uses other fixtures)

**Exclude:** `.env`, production credentials  

### FE commits (suggested split)
1. `feat(i18n): locale runtime + EN/SK (+ technically complete packs)` — `src/i18n`, boot, utils, stores, UI  
2. `feat(legal): static-legal mirrors + legalDocuments meta` — without inventing SK legal body  
3. `test(e2e): registration/onboarding/authenticated i18n flows`  
4. `docs(i18n-meta): release readiness reports` — **exclude** bulky `packages/*` unless requested  

**Exclude:** `.env`, `dist/`, `test-results/`, bulk machine packages  

### Order
BE migration-capable commit → BE deploy to staging → FE commit/deploy → smoke  

### Tests before commit
FE: i18n:check, tooling-test, build, pure-browser + authenticated E2E  
BE: full PHPUnit  

### Tests after commit
Re-checkout clean tree; rebuild; re-run suites against frozen SHAs  

---

## K) FINAL QUESTIONS (short)

1. Manifest? **YES** (this doc + JSON)  
2. Release vs local-only? **YES** (classification)  
3. Secrets identified? **YES** (paths only)  
4. Staging state known? **NO** — NOT CONFIGURED / UNKNOWN  
5. Staging isolated? **UNKNOWN**  
6. Migration strategy prepared? **YES** (order); prod state UNKNOWN  
7. Queue/mail strategy? **YES** on paper; staging sinks UNKNOWN  
8. Reproducible build procedure? **YES** locally; not frozen in git  
9. Versioning plan? **YES**  
10. Versioned artifact created? **NOT READY**  
11. Private staging blockers? Artifact freeze + staging isolation unknown  
12. Public blockers? Legal + product + prod migration + go-live  
13. Language policy product-approved? **OPEN**  
14. Legal approval? **NOT READY**  
15. Owner approvals needed? Commit freeze; staging env; language A/B; legal path  
16. Safe to enter approved 4F.5? **NO** until artifact + isolated staging proven  

| Gate | Verdict |
|------|---------|
| A TECHNICAL CODE | READY WITH CONDITIONS |
| B RELEASE MANIFEST | READY |
| C SECURITY | READY WITH CONDITIONS |
| D VERSIONED ARTIFACT | **NOT READY** |
| E PRIVATE STAGING | **NOT READY** |
| F PUBLIC RELEASE | **NOT READY** |
