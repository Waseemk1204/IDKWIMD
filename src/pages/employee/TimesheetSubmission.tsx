import React from 'react';
export const TimesheetSubmission: React.FC = () => {
  return <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Submit Timesheet
      </h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <form className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Select Project
            </label>
            <select className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm">
              <option>Web Development for TechSolutions</option>
              <option>Content Writing for Creative Agency</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Date
            </label>
            <input type="date" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Hours Worked
            </label>
            <input type="number" min="0.5" step="0.5" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Description of Work
            </label>
            <textarea rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" placeholder="Describe the tasks you worked on"></textarea>
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Submit Timesheet
            </button>
          </div>
        </form>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Submissions
        </h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Web Development for TechSolutions
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  5 hours • June 15, 2023
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                Pending
              </span>
            </div>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Web Development for TechSolutions
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  4 hours • June 14, 2023
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Approved
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};