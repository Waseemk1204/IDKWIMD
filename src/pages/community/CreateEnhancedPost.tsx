import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { 
  ArrowLeftIcon, 
  TagIcon, 
  BriefcaseIcon, 
  GraduationCapIcon,
  LightbulbIcon,
  HelpCircleIcon,
  MegaphoneIcon,
  MessageSquareIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';

interface CommunityCategory {
  _id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  postCount: number;
  memberCount: number;
}

export const CreateEnhancedPost: React.FC = () => {
  const { user: _user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    type: 'discussion' as 'discussion' | 'question' | 'insight' | 'announcement' | 'project' | 'mentorship',
    tags: [] as string[],
    professionalContext: {
      industry: '',
      skillLevel: '' as 'beginner' | 'intermediate' | 'advanced' | 'expert' | '',
      relatedSkills: [] as string[],
      jobRelevance: false
    },
    mentorship: {
      isMentorshipRequest: false,
      menteeLevel: '' as 'beginner' | 'intermediate' | 'advanced' | '',
      preferredMentorSkills: [] as string[],
      mentorshipType: '' as 'career' | 'technical' | 'business' | 'general' | ''
    }
  });

  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newMentorSkill, setNewMentorSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiService.getCommunityCategories(true);
        if (response.success && response.data?.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(typeof prev[parent as keyof typeof prev] === 'object' && prev[parent as keyof typeof prev] !== null ? prev[parent as keyof typeof prev] as Record<string, any> : {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.professionalContext.relatedSkills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        professionalContext: {
          ...prev.professionalContext,
          relatedSkills: [...prev.professionalContext.relatedSkills, newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      professionalContext: {
        ...prev.professionalContext,
        relatedSkills: prev.professionalContext.relatedSkills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const addMentorSkill = () => {
    if (newMentorSkill.trim() && !formData.mentorship.preferredMentorSkills.includes(newMentorSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        mentorship: {
          ...prev.mentorship,
          preferredMentorSkills: [...prev.mentorship.preferredMentorSkills, newMentorSkill.trim()]
        }
      }));
      setNewMentorSkill('');
    }
  };

  const removeMentorSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      mentorship: {
        ...prev.mentorship,
        preferredMentorSkills: prev.mentorship.preferredMentorSkills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.createEnhancedCommunityPost({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        ...(formData.type && { type: formData.type }),
        ...(formData.tags.length > 0 && { tags: formData.tags }),
        ...(formData.professionalContext.industry && { 
          professionalContext: {
            ...formData.professionalContext,
            skillLevel: formData.professionalContext.skillLevel || undefined
          }
        }),
        ...(formData.mentorship.mentorshipType && { 
          mentorship: {
            ...formData.mentorship,
            menteeLevel: formData.mentorship.menteeLevel || undefined,
            mentorshipType: formData.mentorship.mentorshipType || undefined
          }
        })
      });
      
      if (response.success) {
        navigate(`/community-enhanced/post/${response.data.post._id}`);
      } else {
        setError(response.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return <HelpCircleIcon className="h-4 w-4" />;
      case 'insight': return <LightbulbIcon className="h-4 w-4" />;
      case 'announcement': return <MegaphoneIcon className="h-4 w-4" />;
      case 'project': return <BriefcaseIcon className="h-4 w-4" />;
      case 'mentorship': return <GraduationCapIcon className="h-4 w-4" />;
      default: return <MessageSquareIcon className="h-4 w-4" />;
    }
  };

  const getPostTypeDescription = (type: string) => {
    switch (type) {
      case 'question': return 'Ask a question to get help from the community';
      case 'insight': return 'Share your professional insights and experiences';
      case 'announcement': return 'Make an important announcement';
      case 'project': return 'Share information about a project or opportunity';
      case 'mentorship': return 'Request or offer mentorship';
      default: return 'Start a general discussion';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/community-enhanced')}
          leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
        >
          Back to Community
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Create New Post
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Share your professional insights with the community
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Post Title *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a compelling title for your post"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Post Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['discussion', 'question', 'insight', 'announcement', 'project', 'mentorship'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('type', type)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.type === type
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getPostTypeIcon(type)}
                      <span className="font-medium capitalize">{type}</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {getPostTypeDescription(type)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Category *
              </label>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                options={[
                  { value: '', label: 'Select a category' },
                  ...categories.map(category => ({
                    value: category._id,
                    label: category.name
                  }))
                ]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Content *
              </label>
              <TextArea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your post content here..."
                rows={8}
                required
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Tags
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <TagIcon className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary-900 dark:hover:text-primary-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Professional Context */}
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Professional Context
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Industry
              </label>
              <Select
                value={formData.professionalContext.industry}
                onChange={(e) => handleInputChange('professionalContext.industry', e.target.value)}
                options={[
                  { value: '', label: 'Select industry' },
                  { value: 'technology', label: 'Technology' },
                  { value: 'finance', label: 'Finance' },
                  { value: 'healthcare', label: 'Healthcare' },
                  { value: 'education', label: 'Education' },
                  { value: 'marketing', label: 'Marketing' },
                  { value: 'design', label: 'Design' },
                  { value: 'consulting', label: 'Consulting' },
                  { value: 'retail', label: 'Retail' },
                  { value: 'manufacturing', label: 'Manufacturing' },
                  { value: 'other', label: 'Other' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Skill Level
              </label>
              <Select
                value={formData.professionalContext.skillLevel}
                onChange={(e) => handleInputChange('professionalContext.skillLevel', e.target.value)}
                options={[
                  { value: '', label: 'Select skill level' },
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                  { value: 'expert', label: 'Expert' }
                ]}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Related Skills
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} variant="outline">
                Add
              </Button>
            </div>
            
            {formData.professionalContext.relatedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.professionalContext.relatedSkills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.professionalContext.jobRelevance}
                onChange={(e) => handleInputChange('professionalContext.jobRelevance', e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-600"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                This post is relevant to job opportunities
              </span>
            </label>
          </div>
        </div>

        {/* Mentorship Section */}
        {formData.type === 'mentorship' && (
          <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Mentorship Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.mentorship.isMentorshipRequest}
                    onChange={(e) => handleInputChange('mentorship.isMentorshipRequest', e.target.checked)}
                    className="rounded border-neutral-300 dark:border-neutral-600"
                  />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    This is a mentorship request
                  </span>
                </label>
              </div>

              {formData.mentorship.isMentorshipRequest && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Your Level
                      </label>
                      <Select
                        value={formData.mentorship.menteeLevel}
                        onChange={(e) => handleInputChange('mentorship.menteeLevel', e.target.value)}
                        options={[
                          { value: '', label: 'Select your level' },
                          { value: 'beginner', label: 'Beginner' },
                          { value: 'intermediate', label: 'Intermediate' },
                          { value: 'advanced', label: 'Advanced' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Mentorship Type
                      </label>
                      <Select
                        value={formData.mentorship.mentorshipType}
                        onChange={(e) => handleInputChange('mentorship.mentorshipType', e.target.value)}
                        options={[
                          { value: '', label: 'Select type' },
                          { value: 'career', label: 'Career Guidance' },
                          { value: 'technical', label: 'Technical Skills' },
                          { value: 'business', label: 'Business Skills' },
                          { value: 'general', label: 'General Development' }
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Preferred Mentor Skills
                    </label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        type="text"
                        value={newMentorSkill}
                        onChange={(e) => setNewMentorSkill(e.target.value)}
                        placeholder="Add a skill you'd like to learn"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMentorSkill())}
                      />
                      <Button type="button" onClick={addMentorSkill} variant="outline">
                        Add
                      </Button>
                    </div>
                    
                    {formData.mentorship.preferredMentorSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.mentorship.preferredMentorSkills.map(skill => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeMentorSkill(skill)}
                              className="hover:text-purple-900 dark:hover:text-purple-100"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/community-enhanced')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Post...' : 'Create Post'}
          </Button>
        </div>
      </form>
    </div>
  );
};

