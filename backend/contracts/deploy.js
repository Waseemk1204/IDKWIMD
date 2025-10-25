const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function deployContract() {
  try {
    const rpcUrl = process.env.BASE_TESTNET_RPC || 'https://sepolia.base.org';
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const usdcAddress = process.env.USDC_CONTRACT_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
    if (!privateKey) { console.error('DEPLOYER_PRIVATE_KEY not set'); process.exit(1); }
    console.log(' Deploying JobEscrow contract to Base Sepolia...');
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(' Deployer address:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log(' Balance:', ethers.formatEther(balance), 'ETH');
    if (balance === 0n) { console.error(' Deployer wallet has no ETH. Get testnet ETH from https://www.coinbase.com/faucets/base-ethereum-goerli-faucet'); process.exit(1); }
    const contractPath = path.join(__dirname, 'JobEscrow.sol');
    const sourceCode = fs.readFileSync(contractPath, 'utf8');
    console.log('\\n Contract source loaded');
    console.log('  MANUAL DEPLOYMENT REQUIRED');
    console.log('\\n1. Go to https://remix.ethereum.org/');
    console.log('2. Create JobEscrow.sol with the contract code');
    console.log('3. Compile with Solidity 0.8.20+');
    console.log('4. Deploy using Injected Provider (MetaMask)');
    console.log('5. Use USDC address:', usdcAddress);
    console.log('6. Update ESCROW_CONTRACT_ADDRESS in .env');
    console.log('\\n Deployment guide ready');
  } catch (error) {
    console.error(' Deployment error:', error);
    process.exit(1);
  }
}
deployContract();
