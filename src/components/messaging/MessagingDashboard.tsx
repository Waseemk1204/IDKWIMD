import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { 
  MessageCircle, 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ConversationSuggestion {
  type: 'job_application' | 'community_post' | 'gang_connection';
  title: string;
  description: string;
  targetUser: {
    _id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
  };
  context: any;
  priority: 'high' | 'medium' | 'low';
}

interface MessagingAnalytics {
  conversationStats: {
    total: number;
    byType: {
      direct: number;
      job_related: number;
      community_related: number;
      gang_related: number;
    };
  };
  messageStats: {
    total: number;
    byType: {
      text: number;
      job_context: number;
      community_context: number;
    };
  };
  responseRate: number;
  timeframe: string;
}

export const MessagingDashboard: React.FC = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<ConversationSuggestion[]>([]);
  const [analytics, setAnalytics] = useState<MessagingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [suggestionsResponse, analyticsResponse] = await Promise.all([
        apiService.getConversationSuggestions(),
        apiService.getMessagingAnalytics('30d')
      ]);

      if (suggestionsResponse.success) {
        setSuggestions(suggestionsResponse.data.suggestions);
      }

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load messaging dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async (suggestion: ConversationSuggestion) => {
    try {
      let response;
      
      switch (suggestion.type) {
        case 'job_application':
          response = await apiService.createJobConversation({
            applicationId: suggestion.context.applicationId,
            jobId: suggestion.context.jobId
          });
          break;
        case 'community_post':
          response = await apiService.createCommunityConversation({
            postId: suggestion.context.postId,
            authorId: suggestion.targetUser._id
          });
          break;
        case 'gang_connection':
          response = await apiService.createGangConversation({
            connectionId: suggestion.context.connectionId,
            targetUserId: suggestion.targetUser._id
          });
          break;
      }

      if (response?.success) {
        toast.success('Conversation started!');
        // Navigate to messaging
        window.location.href = '/messaging';
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'job_application':
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      case 'community_post':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'gang_connection':
        return <Users className="h-5 w-5 text-purple-600" />;
      default:
        return <MessageCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Messaging Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Connect and communicate across all platform features
          </p>
        </div>
        <Button onClick={() => window.location.href = '/messaging'}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Go to Messages
        </Button>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Conversations
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.conversationStats.total}
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Messages Sent
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.messageStats.total}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Response Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.responseRate}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Job Conversations
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.conversationStats.byType.job_related}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Conversation Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Suggested Conversations
          </h3>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            Refresh
          </Button>
        </div>

        {suggestions.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No suggestions available
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Start engaging with jobs, community posts, or gang members to get conversation suggestions.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <Card 
                key={index} 
                className={`p-4 border-l-4 ${getPriorityColor(suggestion.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {suggestion.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center space-x-1">
                          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              {suggestion.targetUser.fullName.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {suggestion.targetUser.fullName}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.priority === 'high' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : suggestion.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {suggestion.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCreateConversation(suggestion)}
                    className="ml-4"
                  >
                    Start Chat
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" 
                onClick={() => window.location.href = '/jobs'}>
            <div className="flex items-center space-x-3">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Browse Jobs
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find jobs to discuss with employers
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = '/community'}>
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Community Hub
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Engage with community posts
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = '/gang-members'}>
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Gang Members
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect with your network
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tips and Best Practices */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <Lightbulb className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Messaging Best Practices
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Be professional and respectful in all conversations</li>
              <li>• Use context-aware messages to show you've read their content</li>
              <li>• Respond promptly to maintain engagement</li>
              <li>• Use reactions to acknowledge messages without cluttering</li>
              <li>• Leverage shared interests to build stronger connections</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

