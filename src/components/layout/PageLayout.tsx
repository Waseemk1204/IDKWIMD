import React from 'react';
import { classNames } from '../../design-system';

interface PageLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

/**
 * Standardized Page Layout Component
 * Provides consistent spacing and max-width
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  maxWidth = 'xl',
  className = '' 
}) => {
  const maxWidthClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${className}`}>
      {children}
    </div>
  );
};

