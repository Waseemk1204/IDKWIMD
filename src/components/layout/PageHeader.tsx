import React from 'react';
import { classNames } from '../../design-system';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

/**
 * Standardized Page Header Component
 * Use this for ALL page titles to maintain consistency
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  actions,
  badge
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className={classNames.pageTitle}>
              {title}
            </h1>
            {badge && (
              <div className="flex-shrink-0">
                {badge}
              </div>
            )}
          </div>
          {description && (
            <p className={classNames.pageDescription}>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

