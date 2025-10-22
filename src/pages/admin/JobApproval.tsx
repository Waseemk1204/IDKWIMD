import React from 'react';
export const JobApproval: React.FC = () => {
  return <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Job Approval
      </h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Web Developer
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Posted by TechSolutions Pvt Ltd • 2 days ago
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Approve
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Reject
                </button>
              </div>
            </div>
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                    Job Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Hourly Rate:
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        ₹800/hr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Hours per Week:
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        20-30 hrs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Duration:
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        3 months
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      React
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      TypeScript
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      Responsive Design
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Job Description
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We're looking for a skilled web developer to join our team to
                  work on client projects. The ideal candidate should have
                  experience with React, TypeScript, and responsive design.
                </p>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Content Writer
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Posted by Creative Agency • 3 days ago
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Approve
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Reject
                </button>
              </div>
            </div>
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                    Job Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Hourly Rate:
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        ₹500/hr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Hours per Week:
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        10-15 hrs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Duration:
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        Ongoing
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Blog Writing
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      SEO
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Content Strategy
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Job Description
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We are seeking a talented content writer to create engaging
                  blog posts, articles, and website content. The ideal candidate
                  should have experience with SEO and content strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};