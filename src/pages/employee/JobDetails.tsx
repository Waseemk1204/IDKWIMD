import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Job } from '../../components/jobs/JobCard';

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load job from API
  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setError('Job ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiService.getJobById(id);
        if (response.success && response.data?.job) {
          setJob(response.data.job);
        } else {
          setError('Job not found');
        }
      } catch (error) {
        console.error('Failed to load job:', error);
        setError('Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 animate-pulse"></div>
            <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Job Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {error || 'The job you\'re looking for doesn\'t exist or has been removed.'}
        </p>
      </div>
    );
  }

  const formatPayRate = () => {
    if (job.minHourlyRate && job.maxHourlyRate) {
      return `₹${job.minHourlyRate}-${job.maxHourlyRate}/hr`;
    }
    return `₹${job.hourlyRate}/hr`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };
  return <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {job.title}
        </h1>
        <button className="mt-4 md:mt-0 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Apply Now
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {job.company}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {job.location}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatPayRate()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {job.hours}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Posted {formatDate(job.postedDate)}
            </p>
          </div>
        </div>
        <div className="py-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Job Description
          </h3>
          <p className="text-gray-600 dark:text-gray-300">{job.description}</p>
        </div>
        <div className="py-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Responsibilities
          </h3>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-2">
            {job.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
        <div className="py-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Requirements
          </h3>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-2">
            {job.requirements.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
        <div className="py-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill: string, index: number) => <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {skill}
              </span>)}
          </div>
        </div>
        <div className="mt-6">
          <button className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Apply Now
          </button>
        </div>
      </div>
    </div>;
};