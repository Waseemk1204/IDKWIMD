import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  User, 
  Briefcase, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  X,
  Star,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

interface ProfileData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  location: string;
  
  // Professional Information
  title: string;
  bio: string;
  experience: string;
  education: string;
  skills: string[];
  languages: string[];
  
  // Portfolio & Documents
  portfolio: string;
  resume: File | null;
  profileImage: File | null;
  
  // Preferences
  jobTypes: string[];
  availability: string;
  hourlyRate: string;
  remoteWork: boolean;
}

interface ProfileCompletionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialData?: Partial<ProfileData>;
}

const steps = [
  { id: 1, title: 'Personal Info', icon: User, description: 'Basic information about you' },
  { id: 2, title: 'Professional', icon: Briefcase, description: 'Your work experience and skills' },
  { id: 3, title: 'Portfolio', icon: FileText, description: 'Showcase your work and documents' },
  { id: 4, title: 'Preferences', icon: Star, description: 'Job preferences and availability' },
  { id: 5, title: 'Review', icon: CheckCircle, description: 'Review and complete your profile' }
];

export const ProfileCompletionWizard: React.FC<ProfileCompletionWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    location: '',
    title: '',
    bio: '',
    experience: '',
    education: '',
    skills: [],
    languages: [],
    portfolio: '',
    resume: null,
    profileImage: null,
    jobTypes: [],
    availability: '',
    hourlyRate: '',
    remoteWork: false,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  const totalSteps = steps.length;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!profileData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!profileData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!profileData.email.trim()) newErrors.email = 'Email is required';
        if (!profileData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!profileData.location.trim()) newErrors.location = 'Location is required';
        break;
      case 2:
        if (!profileData.title.trim()) newErrors.title = 'Professional title is required';
        if (!profileData.bio.trim()) newErrors.bio = 'Bio is required';
        if (profileData.skills.length === 0) newErrors.skills = 'At least one skill is required';
        break;
      case 3:
        if (!profileData.portfolio.trim()) newErrors.portfolio = 'Portfolio URL is required';
        break;
      case 4:
        if (!profileData.availability.trim()) newErrors.availability = 'Availability is required';
        if (!profileData.hourlyRate.trim()) newErrors.hourlyRate = 'Hourly rate is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error('Please fix the errors before continuing');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fix all errors before completing');
      return;
    }

    setIsLoading(true);
    try {
      // Convert profile data to API format
      const profilePayload = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        location: profileData.location,
        title: profileData.title,
        bio: profileData.bio,
        experience: profileData.experience,
        education: profileData.education,
        skills: profileData.skills,
        languages: profileData.languages,
        portfolio: profileData.portfolio,
        jobTypes: profileData.jobTypes,
        availability: profileData.availability,
        hourlyRate: parseFloat(profileData.hourlyRate),
        remoteWork: profileData.remoteWork
      };

      const response = await apiService.updateProfile(profilePayload);
      
      if (response.success) {
        toast.success('Profile completed successfully!');
        onComplete();
        onClose();
      } else {
        toast.error(response.message || 'Failed to complete profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete profile');
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !profileData.skills.includes(skillInput.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addLanguage = () => {
    if (languageInput.trim() && !profileData.languages.includes(languageInput.trim())) {
      setProfileData(prev => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()]
      }));
      setLanguageInput('');
    }
  };

  const removeLanguage = (language: string) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const handleFileUpload = (field: 'resume' | 'profileImage', file: File) => {
    setProfileData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Complete Your Profile</h2>
              <p className="text-primary-100 mt-1">Step {currentStep} of {totalSteps}: {steps[currentStep - 1].title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-primary-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-primary-100 mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-primary-200 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isActive 
                      ? 'border-primary-600 bg-primary-600 text-white' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  error={errors.firstName}
                  placeholder="Enter your first name"
                />
                <Input
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  error={errors.lastName}
                  placeholder="Enter your last name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  error={errors.email}
                  placeholder="your.email@example.com"
                />
                <Input
                  label="Phone Number"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  error={errors.phone}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  placeholder="Select your date of birth"
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <Input
                  label="Location"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  error={errors.location}
                  placeholder="City, State"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Professional Information</h3>
              
              <Input
                label="Professional Title"
                value={profileData.title}
                onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                error={errors.title}
                placeholder="e.g., Frontend Developer, Marketing Specialist"
              />

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  rows={4}
                  placeholder="Tell us about yourself, your experience, and what you're looking for..."
                />
                {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={profileData.experience}
                    onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="">Select experience level</option>
                    <option value="entry">Entry Level (0-1 years)</option>
                    <option value="junior">Junior (1-3 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior (5+ years)</option>
                  </select>
                </div>
                <Input
                  label="Education"
                  value={profileData.education}
                  onChange={(e) => setProfileData(prev => ({ ...prev, education: e.target.value }))}
                  placeholder="e.g., B.Tech Computer Science"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Languages
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    placeholder="Add a language"
                    onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                  />
                  <Button onClick={addLanguage} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.languages.map((language, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 rounded-full text-sm"
                    >
                      {language}
                      <button
                        onClick={() => removeLanguage(language)}
                        className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Portfolio & Documents</h3>
              
              <Input
                label="Portfolio URL"
                value={profileData.portfolio}
                onChange={(e) => setProfileData(prev => ({ ...prev, portfolio: e.target.value }))}
                error={errors.portfolio}
                placeholder="https://yourportfolio.com"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Resume
                  </label>
                  <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      Upload your resume (PDF, DOC, DOCX)
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('resume', e.target.files[0])}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Choose File
                    </label>
                    {profileData.resume && (
                      <p className="text-sm text-green-600 mt-2">{profileData.resume.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Profile Image
                  </label>
                  <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      Upload profile image (JPG, PNG)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('profileImage', e.target.files[0])}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Choose File
                    </label>
                    {profileData.profileImage && (
                      <p className="text-sm text-green-600 mt-2">{profileData.profileImage.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Job Preferences</h3>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Job Types
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Part-time', 'Contract', 'Freelance', 'Internship', 'Project-based', 'Remote'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileData.jobTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfileData(prev => ({ ...prev, jobTypes: [...prev.jobTypes, type] }));
                          } else {
                            setProfileData(prev => ({ ...prev, jobTypes: prev.jobTypes.filter(t => t !== type) }));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Availability
                  </label>
                  <select
                    value={profileData.availability}
                    onChange={(e) => setProfileData(prev => ({ ...prev, availability: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="">Select availability</option>
                    <option value="immediate">Immediate</option>
                    <option value="1-week">Within 1 week</option>
                    <option value="2-weeks">Within 2 weeks</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="flexible">Flexible</option>
                  </select>
                  {errors.availability && <p className="text-red-500 text-sm mt-1">{errors.availability}</p>}
                </div>
                <Input
                  label="Expected Hourly Rate (₹)"
                  type="number"
                  value={profileData.hourlyRate}
                  onChange={(e) => setProfileData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  error={errors.hourlyRate}
                  placeholder="500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remote-work"
                  checked={profileData.remoteWork}
                  onChange={(e) => setProfileData(prev => ({ ...prev, remoteWork: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="remote-work" className="text-sm text-neutral-700 dark:text-neutral-300">
                  Open to remote work
                </label>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Review Your Profile</h3>
              
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Personal Information</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {profileData.firstName} {profileData.lastName}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{profileData.email}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{profileData.location}</p>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Professional</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{profileData.title}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{profileData.bio}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {profileData.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Preferences</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Available: {profileData.availability}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Rate: ₹{profileData.hourlyRate}/hour
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Remote work: {profileData.remoteWork ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentStep === 1}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Step {currentStep} of {totalSteps}
            </span>
          </div>

          {currentStep === totalSteps ? (
            <Button
              onClick={handleSubmit}
              isLoading={isLoading}
              rightIcon={<CheckCircle className="h-4 w-4" />}
            >
              Complete Profile
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

