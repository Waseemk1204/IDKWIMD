import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, ElevatedCard, TrustCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrustBadge, VerifiedBadge } from '../../components/ui/TrustBadge';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Save, 
  X, 
  Upload, 
  Shield, 
  Star,
  Briefcase,
  GraduationCap,
  FileText,
  Camera,
  CheckCircle,
  AlertCircle,
  Lock,
  MessageCircle
} from 'lucide-react';
import { QuickMessage, MessageIntegration } from '../../components/messaging/MessageIntegration';

interface ProfileFormData {
  fullName: string;
  displayName: string;
  username: string;
  email: string;
  phone: string;
  headline: string;
  about: string;
  location: string;
  website: string;
  skills: string;
  experiences: Array<{
    company: string;
    title: string;
    from: string;
    to: string;
    description: string;
    current: boolean;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    from: string;
    to: string;
    current: boolean;
  }>;
  socialLinks: {
    linkedin: string;
    twitter: string;
    github: string;
    portfolio: string;
  };
  companyInfo?: {
    companyName: string;
    companyWebsite: string;
    companySize: string;
    industry: string;
    headquarters: string;
    description: string;
  };
}

interface FormErrors {
  fullName?: string;
  displayName?: string;
  username?: string;
  email?: string;
  phone?: string;
  headline?: string;
  about?: string;
  location?: string;
  website?: string;
  skills?: string;
  experiences?: string;
  education?: string;
  socialLinks?: string;
  companyInfo?: string;
}

