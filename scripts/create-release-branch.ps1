# Create Release Branch Script (FE)
# Usage: .\scripts\create-release-branch.ps1

param(
    [string]$Version = "1.0.0"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CREATE RELEASE BRANCH - FRONTEND" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Not in dreamhubb-FE directory" -ForegroundColor Red
    exit 1
}

# Step 1: Verify current branch
Write-Host "Step 1: Verifying current branch..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
if ($currentBranch -ne "fix/location-onboarding") {
    Write-Host "⚠️  Warning: Not on fix/location-onboarding (current: $currentBranch)" -ForegroundColor Yellow
    Write-Host "   Continuing anyway..." -ForegroundColor Yellow
} else {
    Write-Host "✅ On branch: fix/location-onboarding" -ForegroundColor Green
}

# Step 2: Verify clean status
Write-Host ""
Write-Host "Step 2: Verifying clean status..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "⚠️  Warning: Working directory not clean:" -ForegroundColor Yellow
    Write-Host $status -ForegroundColor Gray
    Write-Host "   Continuing anyway..." -ForegroundColor Yellow
} else {
    Write-Host "✅ Working directory is clean" -ForegroundColor Green
}

# Step 3: Pull latest
Write-Host ""
Write-Host "Step 3: Pulling latest changes..." -ForegroundColor Yellow
git pull origin fix/location-onboarding
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: git pull failed (may be offline or no remote)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Pulled latest changes" -ForegroundColor Green
}

# Step 4: Check if release branch exists
Write-Host ""
Write-Host "Step 4: Checking for existing release branch..." -ForegroundColor Yellow
$releaseBranch = "release/$Version"
$branchExists = git branch -a | Select-String "release/$Version"

if ($branchExists) {
    Write-Host "⚠️  Release branch $releaseBranch already exists" -ForegroundColor Yellow
    Write-Host "   Checking out existing branch..." -ForegroundColor Yellow
    git checkout $releaseBranch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to checkout existing branch" -ForegroundColor Red
        exit 1
    }
    git pull origin $releaseBranch
    Write-Host "✅ Checked out existing branch: $releaseBranch" -ForegroundColor Green
} else {
    Write-Host "   Creating new branch: $releaseBranch" -ForegroundColor Yellow
    git checkout -b $releaseBranch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create release branch" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Created branch: $releaseBranch" -ForegroundColor Green
}

# Step 5: Verify branch
Write-Host ""
Write-Host "Step 5: Verifying branch..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
if ($currentBranch -eq $releaseBranch) {
    Write-Host "✅ On branch: $releaseBranch" -ForegroundColor Green
} else {
    Write-Host "❌ Error: Not on expected branch (current: $currentBranch, expected: $releaseBranch)" -ForegroundColor Red
    exit 1
}

# Step 6: Push and set upstream
Write-Host ""
Write-Host "Step 6: Pushing to origin and setting upstream..." -ForegroundColor Yellow
git push -u origin $releaseBranch
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: git push failed (may be offline or no remote)" -ForegroundColor Yellow
    Write-Host "   You can push manually later with: git push -u origin $releaseBranch" -ForegroundColor Yellow
} else {
    Write-Host "✅ Pushed to origin and set upstream" -ForegroundColor Green
}

# Final status
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RELEASE BRANCH READY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Branch: $releaseBranch" -ForegroundColor White
Write-Host "Remote: origin/$releaseBranch" -ForegroundColor White
Write-Host ""
