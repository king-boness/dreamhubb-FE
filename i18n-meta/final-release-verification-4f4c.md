# 4F.4C – Final Release Verification & Commit Approval Gate

**Generated:** 2026-10-10  
**Git index mutations:** NOT EXECUTED  
**Awaiting separate owner reply:** explicit approval after this report (this file is NOT approval)

---

## Verdict

### JE RELEASE KANDIDÁT PRIPRAVENÝ NA BEZPEČNÉ LOKÁLNE VERZIONOVANIE?

# READY

Podmienky vykonania (až po výslovnom schválení vlastníka):
1. FE: `git rm --cached -- .env` (lokálny súbor ostáva)
2. Explicit allowlist staging — nikdy `git add -A` / `.` / `-f`
3. BE: preferovaná nová vetva `release/1.0.0` z aktuálneho `main` **pred** commitmi (žiadny auto switch v tejto fáze)
4. Žiadny push / deploy / merge / rebase

**PRIVATE STAGING / PUBLIC RELEASE:** stále **NOT READY** (mimo scope lokálneho verzionovania).

---

## A) FE branch a HEAD

| Položka | Hodnota |
|---------|---------|
| Branch | `release/1.0.0` |
| HEAD | `1a67b3d870e7a2f405fa6c7a8576d8486f2c246c` |
| Dirty | 336 (+ drobné E2E hardening zmeny v tejto fáze) |
| Staged | 0 |

## B) BE branch a HEAD

| Položka | Hodnota |
|---------|---------|
| Branch | `main` |
| HEAD | `448295132c000c88324bf77079d8a6287e149130` |
| Dirty | 45 |
| Staged | 0 |
| Tracking | `main...origin/main` |

### Navrhovaná BE branch stratégia (NEVYKONANÁ)

```bash
# Po schválení, PRED commitmi na BE:
git switch -c release/1.0.0
# commity podľa skupín BE-1…BE-3
# push neskôr samostatným schválením
```

Kompatibilné: čistý `main` + iba lokálne dirty; žiadny rebase/merge potrebný.  
Alternatíva: commity priamo na `main` — **nepreferované** pre RC freeze.

## C) Kompletný commit scope

Pozri sekciu **Commit skupiny** nižšie a `secure-release-allowlist-4f4b.json` (platný; packages stále EXCLUDED).

## D) .env remediation

| Fakt | Stav |
|------|------|
| Tracked | ÁNO |
| assume-unchanged | ÁNO (`H`) |
| `.gitignore` má `.env` / `.env.*` | ÁNO (nechráni už tracked) |
| História | 2 commits |
| Navrhovaná op. | `git rm --cached -- .env` |
| Lokálny súbor | ZACHOVAŤ |

## E) Secrets assessment

| Kľúč (názov) | Trieda |
|--------------|--------|
| `VITE_API_BASE` | PUBLIC CLIENT |
| `VITE_API_BASE_NATIVE_DEV` | PUBLIC CLIENT / LOCAL |
| `VITE_API_BASE_FALLBACK` | PUBLIC CLIENT |

Žiadne private secrets vo FE `.env` **nepotvrdené**. Release príprava **nebola zastavená**.

Staging safety exclude: `.env*`, secrets, keys, dumps, `test-results/`, `dist/`, `i18n-meta/packages/**`.

## F) E2E results

### Cache race (4F.4B)

| Kontrola | Verdikt |
|----------|---------|
| Príčina | Laravel FileStore po `cache:clear` bez parent dirs |
| Fix | `mkdir -p storage/framework/cache/data …` v beforeEach (pure-browser + authenticated-flows) |
| Skutočná príčina odstránená? | **ÁNO** pre cache race |

### Beh pred hardeningom izolácie

| Beh | Workers | Výsledok |
|-----|---------|----------|
| Predbežný #1 (4F.4C) | 2 | **23/23 PASS** |
| Predbežný #2 | 2 | **22/23 FAIL** — nestabilný onboarding click / detach (nie cache; pravdepodobne HMR + parallel) |

