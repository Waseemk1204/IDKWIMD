import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Users, MessageSquare } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

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
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isVisible) {
      // Store original styles
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;
      
      // Get current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Cleanup function to restore scrolling
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        
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

  const handleSignUpClick = () => {
    // Navigate to signup page
    window.location.href = '/signup';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <Card className="max-w-2xl w-full bg-white dark:bg-gray-800 border-2 border-orange-500 shadow-2xl animate-fade-in-up">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full flex-shrink-0">
                <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  🚧 Site Under Development
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  ParttimePays is currently in active development
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0 ml-2"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 sm:p-4">
              <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                <strong>Welcome to ParttimePays!</strong> We're excited to have you here. 
                Our platform is currently under active development, which means some features 
                and functions might not work exactly as intended yet.
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-0.5 sm:mt-1 flex-shrink-0">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                    Support Our Journey
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    You can still support us by signing up and exploring our platform. 
                    Your early adoption helps us build something amazing together!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full mt-0.5 sm:mt-1 flex-shrink-0">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                    Share Your Feedback
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    Found a bug or have suggestions? We'd love to hear from you! 
                    Use the feedback button to share your thoughts and help us improve.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <Button
              onClick={handleSignUpClick}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Sign Up & Explore
            </Button>
            <Button
              onClick={handleDismiss}
              variant="secondary"
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              Continue Browsing
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              Thank you for your patience and support as we build the future of part-time work! 💪
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
