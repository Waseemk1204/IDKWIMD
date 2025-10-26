import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  headline: string;
  about: string;
  location: string;
}

export const SimplifiedProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    phone: '',
    headline: '',
    about: '',
    location: ''
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
        location: user.location || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      await updateProfile(formData);
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
        location: user.location || ''
      });
    }
    setIsEditing(false);
    setErrorMessage('');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-600 dark:text-neutral-400">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Profile</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your profile information
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

      {isEditing ? (
        /* Edit Mode */
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Full Name <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Email Address <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Phone Number <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              {/* Headline */}
              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Professional Headline
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="headline"
                    name="headline"
                    type="text"
                    value={formData.headline}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    placeholder="e.g., Marketing Student | Content Creator"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    placeholder="e.g., Mumbai, Maharashtra"
                  />
                </div>
              </div>

              {/* About */}
              <div>
                <label htmlFor="about" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  About You
                </label>
                <textarea
                  id="about"
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  rows={4}
                  placeholder="Tell us about yourself, your interests, and what you're looking for..."
                  maxLength={500}
                />
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {formData.about?.length || 0}/500 characters
                </p>
              </div>

              {/* Action Buttons */}
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
                  variant="primary"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* View Mode */
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Full Name */}
              <div className="flex items-start">
                <User className="h-5 w-5 text-neutral-400 mt-1 mr-3" />
                <div>
                  <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Full Name</div>
                  <div className="text-base text-neutral-900 dark:text-neutral-100 mt-1">{user.fullName || 'Not set'}</div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-neutral-400 mt-1 mr-3" />
                <div>
                  <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Email</div>
                  <div className="text-base text-neutral-900 dark:text-neutral-100 mt-1">{user.email}</div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-neutral-400 mt-1 mr-3" />
                <div>
                  <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Phone</div>
                  <div className="text-base text-neutral-900 dark:text-neutral-100 mt-1">{user.phone || 'Not set'}</div>
                </div>
              </div>

              {/* Headline */}
              <div className="flex items-start">
                <Briefcase className="h-5 w-5 text-neutral-400 mt-1 mr-3" />
                <div>
                  <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Headline</div>
                  <div className="text-base text-neutral-900 dark:text-neutral-100 mt-1">{user.headline || 'Not set'}</div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-neutral-400 mt-1 mr-3" />
                <div>
                  <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Location</div>
                  <div className="text-base text-neutral-900 dark:text-neutral-100 mt-1">{user.location || 'Not set'}</div>
                </div>
              </div>

              {/* About */}
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-neutral-400 mt-1 mr-3" />
                <div>
                  <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">About</div>
                  <div className="text-base text-neutral-900 dark:text-neutral-100 mt-1 whitespace-pre-wrap">{user.about || 'Not set'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

