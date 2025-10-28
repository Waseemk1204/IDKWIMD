import express from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getWallet,
  getWalletTransactions,
  createTopUpOrder,
  verifyPayment,
  withdrawFunds,
  transferFunds,
  getWalletStats,
  testAddFunds
} from '../controllers/walletController';
import {
  validatePagination,
  validateWalletTopUp,
  validateWithdrawal,
  validateTransfer
} from '../utils/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Wallet routes
router.get('/', getWallet as any);
router.get('/transactions', validatePagination, getWalletTransactions as any);
router.get('/stats', getWalletStats as any);

// Payment routes
router.post('/topup', validateWalletTopUp, createTopUpOrder as any);
router.post('/verify-payment', verifyPayment as any);
router.post('/test-add-funds', testAddFunds as any); // For testing without Razorpay

// Transfer routes
router.post('/withdraw', validateWithdrawal, withdrawFunds as any);
router.post('/transfer', validateTransfer, transferFunds as any);

export default router;
