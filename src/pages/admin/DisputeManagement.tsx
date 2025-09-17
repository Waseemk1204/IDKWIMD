import React from 'react';
export const DisputeManagement: React.FC = () => {
  return <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Dispute Management
      </h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Payment Dispute
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Filed 2 days ago • Creative Agency vs Janu Patel
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  In Progress
                </span>
              </div>
            </div>
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                Dispute Details
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Employer claims that the delivered work does not meet the
                agreed-upon quality standards. Employee claims that the work was
                completed according to the requirements.
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Creative Agency (Employer)
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    "The content delivered has multiple grammatical errors and
                    doesn't follow our brand guidelines as specified in the job
                    description."
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Janu Patel (Employee)
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    "I followed all the guidelines provided. The employer did
                    not provide detailed brand guidelines until after the work
                    was submitted."
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Resolution
                </h3>
                <textarea rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" placeholder="Enter your resolution decision..."></textarea>
                <div className="mt-4 flex space-x-2 justify-end">
                  <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Save Resolution
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Close Dispute
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Timesheet Dispute
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Filed 5 days ago • TechSolutions vs Vikram Mehta
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  In Progress
                </span>
              </div>
            </div>
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                Dispute Details
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Employer disputes the number of hours claimed by the employee.
                Employee claims that all hours were worked as reported.
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    TechSolutions (Employer)
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    "The employee has claimed 8 hours for a task that should
                    take no more than 4 hours to complete based on our previous
                    experience."
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Vikram Mehta (Employee)
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    "The task was more complex than anticipated and required
                    additional research and troubleshooting, which took extra
                    time."
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Resolution
                </h3>
                <textarea rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" placeholder="Enter your resolution decision..."></textarea>
                <div className="mt-4 flex space-x-2 justify-end">
                  <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Save Resolution
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Close Dispute
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};