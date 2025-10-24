import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  MessageSquareIcon, 
  CalendarIcon,
  AwardIcon,
  StarIcon,
  ThumbsUpIcon,
  BriefcaseIcon,
  LightbulbIcon,
  BarChart3Icon,
  ActivityIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';
import { GangCommunityIntegration } from '../../components/community/GangCommunityIntegration';
import { ProfessionalRecommendations } from '../../components/community/ProfessionalRecommendations';
import { UnifiedActivityFeed } from '../../components/community/UnifiedActivityFeed';

interface UserStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  helpfulVotes: number;
  expertEndorsements: number;
  bookmarks: number;
  shares: number;
  connections: number;
  reputation: {
    totalPoints: number;
    level: number;
    levelName: string;
    levelProgress: number;
  };
}

interface RecentActivity {
  _id: string;
  type: 'post' | 'comment' | 'like' | 'connection' | 'event';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export const CommunityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'gang' | 'recommendations' | 'activity'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load user reputation/stats
      const reputationResponse = await apiService.getUserReputation();
      if (reputationResponse.success) {
        const reputation = reputationResponse.data.reputation;
        setUserStats({
          totalPosts: reputation.contributions.postsCreated,
          totalLikes: reputation.contributions.postsLiked,
          totalComments: reputation.contributions.commentsWritten,
          totalViews: 0, // This would need to be calculated from posts
          helpfulVotes: reputation.contributions.helpfulVotes,
          expertEndorsements: reputation.contributions.expertEndorsements,
          bookmarks: 0, // This would need to be calculated
          shares: 0, // This would need to be calculated
          connections: 0, // This would need to be loaded from connections
          reputation: {
            totalPoints: reputation.totalPoints,
            level: reputation.level,
            levelName: reputation.levelName,
            levelProgress: reputation.levelProgress
          }
        });
      }

      // Load recent activity (this would be a new endpoint)
      // For now, we'll simulate some data
      setRecentActivity([
        {
          _id: '1',
          type: 'post',
          title: 'Created a new post',
          description: 'Shared insights about React best practices',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: '2',
          type: 'like',
          title: 'Received a like',
          description: 'Your post about TypeScript got 5 new likes',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: '3',
          type: 'connection',
          title: 'New connection',
          description: 'Connected with Sarah Johnson',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (date: string): string => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return activityDate.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageSquareIcon className="h-4 w-4" />;
      case 'comment': return <MessageSquareIcon className="h-4 w-4" />;
      case 'like': return <ThumbsUpIcon className="h-4 w-4" />;
      case 'connection': return <UsersIcon className="h-4 w-4" />;
      case 'event': return <CalendarIcon className="h-4 w-4" />;
      default: return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'post': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'comment': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'like': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'connection': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'event': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
              </div>
            ))}
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
          <button onClick={loadDashboardData} className="text-primary-600 dark:text-primary-400 hover:underline">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Community
        </h1>
        <Link to="/community-enhanced/create">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm">
            <MessageSquareIcon className="h-4 w-4" />
            Create Post
          </button>
        </Link>
      </div>

      {/* Stats Overview */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Reputation Level</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{userStats.reputation.levelName}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{userStats.reputation.totalPoints} points</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <AwardIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                <span>Progress to next level</span>
                <span>{userStats.reputation.levelProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${userStats.reputation.levelProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Posts Created</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{userStats.totalPosts}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Community contributions</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageSquareIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Likes</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{userStats.totalLikes}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Received on posts</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <ThumbsUpIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Expert Endorsements</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{userStats.expertEndorsements}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Professional recognition</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <StarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-neutral-800 shadow rounded-lg">
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3Icon },
              { id: 'gang', label: 'Gang Activity', icon: UsersIcon },
              { id: 'recommendations', label: 'Recommendations', icon: LightbulbIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentActivity.map(activity => (
                    <div key={activity._id} className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {activity.title}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                          {activity.description}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {getTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link to="/community-enhanced/create">
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                          <MessageSquareIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-primary-900 dark:text-primary-100">
                            Create New Post
                          </p>
                          <p className="text-sm text-primary-700 dark:text-primary-300">
                            Share your professional insights
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link to="/community-enhanced/events">
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <CalendarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="font-medium text-orange-900 dark:text-orange-100">
                            Join Events
                          </p>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Professional networking events
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link to="/gang-members">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <UsersIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-purple-900 dark:text-purple-100">
                            Manage Connections
                          </p>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Build your professional network
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link to="/jobs">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <BriefcaseIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-green-900 dark:text-green-100">
                            Browse Jobs
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Find your next opportunity
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gang' && <GangCommunityIntegration />}
          {activeTab === 'recommendations' && <ProfessionalRecommendations />}
          {activeTab === 'activity' && <UnifiedActivityFeed />}
        </div>
      </div>
    </div>
  );
};

