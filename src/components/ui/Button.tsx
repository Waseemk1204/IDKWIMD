import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'ghost';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  loadingText,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-semibold rounded-lg 
    transition-colors duration-150 outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: `
      bg-primary-500 hover:bg-primary-600 
      text-white shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700
      text-gray-700 dark:text-gray-200
      border border-gray-300 dark:border-gray-600
      hover:border-gray-400 dark:hover:border-gray-500
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 
      text-gray-700 dark:text-gray-300 
    `,
  };

  const sizeStyles = {
    sm: 'text-sm px-4 py-2 gap-1.5',     // 36px height
    md: 'text-base px-5 py-2.5 gap-2',   // 40px height
    lg: 'text-base px-6 py-3 gap-2',     // 48px height
  };

  const widthStyles = isFullWidth ? 'w-full' : '';
  const disabledStyles = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <button 
      className={`
        ${baseStyles} 
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${widthStyles} 
        ${disabledStyles} 
        ${className}
      `} 
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="animate-spin h-4 w-4" />
      )}
      
      {!isLoading && leftIcon && (
        <span className="flex-shrink-0">{leftIcon}</span>
      )}
      
      <span className="flex-1">
        {isLoading && loadingText ? loadingText : children}
      </span>
      
      {!isLoading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};