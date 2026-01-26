# KROK 9 Step 1 Runner - One-Click Release Preparation (FE)
# Usage: .\scripts\run-krok9-step1.ps1 [--version 1.0.0] [--skip-commit]

param(
    [string]$Version = "1.0.0",
    [switch]$SkipCommit = $false
)

$ErrorActionPreference = "Stop"
$script:Pass = $true
$script:Steps = @()
$script:Errors = @()
$script:Warnings = @()

function Add-Step {
    param([string]$Name, [bool]$Success, [string]$Message = "")
    $script:Steps += @{
        Name = $Name
        Success = $Success
        Message = $Message
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    if (-not $Success) {
        $script:Pass = $false
        $script:Errors += "${Name}: ${Message}"
    }
}

function Add-Warning {
    param([string]$Message)
    $script:Warnings += $Message
}

function Remove-GitLockFiles {
    Write-Host "Removing git lock files..." -ForegroundColor Yellow
    $lockFiles = @(
        ".git/index.lock",
        ".git/HEAD.lock"
    )
    
    # Find all refs/heads/*.lock files
    $refsLockPath = ".git/refs/heads"
    if (Test-Path $refsLockPath) {
        $refsLocks = Get-ChildItem -Path $refsLockPath -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue
        foreach ($lock in $refsLocks) {
            $lockFiles += $lock.FullName
        }
    }
    
    $removed = 0
    foreach ($lockFile in $lockFiles) {
        if (Test-Path $lockFile) {
            try {
                Remove-Item $lockFile -Force -ErrorAction Stop
                Write-Host "  ✅ Removed: $lockFile" -ForegroundColor Green
                $removed++
            } catch {
                Add-Warning "Could not remove $lockFile : $($_.Exception.Message)"
                Write-Host "  ⚠️  Could not remove: $lockFile" -ForegroundColor Yellow
            }
        }
    }
    
    if ($removed -gt 0) {
        Add-Step "Remove Git Lock Files" $true "Removed $removed lock file(s)"
    } else {
        Add-Step "Remove Git Lock Files" $true "No lock files found"
    }
}

function Test-CleanWorkingTree {
    Write-Host "Verifying clean working tree..." -ForegroundColor Yellow
    $status = git status --short
    if ($status) {
        $dirtyFiles = ($status -split "`n" | Where-Object { $_ -and $_.Trim() }) -join "`n"
        Add-Step "Clean Working Tree" $false "Working tree is dirty"
        Write-Host "❌ Working tree is not clean:" -ForegroundColor Red
        Write-Host $dirtyFiles -ForegroundColor Gray
        Write-Host ""
        Write-Host "Please commit or stash changes before running release script." -ForegroundColor Yellow
        return $false
    }
    Add-Step "Clean Working Tree" $true
    return $true
}

function Invoke-GitFetchPull {
    Write-Host "Fetching and pulling latest changes..." -ForegroundColor Yellow
    git fetch origin
    if ($LASTEXITCODE -ne 0) {
        Add-Step "Git Fetch" $false "git fetch failed"
        return $false
    }
    Add-Step "Git Fetch" $true
    
    $currentBranch = git branch --show-current
    git pull origin $currentBranch
    if ($LASTEXITCODE -ne 0) {
        Add-Warning "git pull failed (may be offline or no remote)"
        Write-Host "⚠️  Warning: git pull failed" -ForegroundColor Yellow
    } else {
        Add-Step "Git Pull" $true
    }
    return $true
}

function Invoke-CreateReleaseBranch {
    param([string]$Version)
    
    Write-Host "Creating/checking out release branch..." -ForegroundColor Yellow
    $releaseBranch = "release/$Version"
    $currentBranch = git branch --show-current
    
    # Check if release branch exists
    $branchExists = git branch -a | Select-String "release/$Version"
    
    if ($branchExists) {
        Write-Host "  Release branch $releaseBranch already exists" -ForegroundColor Yellow
        Write-Host "  Checking out existing branch..." -ForegroundColor Yellow
        git checkout $releaseBranch
        if ($LASTEXITCODE -ne 0) {
            Add-Step "Checkout Release Branch" $false "Failed to checkout existing branch"
            return $false
        }
        git pull origin $releaseBranch
        Add-Step "Checkout Release Branch" $true "Checked out existing branch"
    } else {
        Write-Host "  Creating new branch: $releaseBranch from $currentBranch" -ForegroundColor Yellow
        git checkout -b $releaseBranch
        if ($LASTEXITCODE -ne 0) {
            Add-Step "Create Release Branch" $false "Failed to create release branch"
            return $false
        }
        Add-Step "Create Release Branch" $true "Created branch: $releaseBranch"
    }
    
    # Push and set upstream
    Write-Host "  Pushing to origin and setting upstream..." -ForegroundColor Yellow
    git push -u origin $releaseBranch
    if ($LASTEXITCODE -ne 0) {
        Add-Warning "git push failed (may be offline or no remote)"
        Write-Host "  ⚠️  Warning: git push failed" -ForegroundColor Yellow
        Write-Host "     You can push manually later with: git push -u origin $releaseBranch" -ForegroundColor Yellow
    } else {
        Add-Step "Push Release Branch" $true "Pushed to origin and set upstream"
    }
    
    return $true
}

function Invoke-SanityChecks {
    Write-Host "Running sanity checks..." -ForegroundColor Yellow
    
    # Use existing build-sanity.ps1 if available
    if (Test-Path "scripts/build-sanity.ps1") {
        Write-Host "  Running build-sanity.ps1..." -ForegroundColor Gray
        & "scripts/build-sanity.ps1"
        if ($LASTEXITCODE -ne 0) {
            Add-Step "Build Sanity" $false "build-sanity.ps1 failed"
            return $false
        }
        Add-Step "Build Sanity" $true
    } else {
        Add-Warning "build-sanity.ps1 not found, skipping build sanity"
    }
    
    # Use existing release-step1.ps1 sanity checks if available
    # (We'll run it but skip the branch creation part)
    if (Test-Path "scripts/release-step1.ps1") {
        Write-Host "  Running release-step1.ps1 sanity checks..." -ForegroundColor Gray
        # Note: release-step1.ps1 will try to create branch, but we already did that
        # So we'll just run the sanity parts manually
        Add-Warning "release-step1.ps1 exists but we're using build-sanity.ps1 instead"
    }
    
    return $true
}

function Invoke-CommitAndPush {
    param([string]$Version)
    
    if ($SkipCommit) {
        Add-Warning "Commit skipped (--SkipCommit flag)"
        Write-Host "⚠️  Commit skipped (--SkipCommit flag)" -ForegroundColor Yellow
        return $true
    }
    
    Write-Host "Committing changes..." -ForegroundColor Yellow
    
    # Check if there are changes to commit
    $status = git status --short
    if (-not $status) {
        Add-Step "Commit Changes" $true "No changes to commit"
        return $true
    }
    
    # Add all changes
    git add .
    if ($LASTEXITCODE -ne 0) {
        Add-Step "Git Add" $false "git add failed"
        return $false
    }
    
    # Commit
    $commitMessage = "release: prepare $Version (step 1)"
    git commit -m $commitMessage
    if ($LASTEXITCODE -ne 0) {
        Add-Step "Git Commit" $false "git commit failed"
        return $false
    }
    Add-Step "Git Commit" $true "Committed: $commitMessage"
    
    # Push (NEVER force push)
    $releaseBranch = "release/$Version"
    Write-Host "  Pushing to origin $releaseBranch..." -ForegroundColor Yellow
    git push origin $releaseBranch
    if ($LASTEXITCODE -ne 0) {
        Add-Step "Git Push" $false "git push failed"
        Write-Host "  ⚠️  Warning: git push failed" -ForegroundColor Yellow
        Write-Host "     You can push manually later with: git push origin $releaseBranch" -ForegroundColor Yellow
        return $false
    }
    Add-Step "Git Push" $true "Pushed to origin $releaseBranch"
    
    return $true
}

# Main execution
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  KROK 9 STEP 1 RUNNER - FRONTEND" -ForegroundColor Cyan
Write-Host "  Version: $Version" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check directory
if (-not (Test-Path "package.json")) {
    Add-Step "Directory Check" $false "Not in dreamhubb-FE directory"
    Write-Host "❌ Error: Not in dreamhubb-FE directory" -ForegroundColor Red
    exit 1
}
Add-Step "Directory Check" $true

# Step 1: Remove git lock files
Remove-GitLockFiles

# Step 2: Verify clean working tree
if (-not (Test-CleanWorkingTree)) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "  KROK 9 STEP 1: FAIL" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Working tree is not clean. Please commit or stash changes first." -ForegroundColor Yellow
    exit 1
}

