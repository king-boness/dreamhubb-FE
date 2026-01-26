# KROK 9 Step 1 - Execution Report

**Dátum:** 2026-01-25  
**Cieľ:** Pripraviť release branch, versioning, build sanity, iOS runbook  
**Status:** ✅ **Hotové - pripravené na manuálne kroky**

---

## 📋 Zoznam Zmenených Súborov

### Frontend (FE)

1. **`package.json`** (UPDATED)
   - ✅ Version zmenený z `0.0.1` na `1.0.0`

2. **`scripts/create-release-branch.ps1`** (NEW)
   - PowerShell script pre vytvorenie release branch

3. **`scripts/build-sanity.ps1`** (NEW)
   - PowerShell script pre build sanity check

4. **`docs/KROK9_RELEASE_CHECKLIST.md`** (NEW)
   - Manual release checklist (10-15 bodov)

5. **`docs/KROK9_ROLLBACK_PLAN.md`** (NEW)
   - Rollback plan pre rôzne scenáre

### Backend (BE)

1. **`config/app.php`** (UPDATED)
   - ✅ Pridané `version` a `build` config (už existovalo)

2. **`app/Http/Controllers/HealthController.php`** (UPDATED)
   - ✅ Pridané `version` a `build` do health endpoint response

3. **`scripts/create-release-branch.ps1`** (NEW)
   - PowerShell script pre vytvorenie release branch

4. **`scripts/build-sanity.ps1`** (NEW)
   - PowerShell script pre build sanity check

---

## 📝 Presné Príkazy (PowerShell)

### A) RELEASE BRANCH

#### Frontend (FE)

```powershell
# 1. Over vetvu a status
cd d:\dreamhubb\dreamhubb-FE
git branch --show-current
# Očakávaný výstup: fix/location-onboarding

git status --short
# Očakávaný výstup: (prázdne alebo len zmeny, ktoré chceš commitnúť)

# 2. Vytvor release branch (použi script alebo manuálne)
.\scripts\create-release-branch.ps1
# Alebo manuálne:
git checkout -b release/1.0.0
git push -u origin release/1.0.0

# 3. Over vetvu
git branch --show-current
# Očakávaný výstup: release/1.0.0
```

#### Backend (BE)

```powershell
# 1. Over vetvu a status
cd d:\dreamhubb\dreamhubb-BE
git branch --show-current
# Očakávaný výstup: fix/location-onboarding

git status --short
# Očakávaný výstup: (prázdne alebo len zmeny, ktoré chceš commitnúť)

# 2. Vytvor release branch (použi script alebo manuálne)
.\scripts\create-release-branch.ps1
# Alebo manuálne:
git checkout -b release/1.0.0
git push -u origin release/1.0.0

# 3. Over vetvu
git branch --show-current
# Očakávaný výstup: release/1.0.0
```

---

### B) VERSIONING

#### Frontend (FE)

```powershell
cd d:\dreamhubb\dreamhubb-FE

# 1. Over version v package.json
cat package.json | Select-String '"version"'
# Očakávaný výstup: "version": "1.0.0"

# 2. Synchronizuj version do iOS projektu (na Macu)
npm run ios:sync-version
# Alebo manuálne v Xcode (na Macu)
```

#### Backend (BE)

```powershell
cd d:\dreamhubb\dreamhubb-BE

# 1. Over version v config/app.php
cat config/app.php | Select-String "'version'"
# Očakávaný výstup: 'version' => env('APP_VERSION', '1.0.0'),

# 2. Over health endpoint (ak BE beží)
curl http://localhost:8000/api/health
# Očakávaný výstup: {"ok":true,"service":"backend","version":"1.0.0","build":"1","ts":"..."}
```

---

### C) BUILD SANITY

#### Frontend (FE)

```powershell
cd d:\dreamhubb\dreamhubb-FE

# Spusti build sanity check
.\scripts\build-sanity.ps1

# Alebo manuálne:
npm ci
npm run lint
npm run build

# Očakávaný výstup:
# ✅ npm ci completed
# ✅ Lint passed (alebo warnings)
# ✅ Build completed
```

#### Backend (BE)

```powershell
cd d:\dreamhubb\dreamhubb-BE

# Spusti build sanity check
.\scripts\build-sanity.ps1

# Alebo manuálne:
composer install --no-interaction --prefer-dist --optimize-autoloader
php artisan test
php artisan config:cache
php artisan route:cache

# Očakávaný výstup:
# ✅ composer install completed
# ✅ Tests passed
# ✅ config:cache completed
# ✅ route:cache completed
```

---

## 📝 Presné Príkazy (CMD)

### A) RELEASE BRANCH

#### Frontend (FE)

```cmd
REM 1. Over vetvu a status
cd d:\dreamhubb\dreamhubb-FE
git branch --show-current
REM Očakávaný výstup: fix/location-onboarding

git status --short
REM Očakávaný výstup: (prázdne)

REM 2. Vytvor release branch
git checkout -b release/1.0.0
git push -u origin release/1.0.0

REM 3. Over vetvu
git branch --show-current
REM Očakávaný výstup: release/1.0.0
```

#### Backend (BE)

```cmd
REM 1. Over vetvu a status
cd d:\dreamhubb\dreamhubb-BE
git branch --show-current
REM Očakávaný výstup: fix/location-onboarding

git status --short
REM Očakávaný výstup: (prázdne)

REM 2. Vytvor release branch
git checkout -b release/1.0.0
git push -u origin release/1.0.0

REM 3. Over vetvu
git branch --show-current
REM Očakávaný výstup: release/1.0.0
```

---

## 🔧 Vykonané Príkazy (Automatizované)

### Frontend (FE)

