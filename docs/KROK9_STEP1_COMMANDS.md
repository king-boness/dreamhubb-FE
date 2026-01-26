# KROK 9 Step 1 - Presné Príkazy

**Cieľ:** Vykonať release branch setup, versioning, build sanity  
**Platform:** Windows (PowerShell/CMD)

---

## 📋 Quick Start (PowerShell)

### Frontend (FE)

```powershell
cd d:\dreamhubb\dreamhubb-FE

# 1. Vytvor release branch
.\scripts\create-release-branch.ps1

# 2. Commit zmeny
git add .
git commit -m "release: prepare 1.0.0 (step 1)"
git push origin release/1.0.0

# 3. Build sanity check
.\scripts\build-sanity.ps1
```

### Backend (BE)

```powershell
cd d:\dreamhubb\dreamhubb-BE

# 1. Vytvor release branch
.\scripts\create-release-branch.ps1

# 2. Commit zmeny
git add .
git commit -m "release: prepare 1.0.0 (step 1)"
git push origin release/1.0.0

# 3. Build sanity check
.\scripts\build-sanity.ps1
```

---

## 📋 Quick Start (CMD)

### Frontend (FE)

```cmd
cd d:\dreamhubb\dreamhubb-FE

REM 1. Vytvor release branch
git checkout -b release/1.0.0
git push -u origin release/1.0.0

REM 2. Commit zmeny
git add .
git commit -m "release: prepare 1.0.0 (step 1)"
git push origin release/1.0.0

REM 3. Build sanity check
npm ci
npm run lint
npm run build
```

### Backend (BE)

```cmd
cd d:\dreamhubb\dreamhubb-BE

REM 1. Vytvor release branch
git checkout -b release/1.0.0
git push -u origin release/1.0.0

REM 2. Commit zmeny
git add .
git commit -m "release: prepare 1.0.0 (step 1)"
git push origin release/1.0.0

REM 3. Build sanity check
composer install --no-interaction --prefer-dist --optimize-autoloader
php artisan test
php artisan config:cache
php artisan route:cache
```

---

## ✅ Očakávané Výstupy

### Release Branch Script

**FE:**
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

**BE:**
```
============================================================
  CREATE RELEASE BRANCH - BACKEND
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

**FE:**
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

**BE:**
```
============================================================
  BUILD SANITY CHECK - BACKEND
============================================================

Step 1: Running composer install...
✅ composer install completed

Step 2: Running php artisan test...
✅ Tests passed

Step 3: Running php artisan config:cache...
✅ config:cache completed

Step 4: Running php artisan route:cache...
✅ route:cache completed

Step 5: Checking for dev endpoints in production...
✅ Dev endpoints safety check passed

============================================================
  BUILD SANITY CHECK PASSED
============================================================
```

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK9_STEP1_EXECUTION_REPORT.md` - Detailný execution report
- `docs/KROK9_RELEASE_CHECKLIST.md` - Manual release checklist
- `docs/KROK9_ROLLBACK_PLAN.md` - Rollback plan

---

**Poznámka:** Po vykonaní týchto príkazov budeš pripravený na manuálne kroky na Macu (Xcode Archive/Upload).
