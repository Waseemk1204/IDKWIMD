import React from 'react';

type CardVariant = 'default' | 'elevated';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: CardVariant;
  size?: CardSize;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  variant = 'default',
  size = 'md',
  style,
}) => {
  // Industry-standard card styling (LinkedIn/Naukri)
  const baseStyles = `
    bg-white dark:bg-gray-800 
    rounded-lg 
    border border-gray-200 dark:border-gray-700
    transition-all duration-200
    ${onClick ? 'cursor-pointer' : ''}
  `;

  const variantStyles = {
    default: '',
    elevated: 'shadow-sm', // Very subtle shadow, no heavy elevation
  };

  const sizeStyles = {
    sm: 'p-4',
    md: 'p-5',  // Reduced from p-6 for more compact look
    lg: 'p-6',  // Reduced from p-8
  };

  const hoverStyles = hover ? 'hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm' : '';

  return (
    <div 
      className={`
        ${baseStyles} 
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${hoverStyles} 
        ${className}
      `} 
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
  withDivider?: boolean;
}> = ({
  children,
  className = '',
  withDivider = false,
}) => {
  return (
    <div className={`mb-4 ${withDivider ? 'pb-3 border-b border-gray-200 dark:border-gray-700' : ''} ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({
  children,
  className = '',
  size = 'md',
}) => {
  // Industry-standard typography
  const sizeStyles = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-semibold',  // 16px - standard for card titles
    lg: 'text-lg font-semibold',     // 18px
    xl: 'text-xl font-semibold',     // 20px - reduced from 2xl/bold
  };

  return (
    <h3 className={`${sizeStyles[size]} text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}> = ({
  children,
  className = '',
  muted = false,
}) => {
  return (
    <p className={`text-sm ${muted ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'} ${className}`}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}> = ({
  children,
  className = '',
  padding = 'none',
}) => {
  const paddingStyles = {
    none: '',
    sm: 'py-2',
    md: 'py-4',
    lg: 'py-6',
  };

  return (
    <div className={`${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
  withDivider?: boolean;
  align?: 'left' | 'center' | 'right' | 'between';
}> = ({
  children,
  className = '',
  withDivider = true,
  align = 'right',
}) => {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={`
      mt-4 pt-3
      ${withDivider ? 'border-t border-gray-200 dark:border-gray-700' : ''}
      flex items-center ${alignStyles[align]}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Specialized card component
export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="elevated" hover {...props} />
);