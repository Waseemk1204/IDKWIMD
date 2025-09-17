import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { GlobalNavbar } from '../components/layout/GlobalNavbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../hooks/useAuth';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <GlobalNavbar onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      <div className="flex flex-1">
        {isAuthenticated && (
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={toggleSidebar}
          />
        )}
        <main className={`flex-1 p-4 md:p-6 overflow-auto transition-all duration-300 ${
          sidebarCollapsed ? 'ml-0' : ''
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};