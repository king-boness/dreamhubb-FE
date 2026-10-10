# 4F.4B – Secure Release Freeze — záverečný report

**Dátum:** 2026-10-10  
**Git mutácie:** NEVYKONANÉ  
**Čaká sa na:** `APPROVE LOCAL RELEASE COMMITS`

Artefakty: `i18n-meta/secure-release-freeze-4f4b.md`, `i18n-meta/secure-release-allowlist-4f4b.json`

---

## A) GIT BASELINE

| | dreamhubb-FE | dreamhubb-BE |
|--|--------------|--------------|
| Branch | `release/1.0.0` | `main` |
| HEAD | `1a67b3d870e7a2f405fa6c7a8576d8486f2c246c` | `448295132c000c88324bf77079d8a6287e149130` |
| Staged | 0 | 0 |
| Dirty | 336 | 45 |
| Package manager | npm + `package-lock.json` (žiadny `packageManager` field, žiadny pnpm) | Composer + `composer.lock` |

---

## B) .ENV SECURITY

| Otázka | FE `.env` | BE `.env` |
|--------|-----------|-----------|
| Tracked? | **ÁNO** (blob `f7b7b84f…`) | NIE |
| V HEAD? | **ÁNO** | NIE |
| V histórii? | **ÁNO** — 2 commity (`28096bc`, `c1d0ed9`) | NIE |
| assume-unchanged? | **ÁNO** (`H .env`) | N/A |
| Lokálny súbor | zachovaný | zachovaný (gitignored) |

**Kľúče (iba názvy):**  
HEAD: `VITE_API_BASE`  
WT: `VITE_API_BASE`, `VITE_API_BASE_NATIVE_DEV`, `VITE_API_BASE_FALLBACK`

**Kategórie:** všetky sú PUBLIC CLIENT / BUILD-TIME (Vite). Žiadne JWT/DB/SMTP/Stripe v FE `.env`.

**Navrhovaná remediácia (NEVYKONANÁ):**
```bash
git rm --cached -- .env   # lokálny súbor zostáva
# potom commit hygiene; históriu NEPREPISOVAŤ
```

---

## C) SECRETS ASSESSMENT

| Riziko | Verdikt |
|--------|---------|
| Klasické private secrets v tracked FE `.env` | NÍZKE (iba VITE_*) |
| Zverejnenie API base URL | STREDNÉ (by-design public, ale zlý tracking) |
| Rotácia credentials z FE `.env` | NEPOVINNÁ na základe dôkazov |
| BE secrets v gite | NENÁJDENÉ (`.env` ignore) |
| Históra rewrite | NENAVRHOVANÁ |

---

## D) RELEASE FILE ALLOWLIST

Presný zoznam: `i18n-meta/secure-release-allowlist-4f4b.json`

**BE:** migrácie (2) + locale/auth/mail/token kód + lang en/sk + PHPUnit testy (+ voliteľné E2E tooling).  
**FE:** `src/` (katalógy + runtime) + `public/static-legal/` + E2E/scripts + slim `i18n-meta` reporty.

---

## E) EXCLUDED FILES

- FE/BE `.env*`
- `i18n-meta/packages/**` (~335 AI export/import súborov)
- `dist/`, `test-results/`, `playwright-report/`, `.tmp-*`
- DB dumpy, logy, lokálne tokeny

---

## F) BUILD / TEST RESULTS

| Kontrola | Výsledok |
|----------|----------|
| i18n inventory | 59 UI / 58 packs / 859 keys |
| i18n check | **0 ERRORS** / 43 WARNINGS |
| i18n tooling | **49/49 PASS** |
| Plural smoke | **PASS** |
| FE production build | **PASS** |
| PHP syntax (kľúčové) | OK |
| Full PHPUnit | **144/144 PASS** |
| E2E (authenticated + pure-browser) | 22/23 → retry failujúceho **PASS** (cache dir race; hardening v beforeEach) |
| Legal routes E2E | **PASS** |

---

## G) FE/BE DEPENDENCIES

| Položka | Stav |
|---------|------|
| Node | v22.23.2; engines `>=20` / npm `>=10` |
| Quasar build | PASS |
| PHP | 8.3.30 (req `^8.1`) |
| PostgreSQL | default `pgsql` |
| Migrácia `preferred_locale` | pripravená (nullable additive) |
| Queue | lokálne `jobs` migrácia; staging sink UNKNOWN |
| Deploy order | staging DB → BE (+ worker) → FE |

---

## H) STAGING ARCHITECTURE

`render.yaml` obsahuje **iba** `dreamhubb-be-php` (docker, starter, autoDeploy).  
**Nie je dôkaz** izolovaného stagingu.

**Blueprint (návrh, NEVYTVORENÉ):**
- samostatný FE host
- nová BE služba (nie mutácia produkcie naslepo)
- oddelená PostgreSQL
- izolovaný queue
- testovací mail / Stripe test keys
- vlastné secrets, health `/api/health`, rollback

---

## I) STAGING ENV REQUIREMENTS

| Premenná | Trieda |
|----------|--------|
| `APP_ENV=staging`, `APP_DEBUG=false`, `APP_URL`, `FRONTEND_URL` | REQUIRED |
| `APP_KEY`, `JWT_SECRET`, `DB_*` | SECRET – SET MANUALLY |
| `QUEUE_CONNECTION`, non-prod `MAIL_*` | REQUIRED |
| `STRIPE_*` test | SECRET – test only |
| FE `VITE_API_BASE` → staging BE | BUILD-TIME |
| `RATE_LIMITER_*=disabled` | **ZAKÁZANÉ** na staging/prod |

