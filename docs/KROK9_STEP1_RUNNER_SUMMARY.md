# KROK 9 Step 1 Runner - Summary

**Cieľ:** 1-click release preparation pre FE aj BE  
**Status:** ✅ **Hotové - pripravené na použitie**

---

## 📋 Nové Súbory

### Frontend (FE)
- **`scripts/run-krok9-step1.ps1`** (NEW)
  - 1-click runner script
  - Odstráni git lock súbory
  - Overí clean working tree
  - Fetch + pull
  - Vytvorí/checkoutne release/1.0.0
  - Spustí sanity checks
  - Commit a push (ak PASS)
  - Vypíše PASS/FAIL summary + next steps

- **`docs/KROK9_STEP1_RUNNER_GUIDE.md`** (NEW)
  - Quick guide pre runner script

- **`docs/KROK9_STEP1_RUNNER_SUMMARY.md`** (NEW - tento súbor)
  - Summary report

### Backend (BE)
- **`scripts/run-krok9-step1.ps1`** (NEW)
  - 1-click runner script (rovnaká funkcionalita ako FE)

---

## 🚀 Presné Príkazy

### Frontend (FE)

```powershell
cd d:\dreamhubb\dreamhubb-FE

# Spusti 1-click runner
.\scripts\run-krok9-step1.ps1

# Očakávaný výstup:
# - Odstránenie git lock súborov
# - Overenie clean working tree
# - Fetch + pull
# - Vytvorenie/checkout release/1.0.0
# - Sanity checks
# - Commit a push (ak PASS)
# - PASS/FAIL summary + next steps
```

### Backend (BE)

```powershell
cd d:\dreamhubb\dreamhubb-BE

# Spusti 1-click runner
.\scripts\run-krok9-step1.ps1

# Očakávaný výstup:
# - Odstránenie git lock súborov
# - Overenie clean working tree
# - Fetch + pull
# - Vytvorenie/checkout release/1.0.0
# - Sanity checks
# - Commit a push (ak PASS)
# - PASS/FAIL summary
```

---

## ✅ Očakávaný Výstup (PASS)

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

---

## ❌ Očakávaný Výstup (FAIL - Dirty Working Tree)

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

## 🔒 Safety Features

### Nikdy Nerobí Force Push
- ✅ Script používa len `git push`, nie `git push --force`
- ✅ Ak push zlyhá, script vypíše warning, ale neničí nič

### Nikdy Neničí Zmeny
- ✅ Ak je working tree dirty, script **STOP** a vypíše čo je zmenené
- ✅ Musíš commitnúť alebo stashnúť zmeny pred pokračovaním

### Nikdy Neprepíše Existujúci Release Branch
- ✅ Ak `release/1.0.0` už existuje, len ho checkoutne a pullne
- ✅ Nenahrádza existujúci release branch

---

## 📝 Workflow

### 1. Pred Spustením

```powershell
# Over, že si na správnej vetve
git branch --show-current
# Malo by byť: fix/location-onboarding

# Ak máš zmeny, ktoré chceš commitnúť:
git add .
git commit -m "your message"

# Alebo stashnúť:
git stash
```

### 2. Spusti Runner

```powershell
# FE
cd d:\dreamhubb\dreamhubb-FE
.\scripts\run-krok9-step1.ps1

# BE
cd d:\dreamhubb\dreamhubb-BE
.\scripts\run-krok9-step1.ps1
```

### 3. Po Úspešnom Spustení

- ✅ Release branch je vytvorený a pushnutý
- ✅ Zmeny sú commitnuté a pushnuté
- ✅ Pokračuj Step 2 na Macu (FE) alebo deploy (BE)

---

## 🔗 Súvisiace Dokumenty

- `docs/KROK9_STEP1_RUNNER_GUIDE.md` - Quick guide
- `docs/KROK9_STEP2_MAC_RUNBOOK.md` - Step 2 Mac runbook
- `docs/KROK9_STEP1_FINAL_REPORT.md` - Final report

---

## 🎯 Záver

**Status:** ✅ **Hotové - pripravené na použitie**

1-click runner script je pripravený. Spusti `.\scripts\run-krok9-step1.ps1` (FE aj BE) a script automaticky:
- Odstráni git lock súbory
- Overí clean working tree
- Vytvorí/checkoutne release branch
- Spustí sanity checks
- Commitne a pushne zmeny (ak PASS)
- Vypíše jasný PASS/FAIL summary + next steps

**KROK 9 Step 1 Runner je pripravený!** 🚀
