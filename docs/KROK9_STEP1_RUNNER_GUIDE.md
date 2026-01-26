# KROK 9 Step 1 Runner - Quick Guide

**Cieľ:** 1-click release preparation pre FE aj BE  
**Platform:** Windows (PowerShell)

---

## 🚀 Quick Start

### Frontend (FE)

```powershell
cd d:\dreamhubb\dreamhubb-FE
.\scripts\run-krok9-step1.ps1
```

### Backend (BE)

```powershell
cd d:\dreamhubb\dreamhubb-BE
.\scripts\run-krok9-step1.ps1
```

---

## 📋 Čo Script Robí

### 1. Odstráni Git Lock Súbory
- `.git/index.lock`
- `.git/HEAD.lock`
- `.git/refs/heads/*.lock` (všetky)

### 2. Overí Clean Working Tree
- Ak je working tree dirty, vypíše čo je zmenené a **STOP**
- Musíš commitnúť alebo stashnúť zmeny pred pokračovaním

### 3. Fetch + Pull
- `git fetch origin`
- `git pull origin <current-branch>`

### 4. Vytvorí/Checkoutne Release Branch
- Ak `release/1.0.0` neexistuje: vytvorí z aktuálnej vetvy
- Ak existuje: checkoutne a pullne
- Pushne na origin a nastaví upstream

### 5. Spustí Sanity Checks
- Použije existujúci `scripts/build-sanity.ps1`
- FE: npm ci, lint, build
- BE: composer install, tests, config cache, route cache

### 6. Commit a Push (ak PASS)
- Commit message: `"release: prepare 1.0.0 (step 1)"`
- Push na `origin release/1.0.0`
- **NIKDY nerobí force push**

### 7. Vypíše Summary
- PASS/FAIL status
- Zoznam krokov (✅/❌)
- Warnings a errors
- Next steps (Step 2 Mac)

---

## ⚙️ Parametre

### Version

```powershell
# Použi inú verziu
.\scripts\run-krok9-step1.ps1 -Version "1.0.1"
```

### Skip Commit

```powershell
# Preskoč commit (len priprav release branch)
.\scripts\run-krok9-step1.ps1 -SkipCommit
```

---

## ✅ Očakávaný Výstup

### Success (PASS)

```
============================================================
  KROK 9 STEP 1 RUNNER - FRONTEND
  Version: 1.0.0
============================================================

Removing git lock files...
  ✅ Removed: .git/index.lock

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
  ✅ Remove Git Lock Files: Removed 1 lock file(s)
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

### Failure (FAIL)

```
============================================================
  KROK 9 STEP 1 RUNNER - FRONTEND
  Version: 1.0.0
============================================================

Removing git lock files...
✅ Remove Git Lock Files: No lock files found

Verifying clean working tree...
❌ Working tree is not clean:
 M package.json
?? scripts/new-script.js

Please commit or stash changes before running release script.

============================================================
  KROK 9 STEP 1: FAIL
============================================================

Steps:
  ✅ Directory Check
  ✅ Remove Git Lock Files: No lock files found
  ❌ Clean Working Tree: Working tree is dirty

Errors:
  ❌ Clean Working Tree: Working tree is dirty
```

---

## ⚠️ Dôležité Poznámky

### Safety
- ✅ **NIKDY nerobí force push** - script používa len `git push`, nie `git push --force`
- ✅ **NIKDY neničí zmeny** - ak je working tree dirty, script STOP a vypíše čo je zmenené
- ✅ **NIKDY neprepíše existujúci release branch** - ak existuje, len ho checkoutne a pullne

### Clean Working Tree
- Script **vyžaduje** clean working tree pred spustením
- Ak máš zmeny, ktoré chceš commitnúť:
  ```powershell
  git add .
  git commit -m "your message"
  ```
- Alebo stashnúť:
  ```powershell
  git stash
  ```

### Sanity Checks
- Ak sanity checks zlyhajú, script STOP pred commitom
- Oprav problémy a spusti script znova

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK9_STEP2_MAC_RUNBOOK.md` - Step 2 Mac runbook
- `docs/KROK9_STEP1_FINAL_REPORT.md` - Final report
- `docs/KROK9_STEP1_COMMANDS.md` - Presné príkazy

---

**Poznámka:** Toto je 1-click runner pre Step 1. Po úspešnom spustení pokračuj Step 2 na Macu.
