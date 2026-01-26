# KROK 9 Release Branch Execution Report

**Dátum:** 2026-01-25  
**Cieľ:** Vytvoriť clean release vetvy `release/1.0.0` pre FE aj BE  
**Status:** ⚠️ **Čiastočne automatizované - vyžaduje manuálne kroky**

---

## ⚠️ Dôležité Poznámky

**Git Lock Súbory:**
- FE má `.git/index.lock` a `.git/refs/heads/release/1.0.0.lock` - blokujú git operácie
- BE má `.git/index.lock` - blokuje git operácie
- **Riešenie:** Odstráň lock súbory manuálne alebo zatvor všetky git procesy (IDE, git GUI, atď.)

---

## 📋 Vykonané Zmeny

### 1. .gitignore Úpravy

#### Frontend (FE)
**Súbor:** `dreamhubb-FE/.gitignore`

**Pridané:**
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

#### Backend (BE)
**Súbor:** `dreamhubb-BE/.gitignore`

**Pridané:**
```
# Database backups
storage/db_backups/

# Logs
storage/logs/
```

---

## 📝 Presné Príkazy (Manuálne Vykonanie)

### Frontend (FE)

#### 1. Odstráň Lock Súbory

```powershell
cd d:\dreamhubb\dreamhubb-FE
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/refs/heads/release/1.0.0.lock -Force -ErrorAction SilentlyContinue
```

#### 2. Checkout a Pull

```powershell
git checkout fix/location-onboarding
git pull origin fix/location-onboarding
```

#### 3. Vytvor Release Vetvu

```powershell
# Skontroluj, či už existuje
git branch -a | findstr "release/1.0.0"

# Vytvor vetvu (alebo použij alternatívu ak existuje)
git checkout -b release/1.0.0
# Alebo: git checkout -b release/1.0.0-rc1

# Over vetvu
git branch --show-current
```

#### 4. Priprav Staging

```powershell
# Pridaj všetko
git add -A

# Odstráň generované súbory zo stagingu
git restore --staged test-results/
git restore --staged playwright-report/
git restore --staged dist/
git restore --staged .env
git restore --staged .env.*

# Skontroluj staging
git diff --staged --stat
```

#### 5. Commit

```powershell
git commit -m "Release 1.0.0: KROK8 hardening + KROK9 App Store pack"
```

#### 6. Push

```powershell
git push -u origin release/1.0.0
# Alebo: git push -u origin release/1.0.0-rc1
```

#### 7. Overenie

```powershell
git status
# Malo by byť: "nothing to commit, working tree clean"
```

---

### Backend (BE)

#### 1. Odstráň Lock Súbory

```powershell
cd d:\dreamhubb\dreamhubb-BE
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
```

#### 2. Checkout a Pull

```powershell
git checkout fix/location-onboarding
git pull origin fix/location-onboarding
```

#### 3. Vytvor Release Vetvu

```powershell
# Skontroluj, či už existuje
git branch -a | findstr "release/1.0.0"

# Vytvor vetvu (alebo použij alternatívu ak existuje)
git checkout -b release/1.0.0
# Alebo: git checkout -b release/1.0.0-rc1

# Over vetvu
git branch --show-current
```

#### 4. Priprav Staging

```powershell
# Pridaj všetko
git add -A

# Odstráň generované súbory zo stagingu
git restore --staged storage/db_backups/
git restore --staged storage/logs/
git restore --staged .env
git restore --staged .env.*

# Skontroluj staging
git diff --staged --stat
```

#### 5. Commit

```powershell
git commit -m "Release 1.0.0: KROK8 hardening + KROK9 release readiness"
```

#### 6. Push

```powershell
git push -u origin release/1.0.0
# Alebo: git push -u origin release/1.0.0-rc1
```

#### 7. Overenie

```powershell
git status
# Malo by byť: "nothing to commit, working tree clean"
```

---

## 🔧 Alternatíva: Použitie PowerShell Scriptov

**Ak sa podarí odstrániť lock súbory, môžeš použiť automatizované scripty:**

### Frontend

```powershell
cd d:\dreamhubb\dreamhubb-FE
.\scripts\prepare-release-branch.ps1
```

### Backend

```powershell
cd d:\dreamhubb\dreamhubb-BE
.\scripts\prepare-release-branch.ps1
```

**Poznámka:** Scripty automatizujú kroky 1-6, ale stále vyžadujú manuálny commit a push (pre bezpečnosť).

