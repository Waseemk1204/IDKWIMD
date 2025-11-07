import React from 'react';
import { Shield, TrendingUp, Star, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type ProfileStrength = 'weak' | 'average' | 'good' | 'excellent';

export interface ProfileSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionText: string;
  actionLink?: string;
  icon?: React.ReactNode;
}

interface ProfileStrengthIndicatorProps {
  strength: ProfileStrength;
  score: number; // 0-100
  suggestions: ProfileSuggestion[];
  className?: string;
}

export const ProfileStrengthIndicator: React.FC<ProfileStrengthIndicatorProps> = ({
  strength,
  score,
  suggestions,
  className = ''
}) => {
  const navigate = useNavigate();

  const strengthConfig = {
    weak: {
      color: 'error',
      label: 'Needs Improvement',
      icon: Shield,
      description: 'Your profile needs attention to attract employers',
      gradient: 'from-error-500 to-error-600'
    },
    average: {
      color: 'warning',
      label: 'Average',
      icon: TrendingUp,
      description: 'Good start! Add more details to stand out',
      gradient: 'from-warning-500 to-warning-600'
    },
    good: {
      color: 'primary',
      label: 'Good',
      icon: Star,
      description: 'Your profile looks great! A few tweaks will make it excellent',
      gradient: 'from-primary-500 to-primary-600'
    },
    excellent: {
      color: 'success',
      label: 'Excellent',
      icon: Zap,
      description: 'Outstanding profile! You\'re set to impress employers',
      gradient: 'from-success-500 to-success-600'
    }
  };

  const config = strengthConfig[strength];
  const StrengthIcon = config.icon;

  const impactConfig = {
    high: {
      color: 'error',
      label: 'High Impact',
      badge: 'bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 border-error-200'
    },
    medium: {
      color: 'warning',
      label: 'Medium Impact',
      badge: 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 border-warning-200'
    },
    low: {
      color: 'info',
      label: 'Low Impact',
      badge: 'bg-info-50 dark:bg-info-900/20 text-info-700 dark:text-info-300 border-info-200'
    }
  };

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden ${className}`}>
      {/* Header with strength indicator */}
      <div className={`p-6 bg-gradient-to-r ${config.gradient} text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <StrengthIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Profile Strength</h3>
              <p className="text-sm text-white/90">{config.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{score}</div>
            <div className="text-sm text-white/90">{config.label}</div>
          </div>
        </div>

        {/* Score Bar */}
        <div className="relative w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-700 ease-out"
            style={{ width: `${score}%` }}
          >
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/30 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Recommended Actions
            </h4>
            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full">
              {suggestions.length}
            </span>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const impactStyle = impactConfig[suggestion.impact];
              return (
                <div
                  key={suggestion.id}
                  className="group p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Number Badge */}
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h5 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                            {suggestion.title}
                          </h5>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {suggestion.description}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded border ${impactStyle.badge}`}>
                          {impactStyle.label}
                        </span>
                      </div>

                      {/* Action Button */}
                      {suggestion.actionLink && (
                        <button
                          onClick={() => navigate(suggestion.actionLink!)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors group-hover:shadow-md"
                        >
                          {suggestion.actionText}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No suggestions - Profile is excellent */}
      {suggestions.length === 0 && strength === 'excellent' && (
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 dark:bg-success-900/20 rounded-full mb-4">
            <Zap className="w-8 h-8 text-success-600 dark:text-success-400" />
          </div>
          <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            You're all set!
          </h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Your profile is in top shape. Keep it updated to stay competitive.
          </p>
        </div>
      )}

      {/* Stats Footer */}
      <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {score >= 80 ? '3x' : score >= 60 ? '2x' : '1.5x'}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              Visibility Boost
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-success-600 dark:text-success-400">
              {score >= 80 ? '85%' : score >= 60 ? '65%' : '45%'}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              Response Rate
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
              {score >= 80 ? 'Top 10%' : score >= 60 ? 'Top 30%' : 'Top 50%'}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              Profile Rank
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStrengthIndicator;
