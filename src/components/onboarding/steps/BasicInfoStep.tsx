import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Briefcase, Upload } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { useAuth } from '../../../hooks/useAuth';

export const BasicInfoStep: React.FC = () => {
  const { data, updateData } = useOnboarding();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(data.fullName || user?.fullName || '');
  const [headline, setHeadline] = useState(data.headline || user?.headline || '');
  const [location, setLocation] = useState(data.location || user?.location || '');
  const [phone, setPhone] = useState(data.phone || user?.phone || '');
  const [photoPreview, setPhotoPreview] = useState(data.profilePhoto || user?.profilePhoto || '');

  useEffect(() => {
    updateData({
      fullName,
      headline,
      location,
      phone,
      profilePhoto: photoPreview
    });
  }, [fullName, headline, location, phone, photoPreview]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-3">
          Welcome! Let's Get Started
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Tell us a bit about yourself to create your professional profile
        </p>
      </div>

      {/* Profile Photo */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 text-center">
          Profile Photo
        </label>
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 flex items-center justify-center overflow-hidden border-4 border-white dark:border-neutral-700 shadow-lg">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-neutral-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-primary-600 hover:bg-primary-700 rounded-full cursor-pointer shadow-lg transition-colors">
              <Upload className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-500 text-center mt-2">
          JPG, PNG or GIF (max 5MB)
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
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
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-professional pl-10"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        {/* Headline */}
        <div>
          <label htmlFor="headline" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Professional Headline <span className="text-error-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              id="headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="input-professional pl-10"
              placeholder="e.g., Computer Science Student | Web Developer"
              required
            />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
            This appears below your name and helps employers understand what you do
          </p>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Location <span className="text-error-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-professional pl-10"
              placeholder="e.g., Mumbai, Maharashtra"
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
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-professional pl-10"
              placeholder="+91 98765 43210"
              required
            />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
        <p className="text-sm text-primary-900 dark:text-primary-100 font-medium mb-2">
          💡 Why we need this information
        </p>
        <ul className="text-sm text-primary-700 dark:text-primary-300 space-y-1">
          <li>• Employers need to know your location for job matching</li>
          <li>• Your headline helps you stand out in search results</li>
          <li>• Contact info is essential for job opportunities</li>
        </ul>
      </div>
    </div>
  );
};

