import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Search,
  Filter,
  Plus,
  Reply,
  Edit,
  Trash2,
  ThumbsUp,
  Lightbulb,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
    headline?: string;
  };
  messageType: 'text' | 'image' | 'file' | 'system' | 'job_context' | 'community_context';
  isRead: boolean;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  conversation: string;
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
  context?: {
    jobId?: {
      title: string;
      company: string;
    };
    communityPostId?: {
      title: string;
      content: string;
    };
    connectionId?: string;
    applicationId?: {
      status: string;
    };
  };
}

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
  lastMessage?: Message;
  lastMessageAt?: Date;
  title?: string;
  conversationType: 'direct' | 'group' | 'job_related' | 'community_related' | 'gang_related';
  isActive: boolean;
  unreadCount?: number;
  metadata?: {
    connectionStrength?: number;
    sharedInterests?: string[];
    lastActivity?: Date;
    messageCount?: number;
  };
}

interface EnhancedMessagingProps {
  className?: string;
}

export const EnhancedMessaging: React.FC<EnhancedMessagingProps> = ({ className }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Professional reaction emojis
  const reactionEmojis = {
    thumbs_up: '👍',
    lightbulb: '💡',
    checkmark: '✅',
    question: '❓',
    like: '❤️',
    laugh: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😠'
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    import('socket.io-client').then(({ io }) => {
      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        console.log('Connected to enhanced messaging server');
        setSocket(socketInstance);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from messaging server');
      });

      socketInstance.on('new_message', (message: Message) => {
        if (selectedConversation && message.conversation === selectedConversation._id) {
          setMessages(prev => [...prev, message]);
        }
        
        // Update conversation list with new message
        setConversations(prev => 
          prev.map(conv => 
            conv._id === message.conversation 
              ? { ...conv, lastMessage: message, lastMessageAt: message.createdAt }
              : conv
          )
        );
      });

      socketInstance.on('message_reaction', (data: { messageId: string; reactionType: string; userId: string }) => {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.messageId 
              ? {
                  ...msg,
                  reactions: msg.reactions?.map(r => 
                    r.reactionType === data.reactionType 
                      ? { ...r, count: r.count + 1, users: [...r.users, data.userId] }
                      : r
                  ) || [{ reactionType: data.reactionType, count: 1, users: [data.userId] }]
                }
              : msg
          )
        );
      });

      socketInstance.on('message_edited', (data: { messageId: string; content: string; editedAt: Date }) => {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, content: data.content, isEdited: true, editedAt: data.editedAt }
              : msg
          )
        );
      });

      socketInstance.on('message_deleted', (data: { messageId: string }) => {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, content: '[Message deleted]', isEdited: true }
              : msg
          )
        );
      });

      socketInstance.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
        if (data.userId !== user._id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (data.isTyping) {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });
        }
      });

      return () => {
        socketInstance.disconnect();
      };
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, selectedConversation]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await apiService.getConversations();
        if (response.success) {
          setConversations(response.data.conversations);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load messages for selected conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) return;

      try {
        const response = await apiService.getMessages(selectedConversation._id);
        if (response.success) {
          setMessages(response.data.messages);
          
          // Mark messages as read
          await apiService.markMessagesAsRead(selectedConversation._id);
          
          // Join conversation room
          if (socket) {
            socket.emit('join_conversation', selectedConversation._id);
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
      }
    };

    loadMessages();
  }, [selectedConversation, socket]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const messageData: any = {
        content: newMessage.trim(),
        messageType: 'text'
      };

      if (replyingTo) {
        messageData.replyTo = replyingTo._id;
      }

      const response = await apiService.sendMessage(selectedConversation._id, messageData);
      
      if (response.success) {
        setNewMessage('');
        setReplyingTo(null);
        
        // Emit socket event
        if (socket) {
          socket.emit('send_message', {
            conversationId: selectedConversation._id,
            content: newMessage.trim(),
            messageType: 'text',
            replyTo: replyingTo?._id
          });
        }
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle adding reaction
  const handleAddReaction = async (messageId: string, reactionType: string) => {
    try {
      const response = await apiService.request(`/v1/messages/messages/${messageId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ reactionType })
      });

      if (response.success) {
        // Emit socket event
        if (socket) {
          socket.emit('add_reaction', { messageId, reactionType });
        }
        setShowReactions(null);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  // Handle editing message
  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const response = await apiService.editMessage(messageId, newContent);
      
      if (response.success) {
        // Emit socket event
        if (socket) {
          socket.emit('edit_message', { messageId, content: newContent });
        }
        setEditingMessage(null);
        toast.success('Message updated');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  // Handle typing indicator
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && selectedConversation) {
      setIsTyping(true);
      if (socket) {
        socket.emit('typing_start', selectedConversation._id);
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket && selectedConversation) {
        socket.emit('typing_stop', selectedConversation._id);
      }
    }, 1000);
  };

  // Get conversation title
  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    
    if (conversation.conversationType === 'direct') {
      const otherParticipant = conversation.participants.find(p => p._id !== user?._id);
      return otherParticipant?.fullName || 'Unknown User';
    }
    
    return `Group Chat (${conversation.participants.length})`;
  };

  // Get conversation subtitle
  const getConversationSubtitle = (conversation: Conversation) => {
    if (conversation.lastMessage) {
      const sender = conversation.lastMessage.sender._id === user?._id ? 'You' : conversation.lastMessage.sender.fullName;
      return `${sender}: ${conversation.lastMessage.content.substring(0, 50)}${conversation.lastMessage.content.length > 50 ? '...' : ''}`;
    }
    return 'No messages yet';
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation => {
    const title = getConversationTitle(conversation).toLowerCase();
    const subtitle = getConversationSubtitle(conversation).toLowerCase();
    return title.includes(searchQuery.toLowerCase()) || subtitle.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Messages</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* TODO: Implement new conversation modal */}}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedConversation?._id === conversation._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar
                    src={conversation.conversationType === 'direct' 
                      ? conversation.participants.find(p => p._id !== user?._id)?.profilePhoto
                      : undefined
                    }
                    name={getConversationTitle(conversation)}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {getConversationTitle(conversation)}
                      </h3>
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {getConversationSubtitle(conversation)}
                    </p>
                    {conversation.lastMessageAt && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={selectedConversation.conversationType === 'direct' 
                    ? selectedConversation.participants.find(p => p._id !== user?._id)?.profilePhoto
                    : undefined
                  }
                  name={getConversationTitle(selectedConversation)}
                  size="md"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getConversationTitle(selectedConversation)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedConversation.conversationType === 'direct' 
                      ? selectedConversation.participants.find(p => p._id !== user?._id)?.isOnline 
                        ? 'Online' 
                        : `Last seen ${formatDistanceToNow(new Date(selectedConversation.participants.find(p => p._id !== user?._id)?.lastSeen || new Date()), { addSuffix: true })}`
                      : `${selectedConversation.participants.length} participants`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.sender._id === user?._id ? 'order-2' : 'order-1'}`}>
                    {message.sender._id !== user?._id && (
                      <div className="flex items-center space-x-2 mb-1">
                        <Avatar
                          src={message.sender.profilePhoto}
                          name={message.sender.fullName}
                          size="sm"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {message.sender.fullName}
                        </span>
                      </div>
                    )}
                    
                    {/* Reply Context */}
                    {message.replyTo && (
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mb-2 border-l-4 border-blue-500">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Replying to {message.replyTo.sender.fullName}
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                          {message.replyTo.content}
                        </p>
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={`rounded-lg p-3 ${
                      message.sender._id === user?._id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}>
                      {editingMessage?._id === message._id ? (
                        <div className="space-y-2">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Edit message..."
                            className="bg-white text-gray-900"
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditMessage(message._id, newMessage)}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingMessage(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm">{message.content}</p>
                          {message.isEdited && (
                            <p className="text-xs opacity-70 mt-1">(edited)</p>
                          )}
                        </div>
                      )}

                      {/* Context Information */}
                      {message.context && (
                        <div className="mt-2 p-2 bg-white/10 rounded">
                          {message.context.jobId && (
                            <p className="text-xs">
                              📋 Job: {message.context.jobId.title} at {message.context.jobId.company}
                            </p>
                          )}
                          {message.context.communityPostId && (
                            <p className="text-xs">
                              💬 Post: {message.context.communityPostId.title}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.reactions.map((reaction, index) => (
                            <button
                              key={index}
                              className="flex items-center space-x-1 bg-white/20 rounded-full px-2 py-1 text-xs hover:bg-white/30"
                            >
                              <span>{reactionEmojis[reaction.reactionType as keyof typeof reactionEmojis]}</span>
                              <span>{reaction.count}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Message Actions */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setShowReactions(showReactions === message._id ? null : message._id)}
                            className="text-xs opacity-70 hover:opacity-100"
                          >
                            <Smile className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setReplyingTo(message)}
                            className="text-xs opacity-70 hover:opacity-100"
                          >
                            <Reply className="h-3 w-3" />
                          </button>
                          {message.sender._id === user?._id && (
                            <>
                              <button
                                onClick={() => setEditingMessage(message)}
                                className="text-xs opacity-70 hover:opacity-100"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => {/* TODO: Implement delete */}}
                                className="text-xs opacity-70 hover:opacity-100"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </>
                          )}
                        </div>
                        <span className="text-xs opacity-70">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Reaction Picker */}
                    {showReactions === message._id && (
                      <div className="flex space-x-1 mt-1">
                        {Object.entries(reactionEmojis).map(([type, emoji]) => (
                          <button
                            key={type}
                            onClick={() => handleAddReaction(message._id, type)}
                            className="text-lg hover:scale-110 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {Array.from(typingUsers).length} user{Array.from(typingUsers).length > 1 ? 's' : ''} typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Context */}
            {replyingTo && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Reply className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Replying to {replyingTo.sender.fullName}
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 truncate">
                  {replyingTo.content}
                </p>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

