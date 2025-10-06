import React from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'trust' | 'gradient';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: CardVariant;
  size?: CardSize;
  trustIndicator?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  variant = 'default',
  size = 'md',
  trustIndicator = false,
  style,
}) => {
  const baseStyles = `
    bg-white dark:bg-neutral-800 
    rounded-xl 
    transition-all duration-200
    ${onClick ? 'cursor-pointer' : ''}
  `;

  const variantStyles = {
    default: 'shadow-soft border border-neutral-200 dark:border-neutral-700',
    elevated: 'shadow-medium border border-neutral-200 dark:border-neutral-700',
    outlined: 'border-2 border-neutral-300 dark:border-neutral-600 shadow-none',
    trust: 'shadow-trust border border-trust-200 dark:border-trust-700 bg-gradient-to-br from-trust-50 to-white dark:from-trust-900/20 dark:to-neutral-800',
    gradient: 'shadow-large border border-primary-200 dark:border-primary-700 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20',
  };

  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'hover:shadow-medium hover:-translate-y-1 hover:scale-[1.02]' : '';

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
      {trustIndicator && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-trust-500 to-primary-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">🔒</span>
        </div>
      )}
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
    <div className={`mb-6 ${withDivider ? 'pb-4 border-b border-neutral-200 dark:border-neutral-700' : ''} ${className}`}>
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
  const sizeStyles = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-semibold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-bold',
  };

  return (
    <h3 className={`${sizeStyles[size]} text-neutral-900 dark:text-neutral-100 ${className}`}>
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
    <p className={`text-sm ${muted ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-600 dark:text-neutral-400'} ${className}`}>
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
      mt-6 pt-4 
      ${withDivider ? 'border-t border-neutral-200 dark:border-neutral-700' : ''}
      flex items-center ${alignStyles[align]}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Specialized card components
export const TrustCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="trust" trustIndicator {...props} />
);

export const GradientCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="gradient" {...props} />
);

export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="elevated" hover {...props} />
);