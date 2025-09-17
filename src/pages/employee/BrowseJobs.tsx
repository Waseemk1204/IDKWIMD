import React, { useState, useEffect } from 'react';
import { JobCard, Job } from '../../components/jobs/JobCard';
import { apiService } from '../../services/api';

export const BrowseJobs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load jobs from API
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getJobs({ 
          limit: 50, 
          search: searchQuery || undefined,
          category: selectedCategory || undefined
        });
        if (response.success && response.data?.jobs) {
          setJobs(response.data.jobs);
        } else {
          setError(response.message || 'Failed to load jobs');
        }
      } catch (error) {
        console.error('Failed to load jobs:', error);
        setError('Failed to load jobs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Browse Jobs
      </h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <input 
              type="text" 
              placeholder="Search jobs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" 
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="">All Categories</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="writing">Content Writing</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm">
              <option value="">Sort By</option>
              <option value="newest">Newest</option>
              <option value="salary-high">Salary: High to Low</option>
              <option value="salary-low">Salary: Low to High</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || selectedCategory 
                ? 'No jobs found matching your criteria.' 
                : 'No jobs available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} variant="compact" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};