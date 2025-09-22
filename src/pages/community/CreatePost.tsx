import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';
export const CreatePost: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      // Validate tag length (max 30 characters)
      if (trimmedTag.length > 30) {
        setError('Tags cannot be longer than 30 characters');
        return;
      }
      setTags([...tags, trimmedTag]);
      setTagInput('');
      setError(null); // Clear any previous errors
    }
  };
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please sign in to create a post');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        tags: tags.filter(tag => tag.trim().length > 0)
      };

      const response = await apiService.createCommunityPost(postData);

      if (response.success) {
        // Redirect to community hub with success message
        navigate('/community', { 
          state: { message: 'Post created successfully!' } 
        });
      } else {
        setError(response.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-4">
          <Link to="/community" className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Post
          </h1>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please sign in to create a post.
          </p>
          <Link to="/login">
            <Button variant="primary">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link to="/community" className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Post
        </h1>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <Input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter a descriptive title" required />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <textarea id="content" rows={10} value={content} onChange={e => setContent(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" placeholder="Share your thoughts, experiences, or questions..." required></textarea>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              You can use Markdown formatting. Add **bold** text, *italics*, and
              [links](https://example.com).
            </p>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <div className="flex">
              <Input 
                id="tags" 
                type="text" 
                value={tagInput} 
                onChange={e => setTagInput(e.target.value)} 
                onKeyDown={handleTagKeyDown} 
                placeholder="Add tags (press Enter)" 
                className="rounded-r-none" 
                maxLength={30}
              />
              <button type="button" onClick={handleAddTag} className="px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Add
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tags must be 30 characters or less. Press Enter or click Add to add a tag.
            </p>
            {tags.length > 0 && <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-500 dark:text-blue-400 hover:bg-blue-300 dark:hover:bg-blue-700 focus:outline-none">
                      <span className="sr-only">Remove tag</span>
                      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  </span>)}
              </div>}
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link to="/community">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={!title.trim() || !content.trim() || isSubmitting} isLoading={isSubmitting}>
              Publish Post
            </Button>
          </div>
        </form>
      </div>
    </div>;
};