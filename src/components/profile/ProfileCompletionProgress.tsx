import React from 'react';
import { Button } from '../ui/Button';
import { 
  CheckCircle, 
  Circle, 
  User, 
  Briefcase, 
  FileText, 
  Star,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface ProfileCompletionItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
}

interface ProfileCompletionProgressProps {
  completionPercentage: number;
  items: ProfileCompletionItem[];
  onCompleteProfile: () => void;
  onItemClick: (itemId: string) => void;
}

export const ProfileCompletionProgress: React.FC<ProfileCompletionProgressProps> = ({
  completionPercentage,
  items,
  onCompleteProfile,
  onItemClick: _onItemClick // TODO: Implement item click functionality
}) => {
  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;
  const requiredItems = items.filter(item => item.required);
  const completedRequiredItems = requiredItems.filter(item => item.completed).length;
  const allRequiredCompleted = completedRequiredItems === requiredItems.length;

  const getCompletionStatus = () => {
    if (completionPercentage === 100) {
      return {
        status: 'complete',
        message: 'Profile is complete!',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900'
      };
    } else if (allRequiredCompleted) {
      return {
        status: 'good',
        message: 'Profile is ready for job applications',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900'
      };
    } else {
      return {
        status: 'incomplete',
        message: 'Complete required fields to start applying',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900'
      };
    }
  };

  const status = getCompletionStatus();

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Profile Completion
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {completedItems} of {totalItems} sections completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {Math.round(completionPercentage)}%
            </div>
            <div className="text-xs text-neutral-500">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className={`mt-4 p-3 rounded-lg ${status.bgColor}`}>
          <div className="flex items-center">
            {status.status === 'complete' ? (
              <CheckCircle className={`h-5 w-5 ${status.color} mr-2`} />
            ) : (
              <AlertCircle className={`h-5 w-5 ${status.color} mr-2`} />
            )}
            <p className={`text-sm font-medium ${status.color}`}>
              {status.message}
            </p>
          </div>
        </div>
      </div>

      {/* Completion Items */}
      <div className="p-6">
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  item.completed
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : item.required
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                      : 'bg-neutral-50 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-600'
                }`}
                onClick={() => item.action && item.action()}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    item.completed
                      ? 'bg-green-100 dark:bg-green-800'
                      : 'bg-neutral-100 dark:bg-neutral-600'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      item.completed
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-neutral-900 dark:text-white">
                        {item.title}
                      </h4>
                      {item.required && !item.completed && (
                        <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-neutral-400" />
                  )}
                  {item.action && (
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {!allRequiredCompleted && (
            <Button
              onClick={onCompleteProfile}
              className="flex-1"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Complete Required Fields
            </Button>
          )}
          
          {allRequiredCompleted && completionPercentage < 100 && (
            <Button
              onClick={onCompleteProfile}
              variant="outline"
              className="flex-1"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Complete Profile
            </Button>
          )}

          {completionPercentage === 100 && (
            <div className="flex-1 text-center py-2">
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Profile Complete!</span>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        {!allRequiredCompleted && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Quick Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Complete all required fields to start applying for jobs</li>
              <li>• Add skills and experience to increase your visibility</li>
              <li>• Upload a professional profile picture</li>
              <li>• Verify your skills to build credibility</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to calculate completion percentage
export const calculateProfileCompletion = (items: ProfileCompletionItem[]): number => {
  if (items.length === 0) return 0;
  
  const completedItems = items.filter(item => item.completed).length;
  return Math.round((completedItems / items.length) * 100);
};

// Helper function to get profile completion items
export const getProfileCompletionItems = (
  user: any,
  onPersonalInfo: () => void,
  onProfessionalInfo: () => void,
  onPortfolio: () => void,
  onSkills: () => void,
  onPreferences: () => void
): ProfileCompletionItem[] => {
  return [
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Add your basic details and contact information',
      completed: !!(user?.firstName && user?.lastName && user?.email && user?.phone && user?.location),
      required: true,
      icon: User,
      action: onPersonalInfo
    },
    {
      id: 'professional-info',
      title: 'Professional Information',
      description: 'Add your title, bio, and work experience',
      completed: !!(user?.title && user?.bio && user?.experience),
      required: true,
      icon: Briefcase,
      action: onProfessionalInfo
    },
    {
      id: 'skills',
      title: 'Skills & Expertise',
      description: 'Add your skills and verify them to build credibility',
      completed: !!(user?.skills && user.skills.length > 0),
      required: true,
      icon: Star,
      action: onSkills
    },
    {
      id: 'portfolio',
      title: 'Portfolio & Documents',
      description: 'Upload your resume and portfolio to showcase your work',
      completed: !!(user?.portfolio || user?.resume),
      required: false,
      icon: FileText,
      action: onPortfolio
    },
    {
      id: 'preferences',
      title: 'Job Preferences',
      description: 'Set your availability, rate, and work preferences',
      completed: !!(user?.availability && user?.hourlyRate),
      required: false,
      icon: Star,
      action: onPreferences
    }
  ];
};

