import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Building2, Briefcase, Mail, Phone, MapPin } from 'lucide-react';
import { VerifiedBadge, TrustBadge } from '../../components/ui/TrustBadge';

interface FormData {
  companyName: string;
  email: string;
  phone: string;
  businessType: string;
  industry: string;
  companySize: string;
  location: string;
  description: string;
  website: string;
}

interface FormErrors {
  companyName?: string;
  email?: string;
  phone?: string;
  businessType?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  website?: string;
}

export const OnboardingEmployer: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    email: '',
    phone: '',
    businessType: '',
    industry: '',
    companySize: '',
    location: '',
    description: '',
    website: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.businessType) {
      newErrors.businessType = 'Please select your business type';
    }

    if (!formData.industry) {
      newErrors.industry = 'Please select your industry';
    }

    if (!formData.companySize) {
      newErrors.companySize = 'Please select your company size';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await completeOnboarding({
        fullName: formData.companyName,
        phone: formData.phone,
        about: formData.description,
        location: formData.location,
        companyInfo: {
          companyName: formData.companyName,
          industry: formData.industry,
          companySize: formData.companySize,
          description: formData.description,
          website: formData.website
        },
        isVerified: false
      });
      navigate('/employer');
    } catch (error) {
      console.error('Profile completion failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Complete Your Employer Profile
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Tell us about your business to start hiring talent
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
            <VerifiedBadge size="sm" />
            <TrustBadge variant="secure" size="sm" text="Secure" />
            <TrustBadge variant="protected" size="sm" text="Protected" />
          </div>
        </div>

        {/* Form */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-primary-500" />
              Company Profile Setup
            </CardTitle>
            <CardDescription>
              This information will help students understand your company and opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-primary-500" />
                  Company Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    error={errors.companyName}
                    placeholder="Enter your company name"
                    leftIcon={<Building2 className="h-4 w-4" />}
                    required
                  />
                  
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="company@example.com"
                    leftIcon={<Mail className="h-4 w-4" />}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="+1 (555) 123-4567"
                    leftIcon={<Phone className="h-4 w-4" />}
                  />
                  
                  <Input
                    label="Location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    error={errors.location}
                    placeholder="City, State/Country"
                    leftIcon={<MapPin className="h-4 w-4" />}
                    required
                  />
                </div>
              </div>

              {/* Business Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary-500" />
                  Business Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Business Type
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className={`input-professional ${errors.businessType ? 'border-error-300 dark:border-error-600 bg-error-50 dark:bg-error-900/20' : ''}`}
                      required
                    >
                      <option value="">Select business type</option>
                      <option value="Small Business">Small Business</option>
                      <option value="Corporation">Corporation</option>
                      <option value="Agency">Agency</option>
                      <option value="Non-Profit">Non-Profit</option>
                      <option value="Startup">Startup</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.businessType && (
                      <p className="text-sm text-error-600 dark:text-error-400">
                        {errors.businessType}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Industry
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className={`input-professional ${errors.industry ? 'border-error-300 dark:border-error-600 bg-error-50 dark:bg-error-900/20' : ''}`}
                      required
                    >
                      <option value="">Select industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Finance">Finance</option>
                      <option value="Retail">Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.industry && (
                      <p className="text-sm text-error-600 dark:text-error-400">
                        {errors.industry}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Company Size
                  </label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className={`input-professional ${errors.companySize ? 'border-error-300 dark:border-error-600 bg-error-50 dark:bg-error-900/20' : ''}`}
                    required
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                  {errors.companySize && (
                    <p className="text-sm text-error-600 dark:text-error-400">
                      {errors.companySize}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Company Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us about your company, culture, and what makes you unique..."
                    className="input-professional"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  loadingText="Completing Profile..."
                  trustIndicator
                >
                  Complete Profile & Start Hiring
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};