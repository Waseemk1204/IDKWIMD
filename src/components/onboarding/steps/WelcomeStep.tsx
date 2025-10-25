import React from 'react';
import { Sparkles, Briefcase, TrendingUp, Users, Zap, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export const WelcomeStep: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-4">
          Welcome{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}! 🎉
        </h1>
        
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Let's set up your profile to connect you with amazing part-time opportunities
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 rounded-xl border border-primary-200 dark:border-primary-800">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Find Great Opportunities
          </h3>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Get matched with part-time jobs that fit your skills, schedule, and goals
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-900/30 rounded-xl border border-secondary-200 dark:border-secondary-800">
          <div className="w-12 h-12 bg-secondary-600 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Grow Your Career
          </h3>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Build experience, develop new skills, and expand your professional network
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-900/30 rounded-xl border border-success-200 dark:border-success-800">
          <div className="w-12 h-12 bg-success-600 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Quick & Easy Process
          </h3>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Apply to jobs with one click. Get responses faster from interested employers
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-900/30 rounded-xl border border-warning-200 dark:border-warning-800">
          <div className="w-12 h-12 bg-warning-600 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Join Our Community
          </h3>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Connect with thousands of students and professionals finding part-time work
          </p>
        </div>
      </div>

      {/* What to Expect */}
      <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-8 border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          What to Expect
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mt-0.5">
              <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                5-Minute Setup
              </h4>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                Complete your profile in just a few simple steps
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mt-0.5">
              <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Resume Import
              </h4>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                Upload your resume and we'll auto-fill your profile
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mt-0.5">
              <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Smart Matching
              </h4>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                Get personalized job recommendations based on your profile
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mt-0.5">
              <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Instant Visibility
              </h4>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                Employers can find and reach out to you directly
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ready CTA */}
      <div className="mt-12">
        <p className="text-base sm:text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          Ready to get started?
        </p>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Click "Next" to begin building your profile. You can save your progress at any time.
        </p>
      </div>
    </div>
  );
};

export default WelcomeStep;

