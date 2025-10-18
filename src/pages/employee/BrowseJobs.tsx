import React, { useState, useEffect, useCallback } from 'react';
import { JobCard, Job } from '../../components/jobs/JobCard';
import { apiService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Filter, MapPin, DollarSign, Clock, Users, X } from 'lucide-react';
import { toast } from 'sonner';

interface JobFilters {
  search: string;
  category: string;
  location: string;
  minSalary: string;
  maxSalary: string;
  jobType: string;
  experienceLevel: string;
  isRemote: boolean;
  sortBy: string;
}

export const BrowseJobs: React.FC = () => {
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    category: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    jobType: '',
    experienceLevel: '',
    isRemote: false,
    sortBy: 'newest'
  });
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Debounced search to avoid too many API calls
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          loadJobs(searchTerm);
        }, 500);
      };
    })(),
    []
  );

  const loadJobs = async (searchTerm?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchQuery = searchTerm !== undefined ? searchTerm : filters.search;
      const response = await apiService.getJobs({ 
        limit: 20,
        page: currentPage,
        search: searchQuery || undefined,
        category: filters.category || undefined,
        location: filters.location || undefined,
        minSalary: filters.minSalary ? parseInt(filters.minSalary) : undefined,
        maxSalary: filters.maxSalary ? parseInt(filters.maxSalary) : undefined,
        jobType: filters.jobType || undefined,
        experienceLevel: filters.experienceLevel || undefined,
        isRemote: filters.isRemote || undefined,
        sortBy: filters.sortBy || undefined
      });
      
      if (response.success && response.data?.jobs) {
        if (currentPage === 1) {
          setJobs(response.data.jobs);
        } else {
          setJobs(prev => [...prev, ...response.data.jobs]);
        }
        setTotalJobs(response.data.total || 0);
        setHasMore(response.data.hasMore || false);
      } else {
        setError(response.message || 'Failed to load jobs');
        toast.error('Failed to load jobs');
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setError('Failed to load jobs. Please try again.');
      toast.error('Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [filters.category, filters.location, filters.minSalary, filters.maxSalary, filters.jobType, filters.experienceLevel, filters.isRemote, filters.sortBy, currentPage]);

  useEffect(() => {
    if (filters.search) {
      debouncedSearch(filters.search);
    } else {
      loadJobs();
    }
  }, [filters.search]);

  const handleFilterChange = (key: keyof JobFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      minSalary: '',
      maxSalary: '',
      jobType: '',
      experienceLevel: '',
      isRemote: false,
      sortBy: 'newest'
    });
    setCurrentPage(1);
  };

  const loadMoreJobs = () => {
    setCurrentPage(prev => prev + 1);
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== false && value !== 'newest'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Find Your Next Job
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {totalJobs > 0 ? `${totalJobs} jobs found` : 'Search for part-time opportunities'}
          </p>
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="mt-4 sm:mt-0"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search jobs by title, company, or skills..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Advanced Filters
            </h3>
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="writing">Content Writing</option>
                <option value="data">Data Analysis</option>
                <option value="sales">Sales</option>
                <option value="customer-service">Customer Service</option>
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <Input
                type="text"
                placeholder="City, State"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Job Type
              </label>
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Experience Level
              </label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Min Salary (₹/hour)
              </label>
              <Input
                type="number"
                placeholder="Min salary"
                value={filters.minSalary}
                onChange={(e) => handleFilterChange('minSalary', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Max Salary (₹/hour)
              </label>
              <Input
                type="number"
                placeholder="Max salary"
                value={filters.maxSalary}
                onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
              />
            </div>
          </div>

          {/* Remote Work Toggle */}
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="remote"
              checked={filters.isRemote}
              onChange={(e) => handleFilterChange('isRemote', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remote" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Remote work only
            </label>
          </div>

          {/* Sort Options */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="salary-high">Salary: High to Low</option>
              <option value="salary-low">Salary: Low to High</option>
              <option value="relevance">Most Relevant</option>
              <option value="deadline">Application Deadline</option>
            </select>
          </div>
        </div>
      )}

      {/* Job Results */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {isLoading && currentPage === 1 ? (
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
            <Button 
              onClick={() => loadJobs()}
              variant="primary"
            >
              Try Again
            </Button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {activeFiltersCount > 0 
                ? 'Try adjusting your filters or search terms.' 
                : 'No jobs are currently available.'}
            </p>
            {activeFiltersCount > 0 && (
              <Button
                onClick={clearFilters}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} variant="compact" />
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-6">
                <Button
                  onClick={loadMoreJobs}
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More Jobs'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};