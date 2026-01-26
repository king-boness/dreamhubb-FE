# KROK 9 Step 1 - Prepare Commands (Copy-Paste Ready)

**Cieľ:** Pripraviť FE aj BE pre spustenie `run-krok9-step1.ps1`  
**Status:** Copy-paste ready príkazy

---

## 📊 Git Status Summary

### Frontend (FE)

**Modified (12 súborov):**
- `.gitattributes` - EOL normalization optimalizácia
- `.gitignore` - Pridané test-results/, playwright-report/, dist/, .env
- `docs/APP_STORE_CONNECT_PACK.md` - Aktualizované
- `docs/KROK9_BONUS_FINAL_REPORT.md` - Aktualizované
- `docs/KROK9_RELEASE_BRANCH_EXECUTION_REPORT.md` - Aktualizované
- `docs/KROK9_RELEASE_BRANCH_FINAL_REPORT.md` - Aktualizované
- `docs/KROK9_RELEASE_BRANCH_SETUP.md` - Aktualizované
- `docs/KROK9_SCREENSHOT_SHOTLIST.md` - Aktualizované
- `docs/KROK9_TESTFLIGHT_CHECKLIST.md` - Aktualizované
- `docs/PRIVACY_POLICY_TEMPLATE.md` - Aktualizované
- `package.json` - Version = 1.0.0
- `scripts/prepare-release-branch.ps1` - Aktualizované

**Untracked (14 súborov):**
- `docs/KROK9_GIT_SETTINGS_WINDOWS.md` - Git settings guide
- `docs/KROK9_RELEASE_CHECKLIST.md` - Release checklist
- `docs/KROK9_ROLLBACK_PLAN.md` - Rollback plan
- `docs/KROK9_STEP1_COMMANDS.md` - Step 1 commands
- `docs/KROK9_STEP1_EXECUTION_REPORT.md` - Execution report
- `docs/KROK9_STEP1_FINAL_REPORT.md` - Final report
- `docs/KROK9_STEP1_RUNNER_GUIDE.md` - Runner guide
- `docs/KROK9_STEP1_RUNNER_SUMMARY.md` - Runner summary
- `docs/KROK9_STEP2_MAC_RUNBOOK.md` - Step 2 Mac runbook
- `scripts/build-sanity.ps1` - Build sanity script
- `scripts/create-release-branch.ps1` - Create release branch script
- `scripts/release-step1.ps1` - Release step 1 script
- `scripts/run-krok9-step1.ps1` - 1-click runner script

### Backend (BE)

**Modified (3 súbory):**
- `app/Http/Controllers/HealthController.php` - Pridané version a build
- `config/app.php` - Version a build config (už existovalo)
- `scripts/prepare-release-branch.ps1` - Aktualizované

**Untracked (4 súbory):**
- `scripts/build-sanity.ps1` - Build sanity script
- `scripts/create-release-branch.ps1` - Create release branch script
- `scripts/release-step1.ps1` - Release step 1 script
- `scripts/run-krok9-step1.ps1` - 1-click runner script

---

## 🔧 Frontend (FE) - Presné Príkazy

### 1. Over Git Lock Súbory (Ak Existujú)

```powershell
cd d:\dreamhubb\dreamhubb-FE

# Zatvor Git GUI, VSCode, alebo iné git procesy (ak bežia)

# Skontroluj, či existujú lock súbory
if (Test-Path .git/index.lock) { Write-Host "⚠️  .git/index.lock exists" }
if (Test-Path .git/HEAD.lock) { Write-Host "⚠️  .git/HEAD.lock exists" }
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "⚠️  $($_.FullName) exists" }

# Ak existujú, odstráň ich:
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/HEAD.lock -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
```

### 2. Over Git Status

```powershell
cd d:\dreamhubb\dreamhubb-FE
git status
```

**Očakávaný výstup:**
- 12 modified súborov
- 14 untracked súborov
- Branch: `fix/location-onboarding`

