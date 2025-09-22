import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { MessageItem } from '../components/messaging/MessageItem';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Send, MoreVertical, Phone, Video, Info } from 'lucide-react';
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
  };
  messageType: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  conversation: string;
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
    role: string;
    isOnline?: boolean;
    lastSeen?: Date;
  }>;
  lastMessage?: Message;
  lastMessageAt?: Date;
  title?: string;
  conversationType: 'direct' | 'group' | 'job_related';
  isActive: boolean;
}

export const Messaging: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Import socket.io-client dynamically
    import('socket.io-client').then(({ io }) => {
      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        console.log('Connected to messaging server');
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

      socketInstance.on('user_online', (data: { userId: string }) => {
        setConversations(prev => 
          prev.map(conv => ({
            ...conv,
            participants: conv.participants.map(p => 
              p._id === data.userId ? { ...p, isOnline: true } : p
            )
          }))
        );
      });

      socketInstance.on('user_offline', (data: { userId: string }) => {
        setConversations(prev => 
          prev.map(conv => ({
            ...conv,
            participants: conv.participants.map(p => 
              p._id === data.userId ? { ...p, isOnline: false, lastSeen: new Date() } : p
            )
          }))
        );
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
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
      }
    };

    loadMessages();

    // Join conversation room
    if (socket && selectedConversation) {
      socket.emit('join_conversation', selectedConversation._id);
    }

    return () => {
      if (socket && selectedConversation) {
        socket.emit('leave_conversation', selectedConversation._id);
      }
    };
  }, [selectedConversation, socket]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      const unreadMessages = messages.filter(msg => 
        msg.sender._id !== user?._id && !msg.isRead
      );
      
      if (unreadMessages.length > 0) {
        apiService.markMessagesAsRead(selectedConversation._id);
      }
    }
  }, [selectedConversation, messages, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const response = await apiService.sendMessage(selectedConversation._id, {
        content: newMessage.trim(),
        messageType: 'text'
      });

      if (response.success) {
        setNewMessage('');
        // Stop typing indicator
        if (socket) {
          socket.emit('typing_stop', selectedConversation._id);
          setIsTyping(false);
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

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!socket || !selectedConversation) return;

    // Start typing indicator
    if (!isTyping) {
      socket.emit('typing_start', selectedConversation._id);
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', selectedConversation._id);
      setIsTyping(false);
    }, 1000);
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    
    const otherParticipants = conversation.participants.filter(p => p._id !== user?._id);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].name;
    } else if (otherParticipants.length > 1) {
      return `${otherParticipants[0].name} and ${otherParticipants.length - 1} others`;
    }
    return 'Unknown';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    const otherParticipants = conversation.participants.filter(p => p._id !== user?._id);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].profileImage;
    }
    return undefined;
  };

  const filteredConversations = conversations.filter(conv => 
    getConversationTitle(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto h-screen flex">
        {/* Conversations Sidebar */}
        <div className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Messages</h1>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedConversation?._id === conversation._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      name={getConversationTitle(conversation)}
                      src={getConversationAvatar(conversation)}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {getConversationTitle(conversation)}
                        </h3>
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
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
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      name={getConversationTitle(selectedConversation)}
                      src={getConversationAvatar(selectedConversation)}
                      size="md"
                    />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getConversationTitle(selectedConversation)}
                      </h2>
                      <div className="flex items-center space-x-2">
                        {selectedConversation.participants
                          .filter(p => p._id !== user?._id)
                          .map(participant => (
                            <div key={participant._id} className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${
                                participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {participant.isOnline ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <MessageItem
                    key={message._id}
                    content={message.content}
                    sender={message.sender}
                    timestamp={new Date(message.createdAt)}
                    isCurrentUser={message.sender._id === user?._id}
                  />
                ))}
                
                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm">
                      {Array.from(typingUsers).length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
                    </span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <Input
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button type="submit" disabled={!newMessage.trim() || sending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MoreVertical className="h-8 w-8 text-gray-400" />
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
    </div>
  );
};
