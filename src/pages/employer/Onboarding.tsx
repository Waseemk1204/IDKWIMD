import React from 'react';
import { OnboardingProvider } from '../../context/OnboardingContext';
import { OnboardingWizard } from '../../components/onboarding/OnboardingWizard';
import { EmployerWelcomeStep } from '../../components/onboarding/steps/EmployerWelcomeStep';
import { CompanyInfoStep } from '../../components/onboarding/steps/CompanyInfoStep';
import { HiringNeedsStep } from '../../components/onboarding/steps/HiringNeedsStep';
import { EmployerReviewStep } from '../../components/onboarding/steps/EmployerReviewStep';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';
import { toast } from 'sonner';

const EMPLOYER_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Get started',
    component: EmployerWelcomeStep
  },
  {
    id: 'company-info',
    title: 'Company',
    description: 'Company details',
    component: CompanyInfoStep
  },
  {
    id: 'hiring-needs',
    title: 'Hiring',
    description: 'Your needs',
    component: HiringNeedsStep
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Confirm details',
    component: EmployerReviewStep,
    isOptional: true
  }
];

export const EmployerOnboarding: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const handleComplete = async (data: any) => {
    try {
      // Update user profile with company info and hiring needs
      const updatePayload = {
        companyInfo: data.companyInfo,
        // Store hiring needs separately or as part of preferences
        hiringPreferences: data.hiringNeeds
      };

      // Call AuthContext updateProfile to update both backend AND local user state
      await updateProfile(updatePayload);

      toast.success('Your company profile has been created successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Onboarding completion error:', error);
      toast.error(error.message || 'Failed to complete onboarding');
      throw error;
    }
  };

  // Get initial data from user if available
  const initialData = user ? {
    companyInfo: user.companyInfo
  } : {};

  return (
    <OnboardingProvider role="employer" initialData={initialData}>
      <OnboardingWizard
        steps={EMPLOYER_STEPS}
        onComplete={handleComplete}
        role="employer"
      />
    </OnboardingProvider>
  );
};

export default EmployerOnboarding;