### Fix flaky UI (iba test helper)

- `clickOnboardingNext`: wait enabled + scroll + stable click
- pure-browser: `test.describe.configure({ mode: "serial" })`
- authenticated-flows: rovnaký mkdir po cache:clear

### 3 čisté behy (požadované)

| Beh | Workers | Výsledok | Čas | Log |
|-----|---------|----------|-----|-----|
| CLEAN 1 | 1 | **23/23 PASS** | ~1.1m | `/tmp/4f4c-e2e-clean1.log` |
| CLEAN 2 | 1 | **23/23 PASS** | ~1.1m | `/tmp/4f4c-e2e-clean2.log` |
| CLEAN 3 | 1 | **23/23 PASS** | ~1.1m | `/tmp/4f4c-e2e-clean3.log` |

Sada: `pure-browser-onboarding.spec.ts` + `authenticated-flows.spec.ts`  
Legal SPA routes E2E: súčasť authenticated-flows — PASS vo všetkých clean behoch.

**Hosting rewrite v cieľovom cloud prostredí:** **NEOVERENÉ** (nie PASS).

## G) PHPUnit

**144/144 PASS** (608 assertions), PHP 8.3.30  
Syntax OK: PostController, NotificationLocalizer, SetLocaleFromAcceptLanguage, AuthController

## H) FE build / i18n

| Check | Result |
|-------|--------|
| inventory | UI **59** / packs **58** / keys **859** / complete **15** / incomplete **43** |
| i18n:check | **ERRORS (0)** / WARNINGS (43) |
| tooling-test | **49/49 PASS** |
| release-readiness | totals match; wrote `i18n-meta/release-readiness.json` (LOCAL artifact — exclude z release alebo slim docs) |
| build | **PASS** (`dist/spa` + static-legal copied) |

## I) Release dependencies

1. Staging/prod DB: `preferred_locale` migration (additive)  
2. BE deploy (+ queue worker ak `database`/`redis`)  
3. FE deploy s `VITE_API_BASE` → cieľové BE  
4. FE `.env` untrack commit pred/push hygiene  

## J) Staging prerequisites (stále NOT READY)

- Samostatný FE + BE + PostgreSQL + queue + mail sink  
- `render.yaml` stále len `dreamhubb-be-php`  
- Žiadny deploy v tejto fáze  

## K) Presné Git operácie po schválení (návrh)

### FE (`release/1.0.0`)

```bash
# 0) hygiene
git rm --cached -- .env
git add -- .gitignore   # iba ak treba potvrdiť; už obsahuje .env
git commit -m "chore(security): stop tracking FE .env"

# 1) i18n + app
git add -- src/ index.html package.json
git commit -m "feat(i18n): locale runtime and complete message catalogs"

# 2) legal
git add -- public/static-legal/
git add -- public/terms/index.html public/privacy/index.html public/privacy-policy/index.html
git commit -m "feat(legal): static-legal mirrors and SPA legal routes integration"

# 3) e2e + scripts
git add -- e2e/ scripts/i18n-check.js scripts/i18n-plural-smoke.js scripts/api-language-smoke.js scripts/i18n/
git commit -m "test(e2e): registration, onboarding, and authenticated EN/SK flows"

# 4) optional slim docs (NOT packages/)
git add -- i18n-meta/secure-release-allowlist-4f4b.json \
  i18n-meta/secure-release-freeze-4f4b.md \
  i18n-meta/final-release-verification-4f4c.md \
  i18n-meta/en-sk-final-gates-4f4.json \
  i18n-meta/pre-staging-freeze-4f4a.json \
  i18n-meta/glossary.en-sk.json \
  i18n-meta/locale-names.json
# (rozšíriť podľa owner preferencie — NIKDY i18n-meta/packages/)
git commit -m "docs(i18n): release readiness and freeze reports"
```

### BE (po `git switch -c release/1.0.0`)

