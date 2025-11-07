import React from 'react';
interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-14 w-14 text-xl'
  };
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  return <div className={`relative inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden ${sizeClasses[size]} ${className}`}>
      {src ? <img src={src} alt={name || 'Avatar'} className="h-full w-full object-cover" /> : name ? <span className="font-medium text-gray-700 dark:text-gray-300">
          {getInitials(name)}
        </span> : <span className="font-medium text-gray-700 dark:text-gray-300">?</span>}
    </div>;
};