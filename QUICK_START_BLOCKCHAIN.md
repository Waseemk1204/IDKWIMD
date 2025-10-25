# 🚀 Quick Start - Blockchain Integration

## TL;DR - Get Running in 5 Minutes

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
```

### 2. Configure Environment

Create `backend/.env`:
```bash
# Copy from backend/env.example
cp backend/env.example backend/.env

# Edit backend/.env - REQUIRED FIELDS:
MONGODB_URI=mongodb://localhost:27017/parttimepay
JWT_SECRET=your_secret_key_here
SESSION_SECRET=your_session_secret_here
PORT=5000
FRONTEND_URL=http://localhost:5173

# Blockchain (add after contract deployment)
BASE_TESTNET_RPC=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=your_metamask_private_key
ESCROW_CONTRACT_ADDRESS=deployed_contract_address
USDC_CONTRACT_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

Create `.env` (frontend):
```bash
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Deploy Smart Contract

**Quick Deploy with Remix:**
1. Go to https://remix.ethereum.org/
2. Create `JobEscrow.sol` → paste code from `backend/contracts/JobEscrow.sol`
3. Compile (v0.8.20+)
4. Deploy with MetaMask on **Base Sepolia**
5. Constructor param: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
6. Copy deployed address → update `ESCROW_CONTRACT_ADDRESS` in backend/.env

### 4. Start Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend (new terminal)
npm run dev
```

### 5. Test the Integration

1. **Open**: http://localhost:5173
2. **Register** employer account
3. **Post Job** → Select "Crypto Escrow"
4. **Connect MetaMask** when prompted
5. **Success!** You can now create blockchain-secured jobs

## What You Get

✅ **Dual Payment System**: Razorpay (INR) + Crypto (USDC on Base)  
✅ **Smart Contract Escrow**: Secure weekly payments  
✅ **Wallet Integration**: MetaMask connection  
✅ **Timesheet System**: Submit → Approve → Auto-pay  
✅ **On-chain Verification**: All payments transparent  

## File Structure (What Was Added)

```
backend/
├── contracts/
│   ├── JobEscrow.sol          # ⭐ Smart contract
│   └── deploy.js              # Deployment script
├── src/
│   ├── models/
│   │   ├── Job.ts             # ✏️ Updated with crypto fields
│   │   ├── Timesheet.ts       # ⭐ NEW model
│   │   └── Transaction.ts     # ✏️ Updated with blockchain fields
│   ├── services/
│   │   └── blockchainService.ts  # ⭐ Blockchain interactions
│   ├── controllers/
│   │   └── timesheetController.ts # ⭐ Timesheet CRUD
│   ├── routes/
│   │   └── timesheetRoutes.ts  # ⭐ API routes
│   └── config/
│       └── index.ts           # ✏️ Added blockchain config

src/
├── config/
│   └── wagmi.ts               # ⭐ Web3 config
├── components/
│   ├── Web3Provider.tsx       # ⭐ Web3 wrapper
│   └── blockchain/
│       ├── WalletConnectButton.tsx  # ⭐ Wallet UI
│       └── WalletStatusWidget.tsx   # ⭐ Dashboard widget
├── hooks/
│   └── useWalletConnect.tsx   # ⭐ Wallet hook
└── pages/
    ├── employer/
    │   ├── PostJob.tsx        # ✏️ Added payment selector
    │   ├── TimesheetApproval.tsx # ✏️ Full blockchain integration
    │   └── Dashboard.tsx      # ✏️ Added wallet widget
    └── employee/
        ├── TimesheetSubmission.tsx # ✏️ Full integration
        └── Dashboard.tsx      # ✏️ Added wallet widget

Root/
├── BLOCKCHAIN_INTEGRATION_GUIDE.md  # 📖 Full guide
├── TESTING_GUIDE.md                 # 🧪 Testing steps
└── QUICK_START_BLOCKCHAIN.md        # 🚀 This file
```

## Common Commands

```bash
# Start backend dev server
cd backend && npm run dev

# Start frontend dev server  
npm run dev

# Install all dependencies
npm install && cd backend && npm install && cd ..

# Check backend logs for blockchain status
# Look for: "✅ Blockchain service initialized"
```

## Key Features Implemented

### For Employers
- ✅ Choose payment method per job (Crypto or Razorpay)
- ✅ Connect MetaMask wallet
- ✅ Fund jobs with USDC on Base
- ✅ Approve timesheets → auto-release payment
- ✅ View on-chain transaction hashes
- ✅ Wallet status on dashboard

### For Employees
- ✅ Connect wallet to receive crypto payments
- ✅ Submit weekly timesheets
- ✅ See payment method badge (🔗 Crypto or 💰 Razorpay)
- ✅ Receive USDC directly to wallet
- ✅ Track payment history with blockchain links
- ✅ Wallet status widget

## Important Notes

⚠️ **This is testnet implementation** - uses Base Sepolia  
⚠️ **Get testnet ETH** from https://www.coinbase.com/faucets  
⚠️ **Private keys** - Never commit `.env` files  
⚠️ **Both systems work** - Razorpay and crypto coexist  

## Need Help?

- 📖 **Full Guide**: See `BLOCKCHAIN_INTEGRATION_GUIDE.md`
- 🧪 **Testing**: See `TESTING_GUIDE.md`
- 🐛 **Troubleshooting**: Check "Troubleshooting" section in testing guide
- 🔗 **Base Docs**: https://docs.base.org/

## Next Steps

1. ✅ You've completed the integration!
2. 📝 Follow `TESTING_GUIDE.md` for end-to-end testing
3. 🚀 Deploy smart contract to Base Sepolia
4. 🧪 Test with real users
5. 🎯 Go to production on Base Mainnet

---

**Ready for Base Builds hackathon! 🎉**


