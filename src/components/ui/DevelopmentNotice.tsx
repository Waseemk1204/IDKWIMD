import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface DevelopmentNoticeProps {
  onDismiss?: () => void;
}

export const DevelopmentNotice: React.FC<DevelopmentNoticeProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the notice
    const hasDismissed = localStorage.getItem('dev-notice-dismissed');
    if (!hasDismissed) {
      setIsVisible(true);
    }
    
    // Add global function for testing (only in development)
    if (process.env.NODE_ENV === 'development') {
      (window as any).showDevNotice = () => {
        localStorage.removeItem('dev-notice-dismissed');
        setIsVisible(true);
      };
    }
  }, []);

  // COMPLETE scroll lock - prevent ALL scrolling when modal is visible
  useEffect(() => {
    if (isVisible) {
      // Save original styles
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyPaddingRight = document.body.style.paddingRight;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;
      
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Lock scroll on both html and body
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      
      // Use position fixed to prevent scroll on mobile (only if there's actual scroll)
      // Set width first to prevent any flash
      document.body.style.width = '100%';
      
      // Only use position fixed if user has scrolled (prevents blank screen on load)
      if (scrollY > 0) {
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
      } else {
        // At top of page, just prevent overflow (safer for initial load)
        document.body.style.position = 'relative';
      }
      
      // Compensate for scrollbar
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      // Prevent touch/wheel events on background
      const preventScroll = (e: Event) => {
        if ((e.target as HTMLElement)?.closest('.fixed.inset-0')) {
          return; // Allow scrolling inside the modal if needed
        }
        e.preventDefault();
        e.stopPropagation();
      };
      
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      
      return () => {
        // Restore all original styles
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.paddingRight = originalBodyPaddingRight;
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        
        // Remove event listeners
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('dev-notice-dismissed', 'true');
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
        {/* Header with close button */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🚧 Under Development
          </h3>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Dismiss notice"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Simple message */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Some features are still being built. Thank you for your patience!
        </p>
        
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
