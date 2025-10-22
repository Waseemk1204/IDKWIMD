import React from 'react';
import { UnifiedDashboard } from '../../components/integration/UnifiedDashboard';

export const UnifiedDashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <UnifiedDashboard />
      </div>
    </div>
  );
};

