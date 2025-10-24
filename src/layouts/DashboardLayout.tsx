import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { GlobalNavbar } from '../components/layout/GlobalNavbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../hooks/useAuth';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  // Handle window resize to close mobile sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileSidebarOpen]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlobalNavbar 
        onToggleSidebar={toggleSidebar} 
        onToggleMobileSidebar={toggleMobileSidebar}
        sidebarCollapsed={sidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
      />
      <div className="flex flex-1 relative">
        {isAuthenticated && (
          <>
            {/* Desktop Sidebar */}
            <Sidebar 
              collapsed={sidebarCollapsed} 
              onToggle={toggleSidebar}
              isMobile={false}
            />
            
            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={closeMobileSidebar}
              />
            )}
            
            {/* Mobile Sidebar */}
            <Sidebar 
              collapsed={false} 
              onToggle={closeMobileSidebar}
              isMobile={true}
              isOpen={mobileSidebarOpen}
            />
          </>
        )}
        <main className={`flex-1 p-6 md:p-8 overflow-auto transition-all duration-150 ${
          sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};