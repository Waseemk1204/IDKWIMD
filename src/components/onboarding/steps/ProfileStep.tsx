import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Upload, FileText } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { useAuth } from '../../../hooks/useAuth';
import { ResumeUpload } from '../../profile/ResumeUpload';
import { Button } from '../../ui/Button';

export const ProfileStep: React.FC = () => {
  const { data, updateData } = useOnboarding();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(data.fullName || user?.fullName || '');
  const [email, setEmail] = useState(data.email || user?.email || '');
  const [phone, setPhone] = useState(data.phone || user?.phone || '');
  const [headline, setHeadline] = useState(data.headline || user?.headline || '');
  const [location, setLocation] = useState(data.location || user?.location || '');
  const [about, setAbout] = useState(data.about || user?.about || '');
  const [showResumeUpload, setShowResumeUpload] = useState(false);

  useEffect(() => {
    updateData({
      fullName,
      email,
      phone,
      headline,
      location,
      about
    });
  }, [fullName, email, phone, headline, location, about]);

  const handleResumeUploadSuccess = (parsedData: any) => {
    console.log('📄 Resume parsed successfully! Data:', parsedData);
    
    // FORCE OVERWRITE all fields with parsed data (Workday-style comprehensive)
    // Always use parsed data, even if fields are already filled
    console.log('✅ Force overwriting fullName:', parsedData.fullName);
    setFullName(parsedData.fullName || fullName);
    
    console.log('✅ Force overwriting email:', parsedData.email);
    setEmail(parsedData.email || email);
    
    console.log('✅ Force overwriting phone:', parsedData.phone);
    setPhone(parsedData.phone || phone);
    
    console.log('✅ Force overwriting location:', parsedData.location);
    setLocation(parsedData.location || location);
    
    console.log('✅ Force overwriting about:', parsedData.about);
    setAbout(parsedData.about || about);
    
    // Update onboarding context with ALL parsed info (FORCE OVERWRITE)
    console.log('📦 Force updating onboarding data with comprehensive info...');
    updateData({
      fullName: parsedData.fullName || fullName,
      email: parsedData.email || email,
      phone: parsedData.phone || phone,
      location: parsedData.location || location,
      about: parsedData.about || about,
      skills: parsedData.skills || [], // Force overwrite skills
      experiences: parsedData.experiences || [], // Force overwrite experiences
      education: parsedData.education || [], // Force overwrite education
      resumeData: {
        fileName: parsedData.fileName,
        uploadedAt: new Date(),
        parsedData
      }
    });
    
    console.log('✅ Form FORCE auto-filled and onboarding data updated!');
    setShowResumeUpload(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-3">
          Let's Build Your Profile
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
          Tell us about yourself so employers can find you
        </p>
      </div>

      {/* Resume Upload Option */}
      {!showResumeUpload && !data.resumeData && (
        <div className="mb-8 p-6 bg-primary-50 dark:bg-primary-900/20 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-xl">
          <div className="text-center">
            <FileText className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Save Time with Your Resume
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Upload your resume and we'll automatically fill in your profile details
            </p>
            <Button
              variant="primary"
              onClick={() => setShowResumeUpload(true)}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload Resume
            </Button>
          </div>
        </div>
      )}

      {/* Resume Upload Component */}
      {showResumeUpload && (
        <div className="mb-8">
          <ResumeUpload
            onParseComplete={handleResumeUploadSuccess}
            onError={(error) => console.error('Resume upload error:', error)}
          />
          <div className="text-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResumeUpload(false)}
            >
              Skip for now
            </Button>
          </div>
        </div>
      )}

      {/* Resume Uploaded Indicator */}
      {data.resumeData && (
        <div className="mb-8 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-success-600 dark:text-success-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-success-900 dark:text-success-100">
                Resume uploaded successfully!
              </p>
              <p className="text-xs text-success-700 dark:text-success-300">
                We've pre-filled your profile with information from your resume. Review and edit as needed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Form */}
      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2">
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

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Email Address <span className="text-error-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-professional pl-10"
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2">
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

        {/* Professional Headline */}
        <div>
          <label htmlFor="headline" className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Professional Headline
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
              placeholder="e.g., Marketing Student | Content Creator"
              maxLength={100}
            />
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            A brief professional title that describes what you do
          </p>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Location
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
            />
          </div>
        </div>

        {/* About */}
        <div>
          <label htmlFor="about" className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            About You
          </label>
          <textarea
            id="about"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="input-professional"
            rows={4}
            placeholder="Tell us a bit about yourself, your interests, and what you're looking for..."
            maxLength={500}
          />
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {about.length}/500 characters
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
        <p className="text-sm text-primary-900 dark:text-primary-100 font-medium mb-2">
          💡 Profile Tips
        </p>
        <ul className="text-sm text-primary-700 dark:text-primary-300 space-y-1">
          <li>• Use a professional email address</li>
          <li>• Make your headline specific and engaging</li>
          <li>• Highlight your unique skills or interests in the "About" section</li>
          <li>• Keep your phone number up-to-date for employer contact</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileStep;

