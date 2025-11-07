import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Avatar } from '../ui/Avatar';
import { 
  BellIcon, 
  ChevronDownIcon,
  HelpCircleIcon,
  BookOpenIcon,
  InfoIcon,
  MessageSquareIcon,
  MenuIcon,
  XIcon
} from 'lucide-react';

/**
 * Global Navigation Bar for Dashboard Pages
 * 
 * Features:
 * - Global navigation options (About Us, Help, Blogs, etc.)
 * - User profile and notifications
 * - Theme switching
 * - Clean, professional design
 */
interface GlobalNavbarProps {
  onToggleSidebar?: () => void;
  onToggleMobileSidebar?: () => void;
  sidebarCollapsed?: boolean;
  mobileSidebarOpen?: boolean;
}

export const GlobalNavbar: React.FC<GlobalNavbarProps> = ({ 
  onToggleSidebar, 
  onToggleMobileSidebar,
  sidebarCollapsed = false,
  mobileSidebarOpen = false
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Global navigation links
  const globalNavLinks = [
    {
      name: 'About Us',
      href: '/about',
      icon: <InfoIcon className="w-4 h-4" />
    },
    {
      name: 'Help',
      href: '/help',
      icon: <HelpCircleIcon className="w-4 h-4" />
    },
    {
      name: 'Blogs',
      href: '/blogs',
      icon: <BookOpenIcon className="w-4 h-4" />
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: <MessageSquareIcon className="w-4 h-4" />
    }
  ];

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
  };

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const shouldBeScrolled = scrollTop > 10;
      setIsScrolled(shouldBeScrolled);
      console.log('Scroll position:', scrollTop, 'isScrolled:', shouldBeScrolled);
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

  return (
    <nav className={`bg-white dark:bg-gray-950 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-150`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left Section: Menu Button + Logo + Global Nav */}
          <div className="flex items-center">
            {/* Mobile Sidebar Toggle Button */}
            {isAuthenticated && onToggleMobileSidebar && (
              <button
                onClick={onToggleMobileSidebar}
                className="lg:hidden mr-3 p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-label={mobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {mobileSidebarOpen ? (
                  <XIcon className="h-5 w-5" />
                ) : (
                  <MenuIcon className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Desktop Sidebar Toggle Button */}
            {isAuthenticated && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="hidden lg:block mr-3 p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <MenuIcon className="h-5 w-5" />
                ) : (
                  <XIcon className="h-5 w-5" />
                )}
              </button>
            )}
            
            {/* Logo - Standardized Size */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-primary-500 transition-colors duration-150 hover:text-primary-600">
                  PART-TIME PAY$
                </span>
              </Link>
            </div>

            {/* Global Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:items-center md:space-x-1">
              {globalNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-150"
                >
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section: Actions + Profile */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {/* Theme Toggle */}
            <div className="p-1">
              <ThemeToggle />
            </div>

            {isAuthenticated && user && (
              <>
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">View notifications</span>
                  <div className="relative">
                    <BellIcon className="h-5 w-5" />
                    {hasNotifications && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center h-2 w-2 rounded-full bg-error-500"></span>
                    )}
                  </div>
                </Link>
                
                {/* Comms */}
                <Link
                  to="/comms"
                  className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">View messages</span>
                  <div className="relative">
                    <MessageSquareIcon className="h-5 w-5" />
                    {unreadMessageCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-[10px] text-white font-semibold">
                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  >
                    <Avatar name={user?.fullName} src={user?.profilePhoto} size="sm" />
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-150 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.fullName}</p>
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
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          {/* Mobile Navigation Links */}
          <div className="px-4 pt-3 pb-3 space-y-1">
            {globalNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-150"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Mobile User Section */}
          {isAuthenticated && user && (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-800">
              {/* User Info */}
              <div className="flex items-center px-4 mb-4">
                <div className="flex-shrink-0">
                  <Avatar name={user?.fullName} src={user?.profilePhoto} size="md" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {user?.fullName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Mobile Menu Items */}
              <div className="space-y-1 px-4">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Your Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}

          {/* Mobile Theme Toggle */}
          <div className="mt-4 px-4 pb-4 flex items-center">
            <ThemeToggle />
            <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </span>
          </div>
        </div>
      )}
    </nav>
  );
};
