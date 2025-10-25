import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ThumbsUpIcon, MessageSquareIcon, ShareIcon, FlagIcon, EyeIcon } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
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
  userHasLiked?: boolean;
  comments: any[];
  views: number;
  tags: string[];
  timeAgo?: string;
  commentCount?: number;
}

// Interface for comment
interface Comment {
  _id: string;
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
}
export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewTracking, setViewTracking] = useState<{
    viewId: string | null;
    startTime: number;
    isTracking: boolean;
  }>({
    viewId: null,
    startTime: 0,
    isTracking: false
  });

  // Start view tracking
  const startViewTracking = async () => {
    if (!id || viewTracking.isTracking) return;
    
    try {
      const sessionId = sessionStorage.getItem('sessionId') || 
        (() => {
          const newSessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
          sessionStorage.setItem('sessionId', newSessionId);
          return newSessionId;
        })();

      const response = await apiService.startViewTracking(id, { sessionId });
      if (response.success) {
        setViewTracking({
          viewId: response.data.viewId,
          startTime: Date.now(),
          isTracking: true
        });
      }
    } catch (error) {
      console.error('Error starting view tracking:', error);
    }
  };

  // Complete view tracking
  const completeViewTracking = async () => {
    if (!viewTracking.isTracking || !viewTracking.viewId || !id) return;
    
    try {
      const duration = Math.floor((Date.now() - viewTracking.startTime) / 1000);
      await apiService.completeViewTracking(id, {
        viewId: viewTracking.viewId,
        duration: duration
      });
      
      setViewTracking(prev => ({ ...prev, isTracking: false }));
    } catch (error) {
      console.error('Error completing view tracking:', error);
    }
  };

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiService.getCommunityPostById(id);
        
        if (response.success && response.data?.post) {
          const postData = response.data.post;
          setPost({
            ...postData,
            timeAgo: getTimeAgo(new Date(postData.createdAt))
          });
          
          // Fetch comments for this post
          const commentsResponse = await apiService.getCommunityPostComments(id);
          if (commentsResponse.success && commentsResponse.data?.comments) {
            setComments(commentsResponse.data.comments);
          }
          
          // Start view tracking after post is loaded
          await startViewTracking();
        } else {
          setError('Post not found');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Complete view tracking when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      if (viewTracking.isTracking) {
        completeViewTracking();
      }
    };
  }, [viewTracking.isTracking]);

  // Helper function to get time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!post || isLiking) return;

    try {
      setIsLiking(true);
      
      const response = await apiService.toggleLikeCommunityPost(post._id);
      if (response.success) {
        setPost(prev => prev ? {
          ...prev,
          likes: response.data.likes,
          userHasLiked: response.data.liked
        } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!commentText.trim() || !post) return;

    try {
      setIsSubmittingComment(true);
      
      const response = await apiService.addCommunityComment(post._id, {
        content: commentText.trim()
      });

      if (response.success && response.data?.comment) {
        const newComment = response.data.comment;
        setComments(prev => [newComment, ...prev]);
        setCommentText('');
        
        // Update comment count
        setPost(prev => prev ? {
          ...prev,
          commentCount: (prev.commentCount || 0) + 1
        } : null);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || 'Community Post',
          url: url
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        // You could show a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-4">
          <Link to="/community" className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Loading...
          </h1>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-4">
          <Link to="/community" className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Post Not Found
          </h1>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'The post you are looking for does not exist.'}
          </p>
          <Link to="/community">
            <Button variant="primary">
              Back to Community
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link to="/community" className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Community Post
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Post Header */}
          <div className="flex items-center mb-4">
            <Avatar name={post.author.name} src={post.author.profileImage} size="md" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {post.author.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {post.author.role.charAt(0).toUpperCase() + post.author.role.slice(1)} •{' '}
                {post.timeAgo || formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h2>
          <div className="prose dark:prose-invert max-w-none mb-6">
            {post.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 text-gray-700 dark:text-gray-300">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center space-x-4 border-t border-b border-gray-200 dark:border-gray-700 py-3 mb-6">
            <button 
              onClick={handleLike} 
              disabled={isLiking}
              className={`flex items-center space-x-1 ${
                post.userHasLiked 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ThumbsUpIcon className={`h-5 w-5 ${post.userHasLiked ? 'fill-current' : ''}`} />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              <MessageSquareIcon className="h-5 w-5" />
              <span>{comments.length}</span>
            </button>
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <EyeIcon className="h-5 w-5" />
              <span>{post.views}</span>
            </div>
            <button 
              onClick={handleShare}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <ShareIcon className="h-5 w-5" />
              <span>Share</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-auto">
              <FlagIcon className="h-5 w-5" />
              <span>Report</span>
            </button>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleComment} className="mb-6">
                <div className="flex items-start space-x-3">
                  <Avatar name={user?.fullName || 'User'} src={user?.profilePhoto} size="sm" />
                  <div className="flex-1">
                    <textarea 
                      value={commentText} 
                      onChange={e => setCommentText(e.target.value)} 
                      rows={3} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" 
                      placeholder="Add a comment..."
                    />
                    <div className="mt-2 flex justify-end">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="sm" 
                        disabled={!commentText.trim() || isSubmittingComment}
                        isLoading={isSubmittingComment}
                      >
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Please sign in to add a comment.
                </p>
                <Link to="/login">
                  <Button variant="primary" size="sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment._id} className="flex space-x-3">
                  <Avatar name={comment.author.name} src={comment.author.profileImage} size="sm" />
                  <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.author.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center mt-2 ml-4">
                      <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                        <ThumbsUpIcon className="h-4 w-4 mr-1" />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 ml-4">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};