# KROK 9 Step 1 - Copy-Paste Commands

**Cieľ:** Presné príkazy pre pripravenie a spustenie `run-krok9-step1.ps1`  
**Format:** Copy-paste ready bloky

---

## 🔧 FRONTEND (FE) - Copy-Paste Blok

### Blok 1: Over a Odstráň Git Lock Súbory

```powershell
cd d:\dreamhubb\dreamhubb-FE

# Zatvor Git GUI, VSCode, alebo iné git procesy (ak bežia)

# Skontroluj lock súbory
if (Test-Path .git/index.lock) { Write-Host "⚠️  .git/index.lock exists" -ForegroundColor Yellow }
if (Test-Path .git/HEAD.lock) { Write-Host "⚠️  .git/HEAD.lock exists" -ForegroundColor Yellow }
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "⚠️  $($_.FullName) exists" -ForegroundColor Yellow }

# Odstráň lock súbory (ak existujú)
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/HEAD.lock -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "✅ Git lock files checked/removed" -ForegroundColor Green
```

### Blok 2: Over Git Status

```powershell
cd d:\dreamhubb\dreamhubb-FE
git status
```

**Očakávaný výstup:**
- 12 modified súborov
- 14 untracked súborov
- Branch: `fix/location-onboarding`

### Blok 3: Commit a Push Zmeny

```powershell
cd d:\dreamhubb\dreamhubb-FE

# Add všetky zmeny
git add -A

# Over staging (malo by zobraziť všetky zmeny)
git status --short

# Commit
git commit -m "release: prepare 1.0.0 (step 1) - KROK9 automation, docs, scripts"

# Push
git push origin fix/location-onboarding
```

**Commit Message Detail:**
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

### Blok 4: Overenie Clean Tree

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

### Blok 5: Spusti Runner Script

```powershell
cd d:\dreamhubb\dreamhubb-FE
.\scripts\run-krok9-step1.ps1
```

**Očakávaný výstup (PASS):**
- ✅ Remove Git Lock Files
- ✅ Clean Working Tree
- ✅ Git Fetch
- ✅ Git Pull
- ✅ Create Release Branch: Created branch: release/1.0.0
- ✅ Push Release Branch: Pushed to origin and set upstream
- ✅ Build Sanity
- ✅ Git Commit: Committed: release: prepare 1.0.0 (step 1)
- ✅ Git Push: Pushed to origin release/1.0.0
- **KROK 9 STEP 1: PASS**

### Blok 6: Overenie Remote Branch

```powershell
cd d:\dreamhubb\dreamhubb-FE

# Over remote branch
git branch -r | findstr "release/1.0.0"
# Očakávaný výstup:   origin/release/1.0.0

# Over local branch
git branch | findstr "release/1.0.0"
# Očakávaný výstup: * release/1.0.0

# Over current branch
git branch --show-current
# Očakávaný výstup: release/1.0.0

# Over status
git status
# Očakávaný výstup: "nothing to commit, working tree clean"
```

---

## 🔧 BACKEND (BE) - Copy-Paste Blok

### Blok 1: Over a Odstráň Git Lock Súbory

```powershell
cd d:\dreamhubb\dreamhubb-BE

# Zatvor Git GUI, VSCode, alebo iné git procesy (ak bežia)

# Skontroluj lock súbory
if (Test-Path .git/index.lock) { Write-Host "⚠️  .git/index.lock exists" -ForegroundColor Yellow }
if (Test-Path .git/HEAD.lock) { Write-Host "⚠️  .git/HEAD.lock exists" -ForegroundColor Yellow }
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "⚠️  $($_.FullName) exists" -ForegroundColor Yellow }

# Odstráň lock súbory (ak existujú)
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/HEAD.lock -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "✅ Git lock files checked/removed" -ForegroundColor Green
```

### Blok 2: Over Git Status

```powershell
cd d:\dreamhubb\dreamhubb-BE
git status
```

**Očakávaný výstup:**
- 3 modified súbory
- 4 untracked súbory
- Branch: `fix/location-onboarding`

### Blok 3: Commit a Push Zmeny

```powershell
cd d:\dreamhubb\dreamhubb-BE

# Add všetky zmeny
git add -A

# Over staging (malo by zobraziť všetky zmeny)
git status --short

# Commit
git commit -m "release: prepare 1.0.0 (step 1) - KROK9 automation, scripts"

# Push
git push origin fix/location-onboarding
```

**Commit Message Detail:**
```
release: prepare 1.0.0 (step 1) - KROK9 automation, scripts

- Add 1-click runner script (run-krok9-step1.ps1)
- Add release automation scripts (release-step1.ps1, build-sanity.ps1, create-release-branch.ps1)
- Update HealthController to include version and build in health endpoint
- Version and build config already in config/app.php
```

### Blok 4: Overenie Clean Tree

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

### Blok 5: Spusti Runner Script

```powershell
cd d:\dreamhubb\dreamhubb-BE
.\scripts\run-krok9-step1.ps1
```

