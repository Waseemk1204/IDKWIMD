import { ethers } from 'ethers';
import { config } from '../config';

const ESCROW_ABI = [
  "function createJob(string memory jobId, address freelancer, uint256 weeklyAmount) external",
  "function fundWeek(string memory jobId, uint256 weekNumber) external",
  "function approveTimesheet(string memory jobId, uint256 weekNumber) external",
  "function getJobStatus(string memory jobId) external view returns (address, address, uint256, uint256, bool, uint256)",
  "function isWeekFunded(string memory jobId, uint256 weekNumber) external view returns (bool, uint256)"
];

class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private escrowContract: ethers.Contract | null = null;

  constructor() {
    try {
      const rpcUrl = config.BASE_TESTNET_RPC;
      const privateKey = config.DEPLOYER_PRIVATE_KEY;
      const escrowAddress = config.ESCROW_CONTRACT_ADDRESS;

      if (!privateKey || !escrowAddress) {
        console.warn('  Blockchain configuration incomplete. Crypto payments disabled.');
        return;
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.escrowContract = new ethers.Contract(escrowAddress, ESCROW_ABI, this.wallet);
      console.log(' Blockchain service initialized');
    } catch (error) {
      console.error(' Blockchain service initialization failed:', error);
    }
  }

  async createJobOnChain(jobId: string, freelancerWallet: string, weeklyAmount: number): Promise<string> {
    if (!this.escrowContract) throw new Error('Blockchain not configured');
    const amountInWei = ethers.parseUnits(weeklyAmount.toString(), 6);
    const tx = await this.escrowContract.createJob(jobId, freelancerWallet, amountInWei);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async fundJobWeek(jobId: string, weekNumber: number): Promise<string> {
    if (!this.escrowContract) throw new Error('Blockchain not configured');
    const tx = await this.escrowContract.fundWeek(jobId, weekNumber);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async approveTimesheetOnChain(jobId: string, weekNumber: number): Promise<string> {
    if (!this.escrowContract) throw new Error('Blockchain not configured');
    const tx = await this.escrowContract.approveTimesheet(jobId, weekNumber);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async getJobBlockchainStatus(jobId: string): Promise<any> {
    if (!this.escrowContract) throw new Error('Blockchain not configured');
    const [employer, freelancer, weeklyAmount, currentWeek, isActive, createdAt] = await this.escrowContract.getJobStatus(jobId);
    return { employer, freelancer, weeklyAmount: ethers.formatUnits(weeklyAmount, 6), currentWeek: Number(currentWeek), isActive, createdAt: Number(createdAt) };
  }

  async isWeekFunded(jobId: string, weekNumber: number): Promise<{ funded: boolean; amount: string }> {
    if (!this.escrowContract) throw new Error('Blockchain not configured');
    const [funded, amount] = await this.escrowContract.isWeekFunded(jobId, weekNumber);
    return { funded, amount: ethers.formatUnits(amount, 6) };
  }
}

export default new BlockchainService();