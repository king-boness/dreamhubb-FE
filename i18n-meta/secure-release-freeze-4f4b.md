# 4F.4B – Secure Release Freeze (approval gate)

**Generated:** 2026-10-10  
**Git index mutations:** NOT EXECUTED  
**Commits / push / deploy:** NOT EXECUTED  
**Waiting for owner phrase:** `APPROVE LOCAL RELEASE COMMITS`

---

## A) GIT BASELINE

| | FE | BE |
|--|----|----|
| Branch | `release/1.0.0` | `main` |
| HEAD | `1a67b3d870e7a2f405fa6c7a8576d8486f2c246c` | `448295132c000c88324bf77079d8a6287e149130` |
| Staged | 0 | 0 |
| Dirty (porcelain) | 336 | 45 |
| Package manager | **npm** + `package-lock.json` (no `packageManager` field; no pnpm lock) | Composer + `composer.lock` |
| Runtime | Node ≥20 / npm ≥10 | PHP ^8.1 |

---

## B) .ENV SECURITY (FE)

| Question | Evidence |
|----------|----------|
| Tracked? | **YES** — `git ls-files` blob `f7b7b84f…` |
| In HEAD? | **YES** — `HEAD:.env` exists |
| In history? | **YES** — 2 commits (`28096bc`, `c1d0ed9`) |
| assume-unchanged? | **YES** — `git ls-files -v` → `H .env` |
| Local file deleted? | **NO** (must keep) |
| BE `.env` tracked? | **NO** (gitignored; present on disk only) |

### Key categories (names only — no values)

| Key | Category | Notes |
|-----|----------|-------|
| `VITE_API_BASE` | PUBLIC CLIENT / BUILD-TIME | Vite exposes to browser; HEAD = localhost API |
| `VITE_API_BASE_FALLBACK` | PUBLIC CLIENT (WT only) | Hostname class: Render BE service DNS — **not a private secret**, but must not be carelessly committed from local WT |
| `VITE_API_BASE_NATIVE_DEV` | TEST / LOCAL CONFIG (WT only) | LAN-style host for Capacitor dev |

**No** JWT / DB / SMTP / Stripe keys in FE `.env` (only 3 Vite keys).

### Historical credentials compromise

| Risk | Assessment |
|------|------------|
| Private secrets in FE `.env` history | **LOW** for classic secrets (no JWT/DB/Stripe in tracked FE env) |
| Disclosure of API base URLs | **MEDIUM** — public-by-design for Vite; still poor hygiene to track `.env` |
| Rotation required? | **NOT INDICATED** for private API keys from FE `.env` alone; still remediate tracking |
| History rewrite | **NOT PROPOSED** (out of scope; does not remove past blobs without separate approval) |

### Proposed remediation (NOT EXECUTED)

```bash
# FE only — after APPROVE LOCAL RELEASE COMMITS (or separate ENV approval):
# 1) Ensure .gitignore contains .env (already does)
# 2) Remove from index WITHOUT deleting working copy:
git rm --cached -- .env
# 3) Optionally add .env.example with key names only (VITE_*)
# 4) Commit that change in a dedicated hygiene commit
# 5) Clear assume-unchanged if set: git update-index --no-assume-unchanged .env
```

**Does not** purge history. Local `.env` must remain on disk.

---

## C) SECRETS ASSESSMENT

| Item | Status |
|------|--------|
| FE `.env` | Tracked + assume-unchanged — remediate via `rm --cached` when approved |
| BE `.env` | Untracked — OK |
| BE `.env.example` | Safe key catalog — OK to keep |
| Stripe/JWT/SMTP/DB | Live only in BE local env — never stage |
| Allowlist excludes | `.env*`, dumps, `dist/`, `test-results/` |

---

## D) RELEASE FILE ALLOWLIST (proposed)

### BE — include (explicit paths)

**RELEASE_MIGRATION**
- `database/migrations/2026_10_10_120000_add_preferred_locale_to_users_table.php`
- `database/migrations/2026_10_10_180000_create_jobs_table_for_local_queue.php` (optional if staging uses Redis/SQS)

**RELEASE_CODE**
- `app/Http/Controllers/AuthController.php`
- `app/Http/Controllers/UserController.php`
- `app/Http/Controllers/PostController.php`
- `app/Http/Controllers/NotificationController.php`
- `app/Http/Controllers/ContributionController.php`
- `app/Http/Controllers/EarnTaskController.php`
- `app/Http/Controllers/PasswordResetController.php`
- `app/Support/NotificationLocalizer.php`
- `app/Support/UserLocale.php`
- `app/Http/Middleware/SetLocaleFromAcceptLanguage.php`
- `app/Http/Middleware/CapacitorCors.php`
- `app/Http/Kernel.php`
- `app/Exceptions/Handler.php`
- `app/Models/User.php`
- `app/Providers/AuthServiceProvider.php`
- `app/Providers/RouteServiceProvider.php`
- `app/Services/EarnTaskService.php`
- `app/Support/ContentModeration.php`
- `config/app_locales.php`
- `config/translation.php`
- `lang/` (entire new tree)
- `routes/api.php`
- `resources/views/email/verify.blade.php`
- `resources/views/email/reset.blade.php`

