import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp, 
  Briefcase, 
  Users, 
  FileText, 
  MessageSquare,
  MapPin,
  DollarSign,
  Star,
  Calendar
} from 'lucide-react';

interface SearchSuggestion {
  type: 'job' | 'skill' | 'company' | 'location';
  text: string;
  count: number;
}

interface SearchResult {
  jobs: any[];
  users: any[];
  blogs: any[];
  community: any[];
  totalResults: number;
}

interface GlobalSearchProps {
  onClose?: () => void;
  placeholder?: string;
  className?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onClose,
  placeholder = "Search jobs, people, blogs...",
  className = ""
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'jobs' | 'users' | 'blogs' | 'community'>('all');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches and trending searches on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Load recent searches from localStorage
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      setRecentSearches(recent);

      // Load trending searches
      try {
        const response = await apiService.getTrendingSearches();
        if (response.success) {
          setTrendingSearches(response.data);
        }
      } catch (error) {
        console.error('Failed to load trending searches:', error);
      }
    };

    loadInitialData();
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const response = await apiService.getSearchSuggestions(query);
          if (response.success) {
            setSuggestions(response.data.suggestions);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Failed to get search suggestions:', error);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = async (searchQuery: string = query, type: string = selectedType) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setShowSuggestions(false);
    setShowResults(true);

    try {
      const response = await apiService.globalSearch({
        q: searchQuery,
        type: type as any,
        limit: 20
      });

      if (response.success) {
        setResults(response.data.results);
        
        // Add to recent searches
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const updatedRecent = [searchQuery, ...recent.filter((item: string) => item !== searchQuery)].slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
        setRecentSearches(updatedRecent);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    handleSearch(search);
  };

  const handleTrendingClick = (trending: string) => {
    setQuery(trending);
    handleSearch(trending);
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'jobs': return <Briefcase className="w-4 h-4" />;
      case 'users': return <Users className="w-4 h-4" />;
      case 'blogs': return <FileText className="w-4 h-4" />;
      case 'community': return <MessageSquare className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
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

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white text-lg"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={!query.trim() || isLoading}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Search'
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Search Type Tabs */}
          <div className="flex space-x-1 mt-3">
            {[
              { key: 'all', label: 'All', count: results?.totalResults || 0 },
              { key: 'jobs', label: 'Jobs', count: results?.jobs?.length || 0 },
              { key: 'users', label: 'People', count: results?.users?.length || 0 },
              { key: 'blogs', label: 'Blogs', count: results?.blogs?.length || 0 },
              { key: 'community', label: 'Community', count: results?.community?.length || 0 }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedType(key as any);
                  if (query.trim()) {
                    handleSearch(query, key);
                  }
                }}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedType === key
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {label} {count > 0 && `(${count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!showResults && !showSuggestions && (
            <div className="p-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(search)}
                        className="w-full text-left p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm text-neutral-600 dark:text-neutral-400"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              {trendingSearches && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trending
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Popular Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.trendingSkills?.slice(0, 8).map((skill: any, index: number) => (
                          <button
                            key={index}
                            onClick={() => handleTrendingClick(skill.text)}
                            className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600"
                          >
                            {skill.text}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Popular Jobs</h4>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.trendingJobTitles?.slice(0, 6).map((job: any, index: number) => (
                          <button
                            key={index}
                            onClick={() => handleTrendingClick(job.text)}
                            className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600"
                          >
                            {job.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Suggestions</h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {getResultIcon(suggestion.type)}
                      <span className="ml-3 text-neutral-900 dark:text-white">{suggestion.text}</span>
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {suggestion.count} {suggestion.type}s
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {showResults && results && (
            <div className="p-4 space-y-6">
              {/* Jobs */}
              {results.jobs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Jobs ({results.jobs.length})
                  </h3>
                  <div className="space-y-3">
                    {results.jobs.map((job) => (
                      <div
                        key={job._id}
                        onClick={() => {
                          navigate(`/employee/jobs/${job._id}`);
                          onClose?.();
                        }}
                        className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">{job.title}</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{job.company}</p>
                            <div className="flex items-center space-x-4 text-xs text-neutral-500 dark:text-neutral-400">
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {job.location}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                {formatPayRate(job)}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
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
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    People ({results.users.length})
                  </h3>
                  <div className="space-y-3">
                    {results.users.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => {
                          navigate(`/profile/${user._id}`);
                          onClose?.();
                        }}
                        className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-neutral-900 dark:text-white">{user.name}</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{user.role}</p>
                            {user.location && (
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center">
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
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Blogs ({results.blogs.length})
                  </h3>
                  <div className="space-y-3">
                    {results.blogs.map((blog) => (
                      <div
                        key={blog._id}
                        onClick={() => {
                          navigate(`/blogs/${blog._id}`);
                          onClose?.();
                        }}
                        className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                      >
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">{blog.title}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{blog.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
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
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Community ({results.community.length})
                  </h3>
                  <div className="space-y-3">
                    {results.community.map((post) => (
                      <div
                        key={post._id}
                        onClick={() => {
                          navigate(`/community/post/${post._id}`);
                          onClose?.();
                        }}
                        className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                      >
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">{post.title}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
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
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Try different keywords or check your spelling
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