### 3. Commit Zmeny

```powershell
cd d:\dreamhubb\dreamhubb-FE

# Add všetky zmeny
git add -A

# Over staging
git status --short

# Commit
git commit -m "release: prepare 1.0.0 (step 1) - KROK9 automation, docs, scripts"

# Push
git push origin fix/location-onboarding
```

**Commit Message:**
```
release: prepare 1.0.0 (step 1) - KROK9 automation, docs, scripts

- Add 1-click runner script (run-krok9-step1.ps1)
- Add release automation scripts (release-step1.ps1, build-sanity.ps1, create-release-branch.ps1)
- Update package.json version to 1.0.0
- Optimize .gitattributes for EOL normalization
- Add Step 2 Mac runbook (KROK9_STEP2_MAC_RUNBOOK.md)
- Add Git settings guide for Windows
- Add release checklist and rollback plan
- Add Step 1 execution reports and guides
- Update existing KROK9 documentation
```

### 4. Overenie Clean Tree

```powershell
cd d:\dreamhubb\dreamhubb-FE
git status
```

**Očakávaný výstup:**
```
On branch fix/location-onboarding
Your branch is ahead of 'origin/fix/location-onboarding' by 1 commit.
  (use "git push" to push your commits)

nothing to commit, working tree clean
```

### 5. Spusti Runner Script

```powershell
cd d:\dreamhubb\dreamhubb-FE
.\scripts\run-krok9-step1.ps1
```

**Očakávaný výstup (PASS):**
```
============================================================
  KROK 9 STEP 1 RUNNER - FRONTEND
  Version: 1.0.0
============================================================

Removing git lock files...
✅ Remove Git Lock Files: No lock files found

Verifying clean working tree...
✅ Clean Working Tree

Fetching and pulling latest changes...
✅ Git Fetch
✅ Git Pull

Creating/checking out release branch...
  Creating new branch: release/1.0.0 from fix/location-onboarding
✅ Create Release Branch: Created branch: release/1.0.0
  Pushing to origin and setting upstream...
✅ Push Release Branch: Pushed to origin and set upstream

Running sanity checks...
  Running build-sanity.ps1...
✅ Build Sanity

Committing changes...
✅ Git Commit: Committed: release: prepare 1.0.0 (step 1)
  Pushing to origin release/1.0.0...
✅ Git Push: Pushed to origin release/1.0.0

============================================================
  KROK 9 STEP 1: PASS
============================================================

Steps:
  ✅ Directory Check
  ✅ Remove Git Lock Files: No lock files found
  ✅ Clean Working Tree
  ✅ Git Fetch
  ✅ Git Pull
  ✅ Create Release Branch: Created branch: release/1.0.0
  ✅ Push Release Branch: Pushed to origin and set upstream
  ✅ Build Sanity
  ✅ Git Commit: Committed: release: prepare 1.0.0 (step 1)
  ✅ Git Push: Pushed to origin release/1.0.0

============================================================
  NEXT STEPS - STEP 2 (Mac)
============================================================

On Mac, run these commands:

  cd ~/projects/dreamhubb-FE  # Alebo tvoja cesta
  git checkout release/1.0.0
  git pull origin release/1.0.0
  npm ci
  npm run ios:sync-version
  open ios/App/App.xcodeproj

Then follow: docs/KROK9_STEP2_MAC_RUNBOOK.md
```

### 6. Overenie Remote Branch

```powershell
cd d:\dreamhubb\dreamhubb-FE

# Over, že remote branch existuje
git branch -r | findstr "release/1.0.0"

# Over, že local branch existuje
git branch | findstr "release/1.0.0"

# Over, že si na release branch
git branch --show-current
# Malo by byť: release/1.0.0

# Over status
git status
# Malo by byť: "nothing to commit, working tree clean"
```

