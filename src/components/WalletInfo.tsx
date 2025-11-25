import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import sessionService from '../services/sessionService';

interface WalletInfoProps {
    balance: number;
    lockedAmount?: number;
    isDevelopment?: boolean;
    onBalanceUpdated: () => void;
}

const WalletInfo: React.FC<WalletInfoProps> = ({
    balance,
    lockedAmount = 0,
    isDevelopment = false,
    onBalanceUpdated
}) => {
    const [testAmount, setTestAmount] = useState(1000);
    const [loading, setLoading] = useState(false);

    const handleAddTestFunds = async () => {
        if (!testAmount || testAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            // Use sessionService to get token (consistent with rest of app)
            const token = sessionService.getToken();
            if (!token) {
                toast.error('Please log in to add funds');
                return;
            }

            await axios.post(
                '/api/v1/wallet/test-add-funds',
                { amount: testAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(`Added ₹${testAmount} to wallet!`);
            onBalanceUpdated();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add funds');
        } finally {
            setLoading(false);
        }
    };

    const availableBalance = balance - lockedAmount;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Wallet</h3>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Balance:</span>
                    <span className="text-2xl font-bold text-green-600">
                        ₹{balance.toLocaleString()}
                    </span>
                </div>

                {lockedAmount > 0 && (
                    <>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Locked Amount:</span>
                            <span className="text-xl font-semibold text-orange-600">
                                ₹{lockedAmount.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-gray-600">Available Balance:</span>
                            <span className="text-xl font-semibold text-blue-600">
                                ₹{availableBalance.toLocaleString()}
                            </span>
                        </div>
                    </>
                )}

                {isDevelopment && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-3">
                            🧪 Development Mode: Add Test Funds
                        </p>

                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={testAmount}
                                onChange={(e) => setTestAmount(Number(e.target.value))}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Amount"
                                min="0"
                            />
                            <button
                                onClick={handleAddTestFunds}
                                disabled={loading}
                                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                            >
                                {loading ? 'Adding...' : 'Add Funds'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WalletInfo;