```bash
git add -- \
  database/migrations/2026_10_10_120000_add_preferred_locale_to_users_table.php \
  database/migrations/2026_10_10_180000_create_jobs_table_for_local_queue.php \
  app/Http/Middleware/SetLocaleFromAcceptLanguage.php \
  app/Support/NotificationLocalizer.php app/Support/UserLocale.php \
  app/Http/Controllers/AuthController.php app/Http/Controllers/UserController.php \
  app/Http/Controllers/PostController.php app/Http/Controllers/NotificationController.php \
  app/Http/Controllers/ContributionController.php app/Http/Controllers/EarnTaskController.php \
  app/Http/Controllers/PasswordResetController.php \
  app/Http/Kernel.php app/Http/Middleware/CapacitorCors.php \
  app/Exceptions/Handler.php app/Models/User.php \
  app/Providers/AuthServiceProvider.php app/Providers/RouteServiceProvider.php \
  app/Services/EarnTaskService.php app/Support/ContentModeration.php \
  config/app_locales.php config/translation.php \
  lang/ routes/api.php \
  resources/views/email/verify.blade.php resources/views/email/reset.blade.php
git commit -m "feat(i18n): add preferred_locale and EN/SK API localization"

git add -- tests/Feature/
git commit -m "test: locale, mail queue, concurrent tokens, auth rate limit, fixture fixes"

# optional e2e tooling
git add -- app/Console/Commands/PrepareE2eDatabaseCommand.php \
  database/seeders/E2eScenarioSeeder.php scripts/e2e-prepare-db.sh scripts/e2e-queue-mail-rehearsal.php
git commit -m "chore(e2e): isolated DB prepare command and seeder"
```

**Pred každým commitom:** `git status` + `git diff --cached --name-only` + kontrola absencie `.env`/secrets.

**NIE SÚČASŤOU schválenia commitov:** push, deploy, merge, rebase, história rewrite, cloud staging.

---

## Commit skupiny (detail)

### FE-0 Security hygiene
- Repo: FE · Branch: `release/1.0.0`
- Files: untrack `.env`
- Purpose: secrets hygiene
- Deps: none
- Message: `chore(security): stop tracking FE .env`
- Security: REQUIRED
- Tests: N/A (git hygiene)

### FE-1 i18n runtime + catalogs
- Files: `src/`, `index.html`, `package.json`
- Message: `feat(i18n): locale runtime and complete message catalogs`
- Evidence: i18n 0 err, tooling 49/49, build PASS

### FE-2 static legal
- Files: `public/static-legal/**`, deletions `public/terms|privacy*`
- Message: `feat(legal): static-legal mirrors and SPA legal routes integration`
- Evidence: E2E legal routes PASS (SPA); hosting rewrite UNKNOWN

### FE-3 E2E
- Files: `e2e/**`, `scripts/i18n*`, `scripts/api-language-smoke.js`
- Message: `test(e2e): registration, onboarding, and authenticated EN/SK flows`
- Evidence: 3× 23/23 PASS

### BE-1 Locale + locks + mail
- Branch: navrhovaná `release/1.0.0`
- Message: `feat(i18n): add preferred_locale and EN/SK API localization`
- Evidence: PHPUnit 144/144

### BE-2 Tests
- Message: `test: locale, mail queue, concurrent tokens, auth rate limit, fixture fixes`

### BE-3 Optional e2e tooling
- Message: `chore(e2e): isolated DB prepare command and seeder`

---

## i18n-meta/packages/**

- **335 súborov na disku — zachované**
- **NEZARADIŤ** do Git release
- Účel mimo git: human review provenance / AI export archeológia
- Release-readiness reprodukcia: inventory + check + tooling + slim meta reports stačia

---

## STOP

Žiadne `git add` / `git rm --cached` / `git commit` neboli vykonané.  
Čaká sa na **novú, samostatnú, výslovnú** odpoveď vlastníka produktu po kontrole tohto reportu.
