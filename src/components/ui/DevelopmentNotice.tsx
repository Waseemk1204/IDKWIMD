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

  // Lock body scroll when modal is visible
  useEffect(() => {
    if (isVisible) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll'; // Prevent layout shift
      
      return () => {
        // Restore scroll position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
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