```powershell
# 1. Version update
# package.json: "version": "0.0.1" → "1.0.0" ✅

# 2. Scripts vytvorené
# scripts/create-release-branch.ps1 ✅
# scripts/build-sanity.ps1 ✅

# 3. Dokumentácia vytvorená
# docs/KROK9_RELEASE_CHECKLIST.md ✅
# docs/KROK9_ROLLBACK_PLAN.md ✅
```

### Backend (BE)

```powershell
# 1. Version config
# config/app.php: Pridané 'version' a 'build' ✅ (už existovalo)

# 2. Health endpoint
# app/Http/Controllers/HealthController.php: Pridané version a build ✅

# 3. Scripts vytvorené
# scripts/create-release-branch.ps1 ✅
# scripts/build-sanity.ps1 ✅
```

---

## ✅ Čo je Hotové

### A) RELEASE BRANCH
- ✅ Scripty vytvorené (FE aj BE)
- ✅ Dokumentácia s presnými príkazmi
- ⚠️ **Manuálne:** Spusti scripty alebo príkazy vyššie

### B) VERSIONING
- ✅ FE: package.json version = `1.0.0`
- ✅ FE: ios-sync-version.js script existuje
- ✅ BE: config/app.php má version a build
- ✅ BE: Health endpoint vracia version a build
- ⚠️ **Manuálne:** Spusti `npm run ios:sync-version` na Macu

### C) BUILD SANITY
- ✅ Scripty vytvorené (FE aj BE)
- ⚠️ **Manuálne:** Spusti scripty alebo príkazy vyššie

### D) RELEASE DOCS
- ✅ Release Checklist (10-15 bodov)
- ✅ Rollback Plan
- ✅ iOS Runbook (už existoval)
- ✅ App Store Connect Pack (už existoval)
- ✅ Screenshot Shotlist (už existoval)
- ✅ Privacy Matrix (už existoval)

---

## ⚠️ Čo Zostáva Manuálne

### 1. Vytvoriť Release Branch

**PowerShell:**
```powershell
# FE
cd d:\dreamhubb\dreamhubb-FE
.\scripts\create-release-branch.ps1

# BE
cd d:\dreamhubb\dreamhubb-BE
.\scripts\create-release-branch.ps1
```

**CMD:**
```cmd
REM FE
cd d:\dreamhubb\dreamhubb-FE
git checkout -b release/1.0.0
git push -u origin release/1.0.0

REM BE
cd d:\dreamhubb\dreamhubb-BE
git checkout -b release/1.0.0
git push -u origin release/1.0.0
```

### 2. Commit Zmeny

**PowerShell:**
```powershell
# FE
cd d:\dreamhubb\dreamhubb-FE
git add .
git commit -m "release: prepare 1.0.0 (step 1)"
git push origin release/1.0.0

# BE
cd d:\dreamhubb\dreamhubb-BE
git add .
git commit -m "release: prepare 1.0.0 (step 1)"
git push origin release/1.0.0
```

### 3. Build Sanity Check

**PowerShell:**
```powershell
# FE
cd d:\dreamhubb\dreamhubb-FE
.\scripts\build-sanity.ps1

# BE
cd d:\dreamhubb\dreamhubb-BE
.\scripts\build-sanity.ps1
```

### 4. iOS Version Sync (na Macu)

```bash
cd dreamhubb-FE
npm run ios:sync-version
```

### 5. Xcode Archive/Upload (na Macu)

Postupuj podľa `docs/KROK9_RELEASE_CHECKLIST.md`

---

## 📊 Očakávané Výstupy

### Release Branch Script

**Očakávaný výstup:**
```
============================================================
  CREATE RELEASE BRANCH - FRONTEND
============================================================

Step 1: Verifying current branch...
✅ On branch: fix/location-onboarding

Step 2: Verifying clean status...
✅ Working directory is clean

Step 3: Pulling latest changes...
✅ Pulled latest changes

Step 4: Checking for existing release branch...
   Creating new branch: release/1.0.0
✅ Created branch: release/1.0.0

Step 5: Verifying branch...
✅ On branch: release/1.0.0

Step 6: Pushing to origin and setting upstream...
✅ Pushed to origin and set upstream

============================================================
  RELEASE BRANCH READY
============================================================

Branch: release/1.0.0
Remote: origin/release/1.0.0
```

### Build Sanity Script

**Očakávaný výstup (FE):**
```
============================================================
  BUILD SANITY CHECK - FRONTEND
============================================================

Step 1: Running npm ci...
✅ npm ci completed

Step 2: Running npm run lint...
✅ Lint passed

Step 3: Running npm run build...
✅ Build completed

============================================================
  BUILD SANITY CHECK PASSED
============================================================
```

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK9_RELEASE_CHECKLIST.md` - Manual release checklist
- `docs/KROK9_ROLLBACK_PLAN.md` - Rollback plan
- `docs/KROK9_IOS_RUNBOOK.md` - iOS build runbook (už existoval)
- `docs/APP_STORE_CONNECT_PACK.md` - App Store Connect metadata (už existoval)
- `docs/KROK9_SCREENSHOT_SHOTLIST.md` - Screenshot shotlist (už existoval)
- `docs/KROK9_PRIVACY_MATRIX.md` - Privacy matrix (už existoval)

---

## 🎯 Záver

**Status:** ✅ **Hotové - pripravené na manuálne kroky**

Všetky prípravné práce sú hotové:
- ✅ Release branch scripty
- ✅ Versioning nastavený
- ✅ Build sanity scripty
- ✅ Release dokumentácia

**Ďalšie kroky:**
1. Spusti release branch scripty (FE aj BE)
2. Commit zmeny do release/1.0.0
3. Spusti build sanity checky
4. Na Macu: iOS version sync, Xcode Archive/Upload

**KROK 9 Step 1 je pripravený!** 🚀
