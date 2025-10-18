import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCircle, DollarSign, MessageSquare, Users, Briefcase, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { apiService as api } from '../../services/api';
import { io, Socket } from 'socket.io-client';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  richContent?: {
    image?: string;
    avatar?: string;
    preview?: string;
    actionButtons?: Array<{
      label: string;
      action: string;
      url?: string;
      style?: 'primary' | 'secondary' | 'danger';
    }>;
    metadata?: {
      jobTitle?: string;
      companyName?: string;
      amount?: number;
      connectionName?: string;
      postTitle?: string;
      senderName?: string;
      [key: string]: any;
    };
  };
  context?: {
    module: string;
    relatedEntity?: {
      type: string;
      id: string;
      title?: string;
      url?: string;
    };
  };
  smart: {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    relevanceScore: number;
  };
  interaction: {
    isRead: boolean;
    readAt?: string;
    clickedAt?: string;
    actionTaken?: string;
  };
  createdAt: string;
  timeAgo: string;
  grouped?: boolean;
  groupCount?: number;
  groupNotifications?: Notification[];
}

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'urgent'>('all');
  const [_socket, _setSocket] = useState<Socket | null>(null); // TODO: Use socket for real-time notifications
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _notificationRef = useRef<HTMLDivElement>(null); // TODO: Use ref for scroll management

  // Initialize socket connection
  useEffect(() => {
    if (user?._id) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token') || ''
        }
      });

      newSocket.on('notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: notification.richContent?.avatar || '/favicon.ico',
            tag: notification._id
          });
        }
      });

      _setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user?._id]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Load notifications
  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await api.getNotifications({
        limit: 10,
        unreadOnly: filter === 'unread',
        priority: filter === 'high' ? 'high' : filter === 'urgent' ? 'urgent' : undefined
      });
      
        if (response.success) {
          setNotifications(response.data?.notifications || []);
          setUnreadCount(response.data?.unreadCount || 0);
        }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, interaction: { ...n.interaction, isRead: true, readAt: new Date().toISOString() } }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      
      setNotifications(prev => 
        prev.map(n => ({ 
          ...n, 
          interaction: { ...n.interaction, isRead: true, readAt: new Date().toISOString() } 
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const trackInteraction = async (notificationId: string, action: string) => {
    try {
      await api.trackNotificationInteraction(notificationId, action);
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_application':
      case 'job_approved':
      case 'job_rejected':
      case 'job_match':
        return <Briefcase className="h-5 w-5" />;
      case 'connection_request':
      case 'connection_accepted':
        return <Users className="h-5 w-5" />;
      case 'message':
      case 'message_reaction':
        return <MessageSquare className="h-5 w-5" />;
      case 'payment_received':
      case 'payment_sent':
        return <DollarSign className="h-5 w-5" />;
      case 'community_like':
      case 'community_comment':
      case 'community_mention':
        return <Star className="h-5 w-5" />;
      case 'verification_approved':
      case 'verification_rejected':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.interaction.isRead;
      case 'high':
        return notification.smart.priority === 'high';
      case 'urgent':
        return notification.smart.priority === 'urgent';
      default:
        return true;
    }
  });

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="danger" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-3">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'high', label: 'High', count: notifications.filter(n => n.smart.priority === 'high').length },
                { key: 'urgent', label: 'Urgent', count: notifications.filter(n => n.smart.priority === 'urgent').length }
              ].map(tab => (
                <Button
                  key={tab.key}
                  variant={filter === tab.key ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(tab.key as any)}
                  className="text-xs"
                >
                  {tab.label} ({tab.count})
                </Button>
              ))}
            </div>

            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="w-full"
                leftIcon={<Check className="h-4 w-4" />}
              >
                Mark All Read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.interaction.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-full ${getPriorityColor(notification.smart.priority)} text-white flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {/* Rich Content */}
                          {notification.richContent?.metadata && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {notification.richContent.metadata.jobTitle && (
                                <span>Job: {notification.richContent.metadata.jobTitle}</span>
                              )}
                              {notification.richContent.metadata.companyName && (
                                <span> • {notification.richContent.metadata.companyName}</span>
                              )}
                              {notification.richContent.metadata.amount && (
                                <span> • ₹{notification.richContent.metadata.amount}</span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.timeAgo}
                            </span>
                            {!notification.interaction.isRead && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1">
                          {!notification.interaction.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification._id)}
                              className="p-1 h-6 w-6"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {notification.richContent?.actionButtons?.map((button, index) => (
                            <Button
                              key={index}
                              variant={button.style === 'primary' ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => {
                                trackInteraction(notification._id, button.action);
                                if (button.url) {
                                  window.location.href = button.url;
                                }
                              }}
                              className="text-xs px-2 py-1 h-6"
                            >
                              {button.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/notifications';
              }}
            >
              View All Notifications
            </Button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
