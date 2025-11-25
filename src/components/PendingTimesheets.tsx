import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Timesheet {
    _id: string;
    contractId: string;
    freelancerId: string;
    hoursWorked: number;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

interface PendingTimesheetsProps {
    contractId?: string;
}

const PendingTimesheets: React.FC<PendingTimesheetsProps> = ({ contractId }) => {
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingTimesheets();
    }, [contractId]);

    const fetchPendingTimesheets = async () => {
        try {
            const response = await axios.get('/api/v1/timesheets/pending', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: contractId ? { contractId } : {}
            });

            setTimesheets(response.data.data.timesheets || []);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch timesheets');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (timesheetId: string) => {
        setApproving(timesheetId);
        try {
            await axios.post(
                `/api/v1/timesheets/approve/${timesheetId}`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            toast.success('Timesheet approved and payment processed!');
            fetchPendingTimesheets();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to approve timesheet');
        } finally {
            setApproving(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500">Loading timesheets...</p>
            </div>
        );
    }

    if (timesheets.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Pending Timesheets</h3>
                <p className="text-gray-500">No pending timesheets to review</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">
                Pending Timesheets ({timesheets.length})
            </h3>

            <div className="space-y-4">
                {timesheets.map((timesheet) => (
                    <div
                        key={timesheet._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="font-semibold text-lg">{timesheet.hoursWorked} hours</p>
                                <p className="text-sm text-gray-500">
                                    Submitted on {new Date(timesheet.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                Pending
                            </span>
                        </div>

                        <p className="text-gray-700 mb-4">{timesheet.description}</p>

                        <button
                            onClick={() => handleApprove(timesheet._id)}
                            disabled={approving === timesheet._id}
                            className="w-full bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {approving === timesheet._id ? 'Approving...' : 'Approve & Process Payment'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingTimesheets;
