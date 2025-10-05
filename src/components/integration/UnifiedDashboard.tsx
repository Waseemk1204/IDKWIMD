import React, { useState, useEffect } from 'react';
import { Activity, Users, Briefcase, MessageSquare, TrendingUp, Zap, Settings, Bell } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { UnifiedActivityFeed } from './UnifiedActivityFeed';
import { CrossModuleRecommendations } from './CrossModuleRecommendations';
import apiService from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface NetworkInsights {
  networkMetrics: {
    influenceScore: number;
    reachScore: number;
    engagementScore: number;
    crossModuleActivity: number;
  };
  moduleActivity: {
    jobs: { applicationsCount: number; successRate: number };
    community: { postsCount: number; likesReceived: number };
    gang: { connectionsCount: number; averageConnectionStrength: number };
    messaging: { messagesSent: number; activeConversations: number };
    wallet: { transactionsCount: number; totalEarned: number };
  };
  totalEngagement: number;
  recommendations: {
    improveInfluence: boolean;
    increaseReach: boolean;
    boostEngagement: boolean;
    crossModuleActivity: boolean;
  };
}

interface UnifiedDashboardProps {
  className?: string;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  className = ''
}) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<NetworkInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'activity' | 'recommendations' | 'insights'>('overview');

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNetworkInsights();
      
      if (response.success) {
        setInsights(response.data);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="primary" className="bg-green-500">Excellent</Badge>;
    if (score >= 60) return <Badge variant="secondary" className="bg-yellow-500">Good</Badge>;
    return <Badge variant="outline" className="bg-red-500 text-white">Needs Improvement</Badge>;
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading unified dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Unified Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your complete Part-Time Pays ecosystem overview
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'activity', label: 'Activity Feed', icon: Activity },
            { id: 'recommendations', label: 'Recommendations', icon: Zap },
            { id: 'insights', label: 'Network Insights', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeView === 'overview' && insights && (
        <div className="space-y-6">
          {/* Network Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Influence Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(insights.networkMetrics.influenceScore)}`}>
                    {insights.networkMetrics.influenceScore}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              {getScoreBadge(insights.networkMetrics.influenceScore)}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reach Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(insights.networkMetrics.reachScore)}`}>
                    {insights.networkMetrics.reachScore}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
              {getScoreBadge(insights.networkMetrics.reachScore)}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Engagement Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(insights.networkMetrics.engagementScore)}`}>
                    {insights.networkMetrics.engagementScore}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
              {getScoreBadge(insights.networkMetrics.engagementScore)}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cross-Module Activity</p>
                  <p className={`text-2xl font-bold ${getScoreColor(insights.networkMetrics.crossModuleActivity)}`}>
                    {insights.networkMetrics.crossModuleActivity}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
              {getScoreBadge(insights.networkMetrics.crossModuleActivity)}
            </Card>
          </div>

          {/* Module Activity Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Module Activity Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">Jobs</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{insights.moduleActivity.jobs.applicationsCount} applications</p>
                    <p className="text-xs text-gray-500">{insights.moduleActivity.jobs.successRate}% success rate</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Community</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{insights.moduleActivity.community.postsCount} posts</p>
                    <p className="text-xs text-gray-500">{insights.moduleActivity.community.likesReceived} likes received</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium">Gang</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{insights.moduleActivity.gang.connectionsCount} connections</p>
                    <p className="text-xs text-gray-500">{insights.moduleActivity.gang.averageConnectionStrength}% avg strength</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium">Messaging</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{insights.moduleActivity.messaging.messagesSent} messages</p>
                    <p className="text-xs text-gray-500">{insights.moduleActivity.messaging.activeConversations} active chats</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Improvement Recommendations
              </h3>
              <div className="space-y-3">
                {insights.recommendations.improveInfluence && (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Focus on building stronger connections to improve influence
                    </span>
                  </div>
                )}
                {insights.recommendations.increaseReach && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Users className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                      Expand your network to increase reach
                    </span>
                  </div>
                )}
                {insights.recommendations.boostEngagement && (
                  <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Activity className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-purple-700 dark:text-purple-300">
                      Increase activity across all modules to boost engagement
                    </span>
                  </div>
                )}
                {insights.recommendations.crossModuleActivity && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">
                      Use cross-module features to increase activity
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeView === 'activity' && (
        <UnifiedActivityFeed showFilters={true} limit={20} />
      )}

      {activeView === 'recommendations' && (
        <CrossModuleRecommendations showHeader={true} limit={15} />
      )}

      {activeView === 'insights' && insights && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detailed Network Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Performance Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Engagement</span>
                    <span className="font-semibold">{insights.totalEngagement.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Network Influence</span>
                    <span className="font-semibold">{insights.networkMetrics.influenceScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Network Reach</span>
                    <span className="font-semibold">{insights.networkMetrics.reachScore}/100</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Activity Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Job Applications</span>
                    <span className="font-semibold">{insights.moduleActivity.jobs.applicationsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Community Posts</span>
                    <span className="font-semibold">{insights.moduleActivity.community.postsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Connections</span>
                    <span className="font-semibold">{insights.moduleActivity.gang.connectionsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

