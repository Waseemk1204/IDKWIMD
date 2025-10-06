import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  SearchIcon, 
  PlusIcon, 
  TrendingUpIcon, 
  ClockIcon, 
  ChevronLeft, 
  ChevronRight,
  FilterIcon,
  ThumbsUpIcon,
  MessageSquareIcon,
  AwardIcon,
  LightbulbIcon,
  HelpCircleIcon,
  MegaphoneIcon,
  BriefcaseIcon,
  GraduationCapIcon
} from 'lucide-react';
import { EnhancedPostCard } from '../../components/community/EnhancedPostCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';

// Interface for enhanced community post
interface EnhancedCommunityPost {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    role: string;
    headline?: string;
    skills?: string[];
  };
  category: {
    _id: string;
    name: string;
    slug: string;
    color: string;
    icon?: string;
  };
  type: 'discussion' | 'question' | 'insight' | 'announcement' | 'project' | 'mentorship';
  createdAt: string;
  likes: number;
  comments: any[];
  views: number;
  tags: string[];
  professionalContext?: {
    industry?: string;
    skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    relatedSkills?: string[];
    jobRelevance?: boolean;
  };
  engagement: {
    helpfulVotes: number;
    expertEndorsements: number;
    shares: number;
    bookmarks: number;
  };
  mentorship?: {
    isMentorshipRequest: boolean;
    menteeLevel?: 'beginner' | 'intermediate' | 'advanced';
    preferredMentorSkills?: string[];
    mentorshipType?: 'career' | 'technical' | 'business' | 'general';
  };
  isFeatured: boolean;
  isPinned: boolean;
  timeAgo?: string;
  commentCount?: number;
  engagementScore?: number;
  isTrending?: boolean;
  professionalRelevanceScore?: number;
}

interface CommunityCategory {
  _id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  postCount: number;
  memberCount: number;
}