**Očakávaný výstup (PASS):**
- ✅ Remove Git Lock Files
- ✅ Clean Working Tree
- ✅ Git Fetch
- ✅ Git Pull
- ✅ Create Release Branch: Created branch: release/1.0.0
- ✅ Push Release Branch: Pushed to origin and set upstream
- ✅ Build Sanity
- ✅ Git Commit: Committed: release: prepare 1.0.0 (step 1)
- ✅ Git Push: Pushed to origin release/1.0.0
- **KROK 9 STEP 1: PASS**

### Blok 6: Overenie Remote Branch

```powershell
cd d:\dreamhubb\dreamhubb-BE

# Over remote branch
git branch -r | findstr "release/1.0.0"
# Očakávaný výstup:   origin/release/1.0.0

# Over local branch
git branch | findstr "release/1.0.0"
# Očakávaný výstup: * release/1.0.0

# Over current branch
git branch --show-current
# Očakávaný výstup: release/1.0.0

# Over status
git status
# Očakávaný výstup: "nothing to commit, working tree clean"
```

---

## ⚠️ Ak Hrozí Git Lock - Bezpečný Postup

### Postup 1: Zatvor Git Procesy

```powershell
# Zatvor:
# - Git GUI
# - VSCode (ak má otvorený git repo)
# - Iné git procesy (Task Manager → Processes → git.exe)

# Alebo použi PowerShell:
Get-Process | Where-Object { $_.ProcessName -like "*git*" -or $_.ProcessName -like "*code*" } | Stop-Process -Force -ErrorAction SilentlyContinue
```

### Postup 2: Odstráň Lock Súbory

```powershell
# FE
cd d:\dreamhubb\dreamhubb-FE
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/HEAD.lock -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

# BE
cd d:\dreamhubb\dreamhubb-BE
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/HEAD.lock -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
```

### Postup 3: Over, Že Sú Odstránené

```powershell
# FE
cd d:\dreamhubb\dreamhubb-FE
if (-not (Test-Path .git/index.lock)) { Write-Host "✅ .git/index.lock removed" -ForegroundColor Green }
if (-not (Test-Path .git/HEAD.lock)) { Write-Host "✅ .git/HEAD.lock removed" -ForegroundColor Green }

# BE
cd d:\dreamhubb\dreamhubb-BE
if (-not (Test-Path .git/index.lock)) { Write-Host "✅ .git/index.lock removed" -ForegroundColor Green }
if (-not (Test-Path .git/HEAD.lock)) { Write-Host "✅ .git/HEAD.lock removed" -ForegroundColor Green }
```

### Postup 4: Pokračuj s Git Príkazmi

```powershell
# Teraz môžeš pokračovať s git príkazmi (add, commit, push)
```

---

## 📋 Complete Workflow - FE

```powershell
# ============================================================
# FRONTEND (FE) - Complete Workflow
# ============================================================

cd d:\dreamhubb\dreamhubb-FE

# 1. Over a odstráň git lock súbory
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/HEAD.lock -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

# 2. Over git status
git status

# 3. Commit a push zmeny
git add -A
git commit -m "release: prepare 1.0.0 (step 1) - KROK9 automation, docs, scripts"
git push origin fix/location-onboarding

# 4. Over clean tree
git status
# Malo by byť: "nothing to commit, working tree clean"

# 5. Spusti runner script
.\scripts\run-krok9-step1.ps1

# 6. Over release branch
git branch -r | findstr "release/1.0.0"
git branch --show-current
git status
```

---

## 📋 Complete Workflow - BE

```powershell
# ============================================================
# BACKEND (BE) - Complete Workflow
# ============================================================

cd d:\dreamhubb\dreamhubb-BE

# 1. Over a odstráň git lock súbory
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
Remove-Item .git/HEAD.lock -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path .git/refs/heads -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

# 2. Over git status
git status

# 3. Commit a push zmeny
git add -A
git commit -m "release: prepare 1.0.0 (step 1) - KROK9 automation, scripts"
git push origin fix/location-onboarding

# 4. Over clean tree
git status
# Malo by byť: "nothing to commit, working tree clean"

# 5. Spusti runner script
.\scripts\run-krok9-step1.ps1

# 6. Over release branch
git branch -r | findstr "release/1.0.0"
git branch --show-current
git status
```

---

## ✅ Final Verification

### Frontend

```powershell
cd d:\dreamhubb\dreamhubb-FE

# Over, že si na release branch
git branch --show-current
# Malo by byť: release/1.0.0

# Over, že remote branch existuje
git branch -r | findstr "release/1.0.0"
# Malo by byť:   origin/release/1.0.0

# Over clean status
git status
# Malo by byť: "nothing to commit, working tree clean"
```

### Backend

```powershell
cd d:\dreamhubb\dreamhubb-BE

# Over, že si na release branch
git branch --show-current
# Malo by byť: release/1.0.0

# Over, že remote branch existuje
git branch -r | findstr "release/1.0.0"
# Malo by byť:   origin/release/1.0.0

# Over clean status
git status
# Malo by byť: "nothing to commit, working tree clean"
```

---

**Poznámka:** Všetky príkazy sú copy-paste ready. Postupuj sekvenčne pre FE aj BE.
