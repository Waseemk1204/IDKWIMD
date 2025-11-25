import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface OfferNegotiationProps {
    applicationId: string;
    isEmployer: boolean;
    offerAmount?: number;
    offerStatus?: 'pending' | 'accepted' | 'rejected' | 'none';
    onOfferUpdated: () => void;
}

const OfferNegotiation: React.FC<OfferNegotiationProps> = ({
    applicationId,
    isEmployer,
    offerAmount,
    offerStatus,
    onOfferUpdated
}) => {
    const [amount, setAmount] = useState<number>(offerAmount || 0);
    const [loading, setLoading] = useState(false);

    const handleMakeOffer = async () => {
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid offer amount');
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                `/api/v1/applications/${applicationId}/offer`,
                { offerAmount: amount },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            toast.success('Offer sent successfully!');
            onOfferUpdated();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send offer');
        } finally {
            setLoading(false);
        }
    };

    const handleRespondToOffer = async (response: 'accepted' | 'rejected') => {
        setLoading(true);
        try {
            await axios.post(
                `/api/v1/applications/${applicationId}/respond-offer`,
                { response },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            toast.success(`Offer ${response} successfully!`);
            onOfferUpdated();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to respond to offer');
        } finally {
            setLoading(false);
        }
    };

    if (isEmployer) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Make an Offer</h3>

                {offerStatus === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                        <p className="text-yellow-800">
                            Offer of ₹{offerAmount}/hour is pending employee response
                        </p>
                    </div>
                )}

                {offerStatus === 'accepted' && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                        <p className="text-green-800">
                            Offer of ₹{offerAmount}/hour has been accepted!
                        </p>
                    </div>
                )}

                {offerStatus === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                        <p className="text-red-800">
                            Offer of ₹{offerAmount}/hour was rejected
                        </p>
                    </div>
                )}

                {(!offerStatus || offerStatus === 'none' || offerStatus === 'rejected') && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hourly Rate (₹)
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter hourly rate"
                                min="0"
                            />
                        </div>

                        <button
                            onClick={handleMakeOffer}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Offer'}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Employee view
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Offer Details</h3>

            {offerStatus === 'pending' && offerAmount && (
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <p className="text-blue-900 font-semibold text-xl mb-2">
                            Offer: ₹{offerAmount}/hour
                        </p>
                        <p className="text-blue-700 text-sm">
                            The employer has made you an offer. Review and respond below.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => handleRespondToOffer('accepted')}
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Processing...' : 'Accept Offer'}
                        </button>
                        <button
                            onClick={() => handleRespondToOffer('rejected')}
                            disabled={loading}
                            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Processing...' : 'Reject Offer'}
                        </button>
                    </div>
                </div>
            )}

            {offerStatus === 'accepted' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-green-800">
                        You accepted the offer of ₹{offerAmount}/hour
                    </p>
                </div>
            )}

            {offerStatus === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-800">
                        You rejected the offer of ₹{offerAmount}/hour
                    </p>
                </div>
            )}

            {(!offerStatus || offerStatus === 'none') && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <p className="text-gray-600">
                        No offer has been made yet
                    </p>
                </div>
            )}
        </div>
    );
};

export default OfferNegotiation;
