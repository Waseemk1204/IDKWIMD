import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { JobCard, Job } from '../components/jobs/JobCard';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Filter, MapPin, DollarSign, Clock, Users, X, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { SEO, pageSEO } from '../utils/seo';

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [filters, setFilters] = useState<JobFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    minSalary: searchParams.get('minSalary') || '',
    maxSalary: searchParams.get('maxSalary') || '',
    jobType: searchParams.get('jobType') || '',
    experienceLevel: searchParams.get('experience') || '',
    isRemote: searchParams.get('isRemote') === 'true',
    sortBy: searchParams.get('sortBy') || 'newest'
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO
        title={pageSEO.jobs.title}
        description={pageSEO.jobs.description}
        keywords={pageSEO.jobs.keywords}
        url={`${window.location.origin}/browse-jobs`}
        type="website"
      />
      {/* Header with Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="text-xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              PART-TIME PAY$
            </button>
            
            {!isAuthenticated && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  size="sm"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/signup')}
                  variant="primary"
                  size="sm"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h3>
                {activeFiltersCount > 0 && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-0 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="IT">IT & Development</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Design">Design</option>
                    <option value="Content">Content Writing</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Data">Data Analysis</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Experience
                  </label>
                  <select
                    value={filters.experienceLevel}
                    onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-0 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="">All Levels</option>
                    <option value="fresher">Fresher</option>
                    <option value="1-2">1-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Job Type
                  </label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-0 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <Input
                    type="text"
                    placeholder="City, State"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Salary Range (₹/hr)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minSalary}
                      onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxSalary}
                      onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Remote Work */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remote"
                    checked={filters.isRemote}
                    onChange={(e) => handleFilterChange('isRemote', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remote" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Remote only
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Browse Jobs
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {totalJobs > 0 ? `${totalJobs} jobs found` : 'Discover part-time opportunities'}
                </p>
              </div>
              
              {/* Mobile Filter Toggle */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>

              {/* Sort */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="salary-high">Salary: High to Low</option>
                <option value="salary-low">Salary: Low to High</option>
                <option value="relevance">Most Relevant</option>
              </select>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
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

            {/* Mobile Filters Panel */}
            {showFilters && (
              <div className="lg:hidden bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Same filters as sidebar, but in mobile view */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Categories</option>
                      <option value="IT">IT & Development</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Design">Design</option>
                      <option value="Content">Content Writing</option>
                      <option value="Customer Service">Customer Service</option>
                      <option value="Data">Data Analysis</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Levels</option>
                      <option value="fresher">Fresher</option>
                      <option value="1-2">1-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5+">5+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <Input
                      type="text"
                      placeholder="City, State"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mobile-remote"
                      checked={filters.isRemote}
                      onChange={(e) => handleFilterChange('isRemote', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="mobile-remote" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Remote only
                    </label>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="flex-1"
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={() => setShowFilters(false)}
                      variant="primary"
                      className="flex-1"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Job Results */}
            <div className="space-y-4">
              {isLoading && currentPage === 1 ? (
                <>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                      <div className="flex gap-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </div>
                    </div>
                  ))}
                </>
              ) : error ? (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
                  <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <Button 
                    onClick={() => loadJobs()}
                    variant="primary"
                  >
                    Try Again
                  </Button>
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No jobs found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {activeFiltersCount > 0 
                      ? 'Try adjusting your filters or search terms.' 
                      : 'Check back later for new opportunities.'}
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
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} variant="default" />
                  ))}
                  
                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center pt-6">
                      <Button
                        onClick={loadMoreJobs}
                        variant="outline"
                        disabled={isLoading}
                        size="lg"
                      >
                        {isLoading ? 'Loading...' : 'Load More Jobs'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

