import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  ClockIcon, 
  WalletIcon, 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  MessageSquareIcon, 
  UsersIcon, 
  NewspaperIcon,
  ChevronRightIcon,
  StarIcon,
  TrendingUpIcon,
  UserPlusIcon,
  FileTextIcon,
  XIcon
} from 'lucide-react';

/**
 * Enhanced Sidebar Component for Part-Time Pay$ Application
 * 
 * Features:
 * - Role-based navigation (employer, employee, admin)
 * - Smooth animations and modern styling
 * - Verification status display
 * - Notification indicators
 * - Consistent with enhanced Navbar design
 * - Responsive design (hidden on mobile)
 */
interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed = false, 
  onToggle,
  isMobile = false,
  isOpen = false
}) => {
  // ===== HOOKS AND STATE =====
  const { user } = useAuth();
  const location = useLocation();
  
  // Animation state for enhanced user experience
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Real notification data will be loaded from API
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  // Load notification counts from API
  useEffect(() => {
    const loadNotificationCounts = async () => {
      try {
        // TODO: Implement API calls to load notification counts
        // const [messagesResponse, notificationsResponse] = await Promise.all([
        //   apiService.getUnreadMessageCount(),
        //   apiService.getUnreadNotificationCount()
        // ]);
        // setUnreadMessages(messagesResponse.data.count);
        // setUnreadNotifications(notificationsResponse.data.count);
        
        // For now, set to 0
        setUnreadMessages(0);
        setUnreadNotifications(0);
      } catch (error) {
        console.error('Failed to load notification counts:', error);
      }
    };
    
    if (user) {
      loadNotificationCounts();
    }
  }, [user]);

  // ===== EFFECTS =====
  
  /**
   * Trigger entrance animation on component mount
   */
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Early return if user is not authenticated
  if (!user) return null;

  // ===== NAVIGATION CONFIGURATION =====
  
  /**
   * Sidebar link type definition
   */
  type SidebarLink = {
    name: string;
    href: string;
    icon: React.ReactNode;
    badge?: number; // For notification counts
    isNew?: boolean; // For highlighting new features
  };

  /**
   * Generate sidebar navigation links based on user role
   * @returns Array of sidebar navigation links
   */
  const getSidebarLinks = (): SidebarLink[] => {
    // Common links available to all authenticated users
    const commonLinks: SidebarLink[] = [
      {
        name: 'Comms',
        href: '/comms',
        icon: <MessageSquareIcon className="w-5 h-5" />,
        badge: unreadMessages
      },
      {
        name: 'Community Hub',
        href: '/community',
        icon: <UsersIcon className="w-5 h-5" />,
        isNew: true // Highlight as new feature
      },
      {
        name: 'Notifications',
        href: '/notifications',
        icon: <BellIcon className="w-5 h-5" />,
        badge: unreadNotifications
      },
      {
        name: 'My Profile',
        href: '/profile',
        icon: <UserIcon className="w-5 h-5" />
      }
    ];

    // Employer-specific navigation links
    if (user.role === 'employer') {
      return [
        {
          name: 'Dashboard',
          href: '/employer',
          icon: <HomeIcon className="w-5 h-5" />
        },
        {
          name: 'Post New Job',
          href: '/employer/post-job',
          icon: <BriefcaseIcon className="w-5 h-5" />
        },
        {
          name: 'Manage Jobs',
          href: '/employer/jobs',
          icon: <BriefcaseIcon className="w-5 h-5" />
        },
        {
          name: 'Timesheets',
          href: '/employer/timesheets',
          icon: <ClockIcon className="w-5 h-5" />
        },
        {
          name: 'Wallet & Billing',
          href: '/employer/wallet',
          icon: <WalletIcon className="w-5 h-5" />
        },
        ...commonLinks
      ];
    }

    // Employee-specific navigation links
    if (user.role === 'employee') {
      return [
        {
          name: 'Dashboard',
          href: '/employee',
          icon: <HomeIcon className="w-5 h-5" />
        },
        {
          name: 'Browse Jobs',
          href: '/employee/jobs',
          icon: <BriefcaseIcon className="w-5 h-5" />
        },
        {
          name: 'My Applications',
          href: '/employee/applications',
          icon: <FileTextIcon className="w-5 h-5" />
        },
        {
          name: 'My Connections',
          href: '/employee/connections',
          icon: <UserPlusIcon className="w-5 h-5" />,
          isNew: true
        },
        {
          name: 'Unified Dashboard',
          href: '/unified-dashboard',
          icon: <TrendingUpIcon className="w-5 h-5" />,
          isNew: true
        },
        {
          name: 'My Timesheet',
          href: '/employee/timesheet',
          icon: <ClockIcon className="w-5 h-5" />
        },
        {
          name: 'Earnings & Wallet',
          href: '/employee/wallet',
          icon: <WalletIcon className="w-5 h-5" />
        },
        ...commonLinks
      ];
    }

    // Admin-specific navigation links
    if (user.role === 'admin') {
      return [
        {
          name: 'Admin Dashboard',
          href: '/admin',
          icon: <HomeIcon className="w-5 h-5" />
        },
        {
          name: 'User Verification',
          href: '/admin/verification',
          icon: <ShieldCheckIcon className="w-5 h-5" />
        },
        {
          name: 'Job Approvals',
          href: '/admin/job-approval',
          icon: <BriefcaseIcon className="w-5 h-5" />
        },
        {
          name: 'Dispute Resolution',
          href: '/admin/disputes',
          icon: <NewspaperIcon className="w-5 h-5" />
        },
        {
          name: 'Analytics',
          href: '/admin/analytics',
          icon: <TrendingUpIcon className="w-5 h-5" />
        },
        ...commonLinks
      ];
    }

    return [];
  };

  // ===== RENDER HELPERS =====
  
  const sidebarLinks = getSidebarLinks();

  /**
   * Check if a navigation link is currently active
   * @param href - The link's href
   * @returns boolean indicating if the link is active
   */
  const isActiveLink = (href: string): boolean => {
    // Exact match for the href
    if (location.pathname === href) {
      return true;
    }
    
    // For dashboard routes, only match exactly to prevent false positives
    if (href === '/employee' || href === '/employer' || href === '/admin') {
      return location.pathname === href;
    }
    
    // For other routes, check if current path starts with the href + '/'
    // This handles nested routes properly
    return location.pathname.startsWith(href + '/');
  };

  /**
   * Render individual sidebar navigation link with enhanced styling
   * @param item - The sidebar link object
   * @param index - The index for stagger animation
   */
  const renderSidebarLink = (item: SidebarLink, index: number) => {
    const isActive = isActiveLink(item.href);
    
    return (
      <Link
        key={item.name}
        to={item.href}
        className={`
          group relative flex items-center ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg
          transition-colors duration-150
          ${isActive 
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'
          }
        `}
        title={collapsed ? item.name : undefined}
      >
        {/* Icon Container */}
        <div className={`
          flex-shrink-0 ${collapsed ? '' : 'mr-3'}
          ${isActive 
            ? 'text-primary-600 dark:text-primary-400' 
            : 'text-gray-500 dark:text-gray-400'
          }
        `}>
          {item.icon}
        </div>

        {/* Link Text - Hidden when collapsed */}
        {!collapsed && (
          <span className="flex-1 truncate">{item.name}</span>
        )}

        {/* Badges and Indicators - Hidden when collapsed */}
        {!collapsed && (
          <div className="flex items-center space-x-2">
            {/* Notification Badge */}
            {item.badge && item.badge > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 text-[10px] font-semibold text-white">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </div>
        )}

        {/* Notification Badge for collapsed state */}
        {collapsed && item.badge && item.badge > 0 && (
          <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary-500 border-2 border-white dark:border-gray-900"></div>
        )}
      </Link>
    );
  };

  /**
   * Render verification status with enhanced styling
   */
  const renderVerificationStatus = () => {
    const isVerified = user.isVerified;
    const verificationStatus = user.verificationStatus || 'pending';
    
    // Don't show anything for new users who haven't started verification
    if (!isVerified && verificationStatus === 'pending' && !user.verificationDocs) {
      return null;
    }
    
    if (collapsed) {
      return (
        <div className="flex justify-center">
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            ${isVerified 
              ? 'bg-success-50 dark:bg-success-900/20' 
              : 'bg-neutral-50 dark:bg-neutral-800'
            }
          `}>
            <ShieldCheckIcon className={`
              w-4 h-4 
              ${isVerified ? 'text-success-600 dark:text-success-400' : 'text-neutral-400 dark:text-neutral-500'}
            `} />
          </div>
        </div>
      );
    }
    
    return (
      <div className={`
        flex items-center p-3 rounded-lg
        ${isVerified 
          ? 'bg-success-50 dark:bg-success-900/20' 
          : 'bg-neutral-50 dark:bg-neutral-800'
        }
      `}>
        <ShieldCheckIcon className={`
          w-4 h-4 mr-2 
          ${isVerified ? 'text-success-600 dark:text-success-400' : 'text-neutral-400 dark:text-neutral-500'}
        `} />
        <div>
          <div className={`
            text-xs font-medium 
            ${isVerified ? 'text-success-700 dark:text-success-400' : 'text-neutral-600 dark:text-neutral-400'}
          `}>
            {isVerified ? 'Verified Account' : 'Verification Available'}
          </div>
          {!isVerified && (
            <div className="text-[10px] text-neutral-500 dark:text-neutral-500 mt-0.5">
              Get verified for more opportunities
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====
  
  // Mobile sidebar
  if (isMobile) {
    return (
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-lg">
                {user.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {user.fullName || 'Company Name'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close sidebar"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((item, index) => renderSidebarLink(item, index))}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
            {renderVerificationStatus()}
          </div>
        </div>
      </aside>
    );
  }

  // Desktop sidebar
  return (
    <aside className={`hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-72'
    }`}>
      <div className="flex flex-col flex-grow overflow-y-auto">
        
        {/* ===== USER INFO SECTION ===== */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-lg">
              {user.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {user.fullName || 'Company Name'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
            )}
          </div>
          
          {/* PART-TIME PAY$ Brand */}
          {/* <div className="text-center">
            <Link to="/" className="group inline-block">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
                PART-TIME PAY$
              </span>
              <div className="h-0.5 bg- gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 mt-1"></div>
            </Link>
          </div> */}
        </div>

        {/* ===== NAVIGATION LINKS ===== */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {sidebarLinks.map((item, index) => renderSidebarLink(item, index))}
        </nav>
      </div>

      {/* ===== SIDEBAR FOOTER ===== */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
        {renderVerificationStatus()}
      </div>
    </aside>
  );
};