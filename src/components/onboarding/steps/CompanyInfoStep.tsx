import React, { useState, useEffect } from 'react';
import { Building2, Globe, MapPin, Users, Upload } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';

const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
];

const INDUSTRIES = [
  'Technology',
  'E-commerce',
  'Finance',
  'Healthcare',
  'Education',
  'Marketing',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Real Estate',
  'Food & Beverage',
  'Other'
];

export const CompanyInfoStep: React.FC = () => {
  const { data, updateData } = useOnboarding();

  const [companyName, setCompanyName] = useState(data.companyInfo?.companyName || '');
  const [companyWebsite, setCompanyWebsite] = useState(data.companyInfo?.companyWebsite || '');
  const [companySize, setCompanySize] = useState(data.companyInfo?.companySize || '');
  const [industry, setIndustry] = useState(data.companyInfo?.industry || '');
  const [headquarters, setHeadquarters] = useState(data.companyInfo?.headquarters || '');
  const [description, setDescription] = useState(data.companyInfo?.description || '');
  const [logoPreview, setLogoPreview] = useState(data.companyInfo?.companyLogo || '');

  useEffect(() => {
    updateData({
      companyInfo: {
        companyName,
        companyWebsite,
        companySize,
        industry,
        headquarters,
        description,
        companyLogo: logoPreview
      }
    });
  }, [companyName, companyWebsite, companySize, industry, headquarters, description, logoPreview]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-3">
          Tell Us About Your Company
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Help candidates learn about your organization
        </p>
      </div>

      {/* Company Logo */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 text-center">
          Company Logo
        </label>
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 flex items-center justify-center overflow-hidden border-4 border-white dark:border-neutral-700 shadow-lg">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-16 h-16 text-neutral-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-primary-600 hover:bg-primary-700 rounded-full cursor-pointer shadow-lg transition-colors">
              <Upload className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-500 text-center mt-2">
          PNG or JPG (recommended 200x200px)
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Company Name <span className="text-error-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input-professional pl-10"
              placeholder="Enter your company name"
              required
            />
          </div>
        </div>

        {/* Company Website */}
        <div>
          <label htmlFor="companyWebsite" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Company Website
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              id="companyWebsite"
              type="url"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              className="input-professional pl-10"
              placeholder="https://www.yourcompany.com"
            />
          </div>
        </div>

        {/* Company Size & Industry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="companySize" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Company Size <span className="text-error-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-neutral-400" />
              </div>
              <select
                id="companySize"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="input-professional pl-10"
                required
              >
                <option value="">Select size</option>
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} employees
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Industry <span className="text-error-500">*</span>
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="input-professional"
              required
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Headquarters */}
        <div>
          <label htmlFor="headquarters" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Headquarters <span className="text-error-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              id="headquarters"
              type="text"
              value={headquarters}
              onChange={(e) => setHeadquarters(e.target.value)}
              className="input-professional pl-10"
              placeholder="e.g., Mumbai, Maharashtra"
              required
            />
          </div>
        </div>

        {/* Company Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Company Description <span className="text-error-500">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-professional"
            rows={5}
            placeholder="Tell candidates about your company, culture, mission, and values..."
            required
          />
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
            {description.length}/1000 characters • A good description helps attract the right talent
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
        <p className="text-sm text-primary-900 dark:text-primary-100 font-medium mb-2">
          💡 Tips for an attractive company profile
        </p>
        <ul className="text-sm text-primary-700 dark:text-primary-300 space-y-1">
          <li>• Use a professional, high-quality logo</li>
          <li>• Write a compelling description that highlights what makes you unique</li>
          <li>• Mention your company culture and values</li>
          <li>• Be honest about your company size and industry</li>
        </ul>
      </div>
    </div>
  );
};

