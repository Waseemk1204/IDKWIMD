# 🧪 Pre-Deployment Testing Checklist

## ✅ Phase 1: Dependency Installation

### Backend
```bash
cd backend
npm install
```

**Expected Output:**
```
✓ Installed ethers@6.13.0
✓ Total packages installed: XX
✓ No vulnerabilities found (or fixable ones)
```

**Verify:**
- [ ] No installation errors
- [ ] `ethers` appears in `node_modules`
- [ ] No peer dependency warnings

### Frontend
```bash
cd ..
npm install
```

**Expected Output:**
```
✓ Installed wagmi@2.12.0
✓ Installed viem@2.21.0
✓ Installed @tanstack/react-query@5.56.0
✓ Total packages installed: XX
```

**Verify:**
- [ ] No installation errors
- [ ] `wagmi`, `viem`, `@tanstack/react-query` in `node_modules`
- [ ] No build warnings

---

## ✅ Phase 2: TypeScript Compilation

### Backend TypeScript Check
```bash
cd backend
npx tsc --noEmit
```

**Expected:** No compilation errors (type checking only)

**Verify:**
- [ ] All imports resolve correctly
- [ ] No type errors in blockchain files
- [ ] Mongoose models compile successfully

### Frontend TypeScript Check
```bash
cd ..
npx tsc --noEmit
```

**Expected:** No compilation errors

**Verify:**
- [ ] React components type correctly
- [ ] Wagmi hooks have proper types
- [ ] No JSX errors

---

## ✅ Phase 3: File Structure Verification

Run this command to verify all new files exist:

```bash
# Windows PowerShell
$files = @(
    "backend\contracts\JobEscrow.sol",
    "backend\contracts\deploy.js",
    "backend\src\models\Timesheet.ts",
    "backend\src\services\blockchainService.ts",
    "backend\src\controllers\timesheetController.ts",
    "backend\src\routes\timesheetRoutes.ts",
    "src\config\wagmi.ts",
    "src\components\Web3Provider.tsx",
    "src\hooks\useWalletConnect.tsx",
    "src\components\blockchain\WalletConnectButton.tsx",
    "src\components\blockchain\WalletStatusWidget.tsx",
    "BLOCKCHAIN_INTEGRATION_GUIDE.md",
    "TESTING_GUIDE.md",
    "QUICK_START_BLOCKCHAIN.md",
    "IMPLEMENTATION_SUMMARY.md"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file MISSING" -ForegroundColor Red
    }
}
```

**Verify:**
- [ ] All 16 new files exist
- [ ] All files have content (not empty)
- [ ] Smart contract has valid Solidity syntax

---

## ✅ Phase 4: Environment Configuration Test

### Create Test Environment Files

**Backend `.env`:**
```bash
cd backend
# If .env doesn't exist, create from example
Copy-Item env.example .env -ErrorAction SilentlyContinue

# Verify required vars are present
Select-String -Path .env -Pattern "BASE_TESTNET_RPC|ESCROW_CONTRACT_ADDRESS|USDC_CONTRACT_ADDRESS"
```

**Frontend `.env`:**
```bash
cd ..
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env
Get-Content .env
```

**Verify:**
- [ ] `backend/.env` exists with blockchain vars
- [ ] Frontend `.env` has VITE_API_URL
- [ ] No sensitive keys committed to git

---

## ✅ Phase 5: Code Quality Checks

### Check for Console Logs (Production)
```bash
# Find console.logs in new files (should remove before production)
Get-ChildItem -Recurse -Include *.ts,*.tsx | Select-String -Pattern "console\.(log|error|warn)" | Where-Object { $_.Line -notmatch "//.*console" }
```

**Verify:**
- [ ] No `console.log` in production code
- [ ] Only `console.error` for error handling

### Check for TODO Comments
```bash
# Find any TODOs in new blockchain files
Get-ChildItem backend\src\services\blockchainService.ts,backend\src\controllers\timesheetController.ts,src\components\blockchain\*.tsx | Select-String -Pattern "TODO|FIXME"
```

**Verify:**
- [ ] No critical TODOs left unresolved
- [ ] All placeholders replaced with real code

---

