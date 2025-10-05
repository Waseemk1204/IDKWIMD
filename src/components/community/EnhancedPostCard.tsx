import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { 
  ThumbsUpIcon, 
  MessageSquareIcon, 
  BookmarkIcon, 
  ShareIcon, 
  AwardIcon,
  EyeIcon,
  ClockIcon,
  MapPinIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  UsersIcon,
  StarIcon,
  MessageCircle
} from 'lucide-react';
import apiService from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { QuickMessage } from '../messaging/MessageIntegration';

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

interface EnhancedPostCardProps {
  post: EnhancedCommunityPost;
  getPostTypeIcon: (type: string) => React.ReactNode;
  getPostTypeColor: (type: string) => string;
}

export const EnhancedPostCard: React.FC<EnhancedPostCardProps> = ({
  post,
  getPostTypeIcon,
  getPostTypeColor
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [bookmarksCount, setBookmarksCount] = useState(post.engagement.bookmarks);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.toggleEnhancedPostLike(post._id);
      if (response.success) {
        setIsLiked(!isLiked);
        setLikesCount(response.data.likesCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.togglePostBookmark(post._id);
      if (response.success) {
        setIsBookmarked(response.data.isBookmarked);
        setBookmarksCount(prev => response.data.isBookmarked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await apiService.sharePost(post._id);
      // Could show a toast notification here
    } catch (error) {
      console.error('Error sharing post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelpfulVote = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await apiService.addHelpfulVote(post._id);
      // Could show a toast notification here
    } catch (error) {
      console.error('Error adding helpful vote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpertEndorsement = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await apiService.addExpertEndorsement(post._id);
      // Could show a toast notification here
    } catch (error) {
      console.error('Error adding expert endorsement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar 
              name={post.author.name} 
              src={post.author.profilePhoto} 
              size="md" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {post.author.name}
                </h3>
                {post.isFeatured && (
                  <StarIcon className="h-4 w-4 text-yellow-500" />
                )}
                {post.isPinned && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <span className="capitalize">{post.author.role}</span>
                {post.author.headline && (
                  <>
                    <span>•</span>
                    <span>{post.author.headline}</span>
                  </>
                )}
                <span>•</span>
                <span>{post.timeAgo}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${getPostTypeColor(post.type)}`}>
              {getPostTypeIcon(post.type)}
              <span className="capitalize">{post.type}</span>
            </div>
            <div 
              className="px-2 py-1 rounded-md text-xs font-medium text-white"
              style={{ backgroundColor: post.category.color }}
            >
              {post.category.name}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <Link to={`/community-enhanced/post/${post._id}`} className="block">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 mb-3 line-clamp-2">
            {post.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 line-clamp-3 mb-4">
            {post.content}
          </p>
        </Link>

        {/* Professional Context */}
        {post.professionalContext && (
          <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
            <div className="flex flex-wrap gap-2 text-sm">
              {post.professionalContext.industry && (
                <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                  <MapPinIcon className="h-3 w-3" />
                  {post.professionalContext.industry}
                </span>
              )}
              {post.professionalContext.skillLevel && (
                <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                  <BriefcaseIcon className="h-3 w-3" />
                  {post.professionalContext.skillLevel}
                </span>
              )}
              {post.professionalContext.jobRelevance && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <StarIcon className="h-3 w-3" />
                  Job Relevant
                </span>
              )}
            </div>
            {post.professionalContext.relatedSkills && post.professionalContext.relatedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.professionalContext.relatedSkills.slice(0, 3).map(skill => (
                  <span key={skill} className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
                    {skill}
                  </span>
                ))}
                {post.professionalContext.relatedSkills.length > 3 && (
                  <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400 text-xs rounded-full">
                    +{post.professionalContext.relatedSkills.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mentorship Context */}
        {post.mentorship?.isMentorshipRequest && (
          <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCapIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Mentorship Request
              </span>
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">
              <p>Level: {post.mentorship.menteeLevel}</p>
              <p>Type: {post.mentorship.mentorshipType}</p>
              {post.mentorship.preferredMentorSkills && post.mentorship.preferredMentorSkills.length > 0 && (
                <p>Looking for: {post.mentorship.preferredMentorSkills.join(', ')}</p>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4" />
              {post.views} views
            </span>
            <span className="flex items-center gap-1">
              <MessageSquareIcon className="h-4 w-4" />
              {post.commentCount || 0} comments
            </span>
            {post.engagementScore && (
              <span className="flex items-center gap-1">
                <TrendingUpIcon className="h-4 w-4" />
                {post.engagementScore} engagement
              </span>
            )}
          </div>
          {post.isTrending && (
            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <TrendingUpIcon className="h-4 w-4" />
              Trending
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center gap-2 ${isLiked ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-600 dark:text-neutral-400'}`}
            >
              <ThumbsUpIcon className="h-4 w-4" />
              <span>{likesCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHelpfulVote}
              disabled={isLoading}
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400"
            >
              <ThumbsUpIcon className="h-4 w-4" />
              <span>{post.engagement.helpfulVotes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpertEndorsement}
              disabled={isLoading}
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400"
            >
              <AwardIcon className="h-4 w-4" />
              <span>{post.engagement.expertEndorsements}</span>
            </Button>
            
            <Link to={`/community-enhanced/post/${post._id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400"
              >
                <MessageSquareIcon className="h-4 w-4" />
                <span>Comment</span>
              </Button>
            </Link>
            
            {/* Direct Message Integration */}
            {user && user._id !== post.author._id && (
              <QuickMessage
                userId={post.author._id}
                userName={post.author.name}
                userPhoto={post.author.profilePhoto}
                context={{
                  type: 'community',
                  data: {
                    postId: post._id,
                    title: post.title,
                    content: post.content.substring(0, 100) + '...'
                  }
                }}
                onMessageSent={() => {
                  // Optional: Show success message or update UI
                }}
              />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={isLoading}
              className={`flex items-center gap-2 ${isBookmarked ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-600 dark:text-neutral-400'}`}
            >
              <BookmarkIcon className="h-4 w-4" />
              <span>{bookmarksCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              disabled={isLoading}
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400"
            >
              <ShareIcon className="h-4 w-4" />
              <span>{post.engagement.shares}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

