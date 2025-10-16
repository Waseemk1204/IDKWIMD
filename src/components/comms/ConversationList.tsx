import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { socketService } from '../../services/socketService';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
    headline?: string;
    role: string;
    isOnline?: boolean;
    lastSeen?: Date;
  }>;
  lastMessage?: {
    content: string;
    sender: {
      fullName: string;
    };
    createdAt: Date;
  };
  lastMessageAt?: Date;
  title?: string;
  conversationType: 'direct' | 'group' | 'job_related' | 'community_related' | 'gang_related';
  unreadCount?: number;
}

interface Channel {
  _id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'announcement';
  members: Array<{
    user: {
      _id: string;
      fullName: string;
      email: string;
      profilePhoto?: string;
    };
    role: 'admin' | 'moderator' | 'member';
  }>;
  lastMessage?: {
    content: string;
    sender: {
      fullName: string;
    };
    createdAt: Date;
  };
  lastMessageAt?: Date;
  messageCount: number;
  unreadCount?: number;
}

interface ConversationListProps {
  selectedConversation?: string | null;
  selectedChannel?: string | null;
  onConversationSelect: (id: string) => void;
  onChannelSelect: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  selectedConversation,
  selectedChannel,
  onConversationSelect,
  onChannelSelect
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'conversations' | 'channels'>('conversations');

  useEffect(() => {
    fetchConversations();
    fetchChannels();
  }, []);

  useEffect(() => {
    // Listen for new messages
    socketService.on('new_message', (message: any) => {
      if (message.conversation) {
        updateConversationLastMessage(message.conversation, message);
      } else if (message.channel) {
        updateChannelLastMessage(message.channel, message);
      }
    });

    return () => {
      socketService.off('new_message');
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await apiService.getConversations();
      if (response.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await apiService.getChannels();
      if (response.success) {
        setChannels(response.data.channels);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConversationLastMessage = (conversationId: string, message: any) => {
    setConversations(prev => 
      prev.map(conv => 
        conv._id === conversationId 
          ? { ...conv, lastMessage: message, lastMessageAt: message.createdAt }
          : conv
      )
    );
  };

  const updateChannelLastMessage = (channelId: string, message: any) => {
    setChannels(prev => 
      prev.map(channel => 
        channel._id === channelId 
          ? { ...channel, lastMessage: message, lastMessageAt: message.createdAt }
          : channel
      )
    );
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    
    const otherParticipants = conversation.participants.filter(
      p => p._id !== user?.userId
    );
    
    if (otherParticipants.length === 1) {
      return otherParticipants[0].fullName;
    } else if (otherParticipants.length > 1) {
      return `${otherParticipants.length + 1} people`;
    }
    
    return 'Unknown';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    const otherParticipants = conversation.participants.filter(
      p => p._id !== user?.userId
    );
    
    if (otherParticipants.length === 1) {
      return otherParticipants[0].profilePhoto;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('conversations')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'conversations'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Conversations
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'channels'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Channels
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'conversations' ? (
          <div className="space-y-1 p-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No conversations yet</p>
                <p className="text-sm">Start a conversation with someone!</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation._id}
                  onClick={() => onConversationSelect(conversation._id)}
                  className={`w-full flex items-center p-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    selectedConversation === conversation._id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                      : ''
                  }`}
                >
                  <Avatar
                    src={getConversationAvatar(conversation)}
                    alt={getConversationName(conversation)}
                    size="md"
                    className="mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {getConversationName(conversation)}
                      </h3>
                      {conversation.lastMessageAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conversation.lastMessage.sender.fullName}: {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <div className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unreadCount}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {channels.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No channels yet</p>
                <p className="text-sm">Create or join a channel!</p>
              </div>
            ) : (
              channels.map((channel) => (
                <button
                  key={channel._id}
                  onClick={() => onChannelSelect(channel._id)}
                  className={`w-full flex items-center p-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    selectedChannel === channel._id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                      : ''
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">#</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {channel.name}
                      </h3>
                      {channel.lastMessageAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(channel.lastMessageAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    {channel.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {channel.description}
                      </p>
                    )}
                    {channel.lastMessage && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {channel.lastMessage.sender.fullName}: {channel.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {channel.unreadCount && channel.unreadCount > 0 && (
                    <div className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {channel.unreadCount}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
