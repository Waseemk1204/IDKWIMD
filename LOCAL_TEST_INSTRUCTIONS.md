# 🧪 Local Testing Instructions

## Step-by-Step Setup & Testing

Follow these steps to install dependencies and test the blockchain integration locally.

---

## Step 1: Install Frontend Dependencies

Open a **new Command Prompt** or **PowerShell** window:

```bash
# Navigate to project root
cd C:\Users\gohil\OneDrive\Desktop\IDKWIMD-main

# Install frontend dependencies
npm install
```

**Expected Output:**
```
added 3 packages, and audited XXX packages in XXs

✓ wagmi@2.12.0
✓ viem@2.21.0  
✓ @tanstack/react-query@5.56.0
```

**Verify:**
- [ ] No errors during installation
- [ ] `node_modules/wagmi` exists
- [ ] `node_modules/viem` exists

---

## Step 2: Install Backend Dependencies

In the same terminal:

```bash
# Navigate to backend
cd backend

# Install backend dependencies
npm install
```

**Expected Output:**
```
added 1 package, and audited XXX packages in XXs

✓ ethers@6.13.0
```

**Verify:**
- [ ] No errors during installation
- [ ] `backend/node_modules/ethers` exists

---

## Step 3: Setup Environment Variables

### Backend Environment

```bash
# Copy example file
copy env.example .env

# Edit .env file with your settings
notepad .env
```

**Required Settings in `backend/.env`:**
```env
# MongoDB (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/parttimepay

# JWT & Session (REQUIRED)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
SESSION_SECRET=your_session_secret_minimum_32_characters_long

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Blockchain (Optional for now - add after contract deployment)
BASE_TESTNET_RPC=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=
ESCROW_CONTRACT_ADDRESS=
USDC_CONTRACT_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

**Note:** You can leave blockchain vars empty for initial testing. The system will work with Razorpay only.

### Frontend Environment

```bash
# Return to project root
cd ..

# Create .env file
echo VITE_API_URL=http://localhost:5000/api/v1 > .env
```

---

## Step 4: Start MongoDB

**If using local MongoDB:**

```bash
# In a NEW Command Prompt window (as Administrator)
net start MongoDB
```

**If using MongoDB Atlas:**
- Update `MONGODB_URI` in `backend/.env` with your Atlas connection string

**Verify MongoDB is running:**
```bash
# Test connection
mongosh
# If connected, type: exit
```

---

## Step 5: Start Backend Server

**In a NEW terminal window:**

```bash
cd C:\Users\gohil\OneDrive\Desktop\IDKWIMD-main\backend

npm run dev
```

**Expected Output:**
```
[timestamp] 🚀 Server running on port 5000
[timestamp] 🗄️  MongoDB connected successfully
[timestamp] ⚠️  Blockchain configuration incomplete. Crypto payments disabled.
[timestamp] 📡 Socket.IO server ready
```

**What to Check:**

✅ **Success Indicators:**
- Server running on port 5000
- MongoDB connected
- No red error messages
- "Blockchain configuration incomplete" is EXPECTED (we haven't deployed contract yet)

❌ **Common Issues:**

**Issue: MongoDB connection failed**
```
Solution: 
1. Check MongoDB is running: net start MongoDB
2. Verify MONGODB_URI in .env is correct
3. Try: mongodb://127.0.0.1:27017/parttimepay
```

**Issue: Port 5000 already in use**
```
Solution:
1. Change PORT in backend/.env to 5001
2. Update VITE_API_URL in frontend .env to http://localhost:5001/api/v1
```

**Issue: JWT_SECRET error**
```
Solution:
1. Ensure JWT_SECRET is at least 32 characters long
2. Example: JWT_SECRET=my_super_secret_jwt_key_for_development_use_only_12345
```

---

## Step 6: Start Frontend Server

**In a NEW terminal window (keep backend running):**

```bash
cd C:\Users\gohil\OneDrive\Desktop\IDKWIMD-main

npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Verify:**
- [ ] Vite server starts successfully
- [ ] No compilation errors
- [ ] URL shown: http://localhost:5173/

---

## Step 7: Test in Browser

### Open Application

1. Open Chrome/Edge browser
2. Go to: **http://localhost:5173/**
3. Open DevTools: Press `F12`

### Check Console (F12 → Console Tab)

**Expected:** No red errors

**You may see:**
```
App component rendering...
App useEffect running...
✓ This is normal
```

**Red flags (should NOT appear):**
```
❌ Failed to fetch
❌ Cannot find module
❌ Uncaught Error
```

### Visual Check

✅ **Homepage should show:**
- Part-Time Pay$ header/logo
- Navigation menu
- Landing page content
- No blank screen
- No error messages

---

## Step 8: Test Blockchain UI Components

### Test 1: Check Payment Selector

1. **Register an Employer Account:**
   - Click "Sign Up" or go to: http://localhost:5173/register
   - Select "Employer" role
   - Fill details (use test@test.com)
   - Submit

2. **Navigate to Post Job:**
   - After login, go to "Post Job"
   - Scroll to "Payment Method" section

3. **Verify Payment Options:**
   ```
   ✓ Should see dropdown with:
     - 💰 Razorpay Wallet (INR) - Traditional Payment
     - 🔗 Crypto Escrow (USDC on Base) - Blockchain Secured
   ```

4. **Select Crypto Option:**
   ```
   ✓ Should see blue info box:
     - "Blockchain Payment Setup"
     - Instructions about MetaMask
     - Weekly USDC calculation
   ```

**Screenshot this if working!** 📸

### Test 2: Check Wallet Widget on Dashboard

1. **Go to Employer Dashboard:**
   - Navigate to `/employer/dashboard`

2. **Verify Wallet Widget:**
   ```
   ✓ Should see blue/green card:
     - "Crypto Payments Available" OR "Wallet Connected"
     - Connect Wallet button (if not connected)
     - MetaMask icon
     - "Powered by Base" text
   ```

### Test 3: Check Timesheet Pages

