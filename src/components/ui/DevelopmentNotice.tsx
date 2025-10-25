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

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('dev-notice-dismissed', 'true');
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-in">
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 flex-1">
              <span className="font-medium">Under Development:</span> Some features are still being built. Thank you for your patience! 🚧
            </p>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded transition-colors flex-shrink-0"
              aria-label="Dismiss notice"
            >
              <X className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