---

## 📊 Očakávané Súbory v Stagingu

### Frontend (FE)

**KROK8/KROK9 súbory (MALI BY BYŤ):**
- ✅ docs/KROK8_* (všetky)
- ✅ docs/KROK9_* (všetky)
- ✅ docs/APP_STORE_CONNECT_PACK.md
- ✅ docs/PRIVACY_POLICY_TEMPLATE.md
- ✅ scripts/ (všetky)
- ✅ e2e/ (všetky)
- ✅ .github/ (templates, workflows)
- ✅ playwright.config.ts
- ✅ vitest.config.ts
- ✅ src/boot/resume-check.ts
- ✅ src/components/common/OfflineBanner.vue
- ✅ src/components/common/RetryPanel.vue
- ✅ src/utils/httpError.ts
- ✅ src/utils/notify.ts
- ✅ src/utils/i18nGlobal.ts
- ✅ src/utils/httpError.test.ts
- ✅ package.json (upravený)
- ✅ .gitignore (upravený)

**Generované súbory (NESMIE BYŤ):**
- ❌ test-results/
- ❌ playwright-report/
- ❌ dist/
- ❌ .env, .env.*

### Backend (BE)

**KROK8/KROK9 súbory (MALI BY BYŤ):**
- ✅ docs/KROK8-BE-PROD-SAFETY-TEST.md
- ✅ app/Http/Controllers/DevToolsController.php
- ✅ app/Http/Controllers/PasswordResetController.php
- ✅ app/Http/Middleware/SanitizeApiErrors.php
- ✅ tests/Feature/DevEndpointsProductionSafetyTest.php
- ✅ tests/Feature/PasswordResetFlowTest.php
- ✅ scripts/ (backup, restore)
- ✅ .gitignore (upravený)

**Generované súbory (NESMIE BYŤ):**
- ❌ storage/db_backups/
- ❌ storage/logs/
- ❌ .env, .env.*

---

## ⚠️ Podozrivé Súbory (Over Manuálne)

### Frontend
- **test-results/** - NESMIE byť v stagingu (generované Playwright)
- **playwright-report/** - NESMIE byť v stagingu (generované Playwright)
- **dist/** - NESMIE byť v stagingu (build artifact)
- **.env, .env.*** - NESMIE byť v stagingu (sensitive data)

### Backend
- **storage/db_backups/** - NESMIE byť v stagingu (generované backupy)
- **storage/logs/** - NESMIE byť v stagingu (generované logy)
- **.env, .env.*** - NESMIE byť v stagingu (sensitive data)

**Overenie:**
```powershell
# FE
git diff --staged --name-only | findstr "test-results playwright-report dist .env"

# BE
git diff --staged --name-only | findstr "storage/db_backups storage/logs .env"
```

**Ak sa zobrazia nejaké súbory, odstráň ich:**
```powershell
# FE
git restore --staged test-results/
git restore --staged playwright-report/
git restore --staged dist/
git restore --staged .env
git restore --staged .env.*

# BE
git restore --staged storage/db_backups/
git restore --staged storage/logs/
git restore --staged .env
git restore --staged .env.*
```

---

## ✅ Final Checklist

### Frontend
- [ ] Git lock súbory odstránené
- [ ] Checkout fix/location-onboarding
- [ ] Pull latest
- [ ] Release vetva vytvorená
- [ ] .gitignore upravený (✅ hotové)
- [ ] Staging pripravený (bez generovaných súborov)
- [ ] Commit vytvorený
- [ ] Push dokončený
- [ ] git status je clean

### Backend
- [ ] Git lock súbory odstránené
- [ ] Checkout fix/location-onboarding
- [ ] Pull latest
- [ ] Release vetva vytvorená
- [ ] .gitignore upravený (✅ hotové)
- [ ] Staging pripravený (bez generovaných súborov)
- [ ] Commit vytvorený
- [ ] Push dokončený
- [ ] git status je clean

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK9_RELEASE_BRANCH_SETUP.md` - Detailný setup guide
- `scripts/prepare-release-branch.ps1` (FE) - Automatizovaný script
- `scripts/prepare-release-branch.ps1` (BE) - Automatizovaný script

---

**Poznámka:** Kvôli git lock súborom je potrebné vykonať niektoré kroky manuálne. Po odstránení lock súborov môžeš použiť automatizované scripty alebo postupovať podľa manuálnych príkazov vyššie.