## ✅ Phase 6: Import/Export Verification

### Test Key Imports
Create a test file to verify exports work:

**`test-imports.js`:**
```javascript
// Test backend imports
const config = require('./backend/src/config');
console.log('✓ Backend config loads');

// Test blockchain service (will need compiled JS)
console.log('✓ Imports test passed');
```

Run:
```bash
node test-imports.js
```

**Verify:**
- [ ] No module not found errors
- [ ] Circular dependency warnings absent

---

## ✅ Phase 7: Database Schema Test

### Start MongoDB
```bash
# If using local MongoDB
net start MongoDB
# Check MongoDB is running
```

### Test Backend Startup
```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ Blockchain service initialized
🗄️  MongoDB connected successfully
🚀 Server running on port 5000
📡 Socket.IO server ready
```

**Verify:**
- [ ] Server starts without errors
- [ ] Blockchain service initializes (even without contract)
- [ ] MongoDB connection successful
- [ ] No deprecation warnings
- [ ] All routes registered (check for `/api/v1/timesheets`)

**Check in logs:**
```
✅ Blockchain service initialized
   OR
⚠️  Blockchain configuration incomplete. Crypto payments disabled.
```

Both are OK! Second one means contract not deployed yet.

### Test API Endpoints (Optional - needs auth)
```bash
# In new PowerShell window
curl http://localhost:5000/health

# Expected:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

**Verify:**
- [ ] Health endpoint responds
- [ ] No 500 errors in console

---

## ✅ Phase 8: Frontend Build Test

### Development Build
```bash
cd ..
npm run dev
```

**Expected Output:**
```
  VITE ready in XXX ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Verify:**
- [ ] Vite starts without errors
- [ ] No module resolution errors
- [ ] Wagmi providers load correctly
- [ ] Visit http://localhost:5173/ → app loads

### Production Build Test
```bash
npm run build
```

**Expected Output:**
```
vite v5.x.x building for production...
✓ XXX modules transformed.
dist/index.html                  X.XX kB
dist/assets/index-XXXXXXXX.js    XXX.XX kB │ gzip: XX.XX kB
✓ built in XXXms
```

**Verify:**
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] Bundle size reasonable (< 1MB for main chunk)
- [ ] All chunks generated

---

## ✅ Phase 9: Smart Contract Syntax Check

### Using Remix IDE
1. Go to https://remix.ethereum.org/
2. Create new file: `JobEscrow.sol`
3. Paste from `backend/contracts/JobEscrow.sol`
4. Select compiler: `0.8.20+`
5. Click "Compile JobEscrow.sol"

**Verify:**
- [ ] No compilation errors
- [ ] No warnings (or only minor ones)
- [ ] Contract ABI generated
- [ ] All functions visible in ABI

---

## ✅ Phase 10: Git Preparation

### Check Git Status
```bash
git status
```

**Verify:**
- [ ] `.env` files NOT staged (should be in `.gitignore`)
- [ ] `node_modules/` NOT staged
- [ ] Only source code files staged

### Verify .gitignore
```bash
cat .gitignore | Select-String -Pattern ".env|node_modules|dist"
```

**Verify:**
- [ ] `.env` in .gitignore
- [ ] `node_modules/` in .gitignore
- [ ] `dist/` in .gitignore

### Check for Sensitive Data
```bash
# Search for potential private keys or secrets in code
Get-ChildItem -Recurse -Include *.ts,*.tsx,*.js,*.json | Select-String -Pattern "0x[a-fA-F0-9]{64}|pk_|sk_|private"
```

**Verify:**
- [ ] No private keys in code
- [ ] No hardcoded secrets
- [ ] All sensitive data in .env

---

## ✅ Phase 11: Documentation Verification

### Check Documentation Files
```bash
Get-ChildItem *.md | Select-Object Name, Length
```

**Verify:**
- [ ] README.md updated with blockchain features
- [ ] BLOCKCHAIN_INTEGRATION_GUIDE.md exists (300+ lines)
- [ ] TESTING_GUIDE.md exists (400+ lines)
- [ ] QUICK_START_BLOCKCHAIN.md exists
- [ ] All links in docs work (no broken references)

