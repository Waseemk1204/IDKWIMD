import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Mail, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from './Button';

interface StickyFeedbackButtonProps {
  className?: string;
}

export const StickyFeedbackButton: React.FC<StickyFeedbackButtonProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Helper function to get human-readable page name from route
  const getPageName = (pathname: string): string => {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    // Handle root path
    if (pathSegments.length === 0) {
      return 'Home';
    }

    // Handle specific routes
    const routeMap: { [key: string]: string } = {
      'login': 'Login',
      'signup': 'Sign Up',
      'additional-info': 'Additional Info',
      'onboarding': 'Onboarding',
      'blogs': 'Blogs',
      'about': 'About Us',
      'contact': 'Contact Us',
      'help': 'Customer Support',
      'search': 'Search',
      'privacy-policy': 'Privacy Policy',
      'messaging': 'Messaging',
      'notifications': 'Notifications',
      'profile': 'Profile',
      'unified-dashboard': 'Unified Dashboard',
      'community': 'Community Hub',
      'post-job': 'Post Job',
      'wallet': 'Wallet',
      'timesheets': 'Timesheet Approval',
      'timesheet': 'Timesheet Submission',
      'jobs': 'Jobs',
      'applications': 'My Applications',
      'gang-members': 'Gang Members',
      'verification': 'Verification Requests',
      'job-approval': 'Job Approval',
      'disputes': 'Dispute Management',
      'create': 'Create Post'
    };

    // Handle nested routes
    if (pathSegments.length === 1) {
      const segment = pathSegments[0];
      if (routeMap[segment]) {
        return routeMap[segment];
      }
      // Capitalize single segments
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    }

    // Handle multi-segment routes
    if (pathSegments.length === 2) {
      const [parent, child] = pathSegments;
      
      // Handle specific parent-child combinations
      if (parent === 'employer') {
        return `Employer ${routeMap[child] || child.charAt(0).toUpperCase() + child.slice(1)}`;
      }
      if (parent === 'employee') {
        return `Employee ${routeMap[child] || child.charAt(0).toUpperCase() + child.slice(1)}`;
      }
      if (parent === 'admin') {
        return `Admin ${routeMap[child] || child.charAt(0).toUpperCase() + child.slice(1)}`;
      }
      if (parent === 'community') {
        return `Community ${routeMap[child] || child.charAt(0).toUpperCase() + child.slice(1)}`;
      }
      if (parent === 'blogs' && child) {
        return 'Blog Post';
      }
      if (parent === 'onboarding') {
        return `Onboarding ${child.charAt(0).toUpperCase() + child.slice(1)}`;
      }
    }

    // Handle routes with IDs (like /jobs/:id)
    if (pathSegments.length === 3 && pathSegments[2] === 'edit') {
      return `${pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1)} Edit`;
    }
    if (pathSegments.length === 3 && pathSegments[2] === 'applicants') {
      return 'Job Applicants';
    }

    // Default fallback - capitalize each segment
    return pathSegments.map(segment => 
      segment.charAt(0).toUpperCase() + segment.slice(1)
    ).join(' ');
  };

  // Close expanded panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleFeedbackClick = () => {
    console.log('Feedback button clicked'); // Debug log
    
    const pageName = getPageName(location.pathname);
    const currentUrl = window.location.href;
    const currentDateTime = new Date().toLocaleString();
    
    const subject = encodeURIComponent(`Feedback for ParttimePays - ${pageName}`);
    const body = encodeURIComponent(
      `Hi ParttimePays Team,\n\n` +
      `I'd like to share feedback about your website.\n\n` +
      `Page: ${pageName}\n` +
      `URL: ${currentUrl}\n` +
      `Date: ${currentDateTime}\n\n` +
      `=== FEEDBACK ===\n\n` +
      `What I was trying to do:\n` +
      `[Your response here]\n\n` +
      `What happened / Issue encountered:\n` +
      `[Your response here]\n\n` +
      `Suggestions for improvement:\n` +
      `[Your response here]\n\n` +
      `=== END FEEDBACK ===\n\n` +
      `Thank you for building this platform!\n\n` +
      `Best regards,\n` +
      `[Your Name]`
    );
    
    const mailtoLink = `mailto:waseemk1204@gmail.com?subject=${subject}&body=${body}`;
    console.log('Opening mailto link:', mailtoLink); // Debug log
    
    // Try multiple methods to ensure the email client opens
    try {
      window.open(mailtoLink, '_blank');
    } catch (error) {
      console.error('Error opening mailto link:', error);
      // Fallback: try to create a temporary link and click it
      const tempLink = document.createElement('a');
      tempLink.href = mailtoLink;
      tempLink.target = '_blank';
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
    }
  };

  const toggleExpanded = () => {
    console.log('Toggle expanded clicked, current state:', isExpanded); // Debug log
    console.log('Button clicked - toggling expanded state'); // Additional debug log
    setIsExpanded(!isExpanded);
  };

  return (
    <div ref={buttonRef} className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Debug info */}
      <div className="absolute -top-8 right-0 text-xs text-gray-500 bg-white p-1 rounded shadow">
        Feedback Button Active
      </div>
      
      {/* Main Feedback Button */}
      <div className="relative">
        <Button
          onClick={toggleExpanded}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
          aria-label="Open feedback options"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" />
        </Button>

        {/* Expanded Options */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-64 transform transition-all duration-200 ease-out animate-fade-in-up">
            {/* Close Button */}
            <button
              onClick={toggleExpanded}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Content */}
            <div className="pr-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Share Your Feedback
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Help us improve ParttimePays by sharing your thoughts, suggestions, or reporting any issues you've encountered.
              </p>

              {/* Feedback Button */}
              <Button
                onClick={handleFeedbackClick}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Feedback Email
              </Button>

              {/* Additional Info */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  We read every message and appreciate your input! 💙
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pulse Animation for Attention */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-ping opacity-20"></div>
    </div>
  );
};