**Očakávaný výstup:**
```
  origin/release/1.0.0
  * release/1.0.0
  release/1.0.0
  On branch release/1.0.0
  Your branch is up to date with 'origin/release/1.0.0'.
  nothing to commit, working tree clean
```

---

## 🔧 Backend (BE) - Presné Príkazy

### 1. Over Git Lock Súbory (Ak Existujú)

```powershell
cd d:\dreamhubb\dreamhubb-BE

# Zatvor Git GUI, VSCode, alebo iné git procesy (ak bežia)

# Skontroluj, či existujú lock súbory
if (Test-Path .git/index.lock) { Write-Host "⚠️  .git/index.lock exists" }
if (Test-Path .git/HEAD.lock) { Write-Host "⚠️  .git/HEAD.lock exists" }
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "⚠️  $($_.FullName) exists" }

# Ak existujú, odstráň ich:
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/HEAD.lock -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
```

### 2. Over Git Status

```powershell
cd d:\dreamhubb\dreamhubb-BE
git status
```

**Očakávaný výstup:**
- 3 modified súbory
- 4 untracked súbory
- Branch: `fix/location-onboarding`

### 3. Commit Zmeny

```powershell
cd d:\dreamhubb\dreamhubb-BE

# Add všetky zmeny
git add -A

# Over staging
git status --short

# Commit
git commit -m "release: prepare 1.0.0 (step 1) - KROK9 automation, scripts"

# Push
git push origin fix/location-onboarding
```

**Commit Message:**
```
release: prepare 1.0.0 (step 1) - KROK9 automation, scripts

- Add 1-click runner script (run-krok9-step1.ps1)
- Add release automation scripts (release-step1.ps1, build-sanity.ps1, create-release-branch.ps1)
- Update HealthController to include version and build in health endpoint
- Version and build config already in config/app.php
```

### 4. Overenie Clean Tree

```powershell
cd d:\dreamhubb\dreamhubb-BE
git status
```

**Očakávaný výstup:**
```
On branch fix/location-onboarding
Your branch is ahead of 'origin/fix/location-onboarding' by 1 commit.
  (use "git push" to push your commits)

nothing to commit, working tree clean
```

### 5. Spusti Runner Script

```powershell
cd d:\dreamhubb\dreamhubb-BE
.\scripts\run-krok9-step1.ps1
```

**Očakávaný výstup (PASS):**
```
============================================================
  KROK 9 STEP 1 RUNNER - BACKEND
  Version: 1.0.0
============================================================

Removing git lock files...
✅ Remove Git Lock Files: No lock files found

Verifying clean working tree...
✅ Clean Working Tree

Fetching and pulling latest changes...
✅ Git Fetch
✅ Git Pull

Creating/checking out release branch...
  Creating new branch: release/1.0.0 from fix/location-onboarding
✅ Create Release Branch: Created branch: release/1.0.0
  Pushing to origin and setting upstream...
✅ Push Release Branch: Pushed to origin and set upstream

Running sanity checks...
  Running build-sanity.ps1...
✅ Build Sanity

Committing changes...
✅ Git Commit: Committed: release: prepare 1.0.0 (step 1)
  Pushing to origin release/1.0.0...
✅ Git Push: Pushed to origin release/1.0.0

============================================================
  KROK 9 STEP 1: PASS
============================================================

Steps:
  ✅ Directory Check
  ✅ Remove Git Lock Files: No lock files found
  ✅ Clean Working Tree
  ✅ Git Fetch
  ✅ Git Pull
  ✅ Create Release Branch: Created branch: release/1.0.0
  ✅ Push Release Branch: Pushed to origin and set upstream
  ✅ Build Sanity
  ✅ Git Commit: Committed: release: prepare 1.0.0 (step 1)
  ✅ Git Push: Pushed to origin release/1.0.0

============================================================
  NEXT STEPS
============================================================

Release branch is ready. Next steps:

  1. Frontend: Continue with Step 2 on Mac (Xcode/App Store Connect)
  2. Backend: Deploy to production (if needed)

For FE Step 2, see: docs/KROK9_STEP2_MAC_RUNBOOK.md
```

