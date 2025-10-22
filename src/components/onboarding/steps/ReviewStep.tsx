import React from 'react';
import { CheckCircle, Edit, User, Briefcase, GraduationCap, Award, MapPin, DollarSign } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { Button } from '../../ui/Button';

export const ReviewStep: React.FC = () => {
  const { data, goToStep, getCompletionPercentage } = useOnboarding();

  const completionPercentage = getCompletionPercentage();

  const handleEditSection = (step: number) => {
    goToStep(step);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-success-100 to-primary-100 dark:from-success-900/20 dark:to-primary-900/20 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-success-600" />
        </div>
        <h1 className="text-3xl font-bold text-gradient mb-3">
          Review Your Profile
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Everything looks great! Review and confirm your information
        </p>
      </div>

      {/* Completion Stats */}
      <div className="mb-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Profile Completion
          </h3>
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-white dark:bg-neutral-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        {completionPercentage === 100 && (
          <p className="text-sm text-success-600 dark:text-success-400 mt-3 font-medium">
            🎉 Your profile is 100% complete!
          </p>
        )}
      </div>

      {/* Basic Information */}
      <div className="mb-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 border-b border-primary-200 dark:border-primary-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Basic Information
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Full Name</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {data.fullName || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Headline</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {data.headline || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Location</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {data.location || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Phone</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {data.phone || 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Work Experience */}
      <div className="mb-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 border-b border-primary-200 dark:border-primary-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Briefcase className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Work Experience
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSection(3)}
            leftIcon={<Edit className="w-4 h-4" />}
          >
            Edit
          </Button>
        </div>
        <div className="p-6">
          {data.experiences && data.experiences.length > 0 ? (
            <div className="space-y-4">
              {data.experiences.map((exp, index) => (
                <div key={index} className="pb-4 border-b border-neutral-200 dark:border-neutral-700 last:border-0">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {exp.title} at {exp.company}
                  </h4>
                  {exp.current && (
                    <span className="text-xs text-success-600 dark:text-success-400 font-medium">
                      Current Position
                    </span>
                  )}
                  {exp.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-500 italic">No experience added</p>
          )}
        </div>
      </div>

      {/* Education */}
      <div className="mb-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-900/30 border-b border-secondary-200 dark:border-secondary-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-5 h-5 text-secondary-600" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Education
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSection(3)}
            leftIcon={<Edit className="w-4 h-4" />}
          >
            Edit
          </Button>
        </div>
        <div className="p-6">
          {data.education && data.education.length > 0 ? (
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="pb-4 border-b border-neutral-200 dark:border-neutral-700 last:border-0">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {edu.degree} in {edu.field}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {edu.institution}
                  </p>
                  {edu.current && (
                    <span className="text-xs text-success-600 dark:text-success-400 font-medium">
                      Currently Studying
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-500 italic">No education added</p>
          )}
        </div>
      </div>

      {/* Skills & Preferences */}
      <div className="mb-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 border-b border-primary-200 dark:border-primary-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Skills & Job Preferences
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSection(4)}
            leftIcon={<Edit className="w-4 h-4" />}
          >
            Edit
          </Button>
        </div>
        <div className="p-6 space-y-6">
          {/* Skills */}
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Skills</p>
            {data.skills && data.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-500 italic">No skills added</p>
            )}
          </div>

          {/* Job Types */}
          {data.jobPreferences?.jobType && data.jobPreferences.jobType.length > 0 && (
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Preferred Job Types</p>
              <div className="flex flex-wrap gap-2">
                {data.jobPreferences.jobType.map((type, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 rounded-full text-sm"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {data.jobPreferences?.categories && data.jobPreferences.categories.length > 0 && (
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Interested Categories</p>
              <div className="flex flex-wrap gap-2">
                {data.jobPreferences.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Locations */}
          {data.jobPreferences?.locations && data.jobPreferences.locations.length > 0 && (
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Preferred Locations
              </p>
              <div className="flex flex-wrap gap-2">
                {data.jobPreferences.locations.map((location, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-sm"
                  >
                    {location}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Salary Range */}
          {(data.jobPreferences?.salaryMin || data.jobPreferences?.salaryMax) && (
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Expected Salary Range
              </p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                ₹{data.jobPreferences.salaryMin?.toLocaleString() || '0'} - 
                ₹{data.jobPreferences.salaryMax?.toLocaleString() || '0'} per month
              </p>
            </div>
          )}

          {/* Availability */}
          {data.jobPreferences?.availability && (
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Availability</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                {data.jobPreferences.availability.replace(/-/g, ' ')}
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
            className="mt-1 w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
            defaultChecked
          />
          <label htmlFor="terms" className="text-sm text-neutral-700 dark:text-neutral-300">
            I confirm that all the information provided is accurate and I agree to the{' '}
            <a href="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
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
            <span>Your profile will be activated immediately</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">2.</span>
            <span>Start browsing and applying to jobs right away</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">3.</span>
            <span>Employers can discover and contact you for opportunities</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">4.</span>
            <span>Keep your profile updated for best results</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

