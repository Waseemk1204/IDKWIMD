import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonButtonProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  className,
  children,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const baseClasses = 'animate-pulse rounded-md bg-gray-200';
  
  const variantClasses = {
    default: 'bg-gray-200',
    outline: 'border border-gray-300 bg-transparent',
    ghost: 'bg-transparent hover:bg-gray-100'
  };
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg'
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default SkeletonButton;