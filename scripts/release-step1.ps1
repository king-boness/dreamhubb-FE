# Release Step 1 Automation Script (FE)
# Usage: .\scripts\release-step1.ps1 [--version 1.0.0]

param(
    [string]$Version = "1.0.0",
    [switch]$SkipSanity = $false
)

$ErrorActionPreference = "Stop"
$report = @{
    Pass = $true
    Steps = @()
    Errors = @()
    Warnings = @()
    MacCommands = @()
}

function Add-Step {
    param([string]$Name, [bool]$Success, [string]$Message = "")
    $report.Steps += @{
        Name = $Name
        Success = $Success
        Message = $Message
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    if (-not $Success) {
        $report.Pass = $false
        $report.Errors += "$Name: $Message"
    }
}

function Add-Warning {
    param([string]$Message)
    $report.Warnings += $Message
}

function Add-MacCommand {
    param([string]$Command, [string]$Description = "")
    $report.MacCommands += @{
        Command = $Command
        Description = $Description
    }
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RELEASE STEP 1 - FRONTEND" -ForegroundColor Cyan
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

# Step 1: Verify clean working tree
Write-Host "Step 1: Verifying clean working tree..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    $dirtyFiles = ($status -split "`n" | Where-Object { $_ }) -join ", "
    Add-Step "Clean Working Tree" $false "Working tree is dirty: $dirtyFiles"
    Write-Host "❌ Working tree is not clean:" -ForegroundColor Red
    Write-Host $status -ForegroundColor Gray
    Write-Host ""
    Write-Host "Please commit or stash changes before running release script." -ForegroundColor Yellow
    exit 1
}
Add-Step "Clean Working Tree" $true

# Step 2: Verify current branch
Write-Host ""
Write-Host "Step 2: Verifying current branch..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
if ($currentBranch -ne "fix/location-onboarding") {
    Add-Warning "Not on fix/location-onboarding (current: $currentBranch)"
    Write-Host "⚠️  Warning: Not on fix/location-onboarding (current: $currentBranch)" -ForegroundColor Yellow
} else {
    Add-Step "Current Branch" $true "On fix/location-onboarding"
}

# Step 3: Fetch and pull
Write-Host ""
Write-Host "Step 3: Fetching and pulling latest changes..." -ForegroundColor Yellow
git fetch origin
if ($LASTEXITCODE -ne 0) {
    Add-Step "Git Fetch" $false "git fetch failed"
    exit 1
}
Add-Step "Git Fetch" $true

git pull origin fix/location-onboarding
if ($LASTEXITCODE -ne 0) {
    Add-Warning "git pull failed (may be offline or no remote)"
    Write-Host "⚠️  Warning: git pull failed" -ForegroundColor Yellow
} else {
    Add-Step "Git Pull" $true
}

# Step 4: Create release branch
Write-Host ""
Write-Host "Step 4: Creating release branch..." -ForegroundColor Yellow
$releaseBranch = "release/$Version"
$branchExists = git branch -a | Select-String "release/$Version"

if ($branchExists) {
    Write-Host "⚠️  Release branch $releaseBranch already exists" -ForegroundColor Yellow
    Write-Host "   Checking out existing branch..." -ForegroundColor Yellow
    git checkout $releaseBranch
    if ($LASTEXITCODE -ne 0) {
        Add-Step "Checkout Release Branch" $false "Failed to checkout existing branch"
        exit 1
    }
    git pull origin $releaseBranch
    Add-Step "Checkout Release Branch" $true "Checked out existing branch"
} else {
    git checkout -b $releaseBranch
    if ($LASTEXITCODE -ne 0) {
        Add-Step "Create Release Branch" $false "Failed to create release branch"
        exit 1
    }
    Add-Step "Create Release Branch" $true "Created branch: $releaseBranch"
}

# Step 5: Push and set upstream
Write-Host ""
Write-Host "Step 5: Pushing to origin and setting upstream..." -ForegroundColor Yellow
git push -u origin $releaseBranch
if ($LASTEXITCODE -ne 0) {
    Add-Warning "git push failed (may be offline or no remote)"
    Write-Host "⚠️  Warning: git push failed" -ForegroundColor Yellow
    Write-Host "   You can push manually later with: git push -u origin $releaseBranch" -ForegroundColor Yellow
} else {
    Add-Step "Push Release Branch" $true "Pushed to origin and set upstream"
}

# Step 6: Version sync
Write-Host ""
Write-Host "Step 6: Syncing version..." -ForegroundColor Yellow

# Check package.json version
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if ($packageJson.version -ne $Version) {
    Write-Host "⚠️  Warning: package.json version is $($packageJson.version), expected $Version" -ForegroundColor Yellow
    Add-Warning "package.json version mismatch: $($packageJson.version) vs $Version"
} else {
    Add-Step "Package.json Version" $true "Version: $Version"
}

# iOS version sync (note: this will be done on Mac)
Add-MacCommand "npm run ios:sync-version" "Sync version from package.json to iOS project"
Add-Step "iOS Version Sync" $true "Will be done on Mac"

# Step 7: Sanity checks
if (-not $SkipSanity) {
    Write-Host ""
    Write-Host "Step 7: Running sanity checks..." -ForegroundColor Yellow

    # Lint
    Write-Host "  Running npm run lint..." -ForegroundColor Gray
    npm run lint 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Add-Step "Lint Check" $false "Lint failed"
    } else {
        Add-Step "Lint Check" $true
    }

    # Build
    Write-Host "  Running npm run build..." -ForegroundColor Gray
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Add-Step "Build Check" $false "Build failed"
    } else {
        Add-Step "Build Check" $true
    }

    # Preflight
    if (Test-Path "scripts/preflight.js") {
        Write-Host "  Running npm run preflight..." -ForegroundColor Gray
        npm run preflight 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Add-Step "Preflight Check" $false "Preflight failed"
        } else {
            Add-Step "Preflight Check" $true
        }
    }

    # Release gate
    if (Test-Path "scripts/release-gate.js") {
        Write-Host "  Running npm run release:gate..." -ForegroundColor Gray
        npm run release:gate 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Add-Step "Release Gate Check" $false "Release gate failed"
        } else {
            Add-Step "Release Gate Check" $true
        }
    }
} else {
    Add-Warning "Sanity checks skipped (--SkipSanity flag)"
}

# Generate report
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
if ($report.Pass) {
    Write-Host "  RELEASE STEP 1: PASS" -ForegroundColor Green
} else {
    Write-Host "  RELEASE STEP 1: FAIL" -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Print steps
Write-Host "Steps:" -ForegroundColor Yellow
foreach ($step in $report.Steps) {
    $icon = if ($step.Success) { "✅" } else { "❌" }
    Write-Host "  $icon $($step.Name)" -ForegroundColor $(if ($step.Success) { "Green" } else { "Red" })
    if ($step.Message) {
        Write-Host "     $($step.Message)" -ForegroundColor Gray
    }
}

# Print warnings
if ($report.Warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "Warnings:" -ForegroundColor Yellow
    foreach ($warning in $report.Warnings) {
        Write-Host "  ⚠️  $warning" -ForegroundColor Yellow
    }
}

# Print errors
if ($report.Errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Errors:" -ForegroundColor Red
    foreach ($error in $report.Errors) {
        Write-Host "  ❌ $error" -ForegroundColor Red
    }
}

# Print Mac commands
if ($report.MacCommands.Count -gt 0) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  STEP 2 - MAC COMMANDS" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Run these commands on Mac:" -ForegroundColor Yellow
    Write-Host ""
    foreach ($cmd in $report.MacCommands) {
        Write-Host "  $($cmd.Command)" -ForegroundColor White
        if ($cmd.Description) {
            Write-Host "    # $($cmd.Description)" -ForegroundColor Gray
        }
    }
    Write-Host ""
    Add-MacCommand "cd dreamhubb-FE" "Navigate to FE directory"
    Add-MacCommand "git checkout release/$Version" "Checkout release branch"
    Add-MacCommand "npm ci" "Install dependencies"
    Add-MacCommand "npm run ios:sync-version" "Sync version to iOS project"
    Add-MacCommand "open ios/App/App.xcodeproj" "Open Xcode project"
    Write-Host "Then follow: docs/KROK9_STEP2_MAC_RUNBOOK.md" -ForegroundColor Yellow
}

# Save report to file
$reportFile = "release-step1-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$report | ConvertTo-Json -Depth 10 | Out-File $reportFile -Encoding UTF8
Write-Host ""
Write-Host "Report saved to: $reportFile" -ForegroundColor Gray

# Exit with appropriate code
if ($report.Pass) {
    exit 0
} else {
    exit 1
}
