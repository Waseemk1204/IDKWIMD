import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  isFullWidth?: boolean;
  variant?: 'default' | 'professional';
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  multiline?: boolean;
  rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className = '',
    label,
    error,
    helpText,
    isFullWidth = false,
    variant = 'default',
    ariaDescribedBy,
    ariaInvalid,
    multiline = true,
    rows = 3,
    ...props
  }, ref) => {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
    
    const variantClasses = {
      default: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
      professional: 'border-gray-200 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white'
    };

    const errorClasses = error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : variantClasses[variant];

    const widthClasses = isFullWidth ? 'w-full' : '';

    return (
      <div className={isFullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            className={`${baseClasses} ${errorClasses} ${widthClasses} ${className}`}
            rows={rows}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            {...props}
          />
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" id={ariaDescribedBy}>
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400" id={ariaDescribedBy}>
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;