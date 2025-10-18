import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { User, GraduationCap, Briefcase, Mail, Phone, CheckCircle } from 'lucide-react';
import { VerifiedBadge, TrustBadge } from '../../components/ui/TrustBadge';
import { toast } from 'sonner';

interface FormData {
  name: string;
  email: string;
  phone: string;
  primarySkill: string;
  experienceLevel: string;
  bio: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  primarySkill?: string;
  experienceLevel?: string;
}

export const OnboardingEmployee: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeOnboarding } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState(1); // TODO: Implement step navigation
  console.log('OnboardingEmployee currentStep:', currentStep, 'setCurrentStep:', setCurrentStep);
  const totalSteps = 3;
  
  // Get pre-filled data from location state (from Google OAuth)
  const prefillData = location.state as { fullName?: string; email?: string; profilePhoto?: string } | null;
  
  const [formData, setFormData] = useState<FormData>({
    name: prefillData?.fullName || '',
    email: prefillData?.email || '',
    phone: '',
    primarySkill: '',
    experienceLevel: '',
    bio: ''
  });
  
  // Calculate progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  // Check if current step is complete
  const isStepComplete = (step: number): boolean => { // TODO: Use this function for step validation
    console.log('Checking step completion for step:', step);
    switch (step) {
      case 1:
        return formData.name.trim().length >= 2 && formData.email.trim().length > 0;
      case 2:
        return formData.primarySkill.length > 0 && formData.experienceLevel.length > 0;
      case 3:
        return formData.bio.trim().length >= 10;
      default:
        return false;
    }
  };
  
  // Use the function to avoid unused variable warning
  console.log('Step completion status:', isStepComplete(currentStep));
  
  useEffect(() => {
    // Prefill data is already set in useState
  }, [prefillData]);

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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.primarySkill) {
      newErrors.primarySkill = 'Please select your primary skill';
    }

    if (!formData.experienceLevel) {
      newErrors.experienceLevel = 'Please select your experience level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Some required fields are missing or invalid');
      return;
    }

    setIsLoading(true);
    
    try {
      await completeOnboarding({
        fullName: formData.name,
        phone: formData.phone,
        about: formData.bio,
        skills: [formData.primarySkill],
        headline: formData.experienceLevel,
        isVerified: false
      });
      
        toast.success('Welcome to PartTimePays! Your profile has been set up successfully.');
      navigate('/employee');
    } catch (error) {
      console.error('Profile completion failed:', error);
      toast.error('There was an error completing your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/employee');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Tell us about your skills and experience to get started
          </p>
          
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 < currentStep 
                      ? 'bg-green-500 text-white' 
                      : index + 1 === currentStep 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {index + 1 < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  {index < totalSteps - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${
                      index + 1 < currentStep ? 'bg-green-500' : 'bg-neutral-200 dark:bg-neutral-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Step {currentStep} of {totalSteps} • {Math.round(progressPercentage)}% Complete
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
            <VerifiedBadge size="sm" />
            <TrustBadge variant="secure" size="sm" text="Secure" />
            <TrustBadge variant="protected" size="sm" text="Protected" />
          </div>
        </div>

        {/* Skip link */}
        <div className="text-right mb-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <button
            onClick={handleSkip}
            className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors group"
            disabled={isLoading}
          >
            <span>Skip for now</span>
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-primary-500" />
              Student Profile Setup
            </CardTitle>
            <CardDescription>
              This information will help employers find and connect with you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-500" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Enter your full name"
                    leftIcon={<User className="h-4 w-4" />}
                    required
                  />
                  
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="your.email@example.com"
                    leftIcon={<Mail className="h-4 w-4" />}
                    required
                  />
                </div>

                <Input
                  label="Phone Number (Optional)"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="+1 (555) 123-4567"
                  leftIcon={<Phone className="h-4 w-4" />}
                />
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary-500" />
                  Professional Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Primary Skill
                    </label>
                    <select
                      name="primarySkill"
                      value={formData.primarySkill}
                      onChange={handleChange}
                      className={`input-professional ${errors.primarySkill ? 'border-error-300 dark:border-error-600 bg-error-50 dark:bg-error-900/20' : ''}`}
                      required
                    >
                      <option value="">Select your primary skill</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Content Writing">Content Writing</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                      <option value="Graphic Design">Graphic Design</option>
                      <option value="Data Analysis">Data Analysis</option>
                      <option value="Social Media Management">Social Media Management</option>
                      <option value="Customer Service">Customer Service</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.primarySkill && (
                      <p className="text-sm text-error-600 dark:text-error-400">
                        {errors.primarySkill}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Experience Level
                    </label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      className={`input-professional ${errors.experienceLevel ? 'border-error-300 dark:border-error-600 bg-error-50 dark:bg-error-900/20' : ''}`}
                      required
                    >
                      <option value="">Select experience level</option>
                      <option value="Entry Level">Entry Level (0-1 years)</option>
                      <option value="Intermediate">Intermediate (1-3 years)</option>
                      <option value="Expert">Expert (3+ years)</option>
                    </select>
                    {errors.experienceLevel && (
                      <p className="text-sm text-error-600 dark:text-error-400">
                        {errors.experienceLevel}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Bio (Optional)
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us about yourself, your interests, and what you're looking for..."
                    className={`input-professional ${formData.bio.length >= 10 ? 'border-green-500 focus:border-green-500' : formData.bio.length > 0 ? 'border-yellow-500 focus:border-yellow-500' : ''}`}
                  />
                  <div className="flex justify-between items-center">
                    <p className={`text-xs ${formData.bio.length >= 10 ? 'text-green-600 dark:text-green-400' : formData.bio.length > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                      {formData.bio.length}/500 characters
                      {formData.bio.length >= 10 && ' • ✓ Complete'}
                    </p>
                    {formData.bio.length > 0 && formData.bio.length < 10 && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        Minimum 10 characters recommended
                      </p>
                    )}
                  </div>
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
                  Complete Profile & Get Started
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};