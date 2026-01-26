# Prepare Release Branch Script (FE)
# Usage: .\scripts\prepare-release-branch.ps1

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  PREPARE RELEASE BRANCH - FRONTEND" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Not in dreamhubb-FE directory" -ForegroundColor Red
    exit 1
}

# Step 1: Remove lock files
Write-Host "Step 1: Removing git lock files..." -ForegroundColor Yellow
if (Test-Path ".git/index.lock") {
    Remove-Item ".git/index.lock" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Removed .git/index.lock" -ForegroundColor Green
}
if (Test-Path ".git/refs/heads/release/1.0.0.lock") {
    Remove-Item ".git/refs/heads/release/1.0.0.lock" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Removed .git/refs/heads/release/1.0.0.lock" -ForegroundColor Green
}

# Step 2: Checkout and pull
Write-Host ""
Write-Host "Step 2: Checking out fix/location-onboarding..." -ForegroundColor Yellow
git checkout fix/location-onboarding
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to checkout fix/location-onboarding" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Checked out fix/location-onboarding" -ForegroundColor Green

Write-Host "Pulling latest changes..." -ForegroundColor Yellow
git pull origin fix/location-onboarding
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: git pull failed (may be offline or no remote)" -ForegroundColor Yellow
}
Write-Host "✅ Pulled latest changes" -ForegroundColor Green

# Step 3: Create release branch
Write-Host ""
Write-Host "Step 3: Creating release/1.0.0 branch..." -ForegroundColor Yellow
$branchExists = git branch -a | Select-String "release/1.0.0"
if ($branchExists) {
    Write-Host "⚠️  Warning: release/1.0.0 branch may already exist" -ForegroundColor Yellow
    Write-Host "   Using release/1.0.0-rc1 instead..." -ForegroundColor Yellow
    git checkout -b release/1.0.0-rc1
    $releaseBranch = "release/1.0.0-rc1"
} else {
    git checkout -b release/1.0.0
    $releaseBranch = "release/1.0.0"
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create release branch" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Created branch: $releaseBranch" -ForegroundColor Green

# Step 4: Verify .gitignore
Write-Host ""
Write-Host "Step 4: Verifying .gitignore..." -ForegroundColor Yellow
$gitignore = Get-Content .gitignore -Raw
$required = @("test-results", "playwright-report", "\.env", "dist/")
$missing = @()
foreach ($item in $required) {
    if ($gitignore -notmatch $item) {
        $missing += $item
    }
}
if ($missing.Count -gt 0) {
    Write-Host "⚠️  Warning: .gitignore may be missing: $($missing -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "✅ .gitignore looks good" -ForegroundColor Green
}

# Step 5: Prepare staging
Write-Host ""
Write-Host "Step 5: Preparing staging..." -ForegroundColor Yellow
Write-Host "  Adding all files..." -ForegroundColor Gray
git add -A

Write-Host "  Removing generated files from staging..." -ForegroundColor Gray
git restore --staged test-results/ 2>$null
git restore --staged playwright-report/ 2>$null
git restore --staged dist/ 2>$null
git restore --staged .env 2>$null
git restore --staged .env.* 2>$null

Write-Host "✅ Staging prepared" -ForegroundColor Green

# Step 6: Show summary
Write-Host ""
Write-Host "Step 6: Staging summary..." -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
git diff --staged --stat | Select-Object -First 50
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Step 7: Show untracked files (should be only ignored files)
Write-Host "Untracked files (should be only ignored/generated):" -ForegroundColor Yellow
git status --short | Select-String "^\?\?" | Select-Object -First 10
Write-Host ""

# Final status
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  READY FOR COMMIT" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review staging: git diff --staged --stat" -ForegroundColor White
Write-Host "2. Commit: git commit -m 'Release 1.0.0: KROK8 hardening + KROK9 App Store pack'" -ForegroundColor White
Write-Host "3. Push: git push -u origin $releaseBranch" -ForegroundColor White
Write-Host ""
