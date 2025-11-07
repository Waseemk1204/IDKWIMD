import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = false,
  animate = true
}) => {
  const baseClasses = 'bg-neutral-200 dark:bg-neutral-700';
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';
  const animateClasses = animate ? 'animate-pulse' : '';
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${roundedClasses} ${animateClasses} ${className}`}
      style={style}
    />
  );
};

// Pre-built skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        height="16px"
        width={index === lines - 1 ? '75%' : '100%'}
        className="h-4"
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton width={48} height={48} rounded />
      <div className="flex-1">
        <Skeleton height={20} width="60%" className="mb-2" />
        <Skeleton height={16} width="40%" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonJobCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg ${className}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <Skeleton height={24} width="70%" className="mb-2" />
        <div className="flex items-center space-x-4 mb-3">
          <Skeleton height={16} width="30%" />
          <Skeleton height={16} width="25%" />
          <Skeleton height={16} width="20%" />
        </div>
      </div>
      <Skeleton width={80} height={32} rounded />
    </div>
    
    <div className="flex flex-wrap gap-2 mb-4">
      <Skeleton height={24} width={60} rounded />
      <Skeleton height={24} width={80} rounded />
      <Skeleton height={24} width={70} rounded />
    </div>
    
    <div className="flex justify-between items-center">
      <Skeleton height={20} width="40%" />
      <div className="flex space-x-2">
        <Skeleton height={32} width={60} rounded />
        <Skeleton height={32} width={80} rounded />
      </div>
    </div>
  </div>
);

export const SkeletonProfile: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg ${className}`}>
    <div className="flex items-center space-x-4 mb-6">
      <Skeleton width={80} height={80} rounded />
      <div className="flex-1">
        <Skeleton height={28} width="50%" className="mb-2" />
        <Skeleton height={16} width="30%" className="mb-1" />
        <Skeleton height={16} width="40%" />
      </div>
    </div>
    
    <div className="space-y-4">
      <div>
        <Skeleton height={16} width="20%" className="mb-2" />
        <SkeletonText lines={2} />
      </div>
      <div>
        <Skeleton height={16} width="25%" className="mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton height={24} width={60} rounded />
          <Skeleton height={24} width={80} rounded />
          <Skeleton height={24} width={70} rounded />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string 
}> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} height={20} width="100%" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} height={16} width="100%" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonButton: React.FC<{ 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string 
}> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32'
  };
  
  return (
    <Skeleton 
      height={sizeClasses[size].split(' ')[0]} 
      width={sizeClasses[size].split(' ')[1]} 
      rounded 
      className={className}
    />
  );
};

export const SkeletonAvatar: React.FC<{ 
  size?: 'sm' | 'md' | 'lg' | 'xl'; 
  className?: string 
}> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64
  };
  
  return (
    <Skeleton 
      width={sizeClasses[size]} 
      height={sizeClasses[size]} 
      rounded 
      className={className}
    />
  );
};
