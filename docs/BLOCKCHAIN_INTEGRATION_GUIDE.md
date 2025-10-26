# Blockchain Integration Guide - Base Sepolia Escrow

## 🚀 Overview

This platform now supports **dual payment methods**:
1. **Crypto Escrow** (USDC on Base Sepolia) - Blockchain-secured weekly payments
2. **Razorpay Wallet** (INR) - Traditional payment system

## 📋 Prerequisites

### Required Accounts & Tools
- **MetaMask Wallet** ([Download](https://metamask.io/download/))
- **Base Sepolia Testnet ETH** ([Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- **Base Sepolia USDC** (Testnet faucet TBD)
- **Node.js 18+** and **npm**

### Environment Setup

#### Backend `.env` Configuration
```bash
# Blockchain Configuration (Base Testnet)
BASE_TESTNET_RPC=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=your_private_key_here
ESCROW_CONTRACT_ADDRESS=deployed_contract_address
USDC_CONTRACT_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

## 🔧 Smart Contract Deployment

### Step 1: Get Testnet ETH
1. Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Connect your MetaMask wallet
3. Request testnet ETH for gas fees

### Step 2: Deploy JobEscrow Contract
```bash
# Option A: Using Remix IDE (Recommended)
1. Go to https://remix.ethereum.org/
2. Create new file: JobEscrow.sol
3. Copy contract code from backend/contracts/JobEscrow.sol
4. Compile with Solidity 0.8.20+
5. Deploy using "Injected Provider - MetaMask"
6. Constructor parameter: 0x036CbD53842c5426634e7929541eC2318f3dCF7e (USDC address)
7. Confirm transaction in MetaMask
8. Copy deployed contract address

# Option B: Using Hardhat (Advanced)
cd backend/contracts
npm install --save-dev hardhat @nomiclabs/hardhat-ethers
npx hardhat compile
npx hardhat run scripts/deploy.js --network baseSepolia
```

### Step 3: Update Environment Variables
```bash
# Add the deployed contract address to backend/.env
ESCROW_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

### Step 4: Verify Contract (Optional)
```bash
# On BaseScan
https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS#code
```

## 💻 Installation & Setup

### Backend Dependencies
```bash
cd backend
npm install ethers@6
```

### Frontend Dependencies
```bash
cd ../
npm install wagmi viem @tanstack/react-query
```

### Start Development Servers
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd ../
npm run dev
```

## 🔑 How It Works

### For Employers

#### 1. Post Job with Crypto Payment
1. Go to **Post Job** page
2. Fill in job details
3. Select payment method: **🔗 Crypto Escrow (USDC on Base)**
4. System calculates weekly USDC amount (hourly rate × 20 hours)
5. Submit job

#### 2. Fund Weekly Escrow
1. Connect MetaMask wallet
2. Approve USDC spending (one-time)
3. Fund first week's escrow (e.g., 400 USDC for $20/hr job)
4. Transaction confirmed on Base Sepolia

#### 3. Approve Timesheets & Release Payment
1. Employee submits weekly timesheet
2. Review timesheet in **Timesheet Approval** dashboard
3. Click "Approve & Release Payment"
4. Smart contract automatically transfers USDC to freelancer
5. Transaction hash saved to database

### For Freelancers/Employees

#### 1. Connect Wallet
1. Go to **Dashboard**
2. Click "Connect MetaMask"
3. Approve wallet connection

#### 2. Submit Weekly Timesheet
1. Go to **Timesheet Submission** page
2. Select job (shows payment method badge)
3. Enter hours worked (max 20/week)
4. Add work description
5. Submit timesheet

#### 3. Receive Payment
1. Wait for employer approval
2. USDC automatically transferred to your wallet
3. View transaction on BaseScan

## 📁 File Structure

```
backend/
├── contracts/
│   ├── JobEscrow.sol          # Solidity escrow contract
│   └── deploy.js              # Deployment script
├── src/
│   ├── models/
│   │   ├── Job.ts             # Updated with blockchain fields
│   │   ├── Timesheet.ts       # NEW: Timesheet model
│   │   └── Transaction.ts     # Updated with blockchain fields
│   ├── services/
│   │   └── blockchainService.ts  # Blockchain interaction layer
│   ├── controllers/
│   │   └── timesheetController.ts # Timesheet CRUD operations
│   ├── routes/
│   │   └── timesheetRoutes.ts     # Timesheet API routes
│   └── config/
│       └── index.ts           # Blockchain config

src/
├── config/
│   └── wagmi.ts               # Wagmi configuration
├── components/
│   ├── Web3Provider.tsx       # Web3 wrapper
│   └── blockchain/
│       └── WalletConnectButton.tsx  # Wallet connection UI
├── hooks/
│   └── useWalletConnect.tsx   # Wallet connection hook
└── pages/
    └── employer/
        └── PostJob.tsx        # Updated with payment selector
```

## 🔗 Smart Contract Functions

### Core Functions

```solidity
// Create job on-chain
createJob(string jobId, address freelancer, uint256 weeklyAmount)

// Fund weekly escrow
fundWeek(string jobId, uint256 weekNumber)

// Approve timesheet and release payment
approveTimesheet(string jobId, uint256 weekNumber)

// View job status
getJobStatus(string jobId) returns (employer, freelancer, weeklyAmount, currentWeek, isActive, createdAt)

// Check if week is funded
isWeekFunded(string jobId, uint256 weekNumber) returns (bool, uint256)
```

### Events Emitted

```solidity
event JobCreated(string indexed jobId, address indexed employer, address indexed freelancer, uint256 weeklyAmount, uint256 timestamp);
event WeekFunded(string indexed jobId, uint256 weekNumber, uint256 amount, uint256 timestamp);
event TimesheetApproved(string indexed jobId, uint256 weekNumber, uint256 amount, uint256 timestamp);
event PaymentReleased(string indexed jobId, uint256 weekNumber, address indexed freelancer, uint256 amount, uint256 timestamp);
```

## 🧪 Testing Checklist

### End-to-End Test Flow

- [ ] **Contract Deployment**
  - [ ] Deploy to Base Sepolia
  - [ ] Verify contract on BaseScan
  - [ ] Update `.env` with contract address

- [ ] **Employer Flow**
  - [ ] Post job with "Crypto" payment method
  - [ ] Connect MetaMask wallet
  - [ ] Approve USDC spending
  - [ ] Fund first week's escrow
  - [ ] Verify transaction on BaseScan

- [ ] **Employee Flow**
  - [ ] Connect MetaMask wallet
  - [ ] Submit timesheet for crypto job
  - [ ] Verify timesheet shows "Pending" status

- [ ] **Approval & Payment**
  - [ ] Employer approves timesheet
  - [ ] Smart contract releases USDC
  - [ ] Employee receives payment
  - [ ] Transaction hash saved to database
  - [ ] Verify payment on BaseScan

- [ ] **Razorpay Compatibility**
  - [ ] Post job with "Razorpay" payment method
  - [ ] Verify existing Razorpay flow still works
  - [ ] No blockchain interactions for Razorpay jobs

## 🛡️ Security Considerations

1. **Private Key Management**
   - Never commit `.env` files
   - Use environment variables in production
   - Rotate keys regularly

2. **Smart Contract Security**
   - Only employer can approve timesheets
   - Cannot withdraw funds without approval
   - All wallet addresses validated
   - Reentrancy protection built-in

3. **Frontend Security**
   - Wallet signature verification
   - Transaction confirmation required
   - Network validation (Base Sepolia only)

## 🐛 Troubleshooting

### "Blockchain not configured" Error
**Solution**: Ensure `DEPLOYER_PRIVATE_KEY` and `ESCROW_CONTRACT_ADDRESS` are set in `backend/.env`

### MetaMask Not Connecting
**Solution**: 
1. Check you're on Base Sepolia network
2. Allow site connection in MetaMask
3. Refresh page and try again

### Transaction Failed
**Solution**:
1. Check wallet has enough ETH for gas
2. Verify USDC balance
3. Ensure USDC spending is approved

### Wrong Network
**Solution**: 
1. Open MetaMask
2. Switch to "Base Sepolia" network
3. If not available, add manually:
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.basescan.org

## 📚 Resources

- [Base Developer Docs](https://docs.base.org/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [MetaMask Integration Guide](https://docs.metamask.io/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

## 🎯 Next Steps

1. **Deploy Smart Contract** → Follow deployment guide above
2. **Test Locally** → Complete testing checklist
3. **Production Deployment** → Use mainnet USDC and Base mainnet
4. **Monitoring** → Set up event listeners for payment tracking
5. **Documentation** → Add user guides for employers/employees

---

**Need Help?** Check the troubleshooting section or contact the development team.


