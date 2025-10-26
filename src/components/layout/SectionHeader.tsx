import React from 'react';
import { classNames } from '../../design-system';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

/**
 * Standardized Section Header Component
 * Use this for major sections within pages
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  description, 
  actions 
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <h2 className={classNames.sectionTitle}>
            {title}
          </h2>
          {description && (
            <p className={classNames.smallText + ' mt-1'}>
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

