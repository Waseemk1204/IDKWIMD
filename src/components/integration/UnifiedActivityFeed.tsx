import React, { useState, useEffect } from 'react';
import { Activity, Users, Briefcase, MessageSquare, Heart, Star, TrendingUp, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import apiService from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface ActivityItem {
  id: string;
  userId: {
    _id: string;
    fullName: string;
    profilePhoto?: string;
  };
  module: 'jobs' | 'community' | 'gang' | 'messaging' | 'wallet' | 'timesheet';
  action: string;
  targetId?: string;
  targetType?: 'job' | 'post' | 'user' | 'message' | 'connection' | 'transaction';
  metadata?: any;
  impactScore: number;
  createdAt: string;
}

interface UnifiedActivityFeedProps {
  className?: string;
  showFilters?: boolean;
  limit?: number;
}

export const UnifiedActivityFeed: React.FC<UnifiedActivityFeedProps> = ({
  className = '',
  showFilters = true,
  limit = 20
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'jobs' | 'community' | 'gang' | 'messaging'>('all');

  useEffect(() => {
    loadActivities();
  }, [page, filter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUnifiedActivityFeed(page, limit);
      
      if (response.success) {
        const newActivities = response.data.activities;
        
        if (page === 1) {
          setActivities(newActivities);
        } else {
          setActivities(prev => [...prev, ...newActivities]);
        }
        
        setHasMore(response.data.pagination.hasNext);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'jobs': return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'community': return <Users className="h-4 w-4 text-green-500" />;
      case 'gang': return <Heart className="h-4 w-4 text-red-500" />;
      case 'messaging': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'wallet': return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'jobs': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'community': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'gang': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'messaging': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'wallet': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getActionText = (action: string, module: string) => {
    switch (action) {
      case 'connection_accepted': return 'accepted a connection request';
      case 'job_applied': return 'applied to a job';
      case 'post_created': return 'created a community post';
      case 'message_sent': return 'sent a message';
      case 'post_liked': return 'liked a post';
      case 'comment_created': return 'commented on a post';
      case 'transaction_completed': return 'completed a transaction';
      default: return `performed ${action.replace('_', ' ')}`;
    }
  };

  const getImpactBadge = (score: number) => {
    if (score >= 80) return <Badge variant="primary" className="bg-red-500">High Impact</Badge>;
    if (score >= 60) return <Badge variant="secondary" className="bg-yellow-500">Medium Impact</Badge>;
    return <Badge variant="outline">Low Impact</Badge>;
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.module === filter);

  if (loading && activities.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading activity feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Unified Activity Feed
          </h2>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredActivities.length} activities
        </Badge>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Activity', icon: Activity },
            { key: 'jobs', label: 'Jobs', icon: Briefcase },
            { key: 'community', label: 'Community', icon: Users },
            { key: 'gang', label: 'Gang', icon: Heart },
            { key: 'messaging', label: 'Messages', icon: MessageSquare }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={filter === key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(key as any)}
              className="flex items-center space-x-1"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Activities */}
      {filteredActivities.length === 0 ? (
        <Card className="p-8 text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No activities yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Activity from your network will appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <Avatar
                  name={activity.userId.fullName}
                  src={activity.userId.profilePhoto}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {activity.userId.fullName}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {getActionText(activity.action, activity.module)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getModuleColor(activity.module)}`}
                    >
                      {getModuleIcon(activity.module)}
                      <span className="ml-1 capitalize">{activity.module}</span>
                    </Badge>
                    {getImpactBadge(activity.impactScore)}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mx-auto"></div>
            ) : (
              'Load More Activities'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