**RELEASE_TEST**
- All new/modified `tests/Feature/*` locale/token/security/fix fixtures
- Optional E2E tooling: `PrepareE2eDatabaseCommand.php`, `E2eScenarioSeeder.php`, `scripts/e2e-*` (can be separate chore commit)

**EXCLUDE:** `.env`, storage dumps, logs

### FE — include

**RELEASE_CODE:** all dirty under `src/` (i18n runtime, catalogs, boot, stores, pages, components, legal config)  
**RELEASE_CODE:** `public/static-legal/**`  
**RELEASE_DEPENDENCY:** `package.json`, `index.html` (and `package-lock.json` only if it changed)  
**NEEDS_REVIEW / include with care:** deletions `public/terms/index.html`, `public/privacy/index.html`, `public/privacy-policy/index.html`  
  - SPA routes `/terms`, `/privacy` remain via Vue history  
  - Static mirrors live at `/static-legal/...`  
  - Hosting must rewrite App Store URLs to SPA **or** keep static HTML at public paths — verify before freeze  
**RELEASE_TEST:** `e2e/**`, `scripts/i18n*.js`, `scripts/api-language-smoke.js`, `scripts/i18n/`  
**RELEASE_DOCUMENTATION (slim):** selected `i18n-meta/*.md|*.json` reports + `product-decisions.json` + glossaries/qa — **NOT** `i18n-meta/packages/**`  

**SECRET / EXCLUDE:** `.env`, `dist/`, `test-results/`, `playwright-report/`, `.tmp-*`, `i18n-meta/packages/**`

---

## E) EXCLUDED FILES
- FE/BE `.env*`
- `i18n-meta/packages/**` (bulk AI export/import)
- Generated reports under `test-results/`, `dist/`
- Local LAN-only config values in working `.env`

---

## F) BUILD / TEST RESULTS (this phase)

| Check | Result |
|-------|--------|
| `npm run i18n:inventory` | 59 UI / 58 packs / 859 keys |
| `npm run i18n:check` | **0 ERRORS** / 43 WARNINGS |
| `npm run i18n:tooling-test` | **49/49 PASS** |
| `node scripts/i18n-plural-smoke.js` | **PASS** |
| `npm run build` | **PASS** |
| `php -l` PostController, NotificationLocalizer | OK |
| Full PHPUnit | **144/144 PASS** |
| E2E pure-browser + authenticated (first run) | **22/23 PASS** — 1 fail: file-cache dir race after `cache:clear` during throttle hit (not product logic) |
| E2E retry `donee full UI flow (en-US)` after `mkdir -p storage/framework/cache/data` | **1/1 PASS** |
| E2E hardening | `pure-browser-onboarding.spec.ts` beforeEach now recreates cache dirs after clear |
| Legal routes E2E | **PASS** (`terms/privacy direct + trailing slash + aliases`) |

---

## G) FE/BE DEPENDENCIES (deploy order)

1. Staging DB: `preferred_locale` migration  
2. Staging BE (+ workers if queue)  
3. Staging FE  

Contracts additive (`preferred_locale`); register still returns user without JWT (FE login after).

---

## H) STAGING ARCHITECTURE (blueprint only)

Current `render.yaml`: single service `dreamhubb-be-php` — **not proven** as isolated staging.

**Required (proposal):**
| Component | Requirement |
|-----------|-------------|
| FE | Separate static/SPA host (e.g. Render static / Netlify / Cloudflare) — staging hostname |
| BE | **New** Render web service (e.g. `dreamhubb-be-staging`) — do not mutate prod service blindly |
| DB | Separate PostgreSQL (`dreamhubb_staging`) |
| Queue | staging Redis **or** database `jobs` on staging DB |
| Mail | Mailtrap / Mailhog / log driver — never prod SMTP |
| Stripe | test keys only |
| Secrets | unique `APP_KEY`, `JWT_SECRET`, DB password |
| Access | basic auth / IP allow / robots noindex |
| Health | `/api/health` |
| Rollback | previous deploy image + keep nullable column |

**NOT EXECUTED:** no Render creates, no paid DBs, no deploys.

---

## I) STAGING ENV REQUIREMENTS (names only)

