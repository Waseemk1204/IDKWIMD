import React from 'react';
import { cn } from '../../lib/utils';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    variant = 'default', 
    size = 'md',
    id,
    ...props 
  }, ref) => {
    const textAreaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = 'w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200';
    
    const variantStyles = {
      default: 'border-neutral-300 dark:border-neutral-700',
      filled: 'border-transparent bg-neutral-100 dark:bg-neutral-800',
      outlined: 'border-2 border-neutral-300 dark:border-neutral-600'
    };

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg'
    };

    const errorStyles = error ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : '';

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textAreaId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          id={textAreaId}
          ref={ref}
          className={cn(
            baseStyles,
            variantStyles[variant],
            sizeStyles[size],
            errorStyles,
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

