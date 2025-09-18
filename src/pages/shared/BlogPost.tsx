import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CardContent, ElevatedCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark,
  Heart,
  MessageCircle,
  Eye,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import blogService, { BlogPost } from '../../services/blogService';
import { useAuth } from '../../hooks/useAuth';

export const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toasts, success, error: showError, info, removeToast } = useToast();
  
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load blog post and related posts
  useEffect(() => {
    const loadBlogData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const [post, related] = await Promise.all([
          blogService.getBlogById(id),
          blogService.getRelatedBlogsForBlog(id, 3)
        ]);
        
        setCurrentPost(post);
        setRelatedPosts(related);
        setLikesCount(post.likes);
        
        // Load user interactions if authenticated
        if (isAuthenticated) {
          try {
            const interactions = await blogService.getUserBlogInteractions([id]);
            setIsLiked(interactions.likedBlogs.includes(id));
            setIsBookmarked(interactions.bookmarkedBlogs.includes(id));
          } catch (error) {
            console.error('Error loading user interactions:', error);
          }
        }
      } catch (error) {
        console.error('Error loading blog data:', error);
        setError('Failed to load blog post. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBlogData();
  }, [id, isAuthenticated]);

  // Handle like toggle
  const handleLike = async () => {
    if (!isAuthenticated) {
      // Store the current URL to return after login
      localStorage.setItem('returnUrl', window.location.href);
      
      // Show confirmation dialog
      const shouldRedirect = window.confirm(
        'Sign in required to like articles.\n\nWould you like to be redirected to the sign-in page?'
      );
      
      if (shouldRedirect) {
        navigate('/login');
      }
      return;
    }
    
    if (!currentPost) {
      showError('Error', 'Article not found');
      return;
    }
    
    try {
      const result = await blogService.toggleLikeBlog(currentPost._id);
      setIsLiked(result.liked);
      setLikesCount(result.likes);
      success(
        result.liked ? 'Liked!' : 'Unliked!',
        result.liked ? 'You liked this article' : 'You unliked this article'
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      showError('Failed to update like', 'Please try again.');
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async () => {
    if (!isAuthenticated) {
      // Store the current URL to return after login
      localStorage.setItem('returnUrl', window.location.href);
      
      // Show confirmation dialog
      const shouldRedirect = window.confirm(
        'Sign in required to bookmark articles.\n\nWould you like to be redirected to the sign-in page?'
      );
      
      if (shouldRedirect) {
        navigate('/login');
      }
      return;
    }
    
    if (!currentPost) {
      showError('Error', 'Article not found');
      return;
    }
    
    try {
      const result = await blogService.toggleBookmarkBlog(currentPost._id);
      setIsBookmarked(result.bookmarked);
      success(
        result.bookmarked ? 'Bookmarked!' : 'Unbookmarked!',
        result.bookmarked ? 'Article saved to your bookmarks' : 'Article removed from bookmarks'
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showError('Failed to update bookmark', 'Please try again.');
    }
  };

  // Handle comment click
  const handleComment = () => {
    if (!isAuthenticated) {
      // Store the current URL to return after login
      localStorage.setItem('returnUrl', window.location.href);
      
      // Show confirmation dialog
      const shouldRedirect = window.confirm(
        'Sign in required to comment on articles.\n\nWould you like to be redirected to the sign-in page?'
      );
      
      if (shouldRedirect) {
        navigate('/login');
      }
      return;
    }
    
    // Scroll to comments section
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      info('Comments', 'Scroll down to see the comments section');
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!currentPost) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentPost.title,
          text: currentPost.excerpt,
          url: window.location.href,
        });
        success('Shared!', 'Article shared successfully');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        success('Link copied!', 'Article link copied to clipboard');
      }
    } catch (error) {
      // Handle user cancellation gracefully
      if (error.name === 'AbortError') {
        // User canceled the share dialog - this is normal, don't show error
        return;
      }
      
      console.error('Error sharing:', error);
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        success('Link copied!', 'Article link copied to clipboard');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        showError('Unable to share', 'Please copy the URL manually');
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading blog post...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Blog Post Not Found
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            The blog post you're looking for doesn't exist or has been moved.
          </p>
          <Button onClick={() => navigate('/blogs')} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blogs</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Button 
            onClick={() => navigate('/blogs')} 
            variant="outline" 
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blogs</span>
          </Button>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Badge variant="primary">{currentPost.category}</Badge>
            <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
              <span>{blogService.formatBlogDate(currentPost.publishedDate)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
              <span>{blogService.formatReadingTime(currentPost.readingTime)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
              <span>{blogService.formatBlogViews(currentPost.views)}</span>
            </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
            {currentPost.title}
          </h1>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-semibold text-lg">
                  {currentPost.author.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {currentPost.author.name}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Author
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`group flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-200 min-w-[80px] justify-center ${
                  isLiked 
                    ? 'bg-red-50 border-2 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 shadow-sm' 
                    : 'bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-red-200 hover:text-red-600 dark:hover:border-red-800 dark:hover:text-red-400 hover:shadow-sm'
                }`}
              >
                <Heart 
                  className={`h-4 w-4 transition-all duration-200 ${
                    isLiked 
                      ? 'fill-current scale-110' 
                      : 'group-hover:scale-110'
                  }`} 
                />
                <span className="text-sm font-medium">{likesCount}</span>
              </button>

              {/* Comment Button */}
              <button 
                onClick={handleComment}
                className="group flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-blue-200 hover:text-blue-600 dark:hover:border-blue-800 dark:hover:text-blue-400 transition-all duration-200 min-w-[80px] justify-center hover:shadow-sm"
              >
                <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium">{currentPost.comments.length}</span>
              </button>

              {/* Share Button */}
              <button 
                onClick={handleShare}
                className="group flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-green-200 hover:text-green-600 dark:hover:border-green-800 dark:hover:text-green-400 transition-all duration-200 min-w-[80px] justify-center hover:shadow-sm"
              >
                <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium hidden sm:inline">Share</span>
              </button>

              {/* Bookmark Button */}
              <button
                onClick={handleBookmark}
                className={`group flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-200 min-w-[80px] justify-center ${
                  isBookmarked 
                    ? 'bg-yellow-50 border-2 border-yellow-200 text-yellow-600 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400 shadow-sm' 
                    : 'bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-yellow-200 hover:text-yellow-600 dark:hover:border-yellow-800 dark:hover:text-yellow-400 hover:shadow-sm'
                }`}
              >
                <Bookmark 
                  className={`h-4 w-4 transition-all duration-200 ${
                    isBookmarked 
                      ? 'fill-current scale-110' 
                      : 'group-hover:scale-110'
                  }`} 
                />
                <span className="text-sm font-medium hidden sm:inline">Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-8">
          <img 
            src={currentPost.thumbnail} 
            alt={currentPost.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl"
          />
        </div>

        {/* Article Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <ElevatedCard>
              <CardContent className="p-8">
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:text-neutral-900 dark:prose-headings:text-white
                    prose-p:text-neutral-700 dark:prose-p:text-neutral-300
                    prose-li:text-neutral-700 dark:prose-li:text-neutral-300
                    prose-strong:text-neutral-900 dark:prose-strong:text-white
                    prose-a:text-primary-600 dark:prose-a:text-primary-400
                    prose-blockquote:border-primary-500
                    prose-code:text-primary-600 dark:prose-code:text-primary-400"
                  dangerouslySetInnerHTML={{ __html: currentPost.content }}
                />

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex flex-wrap gap-2">
                    {currentPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </ElevatedCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Bio */}
            <ElevatedCard>
              <CardContent className="p-6">
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                  About the Author
                </h3>
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 dark:text-primary-400 font-semibold">
                      {currentPost.author.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                      {currentPost.author.name}
                    </h4>
                    <p className="text-sm text-primary-600 dark:text-primary-400 mb-2">
                      Author
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {currentPost.author.bio || 'No bio available.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </ElevatedCard>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <ElevatedCard>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((post) => (
                      <Link 
                        key={post._id} 
                        to={`/blogs/${post._id}`}
                        className="block group"
                      >
                        <div className="flex space-x-3">
                          <img 
                            src={post.thumbnail} 
                            alt={post.title}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                              {post.title}
                            </h4>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                              {blogService.formatBlogDate(post.publishedDate)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </ElevatedCard>
            )}

            {/* Newsletter Signup */}
            <ElevatedCard>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                  Stay Updated
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Get the latest articles and career tips delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button className="w-full">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </ElevatedCard>
          </div>
        </div>

        {/* Comments Section */}
        <div id="comments-section" className="mt-12">
          <ElevatedCard>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Comments ({currentPost.comments.length})
                </h3>
              </div>

              {/* Add Comment Form */}
              {isAuthenticated ? (
                <div className="mb-8 p-6 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
                    Add a Comment
                  </h4>
                  <div className="space-y-4">
                    <textarea
                      placeholder="Share your thoughts on this article..."
                      className="w-full p-4 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => info('Coming Soon!', 'Comment submission will be implemented soon!')}
                        className="px-6"
                      >
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    Please sign in to leave a comment.
                  </p>
                  <Button 
                    onClick={() => {
                      localStorage.setItem('returnUrl', window.location.href);
                      
                      // Show confirmation dialog
                      const shouldRedirect = window.confirm(
                        'Sign in required to comment on articles.\n\nWould you like to be redirected to the sign-in page?'
                      );
                      
                      if (shouldRedirect) {
                        navigate('/login');
                      }
                    }}
                    variant="gradient"
                  >
                    Sign In to Comment
                  </Button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {currentPost.comments.length > 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Comments will be displayed here once the backend is fully implemented.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </ElevatedCard>
        </div>

        {/* Back to Top */}
        <div className="mt-12 text-center">
          <Button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            variant="outline"
            className="flex items-center space-x-2 mx-auto"
          >
            <ArrowRight className="h-4 w-4 rotate-[-90deg]" />
            <span>Back to Top</span>
          </Button>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};