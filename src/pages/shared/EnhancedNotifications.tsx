import React, { useState, useEffect } from 'react';
import { Bell, Filter, Search, CheckCircle, AlertCircle, Clock, DollarSign, MessageSquare, Users, Briefcase, Star, Shield, MoreVertical, Archive, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { useAuth } from '../../hooks/useAuth';
import { apiService as api } from '../../services/api';

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

export const EnhancedNotifications: React.FC = () => {
  console.log('EnhancedNotifications component loaded');
  
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'urgent' | 'today' | 'week'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [filter, typeFilter, priorityFilter]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      console.log('Loading notifications with params:', {
        limit: 50,
        unreadOnly: filter === 'unread',
        type: typeFilter !== 'all' ? typeFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined
      });
      
      const response = await api.getNotifications({
        limit: 50,
        unreadOnly: filter === 'unread',
        type: typeFilter !== 'all' ? typeFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined
      });
      
      console.log('Notification API response:', response);
      
      if (response.data.success) {
        console.log('Setting notifications:', response.data.data?.notifications || []);
        setNotifications(response.data.data?.notifications || []);
        setUnreadCount(response.data.data?.unreadCount || 0);
      } else {
        console.error('API returned success: false', response.data);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Set empty arrays on error to prevent undefined issues
      setNotifications([]);
      setUnreadCount(0);
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
        return <Shield className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-blue-500 text-white';
      case 'low':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job_application':
      case 'job_approved':
      case 'job_rejected':
      case 'job_match':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'connection_request':
      case 'connection_accepted':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'message':
      case 'message_reaction':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'payment_received':
      case 'payment_sent':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'community_like':
      case 'community_comment':
      case 'community_mention':
        return 'text-pink-600 bg-pink-100 dark:bg-pink-900/20';
      case 'verification_approved':
      case 'verification_rejected':
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const filteredNotifications = (notifications || []).filter(notification => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = notification.title.toLowerCase().includes(query);
      const matchesMessage = notification.message.toLowerCase().includes(query);
      const matchesType = notification.type.toLowerCase().includes(query);
      
      if (!matchesTitle && !matchesMessage && !matchesType) {
        return false;
      }
    }

    // Additional filters are handled by the API
    return true;
  });

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  const bulkMarkAsRead = async () => {
    try {
      await Promise.all(
        selectedNotifications.map(id => api.markNotificationAsRead(id))
      );
      
      setNotifications(prev => 
        prev.map(n => 
          selectedNotifications.includes(n._id)
            ? { ...n, interaction: { ...n.interaction, isRead: true, readAt: new Date().toISOString() } }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - selectedNotifications.length));
      setSelectedNotifications([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to bulk mark as read:', error);
    }
  };

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'job_application', label: 'Job Applications' },
    { value: 'job_approved', label: 'Job Approved' },
    { value: 'connection_request', label: 'Connection Requests' },
    { value: 'message', label: 'Messages' },
    { value: 'payment_received', label: 'Payments' },
    { value: 'community_mention', label: 'Community' },
    { value: 'verification_approved', label: 'Verification' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-neutral-100">
            Notifications
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Stay updated with your latest activities and important updates
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              Mark All Read
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Bell className="h-4 w-4" />}
            onClick={() => window.location.href = '/notifications/settings'}
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {notifications?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {unreadCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(notifications || []).filter(n => {
                    const today = new Date();
                    const notificationDate = new Date(n.createdAt);
                    return notificationDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(notifications || []).filter(n => n.smart?.priority === 'high' || n.smart?.priority === 'urgent').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllNotifications}
                >
                  {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkMarkAsRead}
                  leftIcon={<CheckCircle className="h-4 w-4" />}
                >
                  Mark as Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedNotifications([])}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
            </div>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <Card
              key={notification._id}
              className={`transition-all duration-200 hover:shadow-md ${
                !notification.interaction.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/10' : ''
              } ${selectedNotifications.includes(notification._id) ? 'ring-2 ring-primary-500' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification._id)}
                      onChange={() => toggleNotificationSelection(notification._id)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </div>

                  {/* Icon */}
                  <div className={`p-3 rounded-full ${getPriorityColor(notification.smart.priority)} flex-shrink-0`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          {!notification.interaction.isRead && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {notification.message}
                        </p>

                        {/* Rich Content */}
                        {notification.richContent?.metadata && (
                          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {notification.richContent.metadata.jobTitle && (
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4" />
                                  <span>{notification.richContent.metadata.jobTitle}</span>
                                </div>
                              )}
                              {notification.richContent.metadata.companyName && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">at</span>
                                  <span>{notification.richContent.metadata.companyName}</span>
                                </div>
                              )}
                              {notification.richContent.metadata.amount && (
                                <div className="flex items-center gap-2 mt-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="font-medium">₹{notification.richContent.metadata.amount}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <Badge className={getTypeColor(notification.type)}>
                            {notification.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(notification.smart.priority)}>
                            {notification.smart.priority}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {notification.timeAgo}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Relevance: {notification.smart.relevanceScore}%
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {!notification.interaction.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(notification._id)}
                            leftIcon={<CheckCircle className="h-4 w-4" />}
                          >
                            Mark Read
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
                          >
                            {button.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || filter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : "You don't have any notifications yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