---

## J) COMMIT PLAN

### BE
1. `feat(i18n): add preferred_locale and EN/SK API localization`
2. `fix(tokens): serialize donate and post top-up with lockForUpdate` (ak nie zlúčené s 1)
3. `test: locale, mail queue, concurrent tokens, auth rate limit, fixture fixes`
4. (opt) `chore(e2e): isolated DB prepare command and seeder`

### FE
0. `chore(security): stop tracking FE .env` ← `git rm --cached -- .env`
1. `feat(i18n): locale runtime and complete message catalogs`
2. `feat(legal): static-legal mirrors and SPA legal routes integration`
3. `test(e2e): registration, onboarding, and authenticated EN/SK flows`
4. (opt) `docs(i18n): release readiness and freeze reports`

**Nikdy:** `git add -A` / `git add .`

---

## K) OWNER APPROVAL STATUS

| Požiadavka | Stav |
|------------|------|
| `APPROVE LOCAL RELEASE COMMITS` | **PENDING** |
| `git rm --cached -- .env` | **PENDING** |
| Push / merge / rebase | ZAKÁZANÉ bez samostatného schválenia |
| Staging / production deploy | ZAKÁZANÉ bez samostatného schválenia |

---

## L) VERSIONED RELEASE STATUS

**NOT READY** — žiadne release commity ešte nevznikli.

---

## M) PRIVATE STAGING READINESS

**NOT READY** — blueprint existuje; izolácia/env/deploy neschválené a nevykonané.

---

## N) PUBLIC RELEASE READINESS

**NOT READY** — legal/product/go-live otvorené; verejné schválenie nie je automatický výsledok privátneho stagingu.

---

## O) OPEN BLOCKERS

| ID | Severity | Description | Evidence | Component | Required action | Owner | Status | Release impact |
|----|----------|-------------|----------|-----------|-----------------|-------|--------|----------------|
| BL-4F4B-ENV-001 | P0 | FE `.env` tracked + assume-unchanged | `git ls-files -v` → `H .env`; 2 history commits | FE | Schváliť `git rm --cached -- .env` | Product/Eng | OPEN | Blokuje čistý freeze |
| BL-4F4B-ARTIFACT-001 | P0 | Chýbajú versioned release commits | staged 0/0; dirty 336/45 | FE+BE | `APPROVE LOCAL RELEASE COMMITS` | Product | OPEN | VERSIONED ARTIFACT |
| BL-4F4B-STAGE-001 | P0 | Žiadny proven izolovaný staging | `render.yaml` = jedna služba `dreamhubb-be-php` | Infra | Schváliť blueprint + provision | Product/DevOps | OPEN | Private staging |
| BL-4F4B-LEGAL-001 | P1 | Právne schválenie otvorené | legal packages 4F.4/4F.4A | Legal | Counsel review | Legal | OPEN | Public release |
| BL-4F4B-PROD-001 | P1 | Product go-live otvorené | product-decision-pack | Product | Explicit approval | Product | OPEN | Public release |
| BL-4F4B-PROD-MIG-001 | P1 | Prod `preferred_locale` stav UNKNOWN | migrácia len lokálne | BE | Verify pred prod | Eng | OPEN | Public release |
| BL-4F4B-LEGAL-STATIC-001 | P2 | Zmazané `public/terms\|privacy` vs SPA + static-legal | git `D public/...`; E2E SPA PASS | FE hosting | Potvrdiť rewrite/App Store URL | Eng | OPEN | Hosting 404 risk |
| BL-4F4B-E2E-CACHE-001 | P3 | Lokálny file-cache race po `cache:clear` | 1 fail → retry PASS; beforeEach harden | E2E infra | Zachovať mkdir po clear | Eng | MITIGATED | Lokálna flakiness |

---

## P) NEXT EXECUTION STEPS

1. Vlastník odpovie **`APPROVE LOCAL RELEASE COMMITS`** (a voliteľne schváli `.env` untrack).  
2. Agent: iba allowlist `git add -- <paths>`; overí staged names/diff/secrets; `git rm --cached -- .env` ak schválené; commity podľa plánu.  
3. Zaznamená full SHA + branch; nesúvisiacu lokalitu **nezmaže**.  
4. **STOP** — žiadny push / deploy / merge.  
5. Ďalšia fáza: izolovaný staging podľa blueprintu → 4F.5 (samostatné schválenie).

---

## Gate summary (Etapa F)

| Gate | Status |
|------|--------|
| A LOCAL CODE READINESS | READY WITH CONDITIONS |
| B SECRETS HYGIENE | NOT READY |
| C RELEASE MANIFEST | READY |
| D VERSIONED ARTIFACT | NOT READY |
| E STAGING ENV CONFIG | NOT READY |
| F STAGING ISOLATION | UNKNOWN / NOT CONFIGURED |
| G MIGRATION READINESS | READY WITH CONDITIONS |
| H QUEUE / EMAIL READINESS | READY WITH CONDITIONS |
| I STAGING DEPLOY APPROVAL | NOT READY |
| J PUBLIC LEGAL APPROVAL | NOT READY |
| K PUBLIC PRODUCT APPROVAL | NOT READY |
| L PUBLIC GO-LIVE READINESS | NOT READY |

**PRIVATE STAGING READY:** NOT READY  
**PUBLIC RELEASE READY:** NOT READY  
**OVERALL:** NOT READY
