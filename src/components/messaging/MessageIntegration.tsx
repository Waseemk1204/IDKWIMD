import React, { useState } from 'react';
import { MessageCircle, Users, Briefcase, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { apiService } from '../../services/api';
import { toast } from 'sonner';

interface QuickMessageProps {
  userId: string;
  userName: string;
  userPhoto?: string;
  context?: {
    type: 'job' | 'community' | 'connection';
    data: any;
  };
  onMessageSent?: () => void;
}

export const QuickMessage: React.FC<QuickMessageProps> = ({
  userId,
  userName,
  userPhoto: _userPhoto,
  context,
  onMessageSent
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickMessage = async () => {
    setIsLoading(true);
    try {
      // Create or get conversation
      const conversationData: any = {
        participants: [userId],
        conversationType: 'direct'
      };

      // Add context if available
      if (context) {
        switch (context.type) {
          case 'job':
            conversationData.job = context.data._id;
            conversationData.conversationType = 'job_related';
            conversationData.title = `Job Discussion: ${context.data.title}`;
            break;
          case 'community':
            conversationData.communityPost = context.data._id;
            conversationData.conversationType = 'community_related';
            conversationData.title = `Community Discussion: ${context.data.title}`;
            break;
          case 'connection':
            conversationData.conversationType = 'gang_related';
            break;
        }
      }

      const response = await apiService.createConversation(conversationData);
      
      if (response.success) {
        toast.success(`Started conversation with ${userName}`);
        onMessageSent?.();
        
        // Navigate to messaging page
        window.location.href = '/messaging';
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleQuickMessage}
      disabled={isLoading}
      className="flex items-center space-x-2"
    >
      <MessageCircle className="h-4 w-4" />
      <span>Message</span>
    </Button>
  );
};

interface ContextualMessageProps {
  context: {
    type: 'job_application' | 'community_post' | 'gang_connection';
    data: any;
  };
}

export const ContextualMessage: React.FC<ContextualMessageProps> = ({ context }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleContextualMessage = async () => {
    setIsLoading(true);
    try {
      let conversationData: any = {
        participants: [],
        conversationType: 'direct'
      };

      switch (context.type) {
        case 'job_application':
          conversationData.participants = [context.data.employer._id];
          conversationData.job = context.data.job._id;
          conversationData.conversationType = 'job_related';
          conversationData.title = `Job Discussion: ${context.data.job.title}`;
          break;
        
        case 'community_post':
          conversationData.participants = [context.data.author._id];
          conversationData.communityPost = context.data._id;
          conversationData.conversationType = 'community_related';
          conversationData.title = `Community Discussion: ${context.data.title}`;
          break;
        
        case 'gang_connection':
          conversationData.participants = [context.data.user._id];
          conversationData.conversationType = 'gang_related';
          break;
      }

      const response = await apiService.createConversation(conversationData);
      
      if (response.success) {
        toast.success('Conversation started');
        window.location.href = '/messaging';
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error creating contextual conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const getContextIcon = () => {
    switch (context.type) {
      case 'job_application':
        return <Briefcase className="h-4 w-4" />;
      case 'community_post':
        return <FileText className="h-4 w-4" />;
      case 'gang_connection':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getContextText = () => {
    switch (context.type) {
      case 'job_application':
        return `Message about ${context.data.job.title}`;
      case 'community_post':
        return `Discuss "${context.data.title}"`;
      case 'gang_connection':
        return `Connect with ${context.data.user.fullName}`;
      default:
        return 'Start conversation';
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleContextualMessage}
      disabled={isLoading}
      className="flex items-center space-x-2"
    >
      {getContextIcon()}
      <span>{getContextText()}</span>
    </Button>
  );
};

interface MessageIntegrationProps {
  userId: string;
  userName: string;
  userPhoto?: string;
  connectionStrength?: number;
  sharedInterests?: string[];
  recentActivity?: {
    type: 'job_posted' | 'community_post' | 'connection_made';
    data: any;
    timestamp: Date;
  }[];
}

export const MessageIntegration: React.FC<MessageIntegrationProps> = ({
  userId,
  userName,
  userPhoto,
  connectionStrength,
  sharedInterests,
  recentActivity
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getSuggestionMessage = () => {
    if (sharedInterests && sharedInterests.length > 0) {
      return `Hi! I noticed we both have interests in ${sharedInterests.slice(0, 2).join(' and ')}. Would love to connect!`;
    }
    
    if (connectionStrength && connectionStrength > 70) {
      return `Hi ${userName}! I see we have a strong connection. Let's chat!`;
    }
    
    return `Hi ${userName}! I'd love to connect and learn more about your experience.`;
  };

  const handleSuggestedMessage = async () => {
    try {
      const conversationData = {
        participants: [userId],
        conversationType: 'direct' as const,
        context: {
          sharedInterests,
          connectionStrength
        }
      };

      const response = await apiService.createConversation(conversationData);
      
      if (response.success) {
        // Send suggested message
        await apiService.sendMessage(response.data.conversation._id, {
          content: getSuggestionMessage(),
          messageType: 'text'
        });
        
        toast.success('Message sent!');
        window.location.href = '/messaging';
      }
    } catch (error) {
      console.error('Error sending suggested message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="space-y-3">
      <QuickMessage
        userId={userId}
        userName={userName}
        userPhoto={userPhoto}
        context={{
          type: 'connection',
          data: { connectionStrength, sharedInterests }
        }}
      />
      
      {(sharedInterests && sharedInterests.length > 0 || connectionStrength) && (
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="w-full"
          >
            {showSuggestions ? 'Hide' : 'Show'} Message Suggestions
          </Button>
          
          {showSuggestions && (
            <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Suggested message:
              </p>
              <p className="text-sm bg-white dark:bg-gray-700 p-2 rounded border">
                {getSuggestionMessage()}
              </p>
              <Button
                size="sm"
                onClick={handleSuggestedMessage}
                className="w-full"
              >
                Send Suggested Message
              </Button>
            </div>
          )}
        </div>
      )}
      
      {recentActivity && recentActivity.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Recent Activity
          </h4>
          {recentActivity.slice(0, 3).map((activity, index) => (
            <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
              {activity.type === 'job_posted' && `Posted job: ${activity.data.title}`}
              {activity.type === 'community_post' && `Posted: ${activity.data.title}`}
              {activity.type === 'connection_made' && `Connected with ${activity.data.userName}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

