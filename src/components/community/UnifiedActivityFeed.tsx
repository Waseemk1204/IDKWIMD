import React, { useState, useEffect } from 'react';
import { Activity, MessageCircle, Users, Briefcase, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';

export const UnifiedActivityFeed: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnifiedActivities();
  }, []);

  const loadUnifiedActivities = async () => {
    try {
      setLoading(true);
      const [discussions, connections, jobs] = await Promise.all([
        apiService.getPersonalizedDiscussions(10),
        apiService.getUserConnections('accepted'),
        apiService.getJobs({ limit: 5 })
      ]);

      // Combine and sort activities
      const combinedActivities = [
        ...discussions.data.discussions.map((post: any) => ({
          type: 'community_post',
          data: post,
          timestamp: post.createdAt,
          icon: MessageCircle,
          relevanceScore: post.relevanceScore
        })),
        ...connections.data.connections.map((conn: any) => ({
          type: 'connection_activity',
          data: conn,
          timestamp: conn.lastInteraction,
          icon: Users,
          relevanceScore: conn.strength
        })),
        ...jobs.data.jobs.map((job: any) => ({
          type: 'job_recommendation',
          data: job,
          timestamp: job.createdAt,
          icon: Briefcase,
          relevanceScore: 85 // Calculate based on user profile
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(combinedActivities);
    } catch (error) {
      console.error('Error loading unified activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading activities...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Your Unified Activity Feed
      </h3>
      
      {activities.map((activity, index) => (
        <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="flex items-start gap-3">
            <activity.icon className="h-5 w-5 text-blue-600 mt-1" />
            <div className="flex-1">
              {activity.type === 'community_post' && (
                <div>
                  <p className="font-medium">{activity.data.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {activity.data.author.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Relevance: {activity.relevanceScore}%
                  </p>
                </div>
              )}
              {activity.type === 'connection_activity' && (
                <div>
                  <p className="font-medium">Connection Activity</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.data.user.fullName} - Strength: {activity.relevanceScore}%
                  </p>
                </div>
              )}
              {activity.type === 'job_recommendation' && (
                <div>
                  <p className="font-medium">{activity.data.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.data.company} - Match: {activity.relevanceScore}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
