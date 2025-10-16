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
        name: 'Messages',
        href: '/messaging',
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
          group relative flex items-center ${collapsed ? 'justify-center px-2' : 'px-3'} py-3 text-sm font-medium rounded-xl
          transition-all duration-300 ease-in-out
          transform hover:scale-[1.02] hover:shadow-lg
          ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}
          ${isActive 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-gray-900 dark:hover:text-white'
          }
        `}
        style={{
          transitionDelay: `${index * 50}ms` // Stagger animation
        }}
        title={collapsed ? item.name : undefined}
      >
        {/* Icon Container */}
        <div className={`
          flex-shrink-0 ${collapsed ? '' : 'mr-3'} transition-all duration-200
          ${isActive 
            ? 'text-white' 
            : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
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
            {/* New Feature Badge */}
            {item.isNew && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                <StarIcon className="w-3 h-3 mr-1" />
                New
              </span>
            )}

            {/* Notification Badge */}
            {item.badge && item.badge > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs font-bold text-white shadow-md">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}

            {/* Active Indicator Arrow */}
            {isActive && (
              <ChevronRightIcon className="w-4 h-4 text-white" />
            )}
          </div>
        )}

        {/* Notification Badge for collapsed state */}
        {collapsed && item.badge && item.badge > 0 && (
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white dark:border-gray-900"></div>
        )}

        {/* Active Background Glow Effect */}
        {isActive && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 blur-sm -z-10"></div>
        )}
      </Link>
    );
  };

  /**
   * Render verification status with enhanced styling
   */
  const renderVerificationStatus = () => {
    const isVerified = user.isVerified;
    
    if (collapsed) {
      return (
        <div className="flex justify-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
            ${isVerified 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700' 
              : 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700'
            }
          `}>
            <ShieldCheckIcon className={`
              w-4 h-4 
              ${isVerified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}
            `} />
          </div>
        </div>
      );
    }
    
    return (
      <div className={`
        flex items-center p-3 rounded-xl transition-all duration-300
        ${isVerified 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700' 
          : 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700'
        }
      `}>
        <div className="flex items-center">
          <ShieldCheckIcon className={`
            w-4 h-4 mr-2 
            ${isVerified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}
          `} />
          <div>
            <div className={`
              text-xs font-medium 
              ${isVerified ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}
            `}>
              {isVerified ? 'Verified Account' : 'Verification Pending'}
            </div>
            {!isVerified && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                Complete verification to unlock all features
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====
  
  // Mobile sidebar
  if (isMobile) {
    return (
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-r border-gray-200/20 dark:border-gray-700/20 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {user.fullName || 'Company Name'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize font-medium">
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
          <div className="flex-shrink-0 p-4 border-t border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
            {renderVerificationStatus()}
          </div>
        </div>
      </aside>
    );
  }

  // Desktop sidebar
  return (
    <aside className={`hidden lg:flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200/20 dark:border-gray-700/20 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-72'
    }`}>
      <div className="flex flex-col flex-grow overflow-y-auto">
        
        {/* ===== OPTIMIZED USER INFO SECTION (REPLACING EMPTY HEADER) ===== */}
        <div className="p-4 border-b border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} mb-3`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {user.fullName || 'Company Name'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize font-medium">
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

      {/* ===== COMPACT SIDEBAR FOOTER ===== */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
        {renderVerificationStatus()}
      </div>
    </aside>
  );
};