### Test Quick Start Instructions
Follow `QUICK_START_BLOCKCHAIN.md` step by step:

**Verify:**
- [ ] Instructions are clear
- [ ] Commands work as documented
- [ ] No missing steps

---

## ✅ Phase 12: Final Integration Test

### Full Flow Simulation (Without Blockchain)

1. **Start Backend:**
```bash
cd backend
npm run dev
```
✓ Running on port 5000

2. **Start Frontend:**
```bash
# New terminal
npm run dev
```
✓ Running on port 5173

3. **Open Browser:**
- Visit: http://localhost:5173/
- Check browser console: No errors
- Check network tab: API calls work

4. **Test UI Components:**
- [ ] Homepage loads
- [ ] Can navigate to /register
- [ ] Can navigate to /login
- [ ] Payment selector visible on job posting
- [ ] Wallet widgets render on dashboards

### Check Browser Console
**Expected:** No React errors, no import errors

**Verify:**
- [ ] No red errors in console
- [ ] Wagmi provider initialized
- [ ] React Query provider initialized
- [ ] No hydration errors

---

## ✅ Phase 13: Performance Check

### Bundle Size Analysis
```bash
npm run build
ls -lh dist/assets/*.js
```

**Verify:**
- [ ] Main bundle < 500KB (gzipped)
- [ ] Vendor chunks properly split
- [ ] No duplicate dependencies

### Lighthouse Score (Optional)
1. Open http://localhost:5173/ in Chrome
2. Open DevTools → Lighthouse
3. Run audit (Desktop)

**Target Scores:**
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90

---

## ✅ Phase 14: Compatibility Check

### Browser Testing
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if on Mac)

**Verify:**
- [ ] App loads in all browsers
- [ ] MetaMask detection works
- [ ] No browser-specific errors

### Node Version Check
```bash
node --version
npm --version
```

**Required:**
- Node: v18.x or higher
- npm: v9.x or higher

---

## 🎯 Pre-Deployment Summary

### Critical Checks (Must Pass)
- [ ] Backend starts without errors
- [ ] Frontend builds successfully
- [ ] No TypeScript compilation errors
- [ ] Smart contract compiles in Remix
- [ ] `.env` files not committed to git
- [ ] All documentation files present
- [ ] No sensitive data in code

### Important Checks (Should Pass)
- [ ] No linter warnings in new files
- [ ] Bundle size reasonable
- [ ] All imports resolve
- [ ] Health endpoint works
- [ ] UI components render

### Optional Checks (Nice to Have)
- [ ] Lighthouse scores good
- [ ] No console.log statements
- [ ] All TODOs resolved
- [ ] Cross-browser compatible

---

## 🚀 Ready for GitHub?

If all **Critical Checks** pass, you're ready to:

1. **Commit Changes:**
```bash
git add .
git commit -m "feat: Add blockchain escrow payment system with Base integration

- Implement JobEscrow smart contract (Solidity)
- Add dual payment system (Crypto + Razorpay)
- Integrate Wagmi + Viem for Web3
- Create timesheet submission/approval flow
- Add wallet connection UI components
- Update dashboards with blockchain status
- Complete documentation and testing guides"
```

2. **Push to GitHub:**
```bash
git push origin main
```

3. **Create Release (Optional):**
- Tag: `v2.0.0-blockchain`
- Title: "Blockchain Escrow Integration - Base Builds Hackathon"
- Description: See IMPLEMENTATION_SUMMARY.md

---

## 🐛 If Tests Fail

### Backend won't start
1. Check MongoDB is running
2. Verify .env file exists
3. Run `npm install` again
4. Check for port 5000 conflicts

### Frontend build fails
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` fresh
3. Check for conflicting versions
4. Clear Vite cache: `rm -rf node_modules/.vite`

### TypeScript errors
1. Check tsconfig.json hasn't changed
2. Verify all imports use correct paths
3. Run `npx tsc --noEmit` for detailed errors

### Smart contract won't compile
1. Check Solidity version (0.8.20+)
2. Verify no syntax errors
3. Try in Remix IDE for better error messages

---

**Testing Complete!** 🎉

Ready to deploy to GitHub and start the hackathon submission!


