import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { 
  UsersIcon, 
  TrendingUpIcon, 
  MessageSquareIcon, 
  CalendarIcon,
  AwardIcon,
  StarIcon,
  ArrowRightIcon,
  UserPlusIcon,
  EyeIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';

interface GangMember {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    role: string;
    headline?: string;
    skills?: string[];
  };
  status: string;
  strength?: number;
  messageCount?: number;
  lastInteraction?: string;
  mutualConnections?: number;
}

interface CommunityPost {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    profilePhoto?: string;
    role: string;
  };
  category: {
    name: string;
    color: string;
  };
  type: string;
  createdAt: string;
  likes: number;
  views: number;
  engagement: {
    helpfulVotes: number;
    expertEndorsements: number;
  };
}

export const GangCommunityIntegration: React.FC = () => {
  const { user } = useAuth();
  const [gangMembers, setGangMembers] = useState<GangMember[]>([]);
  const [gangPosts, setGangPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGangData();
  }, []);

  const loadGangData = async () => {
    try {
      setIsLoading(true);
      
      // Load gang members
      const connectionsResponse = await apiService.getUserConnections('accepted');
      if (connectionsResponse.success) {
        setGangMembers(connectionsResponse.data.connections || []);
      }

      // Load posts from gang members
      const postsResponse = await apiService.getEnhancedCommunityPosts({
        limit: 5,
        sortBy: 'newest'
      });
      
      if (postsResponse.success) {
        // Filter posts from gang members
        const gangMemberIds = (connectionsResponse.data.connections || []).map((member: GangMember) => member.user._id);
        const filteredPosts = postsResponse.data.posts.filter((post: CommunityPost) => 
          gangMemberIds.includes(post.author._id)
        );
        setGangPosts(filteredPosts);
      }
    } catch (error) {
      console.error('Error loading gang data:', error);
      setError('Failed to load gang data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (date: string): string => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return postDate.toLocaleDateString();
  };

  const getStrengthColor = (strength?: number) => {
    if (!strength) return 'text-gray-500';
    if (strength >= 80) return 'text-green-600';
    if (strength >= 60) return 'text-yellow-600';
    if (strength >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStrengthLabel = (strength?: number) => {
    if (!strength) return 'Unknown';
    if (strength >= 80) return 'Strong';
    if (strength >= 60) return 'Good';
    if (strength >= 40) return 'Fair';
    return 'Weak';
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>
          <Button onClick={loadGangData} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gang Members Activity */}
      <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Your Gang Members
            </h3>
            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
              {gangMembers.length}
            </span>
          </div>
          <Link to="/gang-members">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRightIcon className="h-4 w-4" />}>
              View All
            </Button>
          </Link>
        </div>

        {gangMembers.length > 0 ? (
          <div className="space-y-3">
            {gangMembers.slice(0, 5).map(member => (
              <div key={member._id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar 
                    name={member.user.name} 
                    src={member.user.profilePhoto} 
                    size="sm" 
                  />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {member.user.name}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {member.user.headline || member.user.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {member.strength && (
                    <div className="text-center">
                      <p className={`font-medium ${getStrengthColor(member.strength)}`}>
                        {member.strength}%
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {getStrengthLabel(member.strength)}
                      </p>
                    </div>
                  )}
                  {member.messageCount && (
                    <div className="text-center">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {member.messageCount}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Messages
                      </p>
                    </div>
                  )}
                  <Link to={`/messages?user=${member.user._id}`}>
                    <Button variant="ghost" size="sm">
                      <MessageSquareIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              You don't have any gang members yet
            </p>
            <Link to="/gang-members">
              <Button variant="primary" leftIcon={<UserPlusIcon className="h-4 w-4" />}>
                Start Building Your Gang
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Gang Members' Community Activity */}
      {gangPosts.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Gang Members' Activity
              </h3>
            </div>
            <Link to="/community-enhanced">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRightIcon className="h-4 w-4" />}>
                View All Posts
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {gangPosts.map(post => (
              <div key={post._id} className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar 
                      name={post.author.name} 
                      src={post.author.profilePhoto} 
                      size="sm" 
                    />
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {post.author.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {getTimeAgo(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-1 text-xs font-medium text-white rounded-full"
                      style={{ backgroundColor: post.category.color }}
                    >
                      {post.category.name}
                    </span>
                    <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 text-xs rounded-full capitalize">
                      {post.type}
                    </span>
                  </div>
                </div>
                
                <Link to={`/community-enhanced/post/${post._id}`}>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 mb-2 line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 mb-3">
                    {post.content}
                  </p>
                </Link>

                <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      {post.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <AwardIcon className="h-4 w-4" />
                      {post.engagement.expertEndorsements}
                    </span>
                  </div>
                  <Link to={`/community-enhanced/post/${post._id}`}>
                    <Button variant="ghost" size="sm">
                      Read More
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/community-enhanced/create">
            <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <MessageSquareIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    Create Post
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Share your insights
                  </p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link to="/gang-members">
            <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <UsersIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    Manage Gang
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Connect with peers
                  </p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link to="/community-enhanced/events">
            <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    Join Events
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Professional events
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