export const Profile: React.FC = () => {
  const { user, isLoading: authLoading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    displayName: '',
    username: '',
    email: '',
    phone: '',
    headline: '',
    about: '',
    location: '',
    website: '',
    skills: '',
    experiences: [],
    education: [],
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: '',
      portfolio: ''
    },
    companyInfo: user?.role === 'employer' ? {
      companyName: '',
      companyWebsite: '',
      companySize: '',
      industry: '',
      headquarters: '',
      description: ''
    } : undefined
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        displayName: user.displayName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        headline: user.headline || '',
        about: user.about || '',
        location: user.location || '',
        website: user.website || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
        experiences: user.experiences || [],
        education: user.education || [],
        socialLinks: user.socialLinks || {
          linkedin: '',
          twitter: '',
          github: '',
          portfolio: ''
        },
        companyInfo: user?.role === 'employer' ? user.companyInfo || {
          companyName: '',
          companyWebsite: '',
          companySize: '',
          industry: '',
          headquarters: '',
          description: ''
        } : undefined
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.about && formData.about.length > 500) {
      newErrors.about = 'About section must be less than 500 characters';
    }

    if (user?.role === 'employee' && formData.skills && formData.skills.length > 200) {
      newErrors.skills = 'Skills must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the data for the API call
      const updateData = {
        fullName: formData.fullName,
        displayName: formData.displayName,
        username: formData.username,
        phone: formData.phone,
        headline: formData.headline,
        about: formData.about,
        location: formData.location,
        website: formData.website,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        experiences: formData.experiences,
        education: formData.education,
        socialLinks: formData.socialLinks,
        ...(user?.role === 'employer' && formData.companyInfo && {
          companyInfo: formData.companyInfo
        })
      };

      await updateProfile(updateData);
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Profile update error:', error);
      setErrors({ 
        name: error.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        displayName: user.displayName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        headline: user.headline || '',
        about: user.about || '',
        location: user.location || '',
        website: user.website || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
        experiences: user.experiences || [],
        education: user.education || [],
        socialLinks: user.socialLinks || {
          linkedin: '',
          twitter: '',
          github: '',
          portfolio: ''
        },
        companyInfo: user?.role === 'employer' ? user.companyInfo || {
          companyName: '',
          companyWebsite: '',
          companySize: '',
          industry: '',
          headquarters: '',
          description: ''
        } : undefined
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const formatMemberSince = (date?: string) => {
    if (!date) return 'June 2023'; // Fallback
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const renderFormField = (
    name: keyof ProfileFormData,
    label: string,
    type: string = 'text',
    placeholder?: string,
    component: 'input' | 'textarea' = 'input'
  ) => {
    const hasError = !!errors[name];
    
    return (
      <div className="space-y-2">
        <label htmlFor={name} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
        {component === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            rows={4}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={`input-professional ${hasError ? 'border-error-300 dark:border-error-600 bg-error-50 dark:bg-error-900/20' : ''}`}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={`input-professional ${hasError ? 'border-error-300 dark:border-error-600 bg-error-50 dark:bg-error-900/20' : ''}`}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
        )}
        {hasError && (
          <p id={`${name}-error`} className="text-sm text-error-600 dark:text-error-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  // Show loading state while authentication is being checked or user data is being fetched
  if (authLoading || !user) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-48 mb-2 loading-skeleton"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-64 loading-skeleton"></div>
          </div>
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded w-32 loading-skeleton"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ElevatedCard>
              <CardContent className="p-8 text-center">
                <div className="h-32 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto mb-6 loading-skeleton"></div>
                <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-32 mx-auto mb-2 loading-skeleton"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24 mx-auto mb-4 loading-skeleton"></div>
                <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-32 mx-auto loading-skeleton"></div>
              </CardContent>
            </ElevatedCard>
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <ElevatedCard>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-48 loading-skeleton"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-16 loading-skeleton"></div>
                      <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded loading-skeleton"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-20 loading-skeleton"></div>
                      <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded loading-skeleton"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ElevatedCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Profile</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)} 
            leftIcon={<Edit3 className="h-4 w-4" />}
            variant="primary"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {successMessage && (
        <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mr-3" />
            <p className="text-sm text-success-700 dark:text-success-300">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <ElevatedCard className="sticky top-6">
            <CardContent className="p-8 text-center">
              <div className="relative inline-block">
                <div className="h-32 w-32 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-4xl font-bold text-white mx-auto">
                  {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-lg border-2 border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <Camera className="h-4 w-4 text-primary-600" />
                </button>
              </div>
              
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {user.fullName}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 capitalize mb-4">
                  {user.role === 'employee' ? 'Student' : 'Employer'}
                </p>
                
                {user.isVerified ? (
                  <VerifiedBadge size="lg" text="Verified Account" />
                ) : (
                  <TrustBadge variant="pending" size="lg" text="Verification Pending" />
                )}
                
                {/* Messaging Integration */}
                <div className="mt-4">
                  <MessageIntegration
                    userId={user._id}
                    userName={user.fullName}
                    userPhoto={user.profilePhoto}
                    connectionStrength={85} // This would come from connection analytics
                    sharedInterests={user.skills || []}
                    recentActivity={[
                      {
                        type: 'community_post',
                        data: { title: 'Latest post', content: 'Recent activity' },
                        timestamp: new Date()
                      }
                    ]}
                  />
                </div>
              </div>

              {/* Profile Stats */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-warning-500 mr-2" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Rating</span>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">4.8★</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-primary-500 mr-2" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Member Since</span>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatMemberSince(user.createdAt)}
                  </span>
                </div>

                {user.role === 'employee' && (
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 text-success-500 mr-2" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Jobs Completed</span>
                    </div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">12</span>
                  </div>
                )}
              </div>
            </CardContent>
          </ElevatedCard>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {isEditing ? (
            <ElevatedCard>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit3 className="h-5 w-5 mr-2 text-primary-600" />
                  Edit Profile
                </CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderFormField('name', 'Full Name', 'text', 'Enter your full name')}
                    {renderFormField('email', 'Email Address', 'email', 'Enter your email')}
                    {renderFormField('phone', 'Phone Number', 'tel', '+1 (555) 123-4567')}
                    <div className="md:col-span-2">
                      {renderFormField('bio', 'Bio', 'text', 'Tell us about yourself...', 'textarea')}
                    </div>
                    
                    {user.role === 'employee' && (
                      <div className="md:col-span-2">
                        {renderFormField(
                          'skills', 
                          'Skills (comma separated)', 
                          'text', 
                          'e.g. React, JavaScript, Content Writing'
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
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
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </ElevatedCard>
          ) : (
            <>
              {/* Personal Information */}
              <ElevatedCard>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Your basic profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Email</label>
                      <div className="flex items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <Mail className="h-4 w-4 text-neutral-400 mr-3" />
                        <span className="text-neutral-900 dark:text-neutral-100">{user.email}</span>
                      </div>
                    </div>
                    
                    {formData.phone && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Phone</label>
                        <div className="flex items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                          <Phone className="h-4 w-4 text-neutral-400 mr-3" />
                          <span className="text-neutral-900 dark:text-neutral-100">{formData.phone}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Member Since</label>
                      <div className="flex items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <Calendar className="h-4 w-4 text-neutral-400 mr-3" />
                        <span className="text-neutral-900 dark:text-neutral-100">
                          {formatMemberSince(user.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    {formData.bio && (
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Bio</label>
                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                          <p className="text-neutral-900 dark:text-neutral-100">{formData.bio}</p>
                        </div>
                      </div>
                    )}
                    
                    {user.role === 'employee' && formData.skills && (
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Skills</label>
                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                          <div className="flex flex-wrap gap-2">
                            {formData.skills.split(',').map((skill, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </ElevatedCard>

              {/* Security Settings */}
              <ElevatedCard>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-trust-600" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and privacy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center">
                        <Lock className="h-5 w-5 text-neutral-400 mr-3" />
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">Password</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Last changed 3 months ago</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Change
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-neutral-400 mr-3" />
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">Two-Factor Authentication</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Add an extra layer of security</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </ElevatedCard>

              {/* Documents */}
              <TrustCard>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-trust-600" />
                    Documents & Verification
                  </CardTitle>
                  <CardDescription>
                    Upload required documents for verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.role === 'employee' ? (
                      <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-neutral-700/50 rounded-lg">
                        <div className="flex items-center">
                          <GraduationCap className="h-5 w-5 text-neutral-400 mr-3" />
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">Student ID Proof</p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Upload your student ID or enrollment certificate</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />}>
                          Upload
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-neutral-700/50 rounded-lg">
                        <div className="flex items-center">
                          <Building2 className="h-5 w-5 text-neutral-400 mr-3" />
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">Business Registration</p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Upload your business registration documents</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />}>
                          Upload
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </TrustCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
};