1. **Timesheet Approval Page:**
   - Go to `/employer/timesheets`
   - Should load without errors
   - Shows "No pending timesheets" (since we haven't created any)

2. **Timesheet Submission Page (Employee):**
   - Register an Employee account (use incognito window)
   - Go to `/employee/timesheets`
   - Should load without errors
   - Shows wallet connection option

---

## Step 9: Test API Endpoints

### Test Health Endpoint

Open a NEW terminal:

```bash
# Test health check
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-22T...",
  "environment": "development"
}
```

### Test Timesheet Routes Registered

```bash
# This should return 401 (unauthorized) - meaning route exists!
curl http://localhost:5000/api/v1/timesheets/pending
```

**Expected:**
```json
{"success":false,"message":"Unauthorized"...}
```

✅ This is GOOD! It means:
- Route is registered
- Authentication is working
- Just need to login first

---

## Step 10: Console Checks

### Backend Console

**Check for these logs:**
```
✅ Blockchain service initialized
   OR
⚠️  Blockchain configuration incomplete
```

Both are OK! The warning is expected until we deploy the contract.

**Should NOT see:**
```
❌ Error: Cannot find module 'ethers'
❌ TypeError: Cannot read property
❌ Unhandled promise rejection
```

### Frontend Console

**In browser DevTools Console, should see:**
```
App component rendering...
App useEffect running...
```

**Should NOT see:**
```
❌ Failed to compile
❌ Cannot resolve module 'wagmi'
❌ React error boundary
```

---

## Step 11: Network Tab Check

In browser DevTools (F12) → Network Tab:

1. Refresh page
2. Check requests

**Expected Requests:**
```
✓ http://localhost:5173/ → 200 OK
✓ /assets/index-xxx.js → 200 OK
✓ /assets/index-xxx.css → 200 OK
```

**If making API calls:**
```
✓ http://localhost:5000/api/v1/... → Should succeed or return proper error
```

---

## ✅ Success Criteria Checklist

### Installation
- [ ] Frontend `npm install` completed without errors
- [ ] Backend `npm install` completed without errors
- [ ] `node_modules/wagmi` exists
- [ ] `node_modules/ethers` exists (in backend)

### Environment
- [ ] `backend/.env` created with required vars
- [ ] MongoDB running and accessible
- [ ] Both `.env` files configured

### Servers
- [ ] Backend starts on port 5000
- [ ] Frontend starts on port 5173
- [ ] No compilation errors
- [ ] MongoDB connected successfully

### UI Testing
- [ ] Homepage loads correctly
- [ ] Can register employer account
- [ ] Payment method selector visible on Post Job page
- [ ] Both payment options (Crypto/Razorpay) appear
- [ ] Crypto option shows blockchain setup info
- [ ] Wallet widget appears on dashboard
- [ ] Timesheet pages load without errors

### API Testing
- [ ] Health endpoint responds correctly
- [ ] Timesheet routes registered
- [ ] No 500 errors in network tab

### Console
- [ ] Browser console: No red errors
- [ ] Backend console: Server running message
- [ ] Blockchain service initialized (or warning shown)

---

## 🎯 What This Proves

If all checks pass, you've verified:

1. ✅ **Dependencies Installed** - All Web3 libraries working
2. ✅ **Code Compiles** - TypeScript has no errors
3. ✅ **UI Integration** - React components render correctly
4. ✅ **Dual Payment System** - Both options visible and functional
5. ✅ **API Routes** - Backend endpoints registered
6. ✅ **Database** - MongoDB integration working
7. ✅ **Blockchain Ready** - Code ready for contract deployment

---

## 🐛 Troubleshooting

### Cannot connect to MongoDB

**Option 1: Use MongoDB Atlas (Cloud)**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `MONGODB_URI` in `backend/.env`

**Option 2: Fix Local MongoDB**
```bash
# Check if installed
mongod --version

# Start service
net start MongoDB

# If not installed, download from:
# https://www.mongodb.com/try/download/community
```

### Port conflicts

```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Build errors

```bash
# Clear caches and reinstall
rm -rf node_modules package-lock.json
npm install

# For backend too
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Expected Results Summary

### ✅ If Everything Works:

**Backend:**
```
✅ Server running on port 5000
✅ MongoDB connected
✅ Blockchain service message shown
✅ All routes registered
```

**Frontend:**
```
✅ Vite dev server running
✅ App loads at localhost:5173
✅ Payment selector works
✅ Wallet widgets visible
✅ No console errors
```

**Features Working:**
```
✅ Can register accounts
✅ Can navigate pages
✅ Payment method selector functional
✅ Both Crypto and Razorpay options available
✅ UI responsive and styled correctly
```

### 🎉 Ready for Next Steps:

Once all tests pass:
1. ✅ Code is working locally
2. ✅ Ready to deploy smart contract
3. ✅ Ready to commit to GitHub
4. ✅ Ready for full end-to-end testing with blockchain

---

## 📸 Screenshots to Take

For documentation/demo:
1. Backend console with "Server running" message
2. Frontend running at localhost:5173
3. Post Job page with payment method selector
4. Both payment options visible
5. Wallet widget on dashboard
6. Browser console showing no errors

---

## ⏭️ Next Steps After Local Testing

Once everything works locally:

1. **Deploy Smart Contract** (optional for now)
   - Use Remix IDE
   - Deploy to Base Sepolia
   - Update `ESCROW_CONTRACT_ADDRESS`

2. **Full End-to-End Test**
   - Follow `TESTING_GUIDE.md`
   - Test complete payment flow
   - Verify blockchain integration

3. **Commit to GitHub**
   - Review changes: `git status`
   - Stage files: `git add .`
   - Commit: `git commit -m "feat: blockchain integration"`
   - Push: `git push origin main`

---

**Good luck with testing! 🚀**

If you encounter any issues, check the troubleshooting section or refer to `PRE_DEPLOYMENT_CHECKLIST.md` for more detailed diagnostics.