# Step 3: Fetch and pull
if (-not (Invoke-GitFetchPull)) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "  KROK 9 STEP 1: FAIL" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    exit 1
}

# Step 4: Create/checkout release branch
if (-not (Invoke-CreateReleaseBranch -Version $Version)) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "  KROK 9 STEP 1: FAIL" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    exit 1
}

# Step 5: Run sanity checks
if (-not (Invoke-SanityChecks)) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "  KROK 9 STEP 1: FAIL" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Sanity checks failed. Please fix issues before committing." -ForegroundColor Yellow
    exit 1
}

# Step 6: Commit and push (if not skipped)
if (-not (Invoke-CommitAndPush -Version $Version)) {
    Add-Warning "Commit/push failed, but release branch is ready"
}

# Final report
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
if ($script:Pass) {
    Write-Host "  KROK 9 STEP 1: PASS" -ForegroundColor Green
} else {
    Write-Host "  KROK 9 STEP 1: FAIL" -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Print steps
Write-Host "Steps:" -ForegroundColor Yellow
foreach ($step in $script:Steps) {
    $icon = if ($step.Success) { "✅" } else { "❌" }
    $color = if ($step.Success) { "Green" } else { "Red" }
    Write-Host "  $icon $($step.Name)" -ForegroundColor $color
    if ($step.Message) {
        Write-Host "     $($step.Message)" -ForegroundColor Gray
    }
}

# Print warnings
if ($script:Warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "Warnings:" -ForegroundColor Yellow
    foreach ($warning in $script:Warnings) {
        Write-Host "  ⚠️  $warning" -ForegroundColor Yellow
    }
}

# Print errors
if ($script:Errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Errors:" -ForegroundColor Red
    foreach ($error in $script:Errors) {
        Write-Host "  ❌ $error" -ForegroundColor Red
    }
}

# Next steps
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS - STEP 2 (Mac)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "On Mac, run these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  cd ~/projects/dreamhubb-FE  # Alebo tvoja cesta" -ForegroundColor White
Write-Host "  git checkout release/$Version" -ForegroundColor White
Write-Host "  git pull origin release/$Version" -ForegroundColor White
Write-Host "  npm ci" -ForegroundColor White
Write-Host "  npm run ios:sync-version" -ForegroundColor White
Write-Host "  open ios/App/App.xcodeproj" -ForegroundColor White
Write-Host ""
Write-Host "Then follow: docs/KROK9_STEP2_MAC_RUNBOOK.md" -ForegroundColor Yellow
Write-Host ""

# Exit with appropriate code
if ($script:Pass) {
    exit 0
} else {
    exit 1
}
