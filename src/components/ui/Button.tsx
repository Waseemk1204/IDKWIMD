import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'danger' 
  | 'success' 
  | 'trust' 
  | 'gradient';

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  trustIndicator?: boolean;
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
  trustIndicator = false,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-lg 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
    active:scale-95
  `;

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-primary-500 to-primary-600 
      hover:from-primary-600 hover:to-primary-700 
      text-white shadow-soft hover:shadow-medium
      focus:ring-primary-500
      hover:scale-105
    `,
    secondary: `
      bg-gradient-to-r from-secondary-500 to-secondary-600 
      hover:from-secondary-600 hover:to-secondary-700 
      text-white shadow-soft hover:shadow-medium
      focus:ring-secondary-500
      hover:scale-105
    `,
    outline: `
      border-2 border-primary-500 
      bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20 
      text-primary-600 dark:text-primary-400 
      hover:text-primary-700 dark:hover:text-primary-300
      focus:ring-primary-500
      hover:scale-105
    `,
    ghost: `
      bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 
      text-neutral-700 dark:text-neutral-300 
      hover:text-neutral-900 dark:hover:text-neutral-100
      focus:ring-neutral-500
      hover:scale-105
    `,
    danger: `
      bg-gradient-to-r from-error-500 to-error-600 
      hover:from-error-600 hover:to-error-700 
      text-white shadow-soft hover:shadow-medium
      focus:ring-error-500
      hover:scale-105
    `,
    success: `
      bg-gradient-to-r from-success-500 to-success-600 
      hover:from-success-600 hover:to-success-700 
      text-white shadow-soft hover:shadow-medium
      focus:ring-success-500
      hover:scale-105
    `,
    trust: `
      bg-gradient-to-r from-trust-500 to-trust-600 
      hover:from-trust-600 hover:to-trust-700 
      text-white shadow-trust hover:shadow-glow
      focus:ring-trust-500
      hover:scale-105
    `,
    gradient: `
      bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 
      hover:from-primary-600 hover:via-secondary-600 hover:to-primary-700 
      text-white shadow-soft hover:shadow-glow-lg
      focus:ring-primary-500
      hover:scale-105
    `,
  };

  const sizeStyles = {
    xs: 'text-xs px-2.5 py-1.5 gap-1',
    sm: 'text-sm px-3 py-2 gap-1.5',
    md: 'text-base px-4 py-2.5 gap-2',
    lg: 'text-lg px-6 py-3 gap-2.5',
    xl: 'text-xl px-8 py-4 gap-3',
    icon: 'p-2 w-10 h-10',
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

      {trustIndicator && !isLoading && (
        <span className="ml-1 text-xs opacity-75">🔒</span>
      )}
    </button>
  );
};