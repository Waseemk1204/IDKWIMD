import React, { useState, useEffect } from 'react';
import { Award, X, Plus, MapPin, DollarSign, Clock, Briefcase } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { Button } from '../../ui/Button';

const POPULAR_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'HTML/CSS',
  'Java', 'C++', 'SQL', 'MongoDB', 'Git', 'AWS',
  'Communication', 'Teamwork', 'Problem Solving', 'Leadership',
  'Marketing', 'Sales', 'Customer Service', 'Data Analysis',
  'Graphic Design', 'Content Writing', 'Social Media', 'Project Management'
];

const JOB_TYPES = [
  'Part-time',
  'Internship',
  'Freelance',
  'Contract',
  'Remote',
  'On-site'
];

const JOB_CATEGORIES = [
  'Technology',
  'Marketing',
  'Sales',
  'Design',
  'Writing',
  'Customer Service',
  'Data Entry',
  'Teaching',
  'Other'
];

export const SkillsStep: React.FC = () => {
  const { data, updateData } = useOnboarding();

  const [skills, setSkills] = useState<string[]>(data.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(
    data.jobPreferences?.jobType || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    data.jobPreferences?.categories || []
  );
  const [preferredLocations, setPreferredLocations] = useState<string[]>(
    data.jobPreferences?.locations || []
  );
  const [locationInput, setLocationInput] = useState('');
  const [salaryMin, setSalaryMin] = useState(data.jobPreferences?.salaryMin || '');
  const [salaryMax, setSalaryMax] = useState(data.jobPreferences?.salaryMax || '');
  const [availability, setAvailability] = useState(
    data.jobPreferences?.availability || 'flexible'
  );

  useEffect(() => {
    updateData({
      skills,
      jobPreferences: {
        jobType: selectedJobTypes,
        categories: selectedCategories,
        locations: preferredLocations,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        availability
      }
    });
  }, [skills, selectedJobTypes, selectedCategories, preferredLocations, salaryMin, salaryMax, availability]);

  const handleAddSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleToggleJobType = (type: string) => {
    setSelectedJobTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleToggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAddLocation = () => {
    const trimmedLocation = locationInput.trim();
    if (trimmedLocation && !preferredLocations.includes(trimmedLocation)) {
      setPreferredLocations([...preferredLocations, trimmedLocation]);
      setLocationInput('');
    }
  };

  const handleRemoveLocation = (location: string) => {
    setPreferredLocations(preferredLocations.filter(loc => loc !== location));
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-3">
          Skills & Job Preferences
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Help us match you with the perfect opportunities
        </p>
      </div>

      {/* Skills Section */}
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Award className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Your Skills
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Add at least 3 skills (minimum required)
            </p>
          </div>
        </div>

        {/* Skill Input */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(skillInput);
                }
              }}
              className="input-professional flex-1"
              placeholder="Type a skill and press Enter"
            />
            <Button
              variant="primary"
              onClick={() => handleAddSkill(skillInput)}
              disabled={!skillInput.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Selected Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Your Skills ({skills.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-full flex items-center space-x-2"
                >
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {skill}
                  </span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-primary-600 hover:text-primary-800 dark:text-primary-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Skills Suggestions */}
        <div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Popular Skills (click to add)
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SKILLS.filter(skill => !skills.includes(skill)).map((skill) => (
              <button
                key={skill}
                onClick={() => handleAddSkill(skill)}
                className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-primary-100 dark:hover:bg-primary-900/20 border border-neutral-200 dark:border-neutral-600 hover:border-primary-300 rounded-full transition-colors"
              >
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  {skill}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Job Preferences Section */}
      <div className="space-y-8">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center space-x-3">
          <Briefcase className="w-6 h-6 text-secondary-600" />
          <span>Job Preferences</span>
        </h2>

        {/* Job Types */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Preferred Job Types
          </label>
          <div className="flex flex-wrap gap-3">
            {JOB_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleToggleJobType(type)}
                className={`
                  px-4 py-2 rounded-lg border-2 transition-all
                  ${selectedJobTypes.includes(type)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-primary-300'
                  }
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Job Categories */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Interested Categories
          </label>
          <div className="flex flex-wrap gap-3">
            {JOB_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleToggleCategory(category)}
                className={`
                  px-4 py-2 rounded-lg border-2 transition-all
                  ${selectedCategories.includes(category)
                    ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300'
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-secondary-300'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Locations */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Preferred Locations
          </label>
          <div className="flex space-x-2 mb-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLocation();
                  }
                }}
                className="input-professional pl-10"
                placeholder="Add a location (e.g., Mumbai, Remote)"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleAddLocation}
              disabled={!locationInput.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {preferredLocations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {preferredLocations.map((location, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-full flex items-center space-x-2"
                >
                  <MapPin className="w-3 h-3 text-neutral-500" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {location}
                  </span>
                  <button
                    onClick={() => handleRemoveLocation(location)}
                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expected Salary Range */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Expected Salary Range (₹/month)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="input-professional pl-10"
                placeholder="Minimum"
                min="0"
              />
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                className="input-professional pl-10"
                placeholder="Maximum"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            <Clock className="w-4 h-4 inline mr-2" />
            Availability
          </label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="input-professional"
          >
            <option value="flexible">Flexible - Can adjust my schedule</option>
            <option value="immediate">Immediate - Can start right away</option>
            <option value="2weeks">2 Weeks Notice</option>
            <option value="1month">1 Month Notice</option>
            <option value="weekends">Weekends Only</option>
            <option value="evenings">Evenings Only</option>
          </select>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
        <p className="text-sm text-primary-900 dark:text-primary-100 font-medium mb-2">
          💡 Matching Tips
        </p>
        <ul className="text-sm text-primary-700 dark:text-primary-300 space-y-1">
          <li>• Add both technical and soft skills for better matches</li>
          <li>• Select multiple job types to see more opportunities</li>
          <li>• Being flexible with location increases your chances</li>
          <li>• Keep salary expectations realistic for part-time work</li>
        </ul>
      </div>
    </div>
  );
};

