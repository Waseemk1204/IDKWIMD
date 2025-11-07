import React from 'react';
import { ArrowRight, Upload, Linkedin, Briefcase, GraduationCap, Award, User, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
}

interface CompletionSuggestionsProps {
  user: any;
  onActionClick?: (action: string) => void;
  maxSuggestions?: number;
  className?: string;
}

export const CompletionSuggestions: React.FC<CompletionSuggestionsProps> = ({
  user,
  onActionClick,
  maxSuggestions = 5,
  className = ''
}) => {
  // Generate suggestions based on missing data
  const generateSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    // Profile photo
    if (!user?.profilePhoto) {
      suggestions.push({
        id: 'profile-photo',
        title: 'Add Profile Photo',
        description: 'Profiles with photos get 14x more views',
        icon: <User className="w-5 h-5" />,
        action: 'upload-photo',
        priority: 'high',
        points: 7
      });
    }

    // Headline
    if (!user?.headline) {
      suggestions.push({
        id: 'headline',
        title: 'Add Professional Headline',
        description: 'Help employers understand what you do',
        icon: <Briefcase className="w-5 h-5" />,
        action: 'add-headline',
        priority: 'high',
        points: 4
      });
    }

    // Location
    if (!user?.location) {
      suggestions.push({
        id: 'location',
        title: 'Add Your Location',
        description: 'Get jobs near you',
        icon: <MapPin className="w-5 h-5" />,
        action: 'add-location',
        priority: 'high',
        points: 4
      });
    }

    // About
    if (!user?.about || user.about.length < 100) {
      suggestions.push({
        id: 'about',
        title: 'Write About Yourself',
        description: 'Tell employers your story',
        icon: <User className="w-5 h-5" />,
        action: 'add-about',
        priority: 'medium',
        points: 8
      });
    }

    // Work experience
    const expCount = user?.experiences?.length || 0;
    if (expCount === 0) {
      suggestions.push({
        id: 'first-experience',
        title: 'Add Work Experience',
        description: 'Show your professional background',
        icon: <Briefcase className="w-5 h-5" />,
        action: 'add-experience',
        priority: 'high',
        points: 10
      });
    } else if (expCount === 1) {
      suggestions.push({
        id: 'more-experience',
        title: 'Add More Experience',
        description: 'Add at least 2 work experiences',
        icon: <Briefcase className="w-5 h-5" />,
        action: 'add-experience',
        priority: 'medium',
        points: 8
      });
    }

    // Education
    const eduCount = user?.education?.length || 0;
    if (eduCount === 0) {
      suggestions.push({
        id: 'first-education',
        title: 'Add Education',
        description: 'Add your educational background',
        icon: <GraduationCap className="w-5 h-5" />,
        action: 'add-education',
        priority: 'high',
        points: 10
      });
    }

    // Skills
    const skillCount = user?.skills?.length || 0;
    if (skillCount < 3) {
      suggestions.push({
        id: 'add-skills',
        title: 'Add More Skills',
        description: `Add ${3 - skillCount} more skills`,
        icon: <Award className="w-5 h-5" />,
        action: 'add-skills',
        priority: 'high',
        points: 5
      });
    } else if (skillCount < 5) {
      suggestions.push({
        id: 'add-more-skills',
        title: 'Add More Skills',
        description: `Add ${5 - skillCount} more skills to stand out`,
        icon: <Award className="w-5 h-5" />,
        action: 'add-skills',
        priority: 'medium',
        points: 5
      });
    }

    // Resume
    if (!user?.resumeUrl) {
      suggestions.push({
        id: 'upload-resume',
        title: 'Upload Your Resume',
        description: 'Quick-fill your profile with AI',
        icon: <Upload className="w-5 h-5" />,
        action: 'upload-resume',
        priority: 'high',
        points: 5
      });
    }

    // LinkedIn
    if (!user?.socialLinks?.linkedin) {
      suggestions.push({
        id: 'link-linkedin',
        title: 'Connect LinkedIn',
        description: 'Import your profile in seconds',
        icon: <Linkedin className="w-5 h-5" />,
        action: 'link-linkedin',
        priority: 'medium',
        points: 2
      });
    }

    // Sort by priority and points
    return suggestions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.points - a.points;
      })
      .slice(0, maxSuggestions);
  };

  const suggestions = generateSuggestions();

  if (suggestions.length === 0) {
    return (
      <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-success-100 dark:bg-success-900/20 rounded-full flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-success-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Profile Complete! 🎉
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Your profile is looking great. Keep it updated to attract more opportunities.
          </p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error-100 dark:bg-error-900/20 text-error-600 dark:text-error-400';
      case 'medium':
        return 'bg-warning-100 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400';
      case 'low':
        return 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400';
      default:
        return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400';
    }
  };

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Quick Actions to Improve Profile
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Complete these actions to increase your visibility
        </p>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="group p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
            onClick={() => onActionClick?.(suggestion.action)}
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className={`flex-shrink-0 p-2.5 rounded-lg ${getPriorityColor(suggestion.priority)}`}>
                {suggestion.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {suggestion.title}
                  </h4>
                  <span className="ml-2 flex-shrink-0 text-xs font-medium text-primary-600 dark:text-primary-400">
                    +{suggestion.points} pts
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {suggestion.description}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Points Available */}
      <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
              Complete all suggestions
            </p>
            <p className="text-xs text-primary-700 dark:text-primary-300 mt-1">
              Earn {suggestions.reduce((sum, s) => sum + s.points, 0)} points total
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onActionClick?.(suggestions[0]?.action)}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

