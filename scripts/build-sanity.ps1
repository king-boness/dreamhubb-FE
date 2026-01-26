# Build Sanity Check Script (FE)
# Usage: .\scripts\build-sanity.ps1

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  BUILD SANITY CHECK - FRONTEND" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Not in dreamhubb-FE directory" -ForegroundColor Red
    exit 1
}

$errors = 0

# Step 1: npm ci
Write-Host "Step 1: Running npm ci..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm ci failed" -ForegroundColor Red
    $errors++
} else {
    Write-Host "✅ npm ci completed" -ForegroundColor Green
}

# Step 2: npm run lint
Write-Host ""
Write-Host "Step 2: Running npm run lint..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Lint warnings/errors found (non-blocking)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Lint passed" -ForegroundColor Green
}

# Step 3: npm run build
Write-Host ""
Write-Host "Step 3: Running npm run build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    $errors++
} else {
    Write-Host "✅ Build completed" -ForegroundColor Green
}

# Final status
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "  BUILD SANITY CHECK PASSED" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "  BUILD SANITY CHECK FAILED" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Cyan
    exit 1
}
