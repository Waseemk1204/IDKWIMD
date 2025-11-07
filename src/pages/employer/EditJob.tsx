import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft,
  Save,
  AlertCircle
} from 'lucide-react';

export const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [job, setJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    minHourlyRate: '',
    maxHourlyRate: '',
    hoursPerWeek: '',
    duration: '',
    skills: '',
    requirements: '',
    responsibilities: '',
    category: '',
    experienceLevel: 'entry',
    isRemote: false,
    urgency: 'medium',
    status: 'active'
  });

  // Load job data
  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setError('Job ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiService.getJobById(id);
        if (response.success && response.data?.job) {
          const jobData = response.data.job;
          setJob(jobData);
          
          // Check if user owns this job
          if (jobData.employer._id !== user?._id) {
            setError('You can only edit your own jobs');
            setIsLoading(false);
            return;
          }

          // Populate form with existing data
          setFormData({
            title: jobData.title || '',
            description: jobData.description || '',
            company: jobData.company || '',
            location: jobData.location || '',
            minHourlyRate: jobData.minHourlyRate?.toString() || '',
            maxHourlyRate: jobData.maxHourlyRate?.toString() || '',
            hoursPerWeek: jobData.hoursPerWeek || '',
            duration: jobData.duration || '',
            skills: jobData.skills?.join(', ') || '',
            requirements: jobData.requirements?.join('\n') || '',
            responsibilities: jobData.responsibilities?.join('\n') || '',
            category: jobData.category || '',
            experienceLevel: jobData.experienceLevel || 'entry',
            isRemote: jobData.isRemote || false,
            urgency: jobData.urgency || 'medium',
            status: jobData.status || 'active'
          });
        } else {
          setError('Job not found');
        }
      } catch (error) {
        console.error('Failed to load job:', error);
        setError('Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id, user]);

  const clearFieldError = (fieldName: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const setFieldError = (fieldName: string, message: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: message
    }));
  };

  const validateField = (fieldName: string, value: any) => {
    clearFieldError(fieldName);

    switch (fieldName) {
      case 'title':
        if (!value || value.trim().length < 5) {
          setFieldError(fieldName, 'Job title must be at least 5 characters');
        } else if (value.trim().length > 100) {
          setFieldError(fieldName, 'Job title cannot exceed 100 characters');
        }
        break;
      case 'description':
        if (!value || value.trim().length < 50) {
          setFieldError(fieldName, 'Description must be at least 50 characters');
        } else if (value.trim().length > 2000) {
          setFieldError(fieldName, 'Description cannot exceed 2000 characters');
        }
        break;
      case 'company':
        if (!value || value.trim().length < 2) {
          setFieldError(fieldName, 'Company name must be at least 2 characters');
        }
        break;
      case 'minHourlyRate':
      case 'maxHourlyRate':
        if (value && (isNaN(Number(value)) || Number(value) < 0)) {
          setFieldError(fieldName, 'Rate must be a positive number');
        }
        break;
      case 'skills':
        if (!value || value.trim().length === 0) {
          setFieldError(fieldName, 'At least one skill is required');
        }
        break;
      case 'category':
        if (!value || value.trim().length === 0) {
          setFieldError(fieldName, 'Category is required');
        }
        break;
      case 'duration':
        if (value && value.trim()) {
          const trimmedDuration = value.trim().toLowerCase();
          // Check if it's just a single digit or number
          if (/^\d+$/.test(trimmedDuration)) {
            setFieldError(fieldName, 'Duration must include a unit (e.g., "3 months", "6 weeks", "1 year")');
          } else {
            // Check if it contains weeks, months, or years
            const hasValidUnit = /\b(weeks?|months?|years?)\b/i.test(trimmedDuration);
            if (!hasValidUnit) {
              setFieldError(fieldName, 'Duration must include "weeks", "months", or "years" (e.g., "3 months", "6 weeks", "1 year")');
            }
          }
        }
        break;
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    const fieldsToValidate = ['title', 'description', 'company', 'skills', 'category'];
    fieldsToValidate.forEach(field => {
      validateField(field, formData[field as keyof typeof formData]);
    });

    // Check for any errors
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        ...formData,
        minHourlyRate: formData.minHourlyRate ? Number(formData.minHourlyRate) : undefined,
        maxHourlyRate: formData.maxHourlyRate ? Number(formData.maxHourlyRate) : undefined,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
        requirements: formData.requirements.split('\n').map(r => r.trim()).filter(r => r.length > 0),
        responsibilities: formData.responsibilities.split('\n').map(r => r.trim()).filter(r => r.length > 0)
      };

      const response = await apiService.updateJob(id!, updateData);
      if (response.success) {
        navigate('/employer/jobs');
      } else {
        setError(response.message || 'Failed to update job');
      }
    } catch (error: any) {
      console.error('Error updating job:', error);
      setError(error.message || 'Failed to update job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 animate-pulse"></div>
            <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/employer/jobs')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/employer/jobs')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Job
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Update your job posting details
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  fieldErrors.title ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g. Web Developer, Content Writer"
              />
              {fieldErrors.title && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{fieldErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  fieldErrors.company ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Your company name"
              />
              {fieldErrors.company && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{fieldErrors.company}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                fieldErrors.description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
            {fieldErrors.description && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{fieldErrors.description}</p>
            )}
          </div>

          {/* Location and Remote */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. Mumbai, Remote, Hybrid"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isRemote"
                checked={formData.isRemote}
                onChange={(e) => handleInputChange('isRemote', e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="isRemote" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Remote work allowed
              </label>
            </div>
          </div>

          {/* Pay Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Hourly Rate (₹)
              </label>
              <input
                type="number"
                value={formData.minHourlyRate}
                onChange={(e) => handleInputChange('minHourlyRate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  fieldErrors.minHourlyRate ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., 300"
                min="0"
                step="50"
              />
              {fieldErrors.minHourlyRate && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{fieldErrors.minHourlyRate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Hourly Rate (₹)
              </label>
              <input
                type="number"
                value={formData.maxHourlyRate}
                onChange={(e) => handleInputChange('maxHourlyRate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  fieldErrors.maxHourlyRate ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., 800"
                min="0"
                step="50"
              />
              {fieldErrors.maxHourlyRate && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{fieldErrors.maxHourlyRate}</p>
              )}
            </div>
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hours Per Week
              </label>
              <input
                type="text"
                value={formData.hoursPerWeek}
                onChange={(e) => handleInputChange('hoursPerWeek', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., 20-30 hours"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  fieldErrors.duration ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., 3 months, 6 weeks, 1 year"
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  // Auto-validate if user enters just a number
                  if (value && /^\d+$/.test(value)) {
                    setFieldErrors(prev => ({
                      ...prev,
                      duration: 'Please include a unit: "weeks", "months", or "years"'
                    }));
                  }
                }}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Format: number followed by "weeks", "months", or "years" (e.g., "3 months", "6 weeks", "1 year")
              </p>
              {fieldErrors.duration && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{fieldErrors.duration}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>
          </div>

          {/* Category and Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  fieldErrors.category ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Category</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="writing">Content Writing</option>
                <option value="data">Data Analysis</option>
                <option value="sales">Sales</option>
                <option value="customer-service">Customer Service</option>
                <option value="other">Other</option>
              </select>
              {fieldErrors.category && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{fieldErrors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Urgency
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Required Skills * (comma-separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                fieldErrors.skills ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="e.g., React, JavaScript, Node.js, Python"
            />
            {fieldErrors.skills && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{fieldErrors.skills}</p>
            )}
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requirements (one per line)
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Bachelor's degree in Computer Science&#10;2+ years of experience&#10;Portfolio of previous work"
            />
          </div>

          {/* Responsibilities */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Responsibilities (one per line)
            </label>
            <textarea
              value={formData.responsibilities}
              onChange={(e) => handleInputChange('responsibilities', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Develop and maintain web applications&#10;Collaborate with design team&#10;Write clean, maintainable code"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/employer/jobs')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Job
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};