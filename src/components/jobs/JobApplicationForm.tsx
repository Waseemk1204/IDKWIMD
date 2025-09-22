import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { Button } from '../ui/Button';
import { 
  FileText, 
  Link, 
  DollarSign, 
  Calendar,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ApplicationFormData {
  coverLetter: string;
  salaryExpectation: string;
  availability: string;
  portfolio: string;
  linkedinProfile: string;
  githubProfile: string;
}

export const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  jobId,
  jobTitle,
  companyName,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ApplicationFormData>({
    coverLetter: '',
    salaryExpectation: '',
    availability: '',
    portfolio: '',
    linkedinProfile: '',
    githubProfile: ''
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = 'Cover letter is required';
    } else if (formData.coverLetter.trim().length < 50) {
      newErrors.coverLetter = 'Cover letter must be at least 50 characters';
    } else if (formData.coverLetter.trim().length > 1000) {
      newErrors.coverLetter = 'Cover letter cannot exceed 1000 characters';
    }

    if (formData.salaryExpectation && isNaN(Number(formData.salaryExpectation))) {
      newErrors.salaryExpectation = 'Salary expectation must be a valid number';
    }

    if (formData.portfolio && !isValidUrl(formData.portfolio)) {
      newErrors.portfolio = 'Please enter a valid URL';
    }

    if (formData.linkedinProfile && !isValidUrl(formData.linkedinProfile)) {
      newErrors.linkedinProfile = 'Please enter a valid LinkedIn URL';
    }

    if (formData.githubProfile && !isValidUrl(formData.githubProfile)) {
      newErrors.githubProfile = 'Please enter a valid GitHub URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.submitJobApplication(jobId, {
        coverLetter: formData.coverLetter.trim(),
        salaryExpectation: formData.salaryExpectation ? Number(formData.salaryExpectation) : undefined,
        availability: formData.availability.trim() || undefined,
        portfolio: formData.portfolio.trim() || undefined,
        linkedinProfile: formData.linkedinProfile.trim() || undefined,
        githubProfile: formData.githubProfile.trim() || undefined
      });

      if (response.success) {
        onSuccess();
      } else {
        setErrors({ general: response.message || 'Failed to submit application' });
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setErrors({ general: error.message || 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Apply for {jobTitle}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {companyName}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.general}
                </p>
              </div>
            </div>
          )}

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Cover Letter *
            </label>
            <textarea
              value={formData.coverLetter}
              onChange={(e) => handleInputChange('coverLetter', e.target.value)}
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white ${
                errors.coverLetter 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-neutral-300 dark:border-neutral-600'
              }`}
              rows={6}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.coverLetter && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.coverLetter}
                </p>
              )}
              <p className="text-xs text-neutral-500 ml-auto">
                {formData.coverLetter.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Salary Expectation */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Expected Hourly Rate (₹)
            </label>
            <input
              type="number"
              value={formData.salaryExpectation}
              onChange={(e) => handleInputChange('salaryExpectation', e.target.value)}
              placeholder="e.g., 500"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white ${
                errors.salaryExpectation 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-neutral-300 dark:border-neutral-600'
              }`}
              min="0"
              step="50"
            />
            {errors.salaryExpectation && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.salaryExpectation}
              </p>
            )}
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Availability
            </label>
            <textarea
              value={formData.availability}
              onChange={(e) => handleInputChange('availability', e.target.value)}
              placeholder="e.g., Available 20 hours per week, Monday-Friday 2-6 PM..."
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-neutral-500 mt-1">
              {formData.availability.length}/200 characters
            </p>
          </div>

          {/* Portfolio */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Link className="w-4 h-4 inline mr-1" />
              Portfolio URL
            </label>
            <input
              type="url"
              value={formData.portfolio}
              onChange={(e) => handleInputChange('portfolio', e.target.value)}
              placeholder="https://yourportfolio.com"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white ${
                errors.portfolio 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-neutral-300 dark:border-neutral-600'
              }`}
            />
            {errors.portfolio && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.portfolio}
              </p>
            )}
          </div>

          {/* LinkedIn Profile */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Link className="w-4 h-4 inline mr-1" />
              LinkedIn Profile
            </label>
            <input
              type="url"
              value={formData.linkedinProfile}
              onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white ${
                errors.linkedinProfile 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-neutral-300 dark:border-neutral-600'
              }`}
            />
            {errors.linkedinProfile && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.linkedinProfile}
              </p>
            )}
          </div>

          {/* GitHub Profile */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Link className="w-4 h-4 inline mr-1" />
              GitHub Profile
            </label>
            <input
              type="url"
              value={formData.githubProfile}
              onChange={(e) => handleInputChange('githubProfile', e.target.value)}
              placeholder="https://github.com/yourusername"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white ${
                errors.githubProfile 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-neutral-300 dark:border-neutral-600'
              }`}
            />
            {errors.githubProfile && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.githubProfile}
              </p>
            )}
          </div>

          {/* User Info Display */}
          <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Application will be submitted as:
            </h3>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
