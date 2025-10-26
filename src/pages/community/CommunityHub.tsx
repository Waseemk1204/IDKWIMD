import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, PlusIcon, TrendingUpIcon, ClockIcon, StarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { PostCard } from '../../components/community/PostCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';

// Interface for community post
interface CommunityPost {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    role: string;
  };
  createdAt: string;
  likes: number;
  comments: any[];
  views: number;
  tags: string[];
  timeAgo?: string;
  commentCount?: number;
}
export const CommunityHub: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'top'>('trending');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [allTags, setAllTags] = useState<{name: string, count: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const topicsRef = useRef<HTMLDivElement>(null);

  // Load community posts
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

      if (selectedTag) {
        params.tag = selectedTag;
      }

      console.log('Loading community posts with params:', params);
      const response = await apiService.getCommunityPosts(params);
      console.log('Community posts response:', response);

      if (response.success && response.data?.posts) {
        const newPosts = response.data.posts.map((post: any) => ({
          ...post,
          timeAgo: getTimeAgo(new Date(post.createdAt)),
          commentCount: post.comments?.length || 0
        }));

        console.log('Processed posts:', newPosts);

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

  // Load community tags
  const loadTags = async () => {
    try {
      console.log('Loading community tags...');
      const response = await apiService.getCommunityTags();
      console.log('Community tags response:', response);
      if (response.success && response.data?.tags) {
        console.log('Setting tags:', response.data.tags);
        setAllTags(response.data.tags);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
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
  }, [sortBy, searchTerm, selectedTag]);

  // Load tags on component mount
  useEffect(() => {
    loadTags();
  }, []);

  // Load more posts
  const loadMorePosts = () => {
    if (!isLoading && hasMore) {
      loadPosts(currentPage + 1, false);
    }
  };

  // Handle scroll for topics
  const handleScroll = (direction: 'left' | 'right') => {
    if (!topicsRef.current) return;
    
    const scrollAmount = 200;
    const currentScroll = topicsRef.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    topicsRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  // Handle wheel scroll for topics
  const handleWheelScroll = (e: React.WheelEvent) => {
    if (!topicsRef.current) return;
    
    e.preventDefault();
    const scrollAmount = e.deltaY > 0 ? 100 : -100;
    topicsRef.current.scrollLeft += scrollAmount;
  };

  // Handle touch gestures
  const handleTouchStart = (_e: React.TouchEvent) => {
    setIsScrolling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isScrolling || !topicsRef.current) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - (parseInt(topicsRef.current.dataset.lastTouchX || '0'));
    topicsRef.current.scrollLeft -= deltaX;
    topicsRef.current.dataset.lastTouchX = touch.clientX.toString();
  };

  const handleTouchEnd = () => {
    setIsScrolling(false);
    if (topicsRef.current) {
      delete topicsRef.current.dataset.lastTouchX;
    }
  };
  return <>
      <div className="space-y-8">
        <PageHeader
          title="Community Hub"
          description="Connect, share experiences, and learn from others"
          actions={<div className="flex items-center gap-3">
          <Link to="/community/create">
            <Button variant="primary" leftIcon={<PlusIcon className="h-5 w-5" />}>
              Create Post
            </Button>
          </Link>
        </div>}
        />
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input type="text" placeholder="Search posts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} leftIcon={<SearchIcon className="h-4 w-4 text-neutral-400" />} />
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setSortBy('trending')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${sortBy === 'trending' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
                <TrendingUpIcon className="h-4 w-4 mr-1" />
                Trending
              </button>
              <button onClick={() => setSortBy('newest')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${sortBy === 'newest' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
                <ClockIcon className="h-4 w-4 mr-1" />
                Newest
              </button>
              <button onClick={() => setSortBy('top')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${sortBy === 'top' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
                <StarIcon className="h-4 w-4 mr-1" />
                Top
              </button>
            </div>
          </div>
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
                ref={topicsRef}
                className="flex-1 overflow-x-auto scrollbar-hide"
                onWheel={handleWheelScroll}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex space-x-2 pb-2">
                  <button 
                    onClick={() => setSelectedTag(null)} 
                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200 ${selectedTag === null ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300' : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}
                  >
                    All Topics
                  </button>
                  {allTags.map(tag => (
                    <button 
                      key={tag.name} 
                      onClick={() => setSelectedTag(tag.name === selectedTag ? null : tag.name)} 
                      className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200 ${tag.name === selectedTag ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300' : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}
                    >
                      {tag.name} ({tag.count})
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
                  <PostCard 
                    key={post._id} 
                    id={post._id} 
                    title={post.title} 
                    content={post.content} 
                    author={{
                      id: post.author._id,
                      name: post.author.name,
                      profileImage: post.author.profileImage || '',
                      role: post.author.role
                    }}
                    timestamp={new Date(post.createdAt)} 
                    likes={post.likes} 
                    comments={post.commentCount || 0} 
                    views={post.views || 0}
                    tags={post.tags} 
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
    </>;
};