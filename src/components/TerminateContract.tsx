import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface TerminateContractProps {
    contractId: string;
    onContractTerminated: () => void;
}

const TerminateContract: React.FC<TerminateContractProps> = ({ contractId, onContractTerminated }) => {
    const [showModal, setShowModal] = useState(false);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTerminate = async () => {
        if (!reason.trim()) {
            toast.error('Please provide a reason for termination');
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                `/api/v1/contracts/${contractId}/terminate`,
                { reason },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            toast.success('Contract terminated successfully');
            setShowModal(false);
            onContractTerminated();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to terminate contract');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
                Terminate Contract
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Terminate Contract</h2>

                        <p className="text-gray-600 mb-4">
                            Are you sure you want to terminate this contract? This action cannot be undone.
                            Remaining funds will be unlocked and returned to the employer.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Termination *
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                placeholder="Please explain why you're terminating this contract..."
                                rows={4}
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                                className="flex-1 px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTerminate}
                                disabled={loading}
                                className="flex-1 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
                            >
                                {loading ? 'Terminating...' : 'Terminate Contract'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TerminateContract;