export const EnhancedCommunityHub: React.FC = () => {
  const { isAuthenticated, user: _user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'trending' | 'top' | 'most_helpful' | 'expert_endorsed' | 'professional_relevance'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [posts, setPosts] = useState<EnhancedCommunityPost[]>([]);
  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [trendingPosts, setTrendingPosts] = useState<EnhancedCommunityPost[]>([]);
  
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Load enhanced community posts
  const loadPosts = async (page = 1, reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = {
        page,
        limit: 10,
        sortBy
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (selectedType) {
        params.type = selectedType;
      }

      if (selectedIndustry) {
        params.industry = selectedIndustry;
      }

      if (selectedSkillLevel) {
        params.skillLevel = selectedSkillLevel;
      }

      console.log('Loading enhanced community posts with params:', params);
      const response = await apiService.getEnhancedCommunityPosts(params);
      console.log('Enhanced community posts response:', response);

      if (response.success && response.data?.posts) {
        const newPosts = response.data.posts.map((post: any) => ({
          ...post,
          timeAgo: getTimeAgo(new Date(post.createdAt)),
          commentCount: post.comments?.length || 0
        }));

        console.log('Processed enhanced posts:', newPosts);

        if (reset) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }

        setHasMore(response.data.pagination?.hasNext || false);
        setCurrentPage(page);
      } else {
        console.error('Failed to load posts - response:', response);
        setError('Failed to load posts');
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  // Load community categories
  const loadCategories = async () => {
    try {
      console.log('Loading community categories...');
      const response = await apiService.getCommunityCategories(true);
      console.log('Community categories response:', response);
      if (response.success && response.data?.categories) {
        console.log('Setting categories:', response.data.categories);
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Load trending posts
  const loadTrendingPosts = async () => {
    try {
      const response = await apiService.getTrendingPosts(5);
      if (response.success && response.data?.posts) {
        setTrendingPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Error loading trending posts:', error);
    }
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Load posts on component mount and when filters change
  useEffect(() => {
    loadPosts(1, true);
  }, [sortBy, searchTerm, selectedCategory, selectedType, selectedIndustry, selectedSkillLevel]);

  // Load categories and trending posts on component mount
  useEffect(() => {
    loadCategories();
    loadTrendingPosts();
  }, []);

  // Load more posts
  const loadMorePosts = () => {
    if (!isLoading && hasMore) {
      loadPosts(currentPage + 1, false);
    }
  };

  // Handle scroll for categories
  const handleScroll = (direction: 'left' | 'right') => {
    if (!categoriesRef.current) return;
    
    const scrollAmount = 200;
    const currentScroll = categoriesRef.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    categoriesRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  // Get post type icon
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

  // Get post type color
  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'insight': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'announcement': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'project': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'mentorship': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Professional Community Hub
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Connect, share insights, and grow professionally with industry experts
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/community-enhanced/create">
            <Button variant="primary" leftIcon={<PlusIcon className="h-5 w-5" />}>
              Create Post
            </Button>
          </Link>
          <Button 
            variant="outline" 
            leftIcon={<FilterIcon className="h-5 w-5" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Trending Posts Sidebar */}
      {trendingPosts.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUpIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
              Trending Now
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingPosts.map(post => (
              <Link 
                key={post._id} 
                to={`/community-enhanced/post/${post._id}`}
                className="block p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getPostTypeColor(post.type)}`}>
                    {getPostTypeIcon(post.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {post.engagementScore} engagement • {post.timeAgo}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search and Sort */}
      <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input 
              type="text" 
              placeholder="Search posts, skills, or topics..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              leftIcon={<SearchIcon className="h-4 w-4 text-neutral-400" />} 
            />
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setSortBy('newest')} 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                sortBy === 'newest' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <ClockIcon className="h-4 w-4 mr-1" />
              Newest
            </button>
            <button 
              onClick={() => setSortBy('trending')} 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                sortBy === 'trending' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <TrendingUpIcon className="h-4 w-4 mr-1" />
              Trending
            </button>
            <button 
              onClick={() => setSortBy('most_helpful')} 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                sortBy === 'most_helpful' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <ThumbsUpIcon className="h-4 w-4 mr-1" />
              Most Helpful
            </button>
            <button 
              onClick={() => setSortBy('expert_endorsed')} 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                sortBy === 'expert_endorsed' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <AwardIcon className="h-4 w-4 mr-1" />
              Expert Endorsed
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6 mb-6">
            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">
              Advanced Filters
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Post Type
                </label>
                <select 
                  value={selectedType || ''} 
                  onChange={e => setSelectedType(e.target.value || null)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="discussion">Discussion</option>
                  <option value="question">Question</option>
                  <option value="insight">Insight</option>
                  <option value="announcement">Announcement</option>
                  <option value="project">Project</option>
                  <option value="mentorship">Mentorship</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Industry
                </label>
                <select 
                  value={selectedIndustry || ''} 
                  onChange={e => setSelectedIndustry(e.target.value || null)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm"
                >
                  <option value="">All Industries</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="marketing">Marketing</option>
                  <option value="design">Design</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Skill Level
                </label>
                <select 
                  value={selectedSkillLevel || ''} 
                  onChange={e => setSelectedSkillLevel(e.target.value || null)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedType(null);
                    setSelectedIndustry(null);
                    setSelectedSkillLevel(null);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="mb-6 relative">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleScroll('left')}
              className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div 
              ref={categoriesRef}
              className="flex-1 overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex space-x-2 pb-2">
                <button 
                  onClick={() => setSelectedCategory(null)} 
                  className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === null 
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300' 
                      : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(category => (
                  <button 
                    key={category._id} 
                    onClick={() => setSelectedCategory(category._id)} 
                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                      category._id === selectedCategory 
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300' 
                        : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                  >
                    {category.icon && <span className="text-xs">{category.icon}</span>}
                    {category.name} ({category.postCount})
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => handleScroll('right')}
              className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {error ? (
            <div className="text-center py-10">
              <p className="text-red-500 dark:text-red-400 mb-2">
                {error}
              </p>
              <Button 
                onClick={() => loadPosts(1, true)} 
                variant="outline"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : isLoading && posts.length === 0 ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-neutral-500 dark:text-neutral-400">
                Loading posts...
              </p>
            </div>
          ) : posts.length > 0 ? (
            <>
              {posts.map(post => (
                <EnhancedPostCard 
                  key={post._id} 
                  post={post}
                  getPostTypeIcon={getPostTypeIcon}
                  getPostTypeColor={getPostTypeColor}
                />
              ))}
              
              {hasMore && (
                <div className="text-center py-6">
                  <Button 
                    onClick={loadMorePosts}
                    variant="outline"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More Posts'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-neutral-500 dark:text-neutral-400">
                No posts found
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                Try adjusting your search or filters
              </p>
              {!isAuthenticated && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">
                    Sign in
                  </Link> to create the first post!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

