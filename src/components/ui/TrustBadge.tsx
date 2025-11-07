import React from 'react';
import { CheckCircle } from 'lucide-react';

// Minimal professional status badge - only for essential verification status
export type StatusBadgeVariant = 'verified' | 'pending';

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  text?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

const badgeConfig = {
  verified: {
    icon: CheckCircle,
    text: 'Verified',
    className: 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400',
  },
  pending: {
    icon: CheckCircle,
    text: 'Pending',
    className: 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400',
  },
};

const sizeConfig = {
  sm: {
    iconSize: 'h-3 w-3',
    textSize: 'text-xs',
    padding: 'px-2 py-0.5',
  },
  md: {
    iconSize: 'h-3.5 w-3.5',
    textSize: 'text-xs',
    padding: 'px-2.5 py-1',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  text,
  size = 'sm',
  showIcon = true,
  className = '',
}) => {
  const config = badgeConfig[variant];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={`
        ${config.className}
        ${sizeStyles.padding}
        ${sizeStyles.textSize}
        ${className}
        inline-flex items-center gap-1 font-medium rounded transition-colors duration-150
      `}
      title={text || config.text}
    >
      {showIcon && (
        <Icon 
          className={`${sizeStyles.iconSize} flex-shrink-0`} 
          aria-hidden="true"
        />
      )}
      <span>{text || config.text}</span>
    </span>
  );
};

// Convenience component for verification badge
export const VerifiedBadge: React.FC<Omit<StatusBadgeProps, 'variant'>> = (props) => (
  <StatusBadge variant="verified" {...props} />
);
