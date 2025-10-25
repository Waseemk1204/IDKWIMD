# Automated Local Testing Script for Blockchain Integration
# Run this before deploying to GitHub

Write-Host ""
Write-Host "Testing Pre-Deployment Setup..." -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0

# Test 1: File Existence
Write-Host "Test 1: Verifying all blockchain files exist..." -ForegroundColor Yellow
$requiredFiles = @(
    "backend\contracts\JobEscrow.sol",
    "backend\src\models\Timesheet.ts",
    "backend\src\services\blockchainService.ts",
    "backend\src\controllers\timesheetController.ts",
    "src\config\wagmi.ts",
    "src\components\Web3Provider.tsx",
    "src\hooks\useWalletConnect.tsx"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "  Missing: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host "  PASS: All blockchain files present" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  FAIL: Some files missing" -ForegroundColor Red
    $testsFailed++
}

# Test 2: Package.json Updates
Write-Host ""
Write-Host "Test 2: Verifying package.json updates..." -ForegroundColor Yellow

try {
    $backendPackage = Get-Content "backend\package.json" -Raw | ConvertFrom-Json
    if ($backendPackage.dependencies.ethers) {
        Write-Host "  PASS: Backend ethers.js added" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL: Backend ethers.js missing" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  ERROR: Could not read backend package.json" -ForegroundColor Red
    $testsFailed++
}

try {
    $frontendPackage = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($frontendPackage.dependencies.wagmi -and $frontendPackage.dependencies.viem) {
        Write-Host "  PASS: Frontend Web3 dependencies added" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL: Frontend Web3 dependencies missing" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  ERROR: Could not read frontend package.json" -ForegroundColor Red
    $testsFailed++
}

# Test 3: Documentation
Write-Host ""
Write-Host "Test 3: Checking documentation..." -ForegroundColor Yellow
$docFiles = @(
    "BLOCKCHAIN_INTEGRATION_GUIDE.md",
    "TESTING_GUIDE.md",
    "QUICK_START_BLOCKCHAIN.md"
)

$allDocsExist = $true
foreach ($doc in $docFiles) {
    if (-not (Test-Path $doc)) {
        $allDocsExist = $false
    }
}

if ($allDocsExist) {
    Write-Host "  PASS: All documentation files present" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  FAIL: Some documentation missing" -ForegroundColor Red
    $testsFailed++
}

# Test 4: README Update
Write-Host ""
Write-Host "Test 4: Checking README updates..." -ForegroundColor Yellow
$readmeContent = Get-Content "README.md" -Raw

if ($readmeContent -match "Blockchain Integration") {
    Write-Host "  PASS: README.md updated with blockchain info" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  FAIL: README.md not updated" -ForegroundColor Red
    $testsFailed++
}

# Summary
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host "============================================================" -ForegroundColor Cyan

if ($testsFailed -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: All tests passed! Ready to deploy!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: npm install" -ForegroundColor White
    Write-Host "  2. Run: cd backend && npm install" -ForegroundColor White
    Write-Host "  3. Test locally with both servers running" -ForegroundColor White
    Write-Host "  4. Deploy smart contract via Remix" -ForegroundColor White
    Write-Host "  5. Commit and push to GitHub" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host ""
    Write-Host "ATTENTION: Some tests failed. Please review before deploying." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "See PRE_DEPLOYMENT_CHECKLIST.md for detailed steps." -ForegroundColor White
    Write-Host ""
    exit 1
}
