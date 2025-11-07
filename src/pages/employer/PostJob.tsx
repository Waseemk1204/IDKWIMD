import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
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

  // Set company name from user data
  useEffect(() => {
    if (user?.fullName) {
      setFormData(prev => ({
        ...prev,
        company: user.fullName
      }));
    }
  }, [user]);

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        setIsLoadingWallet(true);
        const response = await apiService.getWallet();
        if (response.success && response.data?.balance !== undefined) {
          setWalletBalance(response.data.balance);
        }
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
      } finally {
        setIsLoadingWallet(false);
      }
    };

    if (user?.role === 'employer' || user?.role === 'admin') {
      fetchWalletBalance();
    }
  }, [user]);

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

  const scrollToFirstError = () => {
    const errorFields = Object.keys(fieldErrors);
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // Focus the field after scrolling
        setTimeout(() => {
          (element as HTMLElement).focus();
        }, 500);
      }
    }
  };

  const validateField = (fieldName: string, value: any) => {
    switch (fieldName) {
      case 'title':
        if (!value || !value.trim()) {
          setFieldError('title', 'Job title is required');
          return false;
        }
        clearFieldError('title');
        return true;
      
      case 'description':
        if (!value || !value.trim()) {
          setFieldError('description', 'Job description is required');
          return false;
        } else if (value.trim().length < 50) {
          setFieldError('description', 'Job description must be at least 50 characters');
          return false;
        }
        clearFieldError('description');
        return true;
      
      case 'company':
        if (!value || !value.trim()) {
          setFieldError('company', 'Company name is required');
          return false;
        }
        clearFieldError('company');
        return true;
      
      case 'category':
        if (!value) {
          setFieldError('category', 'Please select a job category');
          return false;
        }
        clearFieldError('category');
        return true;
      
      case 'minHourlyRate':
        if (!value) {
          setFieldError('minHourlyRate', 'Minimum hourly rate is required');
          return false;
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          setFieldError('minHourlyRate', 'Minimum hourly rate must be a positive number');
          return false;
        }
        // Also check if max rate is valid and min <= max
        if (formData.maxHourlyRate && parseFloat(value) > parseFloat(formData.maxHourlyRate)) {
          setFieldError('maxHourlyRate', 'Maximum hourly rate must be greater than or equal to minimum hourly rate');
        } else {
          clearFieldError('maxHourlyRate');
        }
        clearFieldError('minHourlyRate');
        return true;
      
      case 'maxHourlyRate':
        if (!value) {
          setFieldError('maxHourlyRate', 'Maximum hourly rate is required');
          return false;
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          setFieldError('maxHourlyRate', 'Maximum hourly rate must be a positive number');
          return false;
        } else if (formData.minHourlyRate && parseFloat(value) < parseFloat(formData.minHourlyRate)) {
          setFieldError('maxHourlyRate', 'Maximum hourly rate must be greater than or equal to minimum hourly rate');
          return false;
        }
        clearFieldError('maxHourlyRate');
        return true;
      
      case 'location':
        if (!formData.isRemote && (!value || !value.trim())) {
          setFieldError('location', 'Please provide a location or check "Remote Position"');
          return false;
        }
        clearFieldError('location');
        return true;
      
      case 'skills':
        const skillsArray = value ? value.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill) : [];
        if (skillsArray.length === 0) {
          setFieldError('skills', 'Please provide at least one skill');
          return false;
        }
        clearFieldError('skills');
        return true;
      
      case 'isRemote':
        // When remote is checked, clear location error
        if (value) {
          clearFieldError('location');
        } else {
          // Re-validate location if remote is unchecked
          validateField('location', formData.location);
        }
        return true;
      
      default:
        return true;
    }
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
    
    // Validate the field with the new value
    const fieldValue = type === 'checkbox' ? isChecked : value;
    validateField(name, fieldValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clear all previous errors
    setFieldErrors({});

    try {
      // Check if user is authenticated and is an employer
      if (!user) {
        setFieldError('general', 'Please log in to post a job.');
        navigate('/login');
        setIsSubmitting(false);
        return;
      }

      if (user.role !== 'employer' && user.role !== 'admin') {
        setFieldError('general', 'Only employers can post jobs.');
        setIsSubmitting(false);
        return;
      }

      // Client-side validation with field-specific errors
      let hasErrors = false;

      // Validate all required fields
      const fieldsToValidate = [
        { name: 'title', value: formData.title },
        { name: 'description', value: formData.description },
        { name: 'company', value: formData.company },
        { name: 'category', value: formData.category },
        { name: 'minHourlyRate', value: formData.minHourlyRate },
        { name: 'maxHourlyRate', value: formData.maxHourlyRate },
        { name: 'location', value: formData.location },
        { name: 'skills', value: formData.skills }
      ];

      fieldsToValidate.forEach(field => {
        if (!validateField(field.name, field.value)) {
          hasErrors = true;
        }
      });

      if (hasErrors) {
        setIsSubmitting(false);
        // Scroll to first error after a brief delay to allow state to update
        setTimeout(() => {
          scrollToFirstError();
        }, 100);
        return;
      }

      const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      const requirementsArray = formData.requirements ? formData.requirements.split(',').map(req => req.trim()).filter(req => req) : [];
      const responsibilitiesArray = formData.responsibilities ? formData.responsibilities.split(',').map(resp => resp.trim()).filter(resp => resp) : [];

      const jobData = {
        title: formData.title,
        description: formData.description,
        company: formData.company,
        location: formData.isRemote ? 'Remote' : formData.location,
        hourlyRate: parseFloat(formData.minHourlyRate),
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

      const response = await apiService.createJob(jobData);
      
      if (response.success) {
        // Show success message and redirect
        alert('Job posted successfully!');
        navigate('/employer/jobs');
      } else {
        console.error('Failed to create job:', response);
        
        // Handle insufficient funds error
        if (response.error === 'insufficient_funds' && response.data) {
          const { currentBalance, requiredAmount, shortfall } = response.data;
          setFieldError('wallet', `Insufficient wallet balance. You need ₹${requiredAmount.toLocaleString()} but only have ₹${currentBalance.toLocaleString()}. Shortfall: ₹${shortfall.toLocaleString()}`);
          // Refresh wallet balance
          const walletResponse = await apiService.getWallet();
          if (walletResponse.success && walletResponse.data?.balance !== undefined) {
            setWalletBalance(walletResponse.data.balance);
          }
          setIsSubmitting(false);
          return;
        }
        
        // Handle server validation errors
        if (response.errors && response.errors.length > 0) {
          // Map server validation errors to field-specific errors
          response.errors.forEach((error: any) => {
            const fieldName = error.param || error.path || 'general';
            const message = error.msg || error.message || 'Invalid value';
            setFieldError(fieldName, message);
          });
          // Scroll to first error after a brief delay
          setTimeout(() => {
            scrollToFirstError();
          }, 100);
        } else {
          // General error
          setFieldError('general', response.message || 'Failed to post job. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Error creating job:', error);
      setFieldError('general', error.message || 'Error posting job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate required funds based on form data
  const calculateRequiredFunds = () => {
    if (!formData.minHourlyRate || !formData.hoursPerWeek) return 0;
    const hourlyRate = parseFloat(formData.minHourlyRate) || 0;
    const hoursPerWeek = parseInt(formData.hoursPerWeek) || 20;
    return hourlyRate * hoursPerWeek * 4; // 1 month = 4 weeks
  };

  const requiredFunds = calculateRequiredFunds();
  const hasSufficientFunds = walletBalance !== null && walletBalance >= requiredFunds;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Post a New Job
      </h1>
      
      {/* Wallet Balance Info */}
      {!isLoadingWallet && walletBalance !== null && (
        <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-4 border-2 ${
          hasSufficientFunds 
            ? 'border-green-200 dark:border-green-800' 
            : 'border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Wallet Balance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ₹{walletBalance.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Required Funds (1 month)
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                hasSufficientFunds 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                ₹{requiredFunds.toLocaleString()}
              </p>
              {!hasSufficientFunds && formData.minHourlyRate && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Shortfall: ₹{(requiredFunds - walletBalance).toLocaleString()}
                </p>
              )}
            </div>
            <div className="ml-4">
              <button
                type="button"
                onClick={() => navigate('/employer/wallet')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Add Funds
              </button>
            </div>
          </div>
          {!hasSufficientFunds && formData.minHourlyRate && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                ⚠️ You need to add funds to your wallet before posting this job. Minimum required: ₹{requiredFunds.toLocaleString()} for one month of payments.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {fieldErrors.general && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              {fieldErrors.general}
            </p>
          </div>
        )}
        {fieldErrors.wallet && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">
              {fieldErrors.wallet}
            </p>
            <button
              type="button"
              onClick={() => navigate('/employer/wallet')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Go to Wallet to Add Funds →
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
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
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
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
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
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
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
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
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
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
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
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
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
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
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Hours per Week *
              </label>
              <input 
                type="text" 
                name="hoursPerWeek"
                value={formData.hoursPerWeek}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 sm:text-sm cursor-not-allowed" 
                placeholder="20 hours" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Job Duration *
              </label>
              <input 
                type="text" 
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" 
                placeholder="e.g. 3-6 months" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
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
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
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
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Responsibilities
            </label>
            <input 
              type="text" 
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" 
              placeholder="e.g. Develop web applications, Write content (comma separated)" 
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
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
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
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

          <div>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                name="isRemote"
                checked={formData.isRemote}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                This is a remote position
              </span>
            </label>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting Job...
                </div>
              ) : (
                'Post Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};