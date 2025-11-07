import React, { useState, useEffect } from 'react';
import { Briefcase, Award, DollarSign, Clock, Plus, X } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { Button } from '../../ui/Button';

const COMMON_ROLES = [
  'Content Writer',
  'Graphic Designer',
  'Social Media Manager',
  'Web Developer',
  'Mobile App Developer',
  'Data Entry Operator',
  'Customer Support',
  'Sales Representative',
  'Marketing Intern',
  'Business Development',
  'Administrative Assistant',
  'Video Editor',
  'SEO Specialist',
  'UI/UX Designer'
];

const POPULAR_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript',
  'Graphic Design', 'Adobe Photoshop', 'Figma', 'Canva',
  'Content Writing', 'SEO', 'Social Media Marketing',
  'Customer Service', 'Communication', 'MS Excel',
  'Data Analysis', 'SQL', 'Video Editing'
];

const URGENCY_LEVELS = [
  { value: 'immediate', label: 'Immediate (ASAP)', color: 'error' },
  { value: 'within-week', label: 'Within a week', color: 'warning' },
  { value: 'within-month', label: 'Within a month', color: 'primary' },
  { value: 'flexible', label: 'Flexible timeline', color: 'success' }
];

export const HiringNeedsStep: React.FC = () => {
  const { data, updateData } = useOnboarding();

  const [roles, setRoles] = useState<string[]>(data.hiringNeeds?.roles || []);
  const [roleInput, setRoleInput] = useState('');
  const [skills, setSkills] = useState<string[]>(data.hiringNeeds?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [budgetMin, setBudgetMin] = useState(data.hiringNeeds?.budgetMin || '');
  const [budgetMax, setBudgetMax] = useState(data.hiringNeeds?.budgetMax || '');
  const [urgency, setUrgency] = useState(data.hiringNeeds?.urgency || 'flexible');

  useEffect(() => {
    updateData({
      hiringNeeds: {
        roles,
        skills,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        urgency
      }
    });
  }, [roles, skills, budgetMin, budgetMax, urgency]);

  const handleAddRole = (role: string) => {
    const trimmedRole = role.trim();
    if (trimmedRole && !roles.includes(trimmedRole)) {
      setRoles([...roles, trimmedRole]);
      setRoleInput('');
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setRoles(roles.filter(role => role !== roleToRemove));
  };

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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-3">
          What Are You Looking to Hire?
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Help us match you with the right candidates
        </p>
      </div>

      {/* Roles Section */}
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Briefcase className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Roles You're Hiring For
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Add at least one role
            </p>
          </div>
        </div>

        {/* Role Input */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRole(roleInput);
                }
              }}
              className="input-professional flex-1"
              placeholder="Type a role and press Enter"
            />
            <Button
              variant="primary"
              onClick={() => handleAddRole(roleInput)}
              disabled={!roleInput.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Selected Roles */}
        {roles.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Your Hiring Roles ({roles.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {roles.map((role, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-full flex items-center space-x-2"
                >
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {role}
                  </span>
                  <button
                    onClick={() => handleRemoveRole(role)}
                    className="text-primary-600 hover:text-primary-800 dark:text-primary-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Roles Suggestions */}
        <div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Common Roles (click to add)
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_ROLES.filter(role => !roles.includes(role)).slice(0, 12).map((role) => (
              <button
                key={role}
                onClick={() => handleAddRole(role)}
                className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-primary-100 dark:hover:bg-primary-900/20 border border-neutral-200 dark:border-neutral-600 hover:border-primary-300 rounded-full transition-colors"
              >
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  {role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg">
            <Award className="w-5 h-5 text-secondary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Required Skills
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              What skills should candidates have?
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
              Required Skills ({skills.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800 rounded-full flex items-center space-x-2"
                >
                  <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    {skill}
                  </span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-secondary-600 hover:text-secondary-800 dark:text-secondary-400"
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
            {POPULAR_SKILLS.filter(skill => !skills.includes(skill)).slice(0, 15).map((skill) => (
              <button
                key={skill}
                onClick={() => handleAddSkill(skill)}
                className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-secondary-100 dark:hover:bg-secondary-900/20 border border-neutral-200 dark:border-neutral-600 hover:border-secondary-300 rounded-full transition-colors"
              >
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  {skill}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Section */}
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-success-100 dark:bg-success-900/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Budget Range
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              What's your monthly budget per hire?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Minimum (₹/month)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="input-professional pl-8"
                placeholder="5,000"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Maximum (₹/month)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="input-professional pl-8"
                placeholder="20,000"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Urgency Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
            <Clock className="w-5 h-5 text-warning-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Hiring Urgency
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              When do you need candidates?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {URGENCY_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => setUrgency(level.value)}
              className={`
                p-4 rounded-xl border-2 transition-all text-left
                ${urgency === level.value
                  ? `border-${level.color}-500 bg-${level.color}-50 dark:bg-${level.color}-900/20`
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {level.label}
                  </p>
                </div>
                {urgency === level.value && (
                  <div className={`w-5 h-5 bg-${level.color}-500 rounded-full flex items-center justify-center`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
        <p className="text-sm text-primary-900 dark:text-primary-100 font-medium mb-2">
          💡 Tips for attracting great candidates
        </p>
        <ul className="text-sm text-primary-700 dark:text-primary-300 space-y-1">
          <li>• Be specific about the roles you're hiring for</li>
          <li>• List essential skills, not nice-to-haves</li>
          <li>• Offer competitive compensation for part-time work</li>
          <li>• Set realistic urgency levels to attract quality applicants</li>
        </ul>
      </div>
    </div>
  );
};

