import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface StickyFeedbackButtonProps {
  className?: string;
}

export const StickyFeedbackButton: React.FC<StickyFeedbackButtonProps> = ({ className = '' }) => {
  // TODO: Implement component rendering using className
  console.log('StickyFeedbackButton className:', className);
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
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    }

    // Handle multi-segment routes
    if (pathSegments.length === 2) {
      const [parent, child] = pathSegments;
      
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

    // Handle routes with IDs
    if (pathSegments.length === 3 && pathSegments[2] === 'edit') {
      return `${pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1)} Edit`;
    }
    if (pathSegments.length === 3 && pathSegments[2] === 'applicants') {
      return 'Job Applicants';
    }

    // Default fallback
    return pathSegments.map(segment => 
      segment.charAt(0).toUpperCase() + segment.slice(1)
    ).join(' ');
  };

  // Create feedback button using direct DOM manipulation
  useEffect(() => {
    const pageName = getPageName(location.pathname);
    const currentUrl = window.location.href;
    const currentDateTime = new Date().toLocaleString();
    
    const handleFeedbackClick = () => {
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
      
      try {
        window.open(mailtoLink, '_blank');
      } catch (error) {
        console.error('Error opening mailto link:', error);
        const tempLink = document.createElement('a');
        tempLink.href = mailtoLink;
        tempLink.target = '_blank';
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
    };
    
    const buttonDiv = document.createElement('div');
    buttonDiv.innerHTML = `
      <div style="
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        z-index: 999999 !important;
        width: 56px !important;
        height: 56px !important;
        background: linear-gradient(135deg, #2563eb, #9333ea) !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        transition: all 0.3s ease !important;
        border: none !important;
        outline: none !important;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
    `;
    
    // Add click handler
    const button = buttonDiv.querySelector('div');
    if (button) {
      button.addEventListener('click', handleFeedbackClick);
    }
    
    document.body.appendChild(buttonDiv);
    
    return () => {
      if (document.body.contains(buttonDiv)) {
        document.body.removeChild(buttonDiv);
      }
    };
  }, [location.pathname]);

  return null; // This component doesn't render anything in React
};
