import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  variant?: 'default' | 'professional';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  isFullWidth = true,
  variant = 'professional',
  className = '',
  ...props
}, ref) => {
  const hasError = !!error;
  
  const baseInputStyles = variant === 'professional' 
    ? 'input-professional'
    : `w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-soft placeholder-neutral-400 dark:placeholder-neutral-500 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${hasError ? 'border-error-300 dark:border-error-600 bg-error-50 dark:bg-error-900/20' : ''}`;

  return (
    <div className={`${isFullWidth ? 'w-full' : ''} space-y-2`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
            {leftIcon}
          </div>
        )}
        <input 
          ref={ref} 
          className={`
            ${baseInputStyles}
            ${leftIcon ? 'pl-10' : ''} 
            ${rightIcon ? 'pr-10' : ''} 
            ${className}
          `} 
          {...props} 
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
            {rightIcon}
          </div>
        )}
      </div>
      {hasError && (
        <p className="text-sm text-error-600 dark:text-error-400 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      {helpText && !hasError && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';