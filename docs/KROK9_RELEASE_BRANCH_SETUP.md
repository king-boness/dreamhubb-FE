# KROK 9 Release Branch Setup Guide

**Cieľ:** Vytvoriť clean release vetvy `release/1.0.0` pre FE aj BE z `fix/location-onboarding`

**Poznámka:** Tento dokument obsahuje presné kroky, ktoré je potrebné vykonať manuálne kvôli git lock súborom.

---

## ⚠️ Pred Spustením

**Odstráň git lock súbory (ak existujú):**

```powershell
# FE
cd d:\dreamhubb\dreamhubb-FE
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/refs/heads/release/1.0.0.lock -Force -ErrorAction SilentlyContinue

# BE
cd d:\dreamhubb\dreamhubb-BE
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
```

**Alebo manuálne:**
- Zatvor všetky git procesy (IDE, git GUI, atď.)
- Odstráň `.git/index.lock` súbory manuálne

---

## 📋 Presné Kroky

### Frontend (FE)

#### 1. Checkout a Pull

```powershell
cd d:\dreamhubb\dreamhubb-FE
git checkout fix/location-onboarding
git pull origin fix/location-onboarding
```

#### 2. Vytvor Release Vetvu

```powershell
# Skontroluj, či release/1.0.0 už existuje
git branch -a | findstr "release/1.0.0"

# Ak existuje, použij alternatívu
# git checkout -b release/1.0.0-rc1
# Alebo:
git checkout -b release/1.0.0

# Over vetvu
git branch --show-current
# Malo by byť: release/1.0.0
```

#### 3. Uprav .gitignore (Ak ešte nie je upravený)

`.gitignore` už bol upravený, ale over:

```powershell
# Skontroluj, či obsahuje:
cat .gitignore | findstr "test-results"
cat .gitignore | findstr "playwright-report"
cat .gitignore | findstr "\.env"
```

Ak chýbajú, pridaj:
```
# Test results and reports
test-results/
playwright-report/

# Environment files
.env
.env.*

# Build artifacts
dist/
```

#### 4. Audit Untracked/Staged Súborov

```powershell
# Zobraz všetky zmeny
git status

# Identifikuj generované súbory (NEPRIDÁVAŤ):
# - test-results/ (generované Playwright)
# - playwright-report/ (generované Playwright)
# - dist/ (build artifact)
# - .env, .env.* (sensitive)

# Identifikuj KROK8/KROK9 súbory (PRIDAŤ):
# - docs/KROK8_* (všetky)
# - docs/KROK9_* (všetky)
# - docs/APP_STORE_CONNECT_PACK.md
# - docs/PRIVACY_POLICY_TEMPLATE.md
# - scripts/ (všetky)
# - e2e/ (všetky)
# - .github/ (templates, workflows)
# - playwright.config.ts
# - vitest.config.ts
# - src/boot/resume-check.ts
# - src/components/common/OfflineBanner.vue
# - src/components/common/RetryPanel.vue
# - src/utils/httpError.ts
# - src/utils/notify.ts
# - src/utils/i18nGlobal.ts
# - src/utils/httpError.test.ts
# - package.json (upravený s novými scripts)
```

#### 5. Priprav Staging

```powershell
# Pridaj všetko
git add -A

# Odstráň generované súbory zo stagingu (ak sa tam dostali)
git restore --staged test-results/
git restore --staged playwright-report/
git restore --staged dist/
git restore --staged .env
git restore --staged .env.*

# Skontroluj, čo ide do commitu
git diff --staged --stat
```

**Očakávané súbory v stagingu:**
- ✅ docs/KROK8_* (všetky)
- ✅ docs/KROK9_* (všetky)
- ✅ scripts/ (všetky)
- ✅ e2e/ (všetky)
- ✅ .github/ (templates, workflows)
- ✅ .gitignore (upravený)
- ✅ package.json (upravený)
- ✅ Všetky KROK8/KROK9 súbory
- ❌ test-results/ (NIE)
- ❌ playwright-report/ (NIE)
- ❌ dist/ (NIE)
- ❌ .env (NIE)

#### 6. Commit

```powershell
git commit -m "Release 1.0.0: KROK8 hardening + KROK9 App Store pack"
```

#### 7. Push

```powershell
git push -u origin release/1.0.0
```

#### 8. Overenie

```powershell
git status
# Malo by byť: "nothing to commit, working tree clean"
```

---

### Backend (BE)

#### 1. Checkout a Pull

```powershell
cd d:\dreamhubb\dreamhubb-BE
git checkout fix/location-onboarding
git pull origin fix/location-onboarding
```

#### 2. Vytvor Release Vetvu

```powershell
# Skontroluj, či release/1.0.0 už existuje
git branch -a | findstr "release/1.0.0"

# Ak existuje, použij alternatívu
# git checkout -b release/1.0.0-rc1
# Alebo:
git checkout -b release/1.0.0

# Over vetvu
git branch --show-current
# Malo by byť: release/1.0.0
```

#### 3. Uprav .gitignore (Ak ešte nie je upravený)

`.gitignore` už bol upravený, ale over:

```powershell
# Skontroluj, či obsahuje:
cat .gitignore | findstr "storage/db_backups"
cat .gitignore | findstr "storage/logs"
cat .gitignore | findstr "\.env"
```

Ak chýbajú, pridaj:
```
# Database backups
storage/db_backups/

# Logs
storage/logs/
```

#### 4. Audit Untracked/Staged Súborov

