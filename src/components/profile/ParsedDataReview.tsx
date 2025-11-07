import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ParsedResumeData } from '../../services/resumeService';

interface ParsedDataReviewProps {
  parsedData: ParsedResumeData;
  missingFields?: string[];
  onSave: (data: ParsedResumeData) => void;
  onCancel?: () => void;
  className?: string;
}

export const ParsedDataReview: React.FC<ParsedDataReviewProps> = ({
  parsedData,
  missingFields = [],
  onSave,
  onCancel,
  className = ''
}) => {
  const [editedData, setEditedData] = useState<ParsedResumeData>(parsedData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditedData(parsedData);
  }, [parsedData]);

  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
  };

  const handleAddExperience = () => {
    setEditedData({
      ...editedData,
      experiences: [
        ...(editedData.experiences || []),
        { company: '', title: '', description: '', current: false }
      ]
    });
  };

  const handleRemoveExperience = (index: number) => {
    setEditedData({
      ...editedData,
      experiences: editedData.experiences?.filter((_, i) => i !== index)
    });
  };

  const handleAddEducation = () => {
    setEditedData({
      ...editedData,
      education: [
        ...(editedData.education || []),
        { degree: '', institution: '', field: '', current: false }
      ]
    });
  };

  const handleRemoveEducation = (index: number) => {
    setEditedData({
      ...editedData,
      education: editedData.education?.filter((_, i) => i !== index)
    });
  };

  const handleAddSkill = (skill: string) => {
    if (skill.trim()) {
      setEditedData({
        ...editedData,
        skills: [...(editedData.skills || []), skill.trim()]
      });
    }
  };

  const handleRemoveSkill = (index: number) => {
    setEditedData({
      ...editedData,
      skills: editedData.skills?.filter((_, i) => i !== index)
    });
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Review Extracted Information
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Please verify the information extracted from your resume and make any necessary corrections.
            </p>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              Edit All
            </Button>
          )}
        </div>

        {/* Missing Fields Warning */}
        {missingFields.length > 0 && (
          <div className="mt-4 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning-900 dark:text-warning-100">
                Missing Information
              </p>
              <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">
                The following fields could not be extracted: {missingFields.join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.fullName || ''}
                onChange={(e) => setEditedData({ ...editedData, fullName: e.target.value })}
                className="input-professional"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-neutral-900 dark:text-neutral-100">
                {editedData.fullName || <span className="text-neutral-400">Not provided</span>}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editedData.email || ''}
                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                className="input-professional"
                placeholder="Enter your email"
              />
            ) : (
              <p className="text-neutral-900 dark:text-neutral-100">
                {editedData.email || <span className="text-neutral-400">Not provided</span>}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editedData.phone || ''}
                onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                className="input-professional"
                placeholder="Enter your phone number"
              />
            ) : (
              <p className="text-neutral-900 dark:text-neutral-100">
                {editedData.phone || <span className="text-neutral-400">Not provided</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
            <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
            Skills
          </h3>
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const skill = prompt('Enter a skill:');
                if (skill) handleAddSkill(skill);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Skill
            </Button>
          )}
        </div>

        {editedData.skills && editedData.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {editedData.skills.map((skill, index) => (
              <div
                key={index}
                className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-full flex items-center space-x-2"
              >
                <span className="text-sm text-primary-700 dark:text-primary-300">{skill}</span>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveSkill(index)}
                    className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-400">No skills extracted</p>
        )}
      </div>

      {/* Work Experience */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
            <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
            Work Experience
          </h3>
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddExperience}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Experience
            </Button>
          )}
        </div>

        {editedData.experiences && editedData.experiences.length > 0 ? (
          <div className="space-y-4">
            {editedData.experiences.map((exp, index) => (
              <div key={index} className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExps = [...(editedData.experiences || [])];
                            newExps[index] = { ...newExps[index], company: e.target.value };
                            setEditedData({ ...editedData, experiences: newExps });
                          }}
                          className="input-professional"
                          placeholder="Company name"
                        />
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const newExps = [...(editedData.experiences || [])];
                            newExps[index] = { ...newExps[index], title: e.target.value };
                            setEditedData({ ...editedData, experiences: newExps });
                          }}
                          className="input-professional"
                          placeholder="Job title"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveExperience(index)}
                        className="ml-2 text-error-600 hover:text-error-800 dark:text-error-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={exp.description}
                      onChange={(e) => {
                        const newExps = [...(editedData.experiences || [])];
                        newExps[index] = { ...newExps[index], description: e.target.value };
                        setEditedData({ ...editedData, experiences: newExps });
                      }}
                      className="input-professional"
                      placeholder="Job description"
                      rows={2}
                    />
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {exp.title || 'Position'} at {exp.company || 'Company'}
                    </h4>
                    {exp.duration && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {exp.duration}
                      </p>
                    )}
                    {exp.description && (
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-400">No work experience extracted</p>
        )}
      </div>

      {/* Education */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
            <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
            Education
          </h3>
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddEducation}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Education
            </Button>
          )}
        </div>

        {editedData.education && editedData.education.length > 0 ? (
          <div className="space-y-4">
            {editedData.education.map((edu, index) => (
              <div key={index} className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...(editedData.education || [])];
                            newEdu[index] = { ...newEdu[index], degree: e.target.value };
                            setEditedData({ ...editedData, education: newEdu });
                          }}
                          className="input-professional"
                          placeholder="Degree"
                        />
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const newEdu = [...(editedData.education || [])];
                            newEdu[index] = { ...newEdu[index], institution: e.target.value };
                            setEditedData({ ...editedData, education: newEdu });
                          }}
                          className="input-professional"
                          placeholder="Institution"
                        />
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => {
                            const newEdu = [...(editedData.education || [])];
                            newEdu[index] = { ...newEdu[index], field: e.target.value };
                            setEditedData({ ...editedData, education: newEdu });
                          }}
                          className="input-professional"
                          placeholder="Field of study"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveEducation(index)}
                        className="ml-2 text-error-600 hover:text-error-800 dark:text-error-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h4>
                    {edu.institution && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {edu.institution}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-400">No education information extracted</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <div>
          {isEditing && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditedData(parsedData);
                setIsEditing(false);
              }}
            >
              Cancel Editing
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Discard
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isEditing ? 'Save Changes' : 'Apply to Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
};

