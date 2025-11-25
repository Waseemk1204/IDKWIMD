import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface TimesheetFormProps {
    contractId: string;
    onTimesheetSubmitted: () => void;
}

const TimesheetForm: React.FC<TimesheetFormProps> = ({ contractId, onTimesheetSubmitted }) => {
    const [hoursWorked, setHoursWorked] = useState<number>(0);
    const [description, setDescription] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hoursWorked || hoursWorked <= 0) {
            toast.error('Please enter valid hours worked');
            return;
        }

        if (!description.trim()) {
            toast.error('Please describe the work done');
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                '/api/v1/timesheets/submit',
                {
                    contractId,
                    hoursWorked,
                    description
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            toast.success('Timesheet submitted successfully!');
            setHoursWorked(0);
            setDescription('');
            onTimesheetSubmitted();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit timesheet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Submit Timesheet</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hours Worked
                    </label>
                    <input
                        type="number"
                        value={hoursWorked}
                        onChange={(e) => setHoursWorked(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter hours worked"
                        min="0"
                        step="0.5"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Describe the work you completed..."
                        rows={4}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Timesheet'}
                </button>
            </form>
        </div>
    );
};

export default TimesheetForm;