```powershell
# Zobraz všetky zmeny
git status

# Identifikuj generované súbory (NEPRIDÁVAŤ):
# - storage/db_backups/ (generované backupy)
# - storage/logs/ (generované logy)
# - .env, .env.* (sensitive)

# Identifikuj KROK8/KROK9 súbory (PRIDAŤ):
# - docs/KROK8-BE-PROD-SAFETY-TEST.md
# - app/Http/Controllers/DevToolsController.php
# - app/Http/Controllers/PasswordResetController.php
# - app/Http/Middleware/SanitizeApiErrors.php
# - tests/Feature/DevEndpointsProductionSafetyTest.php
# - tests/Feature/PasswordResetFlowTest.php
# - scripts/ (backup, restore)
# - Všetky BE KROK8 súbory
```

#### 5. Priprav Staging

```powershell
# Pridaj všetko
git add -A

# Odstráň generované súbory zo stagingu (ak sa tam dostali)
git restore --staged storage/db_backups/
git restore --staged storage/logs/
git restore --staged .env
git restore --staged .env.*

# Skontroluj, čo ide do commitu
git diff --staged --stat
```

**Očakávané súbory v stagingu:**
- ✅ docs/KROK8-BE-PROD-SAFETY-TEST.md
- ✅ app/Http/Controllers/DevToolsController.php
- ✅ app/Http/Controllers/PasswordResetController.php
- ✅ app/Http/Middleware/SanitizeApiErrors.php
- ✅ tests/Feature/DevEndpointsProductionSafetyTest.php
- ✅ tests/Feature/PasswordResetFlowTest.php
- ✅ scripts/ (backup, restore)
- ✅ .gitignore (upravený)
- ✅ Všetky BE KROK8 súbory
- ❌ storage/db_backups/ (NIE)
- ❌ storage/logs/ (NIE)
- ❌ .env (NIE)

#### 6. Commit

```powershell
git commit -m "Release 1.0.0: KROK8 hardening + KROK9 release readiness"
```

#### 7. Push

```powershell
git push -u origin release/1.0.0
```

#### 8. Overenie

```powershell
git status
# Malo by byť: "nothing to commit, working tree clean"
```

---

## 📊 Súhrn Zmenených Súborov

### Frontend (FE)

**KROK8/KROK9 súbory (PRIDAŤ):**
- docs/KROK8_* (všetky)
- docs/KROK9_* (všetky)
- docs/APP_STORE_CONNECT_PACK.md
- docs/PRIVACY_POLICY_TEMPLATE.md
- scripts/ (ios-release-sanity.js, ios-sync-version.js, release-gate.js, atď.)
- e2e/ (smoke.spec.ts, README.md)
- .github/ (templates, workflows)
- playwright.config.ts
- vitest.config.ts
- src/boot/resume-check.ts
- src/components/common/OfflineBanner.vue
- src/components/common/RetryPanel.vue
- src/utils/httpError.ts
- src/utils/notify.ts
- src/utils/i18nGlobal.ts
- src/utils/httpError.test.ts
- package.json (upravený)
- .gitignore (upravený)

**Generované súbory (NEPRIDÁVAŤ):**
- test-results/
- playwright-report/
- dist/
- .env, .env.*

### Backend (BE)

**KROK8/KROK9 súbory (PRIDAŤ):**
- docs/KROK8-BE-PROD-SAFETY-TEST.md
- app/Http/Controllers/DevToolsController.php
- app/Http/Controllers/PasswordResetController.php
- app/Http/Middleware/SanitizeApiErrors.php
- tests/Feature/DevEndpointsProductionSafetyTest.php
- tests/Feature/PasswordResetFlowTest.php
- scripts/ (backup, restore)
- .gitignore (upravený)

**Generované súbory (NEPRIDÁVAŤ):**
- storage/db_backups/
- storage/logs/
- .env, .env.*

---

## ⚠️ Poznámky

1. **Git Lock Súbory:** Ak sa vyskytnú problémy s git lock súbormi, odstráň ich manuálne alebo zatvor všetky git procesy.

2. **Existujúca Release Vetva:** Ak `release/1.0.0` už existuje, použij alternatívu:
   - `release/1.0.0-rc1`
   - `release/1.0.0-rc2`
   - atď.

3. **Sensitive Data:** Uisti sa, že `.env` súbory NIE sú v stagingu. Skontroluj:
   ```powershell
   git diff --staged | findstr "\.env"
   ```

4. **Generované Súbory:** Uisti sa, že `test-results/`, `playwright-report/`, `dist/`, `storage/db_backups/` NIE sú v stagingu.

---

## ✅ Final Checklist

### Frontend
- [ ] Git lock súbory odstránené
- [ ] Checkout fix/location-onboarding
- [ ] Pull latest
- [ ] Release vetva vytvorená
- [ ] .gitignore upravený
- [ ] Audit untracked/staged súborov
- [ ] Staging pripravený (bez generovaných súborov)
- [ ] Commit vytvorený
- [ ] Push dokončený
- [ ] git status je clean

### Backend
- [ ] Git lock súbory odstránené
- [ ] Checkout fix/location-onboarding
- [ ] Pull latest
- [ ] Release vetva vytvorená
- [ ] .gitignore upravený
- [ ] Audit untracked/staged súborov
- [ ] Staging pripravený (bez generovaných súborov)
- [ ] Commit vytvorený
- [ ] Push dokončený
- [ ] git status je clean

---

**Poznámka:** Kvôli git lock súborom je potrebné vykonať niektoré kroky manuálne. Tento dokument obsahuje presné príkazy pre každý krok.
