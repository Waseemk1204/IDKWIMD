import React from 'react';

export const TestNotifications: React.FC = () => {
  console.log('TestNotifications component loaded');
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-neutral-100">
            Test Notifications Page
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            This is a test page to verify routing is working
          </p>
        </div>
      </div>
      
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <strong>Success!</strong> The notifications page is loading correctly.
      </div>
    </div>
  );
};
