import React, { useState } from 'react';
import { MessageSquare, Mail, X } from 'lucide-react';
import { Button } from './Button';

interface StickyFeedbackButtonProps {
  className?: string;
}

export const StickyFeedbackButton: React.FC<StickyFeedbackButtonProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFeedbackClick = () => {
    const subject = encodeURIComponent('Part-Time Pays Site Feedback');
    const body = encodeURIComponent(
      `Hi ParttimePays Team,\n\nI'd like to share some feedback about the website:\n\n` +
      `Page: ${window.location.href}\n` +
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Feedback:\n\n` +
      `[Please share your thoughts, suggestions, or report any issues you encountered]\n\n` +
      `Thank you!\n\n` +
      `Best regards,\n` +
      `[Your Name]`
    );
    
    const mailtoLink = `mailto:waseemk1204@gmail.com?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
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
          <div className="absolute bottom-16 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-64 animate-in slide-in-from-bottom-2 duration-200">
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
