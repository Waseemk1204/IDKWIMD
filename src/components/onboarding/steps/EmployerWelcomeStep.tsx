import React from 'react';
import { Rocket, Users, Target, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export const EmployerWelcomeStep: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full mb-6">
          <Rocket className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gradient mb-4">
          Welcome to Employer Hub{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}! 🚀
        </h1>
        
        <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Let's set up your company profile and start finding great talent for your part-time roles
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 rounded-xl border border-primary-200 dark:border-primary-800">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Access Quality Talent
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Connect with skilled students and professionals ready for part-time work
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-900/30 rounded-xl border border-secondary-200 dark:border-secondary-800">
          <div className="w-12 h-12 bg-secondary-600 rounded-lg flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Smart Matching
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Our AI matches you with candidates who fit your requirements perfectly
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-900/30 rounded-xl border border-success-200 dark:border-success-800">
          <div className="w-12 h-12 bg-success-600 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Fast Hiring Process
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Post jobs in minutes and start receiving applications within hours
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-900/30 rounded-xl border border-warning-200 dark:border-warning-800">
          <div className="w-12 h-12 bg-warning-600 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Build Your Brand
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Showcase your company culture and attract top talent to your organization
          </p>
        </div>
      </div>

      {/* What to Expect */}
      <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-8 border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          What to Expect
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-secondary-100 dark:bg-secondary-900/20 rounded-full flex items-center justify-center mt-0.5">
              <CheckCircle className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Quick Company Setup
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Complete your company profile in just a few minutes
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-secondary-100 dark:bg-secondary-900/20 rounded-full flex items-center justify-center mt-0.5">
              <CheckCircle className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Define Your Needs
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Tell us what roles you're hiring for and your requirements
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-secondary-100 dark:bg-secondary-900/20 rounded-full flex items-center justify-center mt-0.5">
              <CheckCircle className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Start Posting Jobs
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Create and publish job listings immediately after setup
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-secondary-100 dark:bg-secondary-900/20 rounded-full flex items-center justify-center mt-0.5">
              <CheckCircle className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Review Applications
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Access a dashboard to manage all your applicants in one place
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stats */}
      <div className="mt-12 grid grid-cols-3 gap-6">
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
            10,000+
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Active Candidates
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="text-3xl font-bold text-success-600 dark:text-success-400 mb-1">
            95%
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Satisfaction Rate
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="text-3xl font-bold text-secondary-600 dark:text-secondary-400 mb-1">
            24hrs
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Avg. Response Time
          </div>
        </div>
      </div>

      {/* Ready CTA */}
      <div className="mt-12">
        <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          Ready to find your next hire?
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Click "Next" to set up your company profile. You can save your progress at any time.
        </p>
      </div>
    </div>
  );
};

export default EmployerWelcomeStep;

