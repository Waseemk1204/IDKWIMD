import React from 'react';
import { OnboardingProvider } from '../../context/OnboardingContext';
import { OnboardingWizard } from '../../components/onboarding/OnboardingWizard';
import { WelcomeStep } from '../../components/onboarding/steps/WelcomeStep';
import { ProfileStep } from '../../components/onboarding/steps/ProfileStep';
import { ExperienceStep } from '../../components/onboarding/steps/ExperienceStep';
import { SkillsStep } from '../../components/onboarding/steps/SkillsStep';
import { ReviewStep } from '../../components/onboarding/steps/ReviewStep';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';
import { toast } from 'sonner';

const EMPLOYEE_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Get started',
    component: WelcomeStep
  },
  {
    id: 'profile',
    title: 'Profile',
    description: 'Basic information',
    component: ProfileStep
  },
  {
    id: 'experience',
    title: 'Experience',
    description: 'Work & education',
    component: ExperienceStep
  },
  {
    id: 'skills',
    title: 'Skills',
    description: 'Skills & preferences',
    component: SkillsStep
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Confirm details',
    component: ReviewStep,
    isOptional: true
  }
];

export const EmployeeOnboarding: React.FC = () => {
  const { user } = useAuth();

  const handleComplete = async (data: any) => {
    try {
      // Update user profile with onboarding data
      const updatePayload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        headline: data.headline,
        location: data.location,
        about: data.about,
        skills: data.skills,
        experiences: data.experiences,
        education: data.education,
        jobPreferences: data.jobPreferences
      };

      // Call API to update user profile
      const response = await apiService.request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updatePayload)
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update profile');
      }

      toast.success('Your profile has been created successfully!');
      return response;
    } catch (error: any) {
      console.error('Onboarding completion error:', error);
      toast.error(error.message || 'Failed to complete onboarding');
      throw error;
    }
  };

  // Get initial data from user if available
  const initialData = user ? {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    headline: user.headline,
    location: user.location,
    about: user.about,
    skills: user.skills,
    experiences: user.experiences,
    education: user.education
  } : {};

  return (
    <OnboardingProvider role="employee" initialData={initialData}>
      <OnboardingWizard
        steps={EMPLOYEE_STEPS}
        onComplete={handleComplete}
        role="employee"
      />
    </OnboardingProvider>
  );
};

export default EmployeeOnboarding;

