import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { lockScroll, unlockScroll } from '../../utils/scrollLock';

interface SignupSuccessAnimationProps {
  userName?: string;
  userRole?: 'employee' | 'employer';
  onComplete?: () => void;
  isVisible: boolean;
}

export const SignupSuccessAnimation: React.FC<SignupSuccessAnimationProps> = ({
  userName = 'there',
  userRole = 'employee',
  onComplete,
  isVisible
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isVisible) {
      lockScroll();
    } else {
      unlockScroll();
    }
    
    // Cleanup function to ensure scroll is unlocked when component unmounts
    return () => {
      unlockScroll();
    };
  }, [isVisible]);

  // Auto-close after 2 seconds
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Simple Success Card */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full text-center animate-fade-in-up">
        {/* Success Icon */}
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Simple Message */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Thank you for signing up with us
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We owe you one! 🙏
          </p>
        </div>
      </div>
    </div>
  );
};
