import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { socketService } from '../../services/socketService';
import { MessageBubble } from './MessageBubble';
import { ComposeBox } from './ComposeBox';
import { TypingIndicator } from './TypingIndicator';
import { Button } from '../ui/Button';
import { Phone, Video, Users, Info } from 'lucide-react';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
  };
  messageType: 'text' | 'image' | 'file' | 'system' | 'call_start' | 'call_end';
  createdAt: Date;
  isRead: boolean;
  isEdited: boolean;
  editedAt?: Date;
  replyTo?: {
    content: string;
    sender: {
      fullName: string;
    };
  };
  reactions?: {
    reactionType: string;
    count: number;
    users: string[];
  }[];
  attachments?: {
    url: string;
    filename: string;
    fileType: string;
    fileSize: number;
  }[];
}

interface MessageAreaProps {
  conversationId?: string | null;
  channelId?: string | null;
  onStartCall: (type: 'audio' | 'video', targetId?: string) => void;
  onToggleRightPanel: () => void;
}

export const MessageArea: React.FC<MessageAreaProps> = ({
  conversationId,
  channelId,
  onStartCall,
  onToggleRightPanel
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (conversationId || channelId) {
      fetchMessages();
      joinRoom();
    }

    return () => {
      leaveRoom();
    };
  }, [conversationId, channelId]);

  useEffect(() => {
    // Listen for new messages
    socketService.on('new_message', (message: Message) => {
      if (
        (conversationId && message.conversation === conversationId) ||
        (channelId && message.channel === channelId)
      ) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    });

    // Listen for typing indicators
    socketService.on('user_typing', (data: any) => {
      if (
        (conversationId && data.conversationId === conversationId) ||
        (channelId && data.channelId === channelId)
      ) {
        setTypingUsers(prev => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username];
          }
          return prev;
        });

        // Clear typing indicator after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u !== data.username));
        }, 3000);
      }
    });

    socketService.on('user_stopped_typing', (data: any) => {
      if (
        (conversationId && data.conversationId === conversationId) ||
        (channelId && data.channelId === channelId)
      ) {
        setTypingUsers(prev => prev.filter(u => u !== data.username));
      }
    });

    return () => {
      socketService.off('new_message');
      socketService.off('user_typing');
      socketService.off('user_stopped_typing');
    };
  }, [conversationId, channelId]);

  const fetchMessages = async () => {
    if (!conversationId && !channelId) return;

    setLoading(true);
    try {
      let response;
      if (conversationId) {
        response = await apiService.getMessages(conversationId);
      } else if (channelId) {
        response = await apiService.getChannelMessages(channelId);
      }

      if (response?.success) {
        setMessages(response.data.messages);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = () => {
    if (conversationId) {
      socketService.joinConversation(conversationId);
    } else if (channelId) {
      socketService.joinChannel(channelId);
    }
  };

  const leaveRoom = () => {
    if (conversationId) {
      socketService.leaveConversation(conversationId);
    } else if (channelId) {
      socketService.leaveChannel(channelId);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content: string, attachments?: any[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    socketService.sendMessage({
      conversationId,
      channelId,
      content,
      attachments
    });
  };

  const handleStartTyping = () => {
    if (conversationId) {
      socketService.startTyping(conversationId);
    } else if (channelId) {
      socketService.startTyping('', channelId);
    }
  };

  const handleStopTyping = () => {
    if (conversationId) {
      socketService.stopTyping(conversationId);
    } else if (channelId) {
      socketService.stopTyping('', channelId);
    }
  };

  const getHeaderTitle = () => {
    if (conversationId) {
      // For conversations, we'd need to fetch conversation details
      return 'Direct Message';
    } else if (channelId) {
      // For channels, we'd need to fetch channel details
      return 'Channel';
    }
    return 'Select a conversation';
  };

  if (!conversationId && !channelId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Welcome to Comms
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a conversation or channel to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getHeaderTitle()}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStartCall('audio')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStartCall('video')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleRightPanel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={message.sender._id === user?.userId}
              onAddReaction={(reactionType) => {
                socketService.addReaction(message._id, reactionType);
              }}
            />
          ))
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Compose Box */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <ComposeBox
          onSendMessage={handleSendMessage}
          onStartTyping={handleStartTyping}
          onStopTyping={handleStopTyping}
        />
      </div>
    </div>
  );
};
