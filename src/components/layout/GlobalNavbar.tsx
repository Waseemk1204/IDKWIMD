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
  sidebarCollapsed?: boolean;
}

export const GlobalNavbar: React.FC<GlobalNavbarProps> = ({ 
  onToggleSidebar, 
  sidebarCollapsed = false 
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Mock data - in production, these would come from backend/context
  const unreadMessageCount = 3;
  const hasNotifications = true;

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
    <nav className={`${isScrolled ? 'bg-white/90 dark:bg-neutral-950/95 shadow-xl' : 'bg-white/70 dark:bg-neutral-950/80 shadow-lg'} backdrop-blur-lg border-b border-neutral-200/30 dark:border-neutral-800/50 sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left Section: Menu Button + Logo + Global Nav */}
          <div className="flex items-center">
            {/* Sidebar Toggle Button */}
            {isAuthenticated && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="mr-3 p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <MenuIcon className="h-5 w-5" />
                ) : (
                  <XIcon className="h-5 w-5" />
                )}
              </button>
            )}
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="relative">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-800 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
                    PART-TIME PAY$
                  </span>
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </Link>
              {/* Debug indicator */}
              <div className={`ml-2 w-2 h-2 rounded-full ${isScrolled ? 'bg-green-500' : 'bg-red-500'} transition-colors duration-300`}></div>
            </div>

            {/* Global Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:items-center md:space-x-1">
              {globalNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-200"
                >
                  {link.icon}
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
                  className="relative p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">View notifications</span>
                  <div className="relative">
                    <BellIcon className="h-5 w-5" />
                    {hasNotifications && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-gradient-to-r from-error-500 to-error-600 text-xs text-white font-bold shadow-lg">
                        !
                      </span>
                    )}
                  </div>
                </Link>
                
                {/* Messages */}
                <Link
                  to="/messaging"
                  className="relative p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">View messages</span>
                  <div className="relative">
                    <MessageSquareIcon className="h-5 w-5" />
                    {unreadMessageCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-xs text-white font-bold shadow-lg">
                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  >
                    <Avatar name={user?.name} src={user?.profileImage} size="sm" />
                    <ChevronDownIcon className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-2 bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 border border-neutral-200 dark:border-neutral-700 transform transition-all duration-200 origin-top-right">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user?.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{user?.role}</p>
                      </div>
                      
                      {/* Menu Items */}
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/community"
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Community Hub
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors duration-150"
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
        <div className="md:hidden border-t border-neutral-200/30 dark:border-neutral-800/50 bg-white/80 dark:bg-neutral-950/85 backdrop-blur-lg">
          {/* Mobile Navigation Links */}
          <div className="px-4 pt-3 pb-3 space-y-2">
            {globalNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-150"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Mobile User Section */}
          {isAuthenticated && user && (
            <div className="pt-4 pb-3 border-t border-neutral-200 dark:border-neutral-700">
              {/* User Info */}
              <div className="flex items-center px-4 mb-4">
                <div className="flex-shrink-0">
                  <Avatar name={user?.name} src={user?.profileImage} size="md" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-base font-medium text-neutral-800 dark:text-neutral-100">
                    {user?.name}
                  </div>
                  <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Mobile Menu Items */}
              <div className="space-y-1 px-4">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-lg text-base font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-150"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  to="/community"
                  className="block px-3 py-2 rounded-lg text-base font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-150"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Community Hub
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors duration-150"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}

          {/* Mobile Theme Toggle */}
          <div className="mt-4 px-4 flex items-center">
            <ThemeToggle />
            <span className="ml-3 text-sm text-neutral-600 dark:text-neutral-300">
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </span>
          </div>
        </div>
      )}
    </nav>
  );
};