| Variable | Class |
|----------|-------|
| `APP_ENV=staging` | REQUIRED |
| `APP_DEBUG=false` | REQUIRED |
| `APP_KEY` | SECRET – SET MANUALLY |
| `APP_URL` | REQUIRED (staging URL) |
| `DB_*` | SECRET – SET MANUALLY (staging DB only) |
| `QUEUE_CONNECTION` | REQUIRED (`database`/`redis`) |
| `MAIL_MAILER` / sink host | REQUIRED (non-prod) |
| `JWT_SECRET` | SECRET – SET MANUALLY |
| `FRONTEND_URL` | REQUIRED (staging FE) |
| `STRIPE_*` | SECRET – test mode only |
| `RATE_LIMITER_*=disabled` | **MUST NOT** be set on staging/prod |
| FE `VITE_API_BASE` | BUILD-TIME → staging BE API |

---

## J) COMMIT PLAN (proposed messages)

### BE
1. `feat(i18n): add preferred_locale and EN/SK API localization`
2. `fix(tokens): serialize donate and post top-up with lockForUpdate`
3. `test: locale, mail queue, concurrent tokens, auth rate limit, fixture fixes`
4. (optional) `chore(e2e): isolated DB prepare command and seeder`

### FE
1. `feat(i18n): locale runtime and complete message catalogs`
2. `feat(legal): static-legal mirrors and SPA legal routes integration`
3. `test(e2e): registration, onboarding, and authenticated EN/SK flows`
4. `docs(i18n): release readiness and freeze reports` (slim meta only)
5. (after approval) `chore(security): stop tracking FE .env`

**Staging commands after approval only (examples — not run):**
```bash
# NEVER: git add -A
git add -- <explicit paths from allowlist>
git status
git diff --cached --stat
# secret scan of staged names
git commit -m "..."
```

---

## K) OWNER APPROVAL STATUS

| Request | Status |
|---------|--------|
| `APPROVE LOCAL RELEASE COMMITS` | **PENDING** |
| Approve `git rm --cached -- .env` | **PENDING** (can be same or separate) |
| Push | **NOT REQUESTED** — still forbidden |
| Staging deploy | **NOT REQUESTED** — still forbidden |

**Until approval: no `git add`, no `git rm --cached`, no `git commit`.**

---

## L–N) READINESS

| Gate | Status |
|------|--------|
| LOCAL CODE READINESS | READY WITH CONDITIONS |
| SECRETS HYGIENE | NOT READY (tracked FE `.env` until remediations commit) |
| RELEASE MANIFEST | READY |
| VERSIONED ARTIFACT | **NOT READY** |
| STAGING ENV CONFIG | NOT READY / blueprint only |
| STAGING ISOLATION | UNKNOWN / NOT CONFIGURED |
| MIGRATION READINESS | READY WITH CONDITIONS (staging DB unknown) |
| QUEUE / EMAIL READINESS | READY WITH CONDITIONS (local proven; staging sinks unknown) |
| STAGING DEPLOY APPROVAL | NOT READY |
| PUBLIC LEGAL / PRODUCT / GO-LIVE | NOT READY / OPEN |

**PRIVATE STAGING READY:** NOT READY  
**PUBLIC RELEASE READY:** NOT READY  

---

## O) OPEN BLOCKERS

| ID | Sev | Description | Action | Owner | Impact |
|----|-----|-------------|--------|-------|--------|
| BL-4F4B-ENV-001 | P0 | FE `.env` tracked + assume-unchanged | Approve `git rm --cached`; never commit WT | Product/Eng | Blocks clean freeze |
| BL-4F4B-ARTIFACT-001 | P0 | No release commits yet | Approve commit allowlist | Product | VERSIONED ARTIFACT |
| BL-4F4B-STAGE-001 | P0 | No proven isolated staging | Approve staging blueprint + provision | Product/DevOps | Private staging |
| BL-4F4B-LEGAL-001 | P1 | Legal not approved | Counsel | Public release |
| BL-4F4B-PROD-MIG-001 | P1 | Prod preferred_locale UNKNOWN | Verify before prod | Eng | Public release |
| BL-4F4B-LEGAL-STATIC-001 | P2 | Deleted `public/terms|privacy` vs SPA/static-legal | Confirm hosting rewrites | Eng | Hosting 404 risk |

---

## P) NEXT EXECUTION STEPS

1. Owner replies **`APPROVE LOCAL RELEASE COMMITS`** (and optionally approve `.env` untrack).  
2. Agent stages **only** allowlisted paths; verifies staged names/diff; commits FE/BE per plan.  
3. Record full SHAs; leave unrelated local dirt untouched.  
4. **Stop** — no push/deploy until separate approval.  
5. Provision isolated staging from blueprint → 4F.5.  
