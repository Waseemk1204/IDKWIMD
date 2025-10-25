# Testing Guide - Blockchain Integration

## 🧪 Complete End-to-End Testing Flow

This guide walks you through testing the complete blockchain payment flow from job creation to payment release.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] MongoDB running (local or cloud)
- [ ] MetaMask wallet installed in browser
- [ ] Base Sepolia testnet ETH (from [faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- [ ] Backend dependencies installed: `cd backend && npm install`
- [ ] Frontend dependencies installed: `npm install`
- [ ] Environment variables configured (see below)

## Environment Configuration

### Backend `.env`
```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/parttimepay
# or for cloud: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parttimepay

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Session
SESSION_SECRET=your_session_secret_change_this

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Blockchain (Base Testnet)
BASE_TESTNET_RPC=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=your_metamask_private_key_here
ESCROW_CONTRACT_ADDRESS=deployed_contract_address_after_deployment
USDC_CONTRACT_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Razorpay (for testing traditional payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend `.env`
```bash
VITE_API_URL=http://localhost:5000/api/v1
```

## Step-by-Step Testing

### Phase 1: Smart Contract Deployment

#### 1.1 Deploy JobEscrow Contract

**Option A: Using Remix IDE (Recommended for beginners)**

1. Go to https://remix.ethereum.org/
2. Create new file: `JobEscrow.sol`
3. Copy contract code from `backend/contracts/JobEscrow.sol`
4. Select compiler version: `0.8.20+`
5. Click "Compile JobEscrow.sol"
6. Go to "Deploy & Run Transactions" tab
7. Select "Injected Provider - MetaMask"
8. Ensure MetaMask is on **Base Sepolia** network
9. Constructor parameter: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
10. Click "Deploy"
11. Confirm transaction in MetaMask
12. Copy deployed contract address from Remix console

**Option B: Using Hardhat (For advanced users)**

```bash
cd backend/contracts
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
# Edit hardhat.config.js to add Base Sepolia network
npx hardhat run scripts/deploy.js --network baseSepolia
```

#### 1.2 Update Environment Variables

```bash
# Update backend/.env
ESCROW_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

### Phase 2: Server Setup

#### 2.1 Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
✅ Blockchain service initialized
🚀 Server running on port 5000
🗄️  MongoDB connected successfully
```

#### 2.2 Start Frontend

```bash
# Open new terminal
npm run dev
```

Expected output:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Phase 3: User Accounts Setup

#### 3.1 Create Employer Account

1. Go to http://localhost:5173/register
2. Select "Employer" role
3. Fill in details:
   - Name: Test Employer
   - Email: employer@test.com
   - Password: Test1234!
4. Click "Sign Up"
5. Navigate to Employer Dashboard

#### 3.2 Create Employee Account

1. Open **Incognito/Private browsing** window
2. Go to http://localhost:5173/register
3. Select "Employee" role
4. Fill in details:
   - Name: Test Employee
   - Email: employee@test.com
   - Password: Test1234!
5. Click "Sign Up"
6. Navigate to Employee Dashboard

### Phase 4: Employer Workflow - Crypto Job Creation

#### 4.1 Connect Wallet (Employer)

1. In employer window, go to Dashboard
2. Click "Connect MetaMask" in Wallet Status Widget
3. Approve connection in MetaMask
4. Verify wallet address displays correctly

#### 4.2 Get Testnet USDC (Optional for full test)

If you need test USDC for the actual payment test:
```
Contact Base team or use USDC faucet (TBD)
```

#### 4.3 Post Job with Crypto Payment

1. Go to **Post Job** page
2. Fill in job details:
   - Title: "Full Stack Developer"
   - Description: "Need React + Node.js developer"
   - Company: "Tech Corp"
   - Location: "Remote"
   - Min Hourly Rate: $20
   - Max Hourly Rate: $25
   - Hours per week: 20
   - Duration: "3 months"
   - Skills: "React, Node.js, TypeScript"
   - Category: "Technology"

3. **Payment Method**: Select "🔗 Crypto Escrow (USDC on Base)"
4. Notice the calculated weekly USDC: ~500 USDC/week (25 × 20)
5. Click "Post Job"
6. Verify job created successfully

### Phase 5: Employee Workflow - Apply & Timesheet

#### 5.1 Connect Wallet (Employee)

1. In employee window (incognito), go to Dashboard
2. Click "Connect MetaMask"
3. **Important**: Use a DIFFERENT MetaMask account than employer
4. Approve connection

#### 5.2 Apply for Job

1. Go to **Jobs** page
2. Find "Full Stack Developer" job
3. Notice 🔗 Crypto badge
4. Click "Apply Now"
5. Fill application form
6. Submit application

#### 5.3 Approve Application (Employer)

Switch to employer window:
1. Go to **Jobs** → **Manage Jobs**
2. Click on "Full Stack Developer"
3. See pending application
4. Click "Approve" (or implement approval flow if not present)

#### 5.4 Submit Timesheet (Employee)

Switch to employee window:
1. Go to **Timesheet Submission**
2. Select job: "Full Stack Developer - Tech Corp 🔗"
3. Week number: 1
4. Hours worked: 18
5. Description: "Implemented authentication system and dashboard components"
6. Click "Submit Timesheet"
7. Verify timesheet shows "Pending" status

### Phase 6: Payment Release Flow

#### 6.1 Review Timesheet (Employer)

Switch to employer window:
1. Go to **Timesheet Approval**
2. See pending timesheet with:
   - Employee name
   - Hours: 18
   - Week: 1
   - 🔗 Crypto badge
   - Payment amount: 500 USDC

#### 6.2 Approve & Release Payment

**Note**: This step requires funded escrow. For full test:

1. Click "Approve & Release USDC"
2. MetaMask popup appears
3. Review transaction details
4. Confirm transaction
5. Wait for blockchain confirmation (~5-10 seconds)
6. Toast notification: "✅ Timesheet approved! USDC payment released..."

**For testing without USDC**:
- Backend will still create the approval record
- Transaction will fail with "insufficient funds" error
- You can verify all other logic works correctly

#### 6.3 Verify Payment (Employee)

Switch to employee window:
1. Go to **Timesheet Submission**
2. Refresh page
3. Timesheet status: "Approved" ✅
4. See transaction hash link
5. Click "View on BaseScan"
6. Verify transaction on blockchain explorer

### Phase 7: Razorpay Comparison Test

#### 7.1 Post Job with Razorpay

Employer:
1. Go to **Post Job**
2. Fill similar details
3. **Payment Method**: Select "💰 Razorpay Wallet"
4. Submit job
5. Verify no blockchain interaction required

#### 7.2 Submit Timesheet for Razorpay Job

Employee:
1. Submit timesheet for Razorpay job
2. Notice no wallet connection requirement

#### 7.3 Approve Razorpay Timesheet

Employer:
1. Approve timesheet
2. Notice no MetaMask popup
3. Payment processes through internal wallet system

## Expected Results

### ✅ Success Criteria

- [ ] Smart contract deploys successfully
- [ ] Backend server starts without errors
- [ ] Frontend connects to backend
- [ ] Employer can create crypto job
- [ ] Payment method selector shows both options
- [ ] Employee can connect wallet
- [ ] Employee can apply to crypto job
- [ ] Employee can submit timesheet
- [ ] Employer sees pending timesheet
- [ ] Approval triggers blockchain transaction (if funded)
- [ ] Transaction hash saved to database
- [ ] Both payment methods coexist without conflicts

### 🔍 Verification Points

1. **Database Check** (MongoDB Compass or CLI):
```javascript
// Check Job document
db.jobs.findOne({ title: "Full Stack Developer" })
// Should have: paymentMethod: "crypto", weeklyUSDCAmount: 500

// Check Timesheet document
db.timesheets.findOne({ weekNumber: 1 })
// Should have: status: "approved", blockchainTxHash: "0x..."
```

2. **Browser Console** (DevTools):
- No React errors
- Wallet connection logs show
- API calls return 200 status

3. **Backend Logs**:
```
✅ Blockchain service initialized
POST /api/v1/timesheets/approve/:id
🔗 Approving timesheet on-chain...
✅ Payment released: 0x...
```

4. **BaseScan Verification**:
- Visit: https://sepolia.basescan.org/tx/YOUR_TX_HASH
- Status: Success ✅
- From: Escrow Contract
- To: Employee Wallet
- Value: 500 USDC

## Troubleshooting

### Issue: "Blockchain not configured"

**Solution**:
```bash
# Check backend/.env has:
DEPLOYER_PRIVATE_KEY=0x...
ESCROW_CONTRACT_ADDRESS=0x...
```

### Issue: MetaMask not connecting

**Solution**:
1. Refresh page
2. Check you're on Base Sepolia network
3. Clear browser cache
4. Try different browser

### Issue: Transaction fails with "insufficient funds"

**Solution**:
1. Check deployer wallet has ETH for gas
2. For actual payment test, ensure escrow is funded with USDC
3. For code testing, failure is expected - verify error handling works

### Issue: "Wrong network" error

**Solution**:
Add Base Sepolia to MetaMask:
- Network Name: Base Sepolia
- RPC URL: https://sepolia.base.org
- Chain ID: 84532
- Currency: ETH
- Block Explorer: https://sepolia.basescan.org

### Issue: Jobs don't show crypto badge

**Solution**:
- Check `paymentMethod` field in database
- Verify Job model update was applied
- Restart backend server

## Performance Metrics

Expected timings:
- Smart contract deployment: ~30 seconds
- Job creation: <2 seconds
- Timesheet submission: <1 second
- Blockchain payment approval: ~10-15 seconds
- Database query: <100ms

## Security Checklist

Before production deployment:

- [ ] Rotate all private keys
- [ ] Use environment variables (never commit `.env`)
- [ ] Enable HTTPS for frontend
- [ ] Add rate limiting to API endpoints
- [ ] Audit smart contract (external security firm)
- [ ] Test with real USDC on testnet
- [ ] Implement transaction monitoring
- [ ] Add error tracking (Sentry)
- [ ] Set up blockchain event listeners
- [ ] Test edge cases (rejected timesheets, refunds)

## Next Steps After Testing

1. **Deploy to Staging**:
   - Use Base Sepolia for staging
   - Test with real users
   - Monitor gas costs

2. **Production Deployment**:
   - Deploy contract to Base Mainnet
   - Use real USDC (0x... on Base mainnet)
   - Update RPC endpoint
   - Set up monitoring and alerts

3. **User Onboarding**:
   - Create video tutorials
   - Add in-app wallet setup guide
   - Provide USDC purchase instructions
   - Set up customer support

---

**Testing Complete! 🎉**

If all tests pass, your blockchain integration is working correctly. The platform now supports dual payment methods with secure on-chain escrow for crypto jobs!


