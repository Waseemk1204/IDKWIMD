import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  Wallet as WalletIcon, 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Wallet {
  _id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  _id: string;
  userId: string;
  walletId: string;
  type: 'credit' | 'debit' | 'refund' | 'withdrawal' | 'payment';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  relatedJobId?: {
    _id: string;
    title: string;
    company: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface WalletStats {
  wallet: Wallet;
  stats: Array<{
    _id: string;
    totalAmount: number;
    count: number;
  }>;
  monthlyEarnings: Array<{
    _id: {
      year: number;
      month: number;
    };
    totalEarnings: number;
  }>;
  period: number;
}

export const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [processing, setProcessing] = useState(false);

  // Load wallet data
  useEffect(() => {
    const loadWalletData = async () => {
      try {
        const [walletResponse, transactionsResponse, statsResponse] = await Promise.all([
          apiService.getWallet(),
          apiService.getWalletTransactions({ limit: 10 }),
          apiService.getWalletStats(30)
        ]);

        if (walletResponse.success) {
          setWallet(walletResponse.data.wallet);
        }

        if (transactionsResponse.success) {
          setTransactions(transactionsResponse.data.transactions);
        }

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Error loading wallet data:', error);
        toast.error('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadWalletData();
    }
  }, [user]);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  const handleTestAddFunds = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) < 100) {
      toast.error('Minimum amount is ₹100');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wallet/test-add-funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: parseFloat(topUpAmount) })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Successfully added ₹${topUpAmount} to wallet (Test Mode)`);
        setShowTopUpModal(false);
        setTopUpAmount('');
        // Reload wallet data
        window.location.reload();
      } else {
        toast.error(data.message || 'Failed to add funds');
      }
    } catch (error) {
      console.error('Test add funds error:', error);
      toast.error('Failed to add funds');
    } finally {
      setProcessing(false);
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) < 100) {
      toast.error('Minimum top-up amount is ₹100');
      return;
    }

    setProcessing(true);
    try {
      const response = await apiService.createTopUpOrder(parseFloat(topUpAmount));
      
      if (response.success) {
        const { order } = response.data;
        
        // Initialize Razorpay
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
          amount: order.amount,
          currency: order.currency,
          name: 'Part-Time Pay$',
          description: `Wallet top-up of ₹${topUpAmount}`,
          order_id: order.id,
          handler: async (response: any) => {
            try {
              const verifyResponse = await apiService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyResponse.success) {
                toast.success('Payment successful! Wallet topped up.');
                setShowTopUpModal(false);
                setTopUpAmount('');
                // Reload wallet data
                window.location.reload();
              } else {
                toast.error('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: user?.fullName || '',
            email: user?.email || '',
          },
          theme: {
            color: '#3B82F6'
          }
        };

        const razorpay = (window as any).Razorpay;
        if (razorpay) {
          razorpay.open(options);
        } else {
          toast.error('Payment gateway not loaded');
        }
      } else {
        toast.error('Failed to create payment order');
      }
    } catch (error) {
      console.error('Top-up error:', error);
      toast.error('Failed to process top-up');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 100) {
      toast.error('Minimum withdrawal amount is ₹100');
      return;
    }

    if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName) {
      toast.error('Please fill in all bank details');
      return;
    }

    setProcessing(true);
    try {
      const response = await apiService.withdrawFunds({
        amount: parseFloat(withdrawAmount),
        bankDetails
      });

      if (response.success) {
        toast.success('Withdrawal request submitted successfully');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setBankDetails({ accountNumber: '', ifscCode: '', accountHolderName: '' });
        // Reload wallet data
        window.location.reload();
      } else {
        toast.error('Failed to process withdrawal');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to process withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'failed' || status === 'cancelled') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (status === 'pending') {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    }
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      case 'debit':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case 'withdrawal':
        return <Minus className="h-5 w-5 text-orange-500" />;
      default:
        return <Banknote className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'text-green-600 dark:text-green-400';
      case 'debit':
        return 'text-red-600 dark:text-red-400';
      case 'withdrawal':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <WalletIcon className="h-8 w-8 mr-3" />
            Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your earnings and payments
          </p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Available Balance</p>
              <h2 className="text-4xl font-bold mt-2">
                ₹{wallet?.balance?.toLocaleString() || '0'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {wallet?.currency || 'INR'}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowTopUpModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Money
              </Button>
              <Button
                onClick={() => setShowWithdrawModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Minus className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.stats.map((stat) => (
              <div key={stat._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {stat._id === 'credit' ? (
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-500" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                      {stat._id} Transactions
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      ₹{stat.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.count} transactions
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Transactions
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Banknote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction._id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.type, transaction.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                      </p>
                      {transaction.relatedJobId && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Job: {transaction.relatedJobId.title} at {transaction.relatedJobId.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top-up Modal */}
        <Modal
          isOpen={showTopUpModal}
          onClose={() => setShowTopUpModal(false)}
          title="Add Money to Wallet"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (₹)
              </label>
              <Input
                type="number"
                placeholder="Enter amount (minimum ₹100)"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                min="100"
                max="100000"
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Secure payment powered by Razorpay
                </p>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleTopUp}
                disabled={processing || !topUpAmount}
                className="flex-1"
              >
                {processing ? 'Processing...' : 'Proceed to Payment'}
              </Button>
              <Button
                onClick={handleTestAddFunds}
                disabled={processing || !topUpAmount}
                variant="secondary"
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                title="Test mode: Add funds without payment (for testing only)"
              >
                {processing ? 'Adding...' : 'Test Add Funds'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTopUpModal(false)}
                disabled={processing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Withdrawal Modal */}
        <Modal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          title="Withdraw Funds"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (₹)
              </label>
              <Input
                type="number"
                placeholder="Enter amount (minimum ₹100)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="100"
                max={wallet?.balance || 0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Number
              </label>
              <Input
                placeholder="Enter account number"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                IFSC Code
              </label>
              <Input
                placeholder="Enter IFSC code"
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Holder Name
              </label>
              <Input
                placeholder="Enter account holder name"
                value={bankDetails.accountHolderName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
              />
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Withdrawal requests are processed within 1-2 business days
                </p>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleWithdraw}
                disabled={processing || !withdrawAmount || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName}
                className="flex-1"
              >
                {processing ? 'Processing...' : 'Submit Withdrawal Request'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowWithdrawModal(false)}
                disabled={processing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
