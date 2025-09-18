import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const EditJob: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    minHourlyRate: '',
    maxHourlyRate: '',
    hoursPerWeek: '20',
    duration: '',
    skills: '',
    requirements: '',
    responsibilities: '',
    category: '',
    experienceLevel: 'entry',
    isRemote: false,
    urgency: 'medium'
  });

  // Load job data
  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        navigate('/employer/jobs');
        return;
      }

      try {
        const response = await apiService.getJobById(id);
        if (response.success && response.data?.job) {
          const job = response.data.job;
          setFormData({
            title: job.title || '',
            description: job.description || '',
            company: job.company || '',
            location: job.location || '',
            minHourlyRate: job.minHourlyRate?.toString() || '',
            maxHourlyRate: job.maxHourlyRate?.toString() || '',
            hoursPerWeek: job.hoursPerWeek || '20',
            duration: job.duration || '',
            skills: job.skills?.join(', ') || '',
            requirements: job.requirements?.join(', ') || '',
            responsibilities: job.responsibilities?.join(', ') || '',
            category: job.category || '',
            experienceLevel: job.experienceLevel || 'entry',
            isRemote: job.isRemote || false,
            urgency: job.urgency || 'medium'
          });
        } else {
          alert('Job not found');
          navigate('/employer/jobs');
        }
      } catch (error) {
        console.error('Failed to load job:', error);
        alert('Failed to load job details');
        navigate('/employer/jobs');
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id, navigate]);

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

  const FieldError = ({ fieldName }: { fieldName: string }) => {
    const error = fieldErrors[fieldName];
    if (!error) return null;
    
    return (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  };

  const getFieldClassName = (fieldName: string, baseClassName: string) => {
    const hasError = fieldErrors[fieldName];
    if (hasError) {
      return baseClassName.replace(
        'border-gray-300 dark:border-gray-700',
        'border-red-500 dark:border-red-500'
      ).replace(
        'focus:ring-blue-500 focus:border-blue-500',
        'focus:ring-red-500 focus:border-red-500'
      );
    }
    return baseClassName;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isChecked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? isChecked : value,
      // Clear location if remote position is checked
      ...(name === 'isRemote' && isChecked ? { location: '' } : {})
    }));
    
    // Clear field error when user starts typing
    clearFieldError(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clear all previous errors
    setFieldErrors({});

    try {
      // Check if user is authenticated and is an employer
      if (!user) {
        setFieldError('general', 'Please log in to edit a job.');
        navigate('/login');
        setIsSubmitting(false);
        return;
      }

      if (user.role !== 'employer' && user.role !== 'admin') {
        setFieldError('general', 'Only employers can edit jobs.');
        setIsSubmitting(false);
        return;
      }

      // Client-side validation
      let hasErrors = false;

      if (!formData.title.trim()) {
        setFieldError('title', 'Job title is required');
        hasErrors = true;
      }

      if (!formData.description.trim()) {
        setFieldError('description', 'Job description is required');
        hasErrors = true;
      } else if (formData.description.trim().length < 50) {
        setFieldError('description', 'Job description must be at least 50 characters');
        hasErrors = true;
      }

      if (!formData.company.trim()) {
        setFieldError('company', 'Company name is required');
        hasErrors = true;
      }

      if (!formData.category) {
        setFieldError('category', 'Please select a job category');
        hasErrors = true;
      }

      if (!formData.minHourlyRate) {
        setFieldError('minHourlyRate', 'Minimum hourly rate is required');
        hasErrors = true;
      } else if (isNaN(parseFloat(formData.minHourlyRate)) || parseFloat(formData.minHourlyRate) <= 0) {
        setFieldError('minHourlyRate', 'Minimum hourly rate must be a positive number');
        hasErrors = true;
      }

      if (!formData.maxHourlyRate) {
        setFieldError('maxHourlyRate', 'Maximum hourly rate is required');
        hasErrors = true;
      } else if (isNaN(parseFloat(formData.maxHourlyRate)) || parseFloat(formData.maxHourlyRate) <= 0) {
        setFieldError('maxHourlyRate', 'Maximum hourly rate must be a positive number');
        hasErrors = true;
      }

      if (formData.minHourlyRate && formData.maxHourlyRate && parseFloat(formData.minHourlyRate) > parseFloat(formData.maxHourlyRate)) {
        setFieldError('maxHourlyRate', 'Maximum hourly rate must be greater than or equal to minimum hourly rate');
        hasErrors = true;
      }

      if (!formData.isRemote && !formData.location.trim()) {
        setFieldError('location', 'Please provide a location or check "Remote Position"');
        hasErrors = true;
      }

      const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      if (skillsArray.length === 0) {
        setFieldError('skills', 'Please provide at least one skill');
        hasErrors = true;
      }

      if (hasErrors) {
        setIsSubmitting(false);
        return;
      }

      const requirementsArray = formData.requirements ? formData.requirements.split(',').map(req => req.trim()).filter(req => req) : [];
      const responsibilitiesArray = formData.responsibilities ? formData.responsibilities.split(',').map(resp => resp.trim()).filter(resp => resp) : [];

      const jobData = {
        title: formData.title,
        description: formData.description,
        company: formData.company,
        location: formData.isRemote ? 'Remote' : formData.location,
        hourlyRate: formData.minHourlyRate ? parseFloat(formData.minHourlyRate) : 0,
        minHourlyRate: parseFloat(formData.minHourlyRate),
        maxHourlyRate: parseFloat(formData.maxHourlyRate),
        hoursPerWeek: formData.hoursPerWeek,
        duration: formData.duration,
        skills: skillsArray,
        requirements: requirementsArray,
        responsibilities: responsibilitiesArray,
        benefits: [],
        category: formData.category,
        experienceLevel: formData.experienceLevel,
        isRemote: formData.isRemote,
        urgency: formData.urgency,
        status: 'active',
        isFeatured: true
      };

      const response = await apiService.updateJob(id!, jobData);
      
      if (response.success) {
        alert('Job updated successfully!');
        navigate('/employer/jobs');
      } else {
        console.error('Failed to update job:', response);
        
        // Handle server validation errors
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error: any) => {
            const fieldName = error.param || error.path || 'general';
            const message = error.msg || error.message || 'Invalid value';
            setFieldError(fieldName, message);
          });
        } else {
          setFieldError('general', response.message || 'Failed to update job. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Error updating job:', error);
      setFieldError('general', error.message || 'Error updating job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse"></div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Edit Job
      </h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {fieldErrors.general && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              {fieldErrors.general}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Job Title *
            </label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required 
              className={getFieldClassName('title', "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm")}
              placeholder="e.g. Web Developer, Content Writer" 
            />
            <FieldError fieldName="title" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Company Name *
            </label>
            <input 
              type="text" 
              name="company"
              value={formData.company}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 sm:text-sm cursor-not-allowed" 
              placeholder="Your company name" 
            />
            <FieldError fieldName="company" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Job Description *
            </label>
            <textarea 
              rows={4} 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required 
              className={getFieldClassName('description', "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm")}
              placeholder="Describe the job responsibilities and requirements"
            />
            <FieldError fieldName="description" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location *
              </label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required={!formData.isRemote}
                disabled={formData.isRemote}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  formData.isRemote 
                    ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                    : 'dark:bg-gray-700 dark:text-white'
                }`}
                placeholder={formData.isRemote ? "Remote position" : "e.g. Mumbai, Delhi"} 
              />
              <FieldError fieldName="location" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Job Category *
              </label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="">Select Category</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="writing">Content Writing</option>
                <option value="data">Data Analysis</option>
                <option value="customer-service">Customer Service</option>
                <option value="sales">Sales</option>
                <option value="other">Other</option>
              </select>
              <FieldError fieldName="category" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Min Hourly Rate (₹) *
              </label>
              <input 
                type="number" 
                name="minHourlyRate"
                value={formData.minHourlyRate}
                onChange={handleInputChange}
                min="0" 
                required
                className={getFieldClassName('minHourlyRate', "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm")}
                placeholder="400" 
              />
              <FieldError fieldName="minHourlyRate" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Hourly Rate (₹) *
              </label>
              <input 
                type="number" 
                name="maxHourlyRate"
                value={formData.maxHourlyRate}
                onChange={handleInputChange}
                min="0" 
                required
                className={getFieldClassName('maxHourlyRate', "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm")}
                placeholder="600" 
              />
              <FieldError fieldName="maxHourlyRate" />
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>• Provide a pay range for hourly compensation</p>
            <p>• Max rate should be higher than or equal to min rate</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hours per Week
              </label>
              <input 
                type="text" 
                name="hoursPerWeek"
                value={formData.hoursPerWeek}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 sm:text-sm cursor-not-allowed" 
                placeholder="20" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Duration
              </label>
              <input 
                type="text" 
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" 
                placeholder="e.g. 3-6 months" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Required Skills *
            </label>
            <input 
              type="text" 
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              required 
              className={getFieldClassName('skills', "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm")}
              placeholder="e.g. React, JavaScript, Content Writing (comma separated)" 
            />
            <FieldError fieldName="skills" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Requirements
            </label>
            <input 
              type="text" 
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" 
              placeholder="e.g. 2+ years experience, Bachelor's degree (comma separated)" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Responsibilities
            </label>
            <input 
              type="text" 
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" 
              placeholder="e.g. Write content, Manage social media (comma separated)" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Experience Level
              </label>
              <select 
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Urgency
              </label>
              <select 
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input 
              type="checkbox" 
              name="isRemote"
              checked={formData.isRemote}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remote Position
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button 
              type="button"
              onClick={() => navigate('/employer/jobs')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
