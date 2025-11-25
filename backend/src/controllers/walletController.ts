import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Wallet, IWallet } from '../models/Wallet';
import { Transaction, ITransaction } from '../models/Transaction';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: config.RAZORPAY_KEY_SECRET || 'rzp_test_secret'
});

// Get user's wallet
export const getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    let wallet = await Wallet.findOne({ userId, isActive: true });

    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = new Wallet({
        userId,
        balance: 0,
        currency: 'INR'
      });
      await wallet.save();
    }

    res.json({
      success: true,
      data: { wallet }
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet'
    });
  }
};

// Get wallet transactions
export const getWalletTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const userId = req.user._id;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { userId };
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('relatedJobId', 'title company')
      .populate('relatedApplicationId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalTransactions: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
};

// Create Razorpay order for wallet top-up
export const createTopUpOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    if (!amount || amount < 100) {
      res.status(400).json({
        success: false,
        message: 'Minimum top-up amount is ₹100'
      });
      return;
    }

    if (amount > 100000) {
      res.status(400).json({
        success: false,
        message: 'Maximum top-up amount is ₹1,00,000'
      });
      return;
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId, isActive: true });
    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: 0,
        currency: 'INR'
      });
      await wallet.save();
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `topup_${userId}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        walletId: wallet._id.toString(),
        type: 'wallet_topup'
      }
    };

    const order = await razorpay.orders.create(options);

    // Create pending transaction
    const transaction = new Transaction({
      userId,
      walletId: wallet._id,
      type: 'credit',
      amount,
      currency: 'INR',
      status: 'pending',
      description: `Wallet top-up of ₹${amount}`,
      razorpayOrderId: order.id,
      metadata: {
        orderDetails: order
      }
    });

    await transaction.save();

    res.json({
      success: true,
      data: {
        order,
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          status: transaction.status
        }
      }
    });
  } catch (error) {
    console.error('Create top-up order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create top-up order'
    });
  }
};

// Verify Razorpay payment and update wallet
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
      return;
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      razorpayOrderId: razorpay_order_id,
      userId,
      status: 'pending'
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
      return;
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', config.RAZORPAY_KEY_SECRET || 'rzp_test_secret')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Update transaction as failed
      transaction.status = 'failed';
      transaction.description += ' - Payment verification failed';
      await transaction.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
      return;
    }

    // Update transaction
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    transaction.status = 'completed';
    await transaction.save();

    // Update wallet balance
    const wallet = await Wallet.findById(transaction.walletId);
    if (wallet) {
      wallet.balance += transaction.amount;
      await wallet.save();
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        transaction,
        wallet: {
          balance: wallet?.balance || 0
        }
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

// Withdraw funds from wallet
export const withdrawFunds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, bankDetails } = req.body;
    const userId = req.user._id;

    if (!amount || amount < 100) {
      res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is ₹100'
      });
      return;
    }

    // Get wallet
    const wallet = await Wallet.findOne({ userId, isActive: true });
    if (!wallet) {
      res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
      return;
    }

    if (wallet.balance < amount) {
      res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
      return;
    }

    // Create withdrawal transaction
    const transaction = new Transaction({
      userId,
      walletId: wallet._id,
      type: 'withdrawal',
      amount,
      currency: 'INR',
      status: 'pending',
      description: `Withdrawal of ₹${amount} to bank account`,
      metadata: {
        bankDetails,
        withdrawalRequestedAt: new Date()
      }
    });

    await transaction.save();

    // Deduct from wallet balance
    wallet.balance -= amount;
    await wallet.save();

    // TODO: Integrate with bank transfer API (like Razorpay Payouts)
    // For now, we'll mark it as completed after a delay
    setTimeout(async () => {
      try {
        transaction.status = 'completed';
        transaction.description += ' - Processed successfully';
        await transaction.save();
      } catch (error) {
        console.error('Error updating withdrawal transaction:', error);
      }
    }, 5000); // 5 second delay for demo

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: {
        transaction,
        wallet: {
          balance: wallet.balance
        }
      }
    });
  } catch (error) {
    console.error('Withdraw funds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal'
    });
  }
};

// Transfer funds between users (for payments)
export const transferFunds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { recipientId, amount, description, relatedJobId, relatedApplicationId } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !amount || amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid transfer details'
      });
      return;
    }

    // Get sender's wallet
    const senderWallet = await Wallet.findOne({ userId: senderId, isActive: true });
    if (!senderWallet) {
      res.status(404).json({
        success: false,
        message: 'Sender wallet not found'
      });
      return;
    }

    if (senderWallet.balance < amount) {
      res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
      return;
    }

    // Get or create recipient's wallet
    let recipientWallet = await Wallet.findOne({ userId: recipientId, isActive: true });
    if (!recipientWallet) {
      recipientWallet = new Wallet({
        userId: recipientId,
        balance: 0,
        currency: 'INR'
      });
      await recipientWallet.save();
    }

    // Create debit transaction for sender
    const debitTransaction = new Transaction({
      userId: senderId,
      walletId: senderWallet._id,
      type: 'debit',
      amount,
      currency: 'INR',
      status: 'completed',
      description: description || `Payment to user ${recipientId}`,
      relatedJobId,
      relatedApplicationId,
      metadata: {
        recipientId,
        transferType: 'payment'
      }
    });

    // Create credit transaction for recipient
    const creditTransaction = new Transaction({
      userId: recipientId,
      walletId: recipientWallet._id,
      type: 'credit',
      amount,
      currency: 'INR',
      status: 'completed',
      description: description || `Payment received from user ${senderId}`,
      relatedJobId,
      relatedApplicationId,
      metadata: {
        senderId,
        transferType: 'payment'
      }
    });

    // Update wallet balances
    senderWallet.balance -= amount;
    recipientWallet.balance += amount;

    // Save all changes in a transaction
    await Promise.all([
      debitTransaction.save(),
      creditTransaction.save(),
      senderWallet.save(),
      recipientWallet.save()
    ]);

    res.json({
      success: true,
      message: 'Funds transferred successfully',
      data: {
        debitTransaction,
        creditTransaction,
        senderWallet: {
          balance: senderWallet.balance
        },
        recipientWallet: {
          balance: recipientWallet.balance
        }
      }
    });
  } catch (error) {
    console.error('Transfer funds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transfer funds'
    });
  }
};

// Test wallet top-up (for development/testing without Razorpay)
export const testAddFunds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    if (!amount || amount < 100) {
      res.status(400).json({
        success: false,
        message: 'Minimum amount is ₹100'
      });
      return;
    }

    if (amount > 1000000) {
      res.status(400).json({
        success: false,
        message: 'Maximum amount is ₹10,00,000 for test top-up'
      });
      return;
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId, isActive: true });
    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: 0,
        currency: 'INR'
      });
      await wallet.save();
    }

    // Create transaction record
    const transaction = new Transaction({
      userId,
      walletId: wallet._id,
      type: 'credit',
      amount,
      currency: 'INR',
      status: 'completed',
      description: `Test wallet top-up of ₹${amount} (No payment gateway)`,
      metadata: {
        testTransaction: true,
        addedAt: new Date()
      }
    });

    await transaction.save();

    // Add to wallet balance
    wallet.balance += amount;
    await wallet.save();

    res.json({
      success: true,
      message: `Test funds of ₹${amount.toLocaleString()} added successfully`,
      data: {
        transaction,
        wallet: {
          balance: wallet.balance
        }
      }
    });
  } catch (error) {
    console.error('Test add funds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add test funds'
    });
  }
};

// Get wallet statistics
export const getWalletStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query; // days

    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get wallet
    const wallet = await Wallet.findOne({ userId, isActive: true });
    if (!wallet) {
      res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
      return;
    }

    // Get transaction statistics
    const stats = await Transaction.aggregate([
      {
        $match: {
          userId: wallet.userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly earnings (for employees)
    const monthlyEarnings = await Transaction.aggregate([
      {
        $match: {
          userId: wallet.userId,
          type: 'credit',
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalEarnings: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        wallet,
        stats,
        monthlyEarnings,
        period: days
      }
    });
  } catch (error) {
    console.error('Get wallet stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet statistics'
    });
  }
};

// Process weekly payouts (Manual trigger for testing)
export const processWeeklyPayouts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admin can trigger this manually
    if (req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const { SchedulerService } = require('../services/schedulerService');
    const scheduler = SchedulerService.getInstance();
    const result = await scheduler.processWeeklyPayouts();

    res.json({
      success: result.success,
      message: result.message,
      data: { processedCount: result.processedCount }
    });
  } catch (error) {
    console.error('Process weekly payouts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
