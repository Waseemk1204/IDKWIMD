import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Briefcase, GraduationCap, Calendar } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { Button } from '../../ui/Button';

interface Experience {
  company: string;
  title: string;
  from?: Date;
  to?: Date;
  description?: string;
  current: boolean;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  from?: Date;
  to?: Date;
  current: boolean;
}

export const ExperienceStep: React.FC = () => {
  const { data, updateData } = useOnboarding();

  const [experiences, setExperiences] = useState<Experience[]>(
    data.experiences || [{ company: '', title: '', description: '', current: false }]
  );

  const [education, setEducation] = useState<Education[]>(
    data.education || [{ institution: '', degree: '', field: '', current: false }]
  );

  useEffect(() => {
    updateData({ experiences, education });
  }, [experiences, education]);

  const handleAddExperience = () => {
    setExperiences([...experiences, { company: '', title: '', description: '', current: false }]);
    // Scroll to the newly added experience field
    setTimeout(() => {
      const experienceCards = document.querySelectorAll('[data-experience-card]');
      if (experienceCards.length > 0) {
        experienceCards[experienceCards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleRemoveExperience = (index: number) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((_, i) => i !== index));
    }
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: any) => {
    const newExperiences = [...experiences];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    setExperiences(newExperiences);
  };

  const handleAddEducation = () => {
    setEducation([...education, { institution: '', degree: '', field: '', current: false }]);
    // Scroll to the newly added education field
    setTimeout(() => {
      const educationCards = document.querySelectorAll('[data-education-card]');
      if (educationCards.length > 0) {
        educationCards[educationCards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleRemoveEducation = (index: number) => {
    if (education.length > 1) {
      setEducation(education.filter((_, i) => i !== index));
    }
  };

  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setEducation(newEducation);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-3">
          Your Professional Background
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
          Add your work experience and education to showcase your qualifications
        </p>
      </div>

      {/* Work Experience Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Briefcase className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Work Experience
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                Add at least one work experience
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddExperience}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Experience
          </Button>
        </div>

        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <div
              key={index}
              data-experience-card
              className="p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Experience #{index + 1}
                </h3>
                {experiences.length > 1 && (
                  <button
                    onClick={() => handleRemoveExperience(index)}
                    className="text-error-600 hover:text-error-700 dark:text-error-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company */}
                <div className="md:col-span-2">
                  <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Company Name <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    className="input-professional"
                    placeholder="e.g., Google, Microsoft, Startup Inc."
                    required
                  />
                </div>

                {/* Job Title */}
                <div className="md:col-span-2">
                  <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Job Title <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                    className="input-professional"
                    placeholder="e.g., Software Engineer, Marketing Intern"
                    required
                  />
                </div>

                {/* From Date */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    From
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="month"
                      value={exp.from ? new Date(exp.from).toISOString().slice(0, 7) : ''}
                      onChange={(e) => handleExperienceChange(index, 'from', new Date(e.target.value))}
                      className="input-professional pl-10"
                    />
                  </div>
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    To
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="month"
                      value={exp.to && !exp.current ? new Date(exp.to).toISOString().slice(0, 7) : ''}
                      onChange={(e) => handleExperienceChange(index, 'to', new Date(e.target.value))}
                      className="input-professional pl-10"
                      disabled={exp.current}
                    />
                  </div>
                </div>

                {/* Current Job Checkbox */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-base text-neutral-700 dark:text-neutral-300">
                      I currently work here
                    </span>
                  </label>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                    className="input-professional"
                    rows={3}
                    placeholder="Describe your responsibilities and achievements..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg">
              <GraduationCap className="w-5 h-5 text-secondary-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Education
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                Add at least one educational qualification
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddEducation}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Education
          </Button>
        </div>

        <div className="space-y-6">
          {education.map((edu, index) => (
            <div
              key={index}
              data-education-card
              className="p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Education #{index + 1}
                </h3>
                {education.length > 1 && (
                  <button
                    onClick={() => handleRemoveEducation(index)}
                    className="text-error-600 hover:text-error-700 dark:text-error-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Institution */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Institution <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className="input-professional"
                    placeholder="e.g., Mumbai University, IIT Delhi"
                    required
                  />
                </div>

                {/* Degree */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Degree <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className="input-professional"
                    placeholder="e.g., B.Tech, MBA, B.Com"
                    required
                  />
                </div>

                {/* Field of Study */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Field of Study <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                    className="input-professional"
                    placeholder="e.g., Computer Science, Business"
                    required
                  />
                </div>

                {/* From Date */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    From
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="month"
                      value={edu.from ? new Date(edu.from).toISOString().slice(0, 7) : ''}
                      onChange={(e) => handleEducationChange(index, 'from', new Date(e.target.value))}
                      className="input-professional pl-10"
                    />
                  </div>
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    To (Expected)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="month"
                      value={edu.to && !edu.current ? new Date(edu.to).toISOString().slice(0, 7) : ''}
                      onChange={(e) => handleEducationChange(index, 'to', new Date(e.target.value))}
                      className="input-professional pl-10"
                      disabled={edu.current}
                    />
                  </div>
                </div>

                {/* Currently Studying Checkbox */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={edu.current}
                      onChange={(e) => handleEducationChange(index, 'current', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      I'm currently studying here
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
        <p className="text-sm text-primary-900 dark:text-primary-100 font-medium mb-2">
          💡 Tips for a strong profile
        </p>
        <ul className="text-sm text-primary-700 dark:text-primary-300 space-y-1">
          <li>• Include internships and part-time work as experience</li>
          <li>• Use action verbs in your job descriptions (Led, Developed, Managed)</li>
          <li>• Mention specific achievements with numbers when possible</li>
          <li>• Keep it concise and relevant to the jobs you're seeking</li>
        </ul>
      </div>
    </div>
  );
};

