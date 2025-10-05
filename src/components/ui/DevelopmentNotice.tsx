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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white dark:bg-gray-800 border-2 border-orange-500 shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  🚧 Site Under Development
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ParttimePays is currently in active development
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                <strong>Welcome to ParttimePays!</strong> We're excited to have you here. 
                Our platform is currently under active development, which means some features 
                and functions might not work exactly as intended yet.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-1">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Support Our Journey
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    You can still support us by signing up and exploring our platform. 
                    Your early adoption helps us build something amazing together!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full mt-1">
                  <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Share Your Feedback
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Found a bug or have suggestions? We'd love to hear from you! 
                    Use the feedback button to share your thoughts and help us improve.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSignUpClick}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <Users className="w-4 h-4 mr-2" />
              Sign Up & Explore
            </Button>
            <Button
              onClick={handleDismiss}
              variant="secondary"
              className="flex-1 sm:flex-none px-6 py-3"
            >
              Continue Browsing
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Thank you for your patience and support as we build the future of part-time work! 💪
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
