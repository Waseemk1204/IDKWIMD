import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Save, X } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
  isOptional?: boolean;
}

interface OnboardingWizardProps {
  steps: WizardStep[];
  onComplete: (data: any) => Promise<void>;
  role: 'employee' | 'employer';
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  steps,
  onComplete,
  role
}) => {
  const {
    currentStep,
    totalSteps,
    data,
    nextStep,
    prevStep,
    completeOnboarding,
    saveProgress,
    loadProgress,
    getCompletionPercentage
  } = useOnboarding();

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  const CurrentStepComponent = steps[currentStep]?.component;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Load saved progress on mount
  useEffect(() => {
    loadProgress();
    // Set a flag after initial load to prevent showing unsaved changes on first render
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [loadProgress]);

  // Auto-save progress when data changes (but not on initial load)
  useEffect(() => {
    if (Object.keys(data).length > 0 && !isInitialLoad) {
      setHasUnsavedChanges(true);
      const timer = setTimeout(() => {
        saveProgress();
        setHasUnsavedChanges(false);
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [data, saveProgress, isInitialLoad]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleNext = async () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }

    if (isLastStep) {
      await handleComplete();
    } else {
      nextStep();
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
      completeOnboarding();
      
      // Clear saved draft
      localStorage.removeItem(`onboarding_draft_${role}`);
      
      toast.success('Onboarding completed successfully!');
      
      // Redirect based on role
      navigate(role === 'employee' ? '/employee/dashboard' : '/employer/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    const step = steps[currentStep];
    
    // Skip validation for optional steps
    if (step.isOptional) {
      return true;
    }

    // Step-specific validation
    switch (step.id) {
      case 'welcome':
        return true; // Welcome step has no validation

      case 'profile':
        if (!data.fullName || !data.email || !data.phone) {
          toast.error('Please fill in all required fields');
          return false;
        }
        return true;

      case 'experience':
        if (!data.experiences || data.experiences.length === 0) {
          toast.error('Please add at least one work experience');
          return false;
        }
        if (!data.education || data.education.length === 0) {
          toast.error('Please add at least one education entry');
          return false;
        }
        return true;

      case 'skills':
        if (!data.skills || data.skills.length < 3) {
          toast.error('Please add at least 3 skills');
          return false;
        }
        if (!data.jobPreferences?.jobType || data.jobPreferences.jobType.length === 0) {
          toast.error('Please select at least one job type');
          return false;
        }
        return true;

      case 'company-info':
        if (!data.companyInfo?.companyName || !data.companyInfo?.companySize || 
            !data.companyInfo?.industry || !data.companyInfo?.headquarters || 
            !data.companyInfo?.description) {
          toast.error('Please fill in all required company information');
          return false;
        }
        return true;

      case 'hiring-needs':
        if (!data.hiringNeeds?.roles || data.hiringNeeds.roles.length === 0) {
          toast.error('Please add at least one role you\'re hiring for');
          return false;
        }
        return true;

      case 'review':
        return true; // Review step has no additional validation

      default:
        return true;
    }
  };

  const handleSaveAndExit = async () => {
    await saveProgress();
    toast.success('Progress saved! You can continue later.');
    navigate(role === 'employee' ? '/employee/dashboard' : '/employer/dashboard');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Progress Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Top bar with save and exit */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {role === 'employee' ? 'Employee' : 'Employer'} Onboarding
              </h1>
              {hasUnsavedChanges && (
                <span className="px-2 py-0.5 bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 text-xs font-medium rounded">
                  Unsaved changes
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {Math.round((currentStep / totalSteps) * 100)}% complete
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveAndExit}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save & Exit
              </Button>
            </div>
          </div>

          {/* Progress stepper */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => index < currentStep && prevStep()}
                    disabled={index > currentStep}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                      ${index < currentStep
                        ? 'bg-success-500 text-white cursor-pointer hover:bg-success-600'
                        : index === currentStep
                        ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/30'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </button>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${
                      index === currentStep
                        ? 'text-primary-600 dark:text-primary-400'
                        : index < currentStep
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}>
                      {step.title}
                    </p>
                    {index === currentStep && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 hidden sm:block">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-8 transition-all ${
                    index < currentStep
                      ? 'bg-success-500'
                      : 'bg-neutral-200 dark:bg-neutral-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8">
          {CurrentStepComponent && <CurrentStepComponent />}
        </div>
      </div>

      {/* Navigation footer */}
      <div className="sticky bottom-0 z-30 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isFirstStep}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>

            <Button
              variant={isLastStep ? 'gradient' : 'primary'}
              onClick={handleNext}
              isLoading={isSubmitting}
              loadingText={isLastStep ? 'Completing...' : 'Next'}
              rightIcon={isLastStep ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            >
              {isLastStep ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
