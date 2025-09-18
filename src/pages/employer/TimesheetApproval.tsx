import React from 'react';
export const TimesheetApproval: React.FC = () => {
  return <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Timesheet Approval
      </h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Pending Timesheets
          </h2>
          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">
                    Janu Patel
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Web Developer
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    4 hours
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Today
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Description:</strong> Implemented new features on the
                  dashboard and fixed responsive design issues.
                </p>
              </div>
              <div className="mt-4 flex space-x-2 justify-end">
                <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Approve
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Reject
                </button>
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">
                    Vikram Mehta
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Digital Marketer
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    5 hours
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Yesterday
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Description:</strong> Created social media content and
                  managed ad campaigns.
                </p>
              </div>
              <div className="mt-4 flex space-x-2 justify-end">
                <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Approve
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};