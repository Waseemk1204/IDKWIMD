import React, { useState } from 'react';
import {
  Filter,
  X,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Award,
  Building2,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface JobFilterOptions {
  searchQuery?: string;
  location?: string[];
  jobType?: string[];
  experienceLevel?: string[];
  salaryRange?: {
    min?: number;
    max?: number;
  };
  skills?: string[];
  companySize?: string[];
  postedWithin?: string;
  isRemote?: boolean;
}

interface JobFiltersProps {
  filters: JobFilterOptions;
  onFilterChange: (filters: JobFilterOptions) => void;
  onClearFilters: () => void;
  className?: string;
}

const JOB_TYPES = ['part-time', 'full-time', 'contract', 'internship', 'freelance'];
const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const POSTED_WITHIN = [
  { label: 'Last 24 hours', value: '1' },
  { label: 'Last 3 days', value: '3' },
  { label: 'Last week', value: '7' },
  { label: 'Last 2 weeks', value: '14' },
  { label: 'Last month', value: '30' }
];

const POPULAR_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript',
  'Graphic Design', 'Content Writing', 'SEO', 'Marketing',
  'Data Analysis', 'Customer Service'
];

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  className = ''
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    jobType: true,
    experience: true,
    salary: true,
    skills: false,
    location: false,
    company: false,
    posted: false
  });

  const [customSkill, setCustomSkill] = useState('');
  const [customLocation, setCustomLocation] = useState('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleJobTypeToggle = (type: string) => {
    const currentTypes = filters.jobType || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    onFilterChange({ ...filters, jobType: newTypes });
  };

  const handleExperienceToggle = (level: string) => {
    const currentLevels = filters.experienceLevel || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level];
    onFilterChange({ ...filters, experienceLevel: newLevels });
  };

  const handleSkillToggle = (skill: string) => {
    const currentSkills = filters.skills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    onFilterChange({ ...filters, skills: newSkills });
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      handleSkillToggle(customSkill.trim());
      setCustomSkill('');
    }
  };

  const handleLocationToggle = (location: string) => {
    const currentLocations = filters.location || [];
    const newLocations = currentLocations.includes(location)
      ? currentLocations.filter(l => l !== location)
      : [...currentLocations, location];
    onFilterChange({ ...filters, location: newLocations });
  };

  const handleAddCustomLocation = () => {
    if (customLocation.trim()) {
      handleLocationToggle(customLocation.trim());
      setCustomLocation('');
    }
  };

  const handleCompanySizeToggle = (size: string) => {
    const currentSizes = filters.companySize || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    onFilterChange({ ...filters, companySize: newSizes });
  };

  const handleSalaryChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? Number(value) : undefined;
    onFilterChange({
      ...filters,
      salaryRange: {
        ...filters.salaryRange,
        [type]: numValue
      }
    });
  };

  const handlePostedWithinChange = (days: string) => {
    onFilterChange({ ...filters, postedWithin: days });
  };

  const handleRemoteToggle = () => {
    onFilterChange({ ...filters, isRemote: !filters.isRemote });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.jobType?.length) count += filters.jobType.length;
    if (filters.experienceLevel?.length) count += filters.experienceLevel.length;
    if (filters.skills?.length) count += filters.skills.length;
    if (filters.location?.length) count += filters.location.length;
    if (filters.companySize?.length) count += filters.companySize.length;
    if (filters.salaryRange?.min || filters.salaryRange?.max) count += 1;
    if (filters.postedWithin) count += 1;
    if (filters.isRemote) count += 1;
    return count;
  };

  const FilterSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    sectionKey: string;
    children: React.ReactNode;
  }> = ({ title, icon, sectionKey, children }) => (
    <div className="border-b border-neutral-200 dark:border-neutral-700 last:border-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-neutral-900 dark:text-neutral-100">{title}</span>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );

  const activeFilters = getActiveFilterCount();

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Filters
            </h2>
            {activeFilters > 0 && (
              <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full">
                {activeFilters}
              </span>
            )}
          </div>
          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              leftIcon={<X className="w-4 h-4" />}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Remote Work Toggle */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            🏠 Remote jobs only
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.isRemote || false}
              onChange={handleRemoteToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full peer peer-checked:bg-primary-600 peer-focus:ring-2 peer-focus:ring-primary-500 transition-colors"></div>
            <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>

      {/* Job Type */}
      <FilterSection
        title="Job Type"
        icon={<Briefcase className="w-4 h-4 text-primary-600" />}
        sectionKey="jobType"
      >
        <div className="space-y-2">
          {JOB_TYPES.map(type => (
            <label key={type} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.jobType?.includes(type) || false}
                onChange={() => handleJobTypeToggle(type)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-neutral-700 dark:text-neutral-300 capitalize group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {type}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Experience Level */}
      <FilterSection
        title="Experience Level"
        icon={<Award className="w-4 h-4 text-secondary-600" />}
        sectionKey="experience"
      >
        <div className="space-y-2">
          {EXPERIENCE_LEVELS.map(level => (
            <label key={level} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.experienceLevel?.includes(level) || false}
                onChange={() => handleExperienceToggle(level)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-neutral-700 dark:text-neutral-300 capitalize group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {level}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Salary Range */}
      <FilterSection
        title="Salary Range (₹/hr)"
        icon={<DollarSign className="w-4 h-4 text-success-600" />}
        sectionKey="salary"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              Minimum
            </label>
            <input
              type="number"
              value={filters.salaryRange?.min || ''}
              onChange={(e) => handleSalaryChange('min', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Min salary"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              Maximum
            </label>
            <input
              type="number"
              value={filters.salaryRange?.max || ''}
              onChange={(e) => handleSalaryChange('max', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Max salary"
            />
          </div>
        </div>
      </FilterSection>

      {/* Skills */}
      <FilterSection
        title="Skills"
        icon={<Award className="w-4 h-4 text-warning-600" />}
        sectionKey="skills"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSkill()}
              placeholder="Add skill..."
              className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button size="sm" onClick={handleAddCustomSkill}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SKILLS.map(skill => (
              <button
                key={skill}
                onClick={() => handleSkillToggle(skill)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  filters.skills?.includes(skill)
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-300'
                    : 'bg-neutral-50 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-neutral-200 hover:border-primary-300'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {filters.skills && filters.skills.length > 0 && (
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-600">
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">Selected skills:</p>
              <div className="flex flex-wrap gap-2">
                {filters.skills.map(skill => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                  >
                    {skill}
                    <button
                      onClick={() => handleSkillToggle(skill)}
                      className="hover:text-primary-900 dark:hover:text-primary-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection
        title="Location"
        icon={<MapPin className="w-4 h-4 text-error-600" />}
        sectionKey="location"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomLocation()}
              placeholder="Add location..."
              className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button size="sm" onClick={handleAddCustomLocation}>
              Add
            </Button>
          </div>
          {filters.location && filters.location.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.location.map(loc => (
                <span
                  key={loc}
                  className="flex items-center gap-1 px-2 py-1 bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 text-xs rounded-full"
                >
                  {loc}
                  <button
                    onClick={() => handleLocationToggle(loc)}
                    className="hover:text-error-900 dark:hover:text-error-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </FilterSection>

      {/* Company Size */}
      <FilterSection
        title="Company Size"
        icon={<Building2 className="w-4 h-4 text-info-600" />}
        sectionKey="company"
      >
        <div className="space-y-2">
          {COMPANY_SIZES.map(size => (
            <label key={size} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.companySize?.includes(size) || false}
                onChange={() => handleCompanySizeToggle(size)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {size} employees
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Posted Within */}
      <FilterSection
        title="Posted Within"
        icon={<Clock className="w-4 h-4 text-neutral-600" />}
        sectionKey="posted"
      >
        <div className="space-y-2">
          {POSTED_WITHIN.map(option => (
            <label key={option.value} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="postedWithin"
                checked={filters.postedWithin === option.value}
                onChange={() => handlePostedWithinChange(option.value)}
                className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

export default JobFilters;

