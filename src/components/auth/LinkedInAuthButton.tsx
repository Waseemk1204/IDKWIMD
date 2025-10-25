import React, { useState } from 'react';
import { linkedinAuthService } from '../../services/linkedinAuth';
import { Loader2 } from 'lucide-react';

interface LinkedInAuthButtonProps {
  text?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  mode?: 'login' | 'signup';
  role?: 'employee' | 'employer';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const LinkedInAuthButton: React.FC<LinkedInAuthButtonProps> = ({
  text = 'Continue with LinkedIn',
  variant = 'default',
  size = 'md',
  className = '',
  mode = 'login',
  role,
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLinkedInAuth = async () => {
    console.log('LinkedInAuthButton - handleLinkedInAuth called with mode:', mode, 'role:', role);
    setIsLoading(true);
    
    try {
      console.log('LinkedInAuthButton - Calling linkedinAuthService.signIn');
      const result = await linkedinAuthService.signIn(mode, role);
      
      console.log('LinkedInAuthButton - signIn result:', result);
      
      if (result.success) {
        console.log('LinkedInAuthButton - Success, calling onSuccess');
        onSuccess?.();
        // Don't set loading to false - we're redirecting
      } else {
        console.log('LinkedInAuthButton - Failed, calling onError');
        setIsLoading(false);
        onError?.(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('LinkedInAuthButton - Error:', error);
      setIsLoading(false);
      onError?.(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-6 py-4 text-lg';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border-2 border-neutral-300 dark:border-neutral-600 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100';
      case 'ghost':
        return 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100';
      default:
        return 'bg-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm';
    }
  };

  return (
    <button
      onClick={handleLinkedInAuth}
      disabled={isLoading}
      className={`
        ${getSizeClasses()}
        ${getVariantClasses()}
        rounded-lg font-medium transition-all duration-200
        flex items-center justify-center space-x-3
        hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-[#0A66C2]" />
          <span>Connecting to LinkedIn...</span>
        </>
      ) : (
        <>
          {/* LinkedIn Logo SVG */}
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="#0A66C2"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          
          <span>{text}</span>
        </>
      )}
    </button>
  );
};

