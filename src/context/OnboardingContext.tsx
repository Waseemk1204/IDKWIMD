import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import sessionService from '../services/sessionService';

export interface OnboardingData {
  // Basic info
  fullName?: string;
  email?: string;
  phone?: string;
  headline?: string;
  location?: string;
  about?: string;
  profilePhoto?: string;

  // Experience
  experiences?: Array<{
    company: string;
    title: string;
    from?: Date;
    to?: Date;
    description?: string;
    current: boolean;
  }>;

  // Education
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    from?: Date;
    to?: Date;
    current: boolean;
  }>;

  // Skills and preferences
  skills?: string[];
  jobPreferences?: {
    jobType?: string[];
    categories?: string[];
    locations?: string[];
    salaryMin?: number;
    salaryMax?: number;
    availability?: string;
  };

  // Company info (for employers)
  companyInfo?: {
    companyName?: string;
    companyWebsite?: string;
    companySize?: string;
    industry?: string;
    headquarters?: string;
    description?: string;
    companyLogo?: string;
  };

  // Hiring needs (for employers)
  hiringNeeds?: {
    roles?: string[];
    skills?: string[];
    budgetMin?: number;
    budgetMax?: number;
    urgency?: string;
  };

  // Resume data (if uploaded)
  resumeData?: {
    fileName?: string;
    uploadedAt?: Date;
    parsedData?: any;
  };
}

interface OnboardingContextType {
  data: OnboardingData;
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  updateData: (newData: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetOnboarding: () => void;
  completeOnboarding: () => void;
  getCompletionPercentage: () => number;
  saveProgress: () => Promise<void>;
  loadProgress: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
  role: 'employee' | 'employer';
  initialData?: OnboardingData;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
  role,
  initialData = {}
}) => {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Define total steps based on role
  const totalSteps = role === 'employee' ? 5 : 4;

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalSteps]);

  const resetOnboarding = useCallback(() => {
    setData({});
    setCurrentStep(0);
    setIsComplete(false);
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsComplete(true);
  }, []);

  const getCompletionPercentage = useCallback(() => {
    let completedFields = 0;
    let totalFields = 0;

    if (role === 'employee') {
      // Basic info (5 fields)
      totalFields += 5;
      if (data.fullName) completedFields++;
      if (data.email) completedFields++;
      if (data.phone) completedFields++;
      if (data.headline) completedFields++;
      if (data.location) completedFields++;

      // Experience (weight: 20%)
      totalFields += 1;
      if (data.experiences && data.experiences.length > 0) completedFields++;

      // Education (weight: 20%)
      totalFields += 1;
      if (data.education && data.education.length > 0) completedFields++;

      // Skills (weight: 20%)
      totalFields += 1;
      if (data.skills && data.skills.length >= 3) completedFields++;

      // Job preferences (weight: 20%)
      totalFields += 2;
      if (data.jobPreferences?.jobType && data.jobPreferences.jobType.length > 0) completedFields++;
      if (data.jobPreferences?.categories && data.jobPreferences.categories.length > 0) completedFields++;
    } else {
      // Employer
      totalFields += 5;
      if (data.companyInfo?.companyName) completedFields++;
      if (data.companyInfo?.companySize) completedFields++;
      if (data.companyInfo?.industry) completedFields++;
      if (data.companyInfo?.headquarters) completedFields++;
      if (data.companyInfo?.description) completedFields++;

      totalFields += 3;
      if (data.hiringNeeds?.roles && data.hiringNeeds.roles.length > 0) completedFields++;
      if (data.hiringNeeds?.skills && data.hiringNeeds.skills.length > 0) completedFields++;
      if (data.hiringNeeds?.budgetMin || data.hiringNeeds?.budgetMax) completedFields++;
    }

    return Math.round((completedFields / totalFields) * 100);
  }, [data, role]);

  const saveProgress = useCallback(async () => {
    try {
      // Save to localStorage as draft (fallback)
      const draftKey = `onboarding_draft_${role}`;
      localStorage.setItem(draftKey, JSON.stringify({
        data,
        currentStep,
        timestamp: new Date().toISOString()
      }));

      // Save to backend API
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/onboarding/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionService.getToken()}`
          },
          body: JSON.stringify({
            role,
            currentStep,
            data
          })
        });

        if (response.ok) {
          console.log('Onboarding progress saved to backend');
        } else {
          console.warn('Failed to save to backend, using local storage only');
        }
      } catch (apiError) {
        console.warn('Backend save failed, using local storage only:', apiError);
      }
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    }
  }, [data, currentStep, role]);

  const loadProgress = useCallback(async () => {
    try {
      // Try to load from backend API first
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/onboarding/load/${role}`, {
          headers: {
            'Authorization': `Bearer ${sessionService.getToken()}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.draft) {
            const { data: savedData, currentStep: savedStep } = result.data.draft;
            setData(savedData);
            setCurrentStep(savedStep);
            console.log('Onboarding progress loaded from backend');
            return; // Success, no need to check localStorage
          }
        }
      } catch (apiError) {
        console.warn('Backend load failed, trying localStorage:', apiError);
      }

      // Fallback to localStorage
      const draftKey = `onboarding_draft_${role}`;
      const savedData = localStorage.getItem(draftKey);
      
      if (savedData) {
        const { data: savedOnboardingData, currentStep: savedStep } = JSON.parse(savedData);
        setData(savedOnboardingData);
        setCurrentStep(savedStep);
        console.log('Onboarding progress loaded from local storage');
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    }
  }, [role]);

  const value: OnboardingContextType = {
    data,
    currentStep,
    totalSteps,
    isComplete,
    updateData,
    nextStep,
    prevStep,
    goToStep,
    resetOnboarding,
    completeOnboarding,
    getCompletionPercentage,
    saveProgress,
    loadProgress
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;