### 6. Overenie Remote Branch

```powershell
cd d:\dreamhubb\dreamhubb-BE

# Over, že remote branch existuje
git branch -r | findstr "release/1.0.0"

# Over, že local branch existuje
git branch | findstr "release/1.0.0"

# Over, že si na release branch
git branch --show-current
# Malo by byť: release/1.0.0

# Over status
git status
# Malo by byť: "nothing to commit, working tree clean"
```

**Očakávaný výstup:**
```
  origin/release/1.0.0
  * release/1.0.0
  release/1.0.0
  On branch release/1.0.0
  Your branch is up to date with 'origin/release/1.0.0'.
  nothing to commit, working tree clean
```

---

## ⚠️ Ak Hrozí Git Lock

### Postup Pri Git Lock Súboroch

```powershell
# 1. Zatvor všetky git procesy:
#    - Git GUI
#    - VSCode (ak má otvorený git repo)
#    - Iné git procesy

# 2. Skontroluj lock súbory:
cd d:\dreamhubb\dreamhubb-FE  # Alebo BE
if (Test-Path .git/index.lock) { Write-Host "⚠️  .git/index.lock exists" }
if (Test-Path .git/HEAD.lock) { Write-Host "⚠️  .git/HEAD.lock exists" }
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "⚠️  $($_.FullName) exists" }

# 3. Odstráň lock súbory:
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/HEAD.lock -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

# 4. Over, že sú odstránené:
if (-not (Test-Path .git/index.lock)) { Write-Host "✅ .git/index.lock removed" }
if (-not (Test-Path .git/HEAD.lock)) { Write-Host "✅ .git/HEAD.lock removed" }

# 5. Pokračuj s git príkazmi
```

---

## 📋 Quick Reference - FE

```powershell
# 1. Over git lock
cd d:\dreamhubb\dreamhubb-FE
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/HEAD.lock -Force -ErrorAction SilentlyContinue

# 2. Commit zmeny
git add -A
git commit -m "release: prepare 1.0.0 (step 1) - KROK9 automation, docs, scripts"
git push origin fix/location-onboarding

# 3. Over clean tree
git status
# Malo by byť: "nothing to commit, working tree clean"

# 4. Spusti runner
.\scripts\run-krok9-step1.ps1

# 5. Over release branch
git branch -r | findstr "release/1.0.0"
git branch --show-current
# Malo by byť: release/1.0.0
```

---

## 📋 Quick Reference - BE

```powershell
# 1. Over git lock
cd d:\dreamhubb\dreamhubb-BE
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/HEAD.lock -Force -ErrorAction SilentlyContinue

# 2. Commit zmeny
git add -A
git commit -m "release: prepare 1.0.0 (step 1) - KROK9 automation, scripts"
git push origin fix/location-onboarding

# 3. Over clean tree
git status
# Malo by byť: "nothing to commit, working tree clean"

# 4. Spusti runner
.\scripts\run-krok9-step1.ps1

# 5. Over release branch
git branch -r | findstr "release/1.0.0"
git branch --show-current
# Malo by byť: release/1.0.0
```

---

## ✅ Final Checklist

### Frontend
- [ ] Git lock súbory odstránené (ak existovali)
- [ ] Zmeny commitnuté a pushnuté
- [ ] Clean working tree overený
- [ ] Runner script spustený
- [ ] PASS/FAIL status overený
- [ ] Remote branch `release/1.0.0` overený

### Backend
- [ ] Git lock súbory odstránené (ak existovali)
- [ ] Zmeny commitnuté a pushnuté
- [ ] Clean working tree overený
- [ ] Runner script spustený
- [ ] PASS/FAIL status overený
- [ ] Remote branch `release/1.0.0` overený

---

**Poznámka:** Všetky príkazy sú copy-paste ready. Postupuj sekvenčne pre FE aj BE.
