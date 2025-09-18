import React from 'react';
import { CheckCircle, Shield, Star, Clock, AlertCircle } from 'lucide-react';

export type TrustBadgeVariant = 
  | 'verified' 
  | 'secure' 
  | 'rated' 
  | 'pending' 
  | 'protected' 
  | 'warning';

interface TrustBadgeProps {
  variant: TrustBadgeVariant;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const badgeConfig = {
  verified: {
    icon: CheckCircle,
    text: 'Verified',
    className: 'verification-badge',
    iconColor: 'text-success-600 dark:text-success-400',
  },
  secure: {
    icon: Shield,
    text: 'Secure',
    className: 'trust-badge',
    iconColor: 'text-trust-600 dark:text-trust-400',
  },
  rated: {
    icon: Star,
    text: 'Top Rated',
    className: 'verification-badge',
    iconColor: 'text-warning-600 dark:text-warning-400',
  },
  pending: {
    icon: Clock,
    text: 'Pending',
    className: 'pending-badge',
    iconColor: 'text-warning-600 dark:text-warning-400',
  },
  protected: {
    icon: Shield,
    text: 'Protected',
    className: 'trust-badge',
    iconColor: 'text-trust-600 dark:text-trust-400',
  },
  warning: {
    icon: AlertCircle,
    text: 'Warning',
    className: 'pending-badge',
    iconColor: 'text-error-600 dark:text-error-400',
  },
};

const sizeConfig = {
  sm: {
    iconSize: 'h-3 w-3',
    textSize: 'text-xs',
    padding: 'px-2 py-0.5',
  },
  md: {
    iconSize: 'h-4 w-4',
    textSize: 'text-sm',
    padding: 'px-2.5 py-1',
  },
  lg: {
    iconSize: 'h-5 w-5',
    textSize: 'text-base',
    padding: 'px-3 py-1.5',
  },
};

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  variant,
  text,
  size = 'md',
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
        inline-flex items-center gap-1.5 font-medium transition-all duration-200 hover:scale-105
      `}
      title={text || config.text}
    >
      {showIcon && (
        <Icon 
          className={`${sizeStyles.iconSize} ${config.iconColor} flex-shrink-0`} 
          aria-hidden="true"
        />
      )}
      <span>{text || config.text}</span>
    </span>
  );
};

// Convenience components for common use cases
export const VerifiedBadge: React.FC<Omit<TrustBadgeProps, 'variant'>> = (props) => (
  <TrustBadge variant="verified" {...props} />
);

export const SecureBadge: React.FC<Omit<TrustBadgeProps, 'variant'>> = (props) => (
  <TrustBadge variant="secure" {...props} />
);

export const RatedBadge: React.FC<Omit<TrustBadgeProps, 'variant'>> = (props) => (
  <TrustBadge variant="rated" {...props} />
);

export const PendingBadge: React.FC<Omit<TrustBadgeProps, 'variant'>> = (props) => (
  <TrustBadge variant="pending" {...props} />
);

export const ProtectedBadge: React.FC<Omit<TrustBadgeProps, 'variant'>> = (props) => (
  <TrustBadge variant="protected" {...props} />
);
