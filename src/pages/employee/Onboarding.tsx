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
  const { user, updateProfile } = useAuth();

  const handleComplete = async (data: any) => {
    try {
      console.log('=== ONBOARDING COMPLETE - STARTED ===');
      console.log('=== ONBOARDING COMPLETE - RAW DATA ===', data);

      // Ensure experiences and education are properly formatted arrays
      const experiences = Array.isArray(data.experiences) 
        ? data.experiences.map((exp: any) => ({
            company: exp.company || '',
            title: exp.title || '',
            description: exp.description || '',
            from: exp.from,
            to: exp.to,
            current: exp.current || false
          }))
        : [];

      const education = Array.isArray(data.education)
        ? data.education.map((edu: any) => ({
            institution: edu.institution || '',
            degree: edu.degree || '',
            field: edu.field || '',
            from: edu.from,
            to: edu.to,
            current: edu.current || false
          }))
        : [];

      // Update user profile with onboarding data
      const updatePayload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        headline: data.headline,
        location: data.location,
        about: data.about,
        skills: Array.isArray(data.skills) ? data.skills : [],
        experiences: experiences,
        education: education,
        jobPreferences: data.jobPreferences
      };

      console.log('=== ONBOARDING COMPLETE - CLEANED PAYLOAD ===', JSON.stringify(updatePayload, null, 2));
      console.log('=== CALLING updateProfile FROM AuthContext ===');

      // Call AuthContext updateProfile to update both backend AND local user state
      await updateProfile(updatePayload);

      console.log('=== updateProfile COMPLETED SUCCESSFULLY ===');
      toast.success('Your profile has been created successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('=== ONBOARDING COMPLETION ERROR ===', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
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

