import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  User, 
  Save, 
  X, 
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Building2
} from 'lucide-react';
import { ResumeUpload } from '../../components/profile/ResumeUpload';

type TabType = 'profile' | 'skills' | 'experience' | 'education' | 'preferences' | 'company';

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  headline: string;
  about: string;
  location: string;
  skills: string[];
  experiences: Array<{
    company: string;
    title: string;
    from: string | Date;
    to?: string | Date;
    description?: string;
    current: boolean;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    from: string | Date;
    to?: string | Date;
    gpa?: string;
    current?: boolean;
  }>;
  jobPreferences?: {
    jobTypes: string[];
    availability: string;
    expectedSalary?: string;
    preferredLocations?: string[];
  };
  companyInfo?: {
    companyName: string;
    companySize: string;
    industry: string;
    website: string;
    headquarters?: string;
    description: string;
  };
}

export const ComprehensiveProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showResumeUpload, setShowResumeUpload] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    phone: '',
    headline: '',
    about: '',
    location: '',
    skills: [],
    experiences: [],
    education: [],
    jobPreferences: user?.role === 'employee' ? {
      jobTypes: [],
      availability: '',
      expectedSalary: '',
      preferredLocations: []
    } : undefined,
    companyInfo: user?.role === 'employer' ? {
      companyName: '',
      companySize: '',
      industry: '',
      website: '',
      headquarters: '',
      description: ''
    } : undefined
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        headline: user.headline || '',
        about: user.about || '',
        location: user.location || '',
        skills: user.skills || [],
        experiences: user.experiences || [],
        education: user.education || [],
        jobPreferences: user.role === 'employee' ? (user.jobPreferences || {
          jobTypes: [],
          availability: '',
          expectedSalary: '',
          preferredLocations: []
        }) : undefined,
        companyInfo: user.role === 'employer' ? (user.companyInfo || {
          companyName: '',
          companySize: '',
          industry: '',
          website: '',
          headquarters: '',
          description: ''
        }) : undefined
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Clean data before sending
      const cleanedData = {
        ...formData,
        // Filter out empty/invalid experiences
        experiences: formData.experiences.filter(exp => 
          exp.company && exp.title && exp.from
        ),
        // Filter out empty/invalid education
        education: formData.education.filter(edu => 
          edu.institution && edu.degree && edu.field && edu.from
        ),
        // Filter out empty skills
        skills: formData.skills.filter(skill => skill.trim().length > 0)
      };

      console.log('📤 Sending cleaned data:', cleanedData);
      
      await updateProfile(cleanedData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current user data
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        headline: user.headline || '',
        about: user.about || '',
        location: user.location || '',
        skills: user.skills || [],
        experiences: user.experiences || [],
        education: user.education || [],
        jobPreferences: user.role === 'employee' ? user.jobPreferences : undefined,
        companyInfo: user.role === 'employer' ? user.companyInfo : undefined
      });
    }
    setIsEditing(false);
    setErrorMessage('');
  };

  const handleResumeUploadSuccess = (parsedData: any) => {
    console.log('📄 Resume parsed successfully! Data:', parsedData);
    
    // Auto-fill all fields from resume
    setFormData(prev => ({
      ...prev,
      fullName: parsedData.fullName || prev.fullName,
      email: parsedData.email || prev.email,
      phone: parsedData.phone || prev.phone,
      location: parsedData.location || prev.location,
      about: parsedData.about || prev.about,
      skills: parsedData.skills || prev.skills,
      experiences: parsedData.experiences || prev.experiences,
      education: parsedData.education || prev.education
    }));
    
    setShowResumeUpload(false);
    setIsEditing(true);
    setSuccessMessage('Resume parsed! Review and save the changes.');
  };

  // Skills management
  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Experience management
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        company: '',
        title: '',
        from: '',
        to: '',
        description: '',
        current: false
      }]
    }));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  // Education management
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        field: '',
        from: '',
        to: '',
        gpa: '',
        current: false
      }]
    }));
  };

  const updateEducation = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-600 dark:text-neutral-400">Loading profile...</div>
      </div>
    );
  }

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'skills', label: 'Skills', icon: <Star className="h-4 w-4" /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="h-4 w-4" /> },
  ];

  if (user.role === 'employee') {
    tabs.push({ id: 'preferences', label: 'Job Preferences', icon: <FileText className="h-4 w-4" /> });
  } else if (user.role === 'employer') {
    tabs.push({ id: 'company', label: 'Company Info', icon: <Building2 className="h-4 w-4" /> });
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">My Details</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            View and update your profile information
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing && (
            <>
              <Button 
                onClick={() => setShowResumeUpload(true)} 
                leftIcon={<Upload className="h-4 w-4" />}
                variant="outline"
              >
                Upload Resume
              </Button>
              <Button 
                onClick={() => setIsEditing(true)} 
                leftIcon={<FileText className="h-4 w-4" />}
                variant="primary"
              >
                Edit Details
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Resume Upload Modal */}
      {showResumeUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Upload Resume</h3>
              <button 
                onClick={() => setShowResumeUpload(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ResumeUpload
              onParseComplete={handleResumeUploadSuccess}
              onError={(error) => {
                console.error('Resume upload error:', error);
                setErrorMessage('Failed to parse resume. Please try again.');
              }}
            />
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3" />
            <p className="text-sm text-success-700 dark:text-success-300">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-error-600 dark:text-error-400 mr-3" />
            <p className="text-sm text-error-700 dark:text-error-300">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Basic Information</h3>
                
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Full Name <span className="text-error-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      required
                    />
                  ) : (
                    <div className="text-base text-neutral-900 dark:text-neutral-100">{user.fullName || 'Not set'}</div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Email <span className="text-error-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      required
                    />
                  ) : (
                    <div className="text-base text-neutral-900 dark:text-neutral-100">{user.email}</div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Phone <span className="text-error-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      required
                    />
                  ) : (
                    <div className="text-base text-neutral-900 dark:text-neutral-100">{user.phone || 'Not set'}</div>
                  )}
                </div>

                {/* Headline */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Professional Headline
                  </label>
                  {isEditing ? (
                    <input
                      name="headline"
                      type="text"
                      value={formData.headline}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      placeholder="e.g., Marketing Student | Content Creator"
                    />
                  ) : (
                    <div className="text-base text-neutral-900 dark:text-neutral-100">{user.headline || 'Not set'}</div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      placeholder="e.g., Mumbai, Maharashtra"
                    />
                  ) : (
                    <div className="text-base text-neutral-900 dark:text-neutral-100">{user.location || 'Not set'}</div>
                  )}
                </div>

                {/* About */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    About
                  </label>
                  {isEditing ? (
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      rows={4}
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                  ) : (
                    <div className="text-base text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">{user.about || 'Not set'}</div>
                  )}
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Your Skills</h3>
                  {isEditing && (
                    <Button type="button" onClick={addSkill} leftIcon={<Plus className="h-4 w-4" />} variant="outline" size="sm">
                      Add Skill
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => updateSkill(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                          placeholder="Enter a skill"
                        />
                        <Button type="button" onClick={() => removeSkill(index)} variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.skills && user.skills.length > 0 ? (
                      user.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <div className="text-neutral-600 dark:text-neutral-400">No skills added yet</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Work Experience</h3>
                  {isEditing && (
                    <Button type="button" onClick={addExperience} leftIcon={<Plus className="h-4 w-4" />} variant="outline" size="sm">
                      Add Experience
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-6">
                    {formData.experiences.map((exp, index) => (
                      <div key={index} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Experience #{index + 1}</h4>
                          <Button type="button" onClick={() => removeExperience(index)} variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            placeholder="Company"
                          />
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            placeholder="Title"
                          />
                          <input
                            type="month"
                            value={exp.from as string}
                            onChange={(e) => updateExperience(index, 'from', e.target.value)}
                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            placeholder="From"
                          />
                          <input
                            type="month"
                            value={exp.to as string || ''}
                            onChange={(e) => updateExperience(index, 'to', e.target.value)}
                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            placeholder="To"
                            disabled={exp.current}
                          />
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                            className="rounded border-neutral-300 dark:border-neutral-600"
                          />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">Currently working here</span>
                        </label>
                        <textarea
                          value={exp.description || ''}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                          rows={3}
                          placeholder="Description"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.experiences && user.experiences.length > 0 ? (
                      user.experiences.map((exp, index) => (
                        <div key={index} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{exp.title}</h4>
                          <p className="text-neutral-700 dark:text-neutral-300">{exp.company}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{exp.from} - {exp.current ? 'Present' : exp.to}</p>
                          {exp.description && <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{exp.description}</p>}
                        </div>
                      ))
                    ) : (
                      <div className="text-neutral-600 dark:text-neutral-400">No experience added yet</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Education</h3>
                  {isEditing && (
                    <Button type="button" onClick={addEducation} leftIcon={<Plus className="h-4 w-4" />} variant="outline" size="sm">
                      Add Education
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-6">
                    {formData.education.map((edu, index) => (
                      <div key={index} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Education #{index + 1}</h4>
                          <Button type="button" onClick={() => removeEducation(index)} variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            placeholder="Institution"
                          />
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            placeholder="Degree"
                          />
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            placeholder="Field of Study"
                          />
                          <input
                            type="text"
                            value={edu.gpa || ''}
                            onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            placeholder="GPA (optional)"
                          />
                          <input
                            type="month"
                            value={edu.from as string}
                            onChange={(e) => updateEducation(index, 'from', e.target.value)}
                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            placeholder="From"
                          />
                          <input
                            type="month"
                            value={edu.to as string || ''}
                            onChange={(e) => updateEducation(index, 'to', e.target.value)}
                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            placeholder="To"
                            disabled={edu.current}
                          />
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={edu.current}
                            onChange={(e) => updateEducation(index, 'current', e.target.checked)}
                            className="rounded border-neutral-300 dark:border-neutral-600"
                          />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">Currently studying here</span>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.education && user.education.length > 0 ? (
                      user.education.map((edu, index) => (
                        <div key={index} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{edu.degree} in {edu.field}</h4>
                          <p className="text-neutral-700 dark:text-neutral-300">{edu.institution}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{edu.from} - {edu.current ? 'Present' : edu.to}</p>
                          {edu.gpa && <p className="text-sm text-neutral-600 dark:text-neutral-400">GPA: {edu.gpa}</p>}
                        </div>
                      ))
                    ) : (
                      <div className="text-neutral-600 dark:text-neutral-400">No education added yet</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Job Preferences Tab (Employee) */}
            {activeTab === 'preferences' && user.role === 'employee' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Job Preferences</h3>
                <div className="text-neutral-600 dark:text-neutral-400">Job preferences section - Coming soon</div>
              </div>
            )}

            {/* Company Info Tab (Employer) */}
            {activeTab === 'company' && user.role === 'employer' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Company Information</h3>
                <div className="text-neutral-600 dark:text-neutral-400">Company info section - Coming soon</div>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-200 dark:border-neutral-700 mt-6">
                <Button 
                  type="button" 
                  onClick={handleCancel}
                  disabled={isLoading}
                  variant="outline"
                  leftIcon={<X className="h-4 w-4" />}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  isLoading={isLoading}
                  loadingText="Saving..."
                  leftIcon={<Save className="h-4 w-4" />}
                  variant="primary"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

