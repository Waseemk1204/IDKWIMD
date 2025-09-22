import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star,
  Briefcase,
  Users,
  FileText,
  MessageSquare,
  Calendar,
  X
} from 'lucide-react';

interface SearchFilters {
  location: string;
  category: string;
  skills: string[];
  minRate: string;
  maxRate: string;
  experienceLevel: string;
  isRemote: boolean;
  userRole: string;
}

interface SearchResult {
  jobs: any[];
  users: any[];
  blogs: any[];
  community: any[];
  totalResults: number;
}

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState<'all' | 'jobs' | 'users' | 'blogs' | 'community'>('all');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    category: '',
    skills: [],
    minRate: '',
    maxRate: '',
    experienceLevel: '',
    isRemote: false,
    userRole: ''
  });
  const [availableFilters, setAvailableFilters] = useState<any>(null);

  // Load available filters on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response = await apiService.getSearchFilters();
        if (response.success) {
          setAvailableFilters(response.data);
        }
      } catch (error) {
        console.error('Failed to load search filters:', error);
      }
    };

    loadFilters();
  }, []);

  // Perform search when query or filters change
  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query, selectedType, filters]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchParams: any = {
        q: query,
        type: selectedType,
        limit: 20
      };

      // Add filters if they have values
      if (filters.location) searchParams.location = filters.location;
      if (filters.category) searchParams.category = filters.category;
      if (filters.skills.length > 0) searchParams.skills = filters.skills;
      if (filters.minRate) searchParams.minRate = Number(filters.minRate);
      if (filters.maxRate) searchParams.maxRate = Number(filters.maxRate);
      if (filters.experienceLevel) searchParams.experienceLevel = filters.experienceLevel;
      if (filters.isRemote) searchParams.isRemote = filters.isRemote;
      if (filters.userRole) searchParams.userRole = filters.userRole;

      const response = await apiService.globalSearch(searchParams);
      if (response.success) {
        setResults(response.data.results);
      } else {
        setError(response.message || 'Search failed');
      }
    } catch (error: any) {
      console.error('Search failed:', error);
      setError(error.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      performSearch();
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      category: '',
      skills: [],
      minRate: '',
      maxRate: '',
      experienceLevel: '',
      isRemote: false,
      userRole: ''
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const formatPayRate = (job: any) => {
    if (job.minHourlyRate && job.maxHourlyRate) {
      return `₹${job.minHourlyRate}-${job.maxHourlyRate}/hr`;
    }
    return `₹${job.hourlyRate}/hr`;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.category) count++;
    if (filters.skills.length > 0) count++;
    if (filters.minRate || filters.maxRate) count++;
    if (filters.experienceLevel) count++;
    if (filters.isRemote) count++;
    if (filters.userRole) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            Search Results
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jobs, people, blogs, community posts..."
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              />
            </div>
            <Button type="submit" variant="primary" disabled={!query.trim() || isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Search'
              )}
            </Button>
          </form>

          {/* Search Type Tabs */}
          <div className="flex space-x-1 mb-4">
            {[
              { key: 'all', label: 'All', count: results?.totalResults || 0 },
              { key: 'jobs', label: 'Jobs', count: results?.jobs?.length || 0 },
              { key: 'users', label: 'People', count: results?.users?.length || 0 },
              { key: 'blogs', label: 'Blogs', count: results?.blogs?.length || 0 },
              { key: 'community', label: 'Community', count: results?.community?.length || 0 }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setSelectedType(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === key
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {label} {count > 0 && `(${count})`}
              </button>
            ))}
          </div>

          {/* Filters Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="flex space-x-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Filters</h3>
              
              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                >
                  <option value="">All Locations</option>
                  {availableFilters?.locations?.map((location: string) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {availableFilters?.categories?.map((category: string) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Skills
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableFilters?.skills?.slice(0, 20).map((skill: any) => (
                    <label key={skill.name} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.skills.includes(skill.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('skills', [...filters.skills, skill.name]);
                          } else {
                            handleFilterChange('skills', filters.skills.filter(s => s !== skill.name));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {skill.name} ({skill.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pay Rate */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Pay Rate (₹/hr)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minRate}
                    onChange={(e) => handleFilterChange('minRate', e.target.value)}
                    className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxRate}
                    onChange={(e) => handleFilterChange('maxRate', e.target.value)}
                    className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Experience Level */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Experience Level
                </label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                >
                  <option value="">All Levels</option>
                  {availableFilters?.experienceLevels?.map((level: string) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Remote Work */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isRemote}
                    onChange={(e) => handleFilterChange('isRemote', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Remote work</span>
                </label>
              </div>

              {/* User Role */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  User Role
                </label>
                <select
                  value={filters.userRole}
                  onChange={(e) => handleFilterChange('userRole', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                >
                  <option value="">All Roles</option>
                  <option value="employee">Employee</option>
                  <option value="employer">Employer</option>
                </select>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-neutral-600 dark:text-neutral-400">Searching...</p>
              </div>
            )}

            {results && !isLoading && (
              <div className="space-y-8">
                {/* Jobs */}
                {results.jobs.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Jobs ({results.jobs.length})
                    </h2>
                    <div className="grid gap-4">
                      {results.jobs.map((job) => (
                        <div
                          key={job._id}
                          onClick={() => navigate(`/employee/jobs/${job._id}`)}
                          className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md cursor-pointer transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                {job.title}
                              </h3>
                              <p className="text-neutral-600 dark:text-neutral-400 mb-3">{job.company}</p>
                              <div className="flex items-center space-x-6 text-sm text-neutral-500 dark:text-neutral-400">
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {job.location}
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  {formatPayRate(job)}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(job.postedDate)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Users */}
                {results.users.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      People ({results.users.length})
                    </h2>
                    <div className="grid gap-4">
                      {results.users.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => navigate(`/profile/${user._id}`)}
                          className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md cursor-pointer transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage}
                                  alt={user.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-medium">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                {user.name}
                              </h3>
                              <p className="text-neutral-600 dark:text-neutral-400 mb-1">{user.role}</p>
                              {user.location && (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {user.location}
                                </p>
                              )}
                            </div>
                            {user.rating && (
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-1">
                                  {user.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blogs */}
                {results.blogs.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Blogs ({results.blogs.length})
                    </h2>
                    <div className="grid gap-4">
                      {results.blogs.map((blog) => (
                        <div
                          key={blog._id}
                          onClick={() => navigate(`/blogs/${blog._id}`)}
                          className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md cursor-pointer transition-shadow"
                        >
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                            {blog.title}
                          </h3>
                          <p className="text-neutral-600 dark:text-neutral-400 mb-3">{blog.excerpt}</p>
                          <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                            <span>By {blog.author.name}</span>
                            <span>{formatDate(blog.publishedDate)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Community Posts */}
                {results.community.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Community ({results.community.length})
                    </h2>
                    <div className="grid gap-4">
                      {results.community.map((post) => (
                        <div
                          key={post._id}
                          onClick={() => navigate(`/community/post/${post._id}`)}
                          className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md cursor-pointer transition-shadow"
                        >
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                            {post.title}
                          </h3>
                          <p className="text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                            <span>By {post.author.name}</span>
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {results.totalResults === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-2">
                      No results found
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      Try different keywords or adjust your filters
                    </p>
                    <Button onClick={clearFilters} variant="secondary">
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
