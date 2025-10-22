import React from 'react';
import { CheckCircle, Edit, Building2, Briefcase, DollarSign } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { Button } from '../../ui/Button';

export const EmployerReviewStep: React.FC = () => {
  const { data, goToStep, getCompletionPercentage } = useOnboarding();

  const completionPercentage = getCompletionPercentage();

  const handleEditSection = (step: number) => {
    goToStep(step);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-success-100 to-secondary-100 dark:from-success-900/20 dark:to-secondary-900/20 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-success-600" />
        </div>
        <h1 className="text-3xl font-bold text-gradient mb-3">
          Review Your Company Profile
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Everything looks great! Review and confirm your information
        </p>
      </div>

      {/* Completion Stats */}
      <div className="mb-8 p-6 bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-900/20 dark:to-primary-900/20 rounded-xl border border-secondary-200 dark:border-secondary-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Profile Completion
          </h3>
          <span className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-white dark:bg-neutral-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-secondary-500 to-primary-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        {completionPercentage === 100 && (
          <p className="text-sm text-success-600 dark:text-success-400 mt-3 font-medium">
            🎉 Your company profile is 100% complete!
          </p>
        )}
      </div>

      {/* Company Information */}
      <div className="mb-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-900/30 border-b border-secondary-200 dark:border-secondary-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="w-5 h-5 text-secondary-600" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Company Information
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSection(1)}
            leftIcon={<Edit className="w-4 h-4" />}
          >
            Edit
          </Button>
        </div>
        <div className="p-6">
          {/* Company Logo */}
          {data.companyInfo?.companyLogo && (
            <div className="mb-4 flex justify-center">
              <img
                src={data.companyInfo.companyLogo}
                alt={data.companyInfo.companyName}
                className="w-24 h-24 rounded-xl object-cover border-2 border-neutral-200 dark:border-neutral-700"
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Company Name</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {data.companyInfo?.companyName || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Website</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {data.companyInfo?.companyWebsite || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Company Size</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {data.companyInfo?.companySize ? `${data.companyInfo.companySize} employees` : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Industry</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {data.companyInfo?.industry || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Headquarters</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {data.companyInfo?.headquarters || 'Not provided'}
              </p>
            </div>
          </div>
          
          {data.companyInfo?.description && (
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Company Description</p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {data.companyInfo.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hiring Needs */}
      <div className="mb-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 border-b border-primary-200 dark:border-primary-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Briefcase className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Hiring Needs
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSection(2)}
            leftIcon={<Edit className="w-4 h-4" />}
          >
            Edit
          </Button>
        </div>
        <div className="p-6 space-y-6">
          {/* Roles */}
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Hiring For</p>
            {data.hiringNeeds?.roles && data.hiringNeeds.roles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.hiringNeeds.roles.map((role, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-500 italic">No roles specified</p>
            )}
          </div>

          {/* Required Skills */}
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Required Skills</p>
            {data.hiringNeeds?.skills && data.hiringNeeds.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.hiringNeeds.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-500 italic">No skills specified</p>
            )}
          </div>

          {/* Budget Range */}
          {(data.hiringNeeds?.budgetMin || data.hiringNeeds?.budgetMax) && (
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Budget Range
              </p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                ₹{data.hiringNeeds.budgetMin?.toLocaleString() || '0'} - 
                ₹{data.hiringNeeds.budgetMax?.toLocaleString() || '0'} per month
              </p>
            </div>
          )}

          {/* Urgency */}
          {data.hiringNeeds?.urgency && (
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Hiring Urgency</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                {data.hiringNeeds.urgency.replace(/-/g, ' ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-8 p-6 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 w-4 h-4 text-secondary-600 border-neutral-300 rounded focus:ring-secondary-500"
            defaultChecked
          />
          <label htmlFor="terms" className="text-sm text-neutral-700 dark:text-neutral-300">
            I confirm that all the information provided is accurate and I agree to the{' '}
            <a href="/terms" className="text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 font-medium">
              Privacy Policy
            </a>
          </label>
        </div>
      </div>

      {/* Next Steps Info */}
      <div className="p-6 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl">
        <h3 className="font-semibold text-success-900 dark:text-success-100 mb-3 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          What happens next?
        </h3>
        <ul className="text-sm text-success-700 dark:text-success-300 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">1.</span>
            <span>Your company profile will be activated immediately</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">2.</span>
            <span>You can start posting job openings right away</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">3.</span>
            <span>Candidates matching your criteria will be recommended to you</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">4.</span>
            <span>Review applications and connect with top talent</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EmployerReviewStep;

