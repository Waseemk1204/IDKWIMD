import React from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ProfileSection {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  weight: number; // percentage contribution to overall completion
  link?: string;
}

interface ProfileCompletionBarProps {
  sections: ProfileSection[];
  currentPercentage: number;
  className?: string;
}

export const ProfileCompletionBar: React.FC<ProfileCompletionBarProps> = ({
  sections,
  currentPercentage,
  className = ''
}) => {
  const navigate = useNavigate();

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'primary';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const completionColor = getCompletionColor(currentPercentage);
  
  const colorClasses = {
    success: {
      bg: 'bg-success-500',
      text: 'text-success-700 dark:text-success-300',
      border: 'border-success-200 dark:border-success-800',
      bgLight: 'bg-success-50 dark:bg-success-900/20'
    },
    primary: {
      bg: 'bg-primary-500',
      text: 'text-primary-700 dark:text-primary-300',
      border: 'border-primary-200 dark:border-primary-800',
      bgLight: 'bg-primary-50 dark:bg-primary-900/20'
    },
    warning: {
      bg: 'bg-warning-500',
      text: 'text-warning-700 dark:text-warning-300',
      border: 'border-warning-200 dark:border-warning-800',
      bgLight: 'bg-warning-50 dark:bg-warning-900/20'
    },
    error: {
      bg: 'bg-error-500',
      text: 'text-error-700 dark:text-error-300',
      border: 'border-error-200 dark:border-error-800',
      bgLight: 'bg-error-50 dark:bg-error-900/20'
    }
  };

  const colors = colorClasses[completionColor];

  const incompleteSections = sections.filter(s => !s.isCompleted);
  const completedCount = sections.filter(s => s.isCompleted).length;

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`p-5 border-b ${colors.border} ${colors.bgLight}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Profile Completion
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
              {completedCount}/{sections.length} sections completed
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${colors.text}`}>
              {currentPercentage}%
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {currentPercentage >= 90 ? 'Excellent!' : currentPercentage >= 70 ? 'Almost there!' : currentPercentage >= 50 ? 'Keep going!' : 'Get started'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${colors.bg} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${currentPercentage}%` }}
          >
            {currentPercentage > 15 && (
              <div className="absolute top-0 right-0 w-1/3 h-full bg-white/20 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Incomplete Sections */}
      {incompleteSections.length > 0 && (
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-warning-600 dark:text-warning-400" />
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Complete these to boost your profile
            </h4>
          </div>
          <div className="space-y-3">
            {incompleteSections.map((section) => (
              <button
                key={section.id}
                onClick={() => section.link && navigate(section.link)}
                className={`w-full text-left p-4 rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group ${
                  section.link ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Circle className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {section.title}
                      </h5>
                      <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                        +{section.weight}%
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {section.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Completed Sections */}
      {completedCount > 0 && (
        <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400" />
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Completed sections ({completedCount})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {sections.filter(s => s.isCompleted).map((section) => (
              <div
                key={section.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 rounded-full text-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{section.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Profile Achievement */}
      {currentPercentage === 100 && (
        <div className="p-5 bg-gradient-to-r from-success-50 to-primary-50 dark:from-success-900/20 dark:to-primary-900/20 border-t border-success-200 dark:border-success-800">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-full mb-3">
              <CheckCircle2 className="w-7 h-7 text-success-600 dark:text-success-400" />
            </div>
            <h4 className="text-lg font-bold text-success-900 dark:text-success-100 mb-1">
              🎉 Your profile is complete!
            </h4>
            <p className="text-sm text-success-700 dark:text-success-300">
              You're 3x more likely to get noticed by employers
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionBar;
