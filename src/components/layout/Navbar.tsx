import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { 
  MenuIcon, 
  XIcon, 
  BellIcon, 
  UserIcon, 
  BriefcaseIcon, 
  WalletIcon, 
  ClockIcon, 
  HomeIcon, 
  MessageSquareIcon,
  ChevronDownIcon,
  SearchIcon
} from 'lucide-react';

/**
 * Enhanced Navbar Component for Part-Time Pay$ Application
 * 
 * Features:
 * - Role-based navigation (employer, employee, admin)
 * - Authentication state handling
 * - Responsive mobile menu
 * - Theme switching (dark/light mode)
 * - Notification and message indicators
 * - Smooth animations and modern styling
 */
export const Navbar: React.FC = () => {
  // ===== HOOKS AND STATE =====
  const { user, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // UI state management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Refs for click outside detection
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  // Real data will be loaded from API
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [hasNotifications, setHasNotifications] = useState(false);
  
  // Load notification data from API
  useEffect(() => {
    const loadNotificationData = async () => {
      try {
        // TODO: Implement API calls to load notification data
        // const [messagesResponse, notificationsResponse] = await Promise.all([
        //   apiService.getUnreadMessageCount(),
        //   apiService.getUnreadNotificationCount()
        // ]);
        // setUnreadMessageCount(messagesResponse.data.count);
        // setHasNotifications(notificationsResponse.data.count > 0);
        
        // For now, set to 0
        setUnreadMessageCount(0);
        setHasNotifications(false);
      } catch (error) {
        console.error('Failed to load notification data:', error);
      }
    };
    
    if (user) {
      loadNotificationData();
    }
  }, [user]);

  // ===== NAVIGATION CONFIGURATION =====
  
  /**
   * Navigation link type definition
   */
  type NavLink = { 
    name: string;
    href: string;
    icon?: React.ReactNode;
    badge?: number; // For notification counts
  };

  /**
   * Generate navigation links based on user role and authentication status
   * @returns Array of navigation links
   */
  const getNavLinks = (): NavLink[] => {
    // Unauthenticated user links
    if (!isAuthenticated) {
      return [
        {
          name: 'Home',
          href: '/',
          icon: <HomeIcon className="w-4 h-4" />
        }, 
        {
          name: 'Find a Job',
          href: '/login?intent=employee',
          icon: <BriefcaseIcon className="w-4 h-4" />
        }, 
        {
          name: 'Hire Talent',
          href: '/login?intent=employer',
          icon: <UserIcon className="w-4 h-4" />
        }
      ];
    }

    // Employer navigation links
    if (user?.role === 'employer') {
      return [
        {
          name: 'Dashboard',
          href: '/employer',
          icon: <HomeIcon className="w-4 h-4" />
        }, 
        {
          name: 'Post Job',
          href: '/employer/post-job',
          icon: <BriefcaseIcon className="w-4 h-4" />
        }, 
        {
          name: 'Manage Jobs',
          href: '/employer/jobs',
          icon: <BriefcaseIcon className="w-4 h-4" />
        }, 
        {
          name: 'Timesheets',
          href: '/employer/timesheets',
          icon: <ClockIcon className="w-4 h-4" />
        }, 
        {
          name: 'Wallet',
          href: '/employer/wallet',
          icon: <WalletIcon className="w-4 h-4" />
        }
      ];
    }

    // Employee navigation links
    if (user?.role === 'employee') {
      return [
        {
          name: 'Dashboard',
          href: '/employee',
          icon: <HomeIcon className="w-4 h-4" />
        }, 
        {
          name: 'Browse Jobs',
          href: '/employee/jobs',
          icon: <BriefcaseIcon className="w-4 h-4" />
        }, 
        {
          name: 'My Timesheet',
          href: '/employee/timesheet',
          icon: <ClockIcon className="w-4 h-4" />
        }, 
        {
          name: 'Wallet',
          href: '/employee/wallet',
          icon: <WalletIcon className="w-4 h-4" />
        }
      ];
    }

    // Admin navigation links
    if (user?.role === 'admin') {
      return [
        {
          name: 'Dashboard',
          href: '/admin',
          icon: <HomeIcon className="w-4 h-4" />
        }, 
        {
          name: 'Verification',
          href: '/admin/verification',
          icon: <UserIcon className="w-4 h-4" />
        }, 
        {
          name: 'Job Approval',
          href: '/admin/job-approval',
          icon: <BriefcaseIcon className="w-4 h-4" />
        }, 
        {
          name: 'Disputes',
          href: '/admin/disputes',
          icon: <BriefcaseIcon className="w-4 h-4" />
        }
      ];
    }

    return [];
  };

  // ===== EVENT HANDLERS =====
  
  /**
   * Toggle mobile menu visibility
   */
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  /**
   * Toggle profile dropdown menu
   */
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  /**
   * Close mobile menu when navigation occurs
   */
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // ===== EFFECTS =====
  
  /**
   * Handle click outside to close profile menu
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Close mobile menu on route change
   */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  /**
   * Handle scroll effect for navbar
   */
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 10);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // ===== RENDER HELPERS =====
  
  const navLinks = getNavLinks();

  /**
   * Render navigation link with active state styling
   */
  const renderNavLink = (item: NavLink, isMobile: boolean = false) => {
    const isActive = location.pathname === item.href;
    const baseClasses = isMobile 
      ? "flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
      : "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200";
    
    const activeClasses = isActive
      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
      : "text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-gray-900 dark:hover:text-white hover:shadow-md";

    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={isMobile ? closeMobileMenu : undefined}
        className={`${baseClasses} ${activeClasses}`}
      >
        {item.icon && (
          <span className={isActive ? "text-white" : "text-gray-500 dark:text-gray-400"}>
            {item.icon}
          </span>
        )}
        <span>{item.name}</span>
        {item.badge && item.badge > 0 && (
          <span className="ml-auto flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs text-white">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  /**
   * Render notification icon with indicator
   */
  const renderNotificationIcon = (to: string, icon: React.ReactNode, hasIndicator: boolean, count?: number) => (
    <Link
      to={to}
      className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <span className="sr-only">View {to.replace('/', '')}</span>
      <div className="relative">
        {icon}
        {hasIndicator && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs text-white font-bold shadow-lg">
            {count || ''}
          </span>
        )}
      </div>
    </Link>
  );

  // ===== MAIN RENDER =====
  
  return (
    <nav className={`${isScrolled ? 'bg-white/90 dark:bg-neutral-950/95 shadow-xl' : 'bg-white/70 dark:bg-neutral-950/80 shadow-lg'} backdrop-blur-lg border-b border-gray-200/30 dark:border-neutral-800/50 sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* ===== LEFT SECTION: LOGO + DESKTOP NAV ===== */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-primary-500 transition-colors duration-150 hover:text-primary-600">
                  PART-TIME PAY$
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:items-center md:space-x-2">
              {navLinks.map(item => renderNavLink(item))}
            </div>
          </div>

          {/* ===== RIGHT SECTION: ACTIONS + PROFILE ===== */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {/* Search Button */}
            <button
              onClick={() => navigate('/search')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Search"
            >
              <SearchIcon className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            <div className="p-1">
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <>
                {/* Notifications and Comms */}
                {renderNotificationIcon(
                  '/comms', 
                  <MessageSquareIcon className="h-5 w-5" />, 
                  unreadMessageCount > 0, 
                  unreadMessageCount
                )}
                
                {renderNotificationIcon(
                  '/notifications', 
                  <BellIcon className="h-5 w-5" />, 
                  hasNotifications
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={toggleProfileMenu}
                  >
                    <Avatar name={user?.fullName} src={user?.profilePhoto} size="sm" />
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-2 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 transform transition-all duration-200 origin-top-right">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                      </div>
                      
                      {/* Menu Items */}
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Authentication Buttons */
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 shadow-lg">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* ===== MOBILE MENU BUTTON ===== */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XIcon className="block h-6 w-6" />
              ) : (
                <MenuIcon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/30 dark:border-neutral-800/50 bg-white/80 dark:bg-neutral-950/85 backdrop-blur-lg">
          {/* Mobile Navigation Links */}
          <div className="px-4 pt-3 pb-3 space-y-2">
            {navLinks.map(item => renderNavLink(item, true))}
          </div>

          {/* Mobile User Section */}
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="flex items-center px-4 mb-4">
                  <div className="flex-shrink-0">
                    <Avatar name={user?.fullName} src={user?.profilePhoto} size="md" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-base font-medium text-gray-800 dark:text-white">
                      {user?.fullName}
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                  
                  {/* Mobile Notification Icons */}
                  <div className="flex items-center space-x-2">
                    {renderNotificationIcon(
                      '/comms', 
                      <MessageSquareIcon className="h-5 w-5" />, 
                      unreadMessageCount > 0, 
                      unreadMessageCount
                    )}
                    {renderNotificationIcon(
                      '/notifications', 
                      <BellIcon className="h-5 w-5" />, 
                      hasNotifications
                    )}
                  </div>
                </div>

                {/* Mobile Menu Items */}
                <div className="space-y-1 px-4">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    onClick={closeMobileMenu}
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              /* Mobile Authentication */
              <div className="px-4 space-y-3">
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button variant="outline" className="w-full justify-center">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup" onClick={closeMobileMenu}>
                  <Button variant="primary" className="w-full justify-center bg-gradient-to-r from-blue-600 to-purple-600">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Theme Toggle */}
            <div className="mt-4 px-4 flex items-center">
              <ThemeToggle />
              <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};