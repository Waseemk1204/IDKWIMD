import { io, Socket } from 'socket.io-client';
import { apiService } from './api';

export interface Notification {
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
}

export interface NotificationPreferences {
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  types: {
    [key: string]: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
  };
  timing: {
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
    maxFrequency: {
      enabled: boolean;
      maxPerHour: number;
      maxPerDay: number;
    };
    digest: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
    };
  };
  advanced: {
    smartGrouping: boolean;
    relevanceThreshold: number;
    aiRecommendations: boolean;
    crossModuleIntegration: boolean;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Array<{ _id: string; count: number }>;
  byPriority: Array<{ _id: string; count: number }>;
  recentActivity: Array<{
    type: string;
    createdAt: string;
    'interaction.isRead': boolean;
    'smart.priority': string;
  }>;
}

class NotificationService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private isConnected = false;

  constructor() {
    this.initializeBrowserNotifications();
  }

  private initializeBrowserNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.emit('connected');
      console.log('Notification service connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.emit('disconnected');
      console.log('Notification service disconnected');
    });

    this.socket.on('notification', (notification: Notification) => {
      this.emit('notification', notification);
      this.showBrowserNotification(notification);
    });

    this.socket.on('notification_read', (notificationId: string) => {
      this.emit('notification_read', notificationId);
    });

    this.socket.on('notification_stats', (stats: NotificationStats) => {
      this.emit('notification_stats', stats);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  private showBrowserNotification(notification: Notification) {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.richContent?.avatar || '/favicon.ico',
        tag: notification._id,
        requireInteraction: notification.smart.priority === 'urgent',
        actions: notification.richContent?.actionButtons?.map(button => ({
          action: button.action,
          title: button.label
        })) || []
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.richContent?.actionButtons?.[0]?.url) {
          window.location.href = notification.richContent.actionButtons[0].url;
        }
        browserNotification.close();
      };

      // Auto-close non-urgent notifications after 5 seconds
      if (notification.smart.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // API methods
  async getNotifications(params: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
    priority?: string;
    grouped?: boolean;
  } = {}): Promise<{
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  }> {
    const response = await apiService.getNotifications(params);
    
    if (response.success && response.data) {
      return {
        notifications: response.data.notifications || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        },
        unreadCount: response.data.unreadCount || 0
      };
    }
    
    return {
      notifications: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      unreadCount: 0
    };
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiService.markNotificationAsRead(notificationId);
  }

  async markAllAsRead(): Promise<void> {
    await apiService.markAllNotificationsAsRead();
  }

  async trackInteraction(notificationId: string, action: string): Promise<void> {
    await apiService.trackNotificationInteraction(notificationId, action);
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiService.getNotificationSettings();
    return response.data || {};
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await apiService.updateNotificationSettings(preferences);
    return response.data || {};
  }

  async getStats(): Promise<NotificationStats> {
    const response = await apiService.getNotificationStats();
    return response.data || {
      total: 0,
      unread: 0,
      byType: [],
      byPriority: [],
      recentActivity: []
    };
  }

  async createTestNotification(data: {
    type?: string;
    title?: string;
    message?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    channels?: Array<'push' | 'email' | 'sms' | 'inApp'>;
  }): Promise<Notification> {
    const response = await apiService.createTestNotification(data);
    return response.data || {} as Notification;
  }

  // Utility methods
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  getNotificationTypeIcon(type: string): string {
    switch (type) {
      case 'job_application':
      case 'job_approved':
      case 'job_rejected':
      case 'job_match':
        return 'briefcase';
      case 'connection_request':
      case 'connection_accepted':
        return 'users';
      case 'message':
      case 'message_reaction':
        return 'message-square';
      case 'payment_received':
      case 'payment_sent':
        return 'dollar-sign';
      case 'community_like':
      case 'community_comment':
      case 'community_mention':
        return 'star';
      case 'verification_approved':
      case 'verification_rejected':
        return 'shield';
      default:
        return 'bell';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'blue';
      case 'low':
        return 'gray';
      default:
        return 'gray';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'job_application':
      case 'job_approved':
      case 'job_rejected':
      case 'job_match':
        return 'blue';
      case 'connection_request':
      case 'connection_accepted':
        return 'green';
      case 'message':
      case 'message_reaction':
        return 'purple';
      case 'payment_received':
      case 'payment_sent':
        return 'yellow';
      case 'community_like':
      case 'community_comment':
      case 'community_mention':
        return 'pink';
      case 'verification_approved':
      case 'verification_rejected':
        return 'indigo';
      default:
        return 'gray';
    }
  }

  // Smart grouping
  groupNotifications(notifications: Notification[]): Notification[] {
    const groups: { [key: string]: Notification[] } = {};
    const grouped: Notification[] = [];

    // Group notifications by type and context
    notifications.forEach(notification => {
      const groupKey = `${notification.type}_${notification.context?.module || 'general'}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(notification);
    });

    // Create grouped notifications
    Object.entries(groups).forEach(([groupKey, groupNotifications]) => {
      if (groupNotifications.length > 1) {
        // Create a grouped notification
        const groupedNotification: Notification = {
          ...groupNotifications[0],
          _id: `grouped_${groupKey}_${Date.now()}`,
          title: `${groupNotifications.length} ${groupNotifications[0].type.replace('_', ' ')} notifications`,
          message: `You have ${groupNotifications.length} new ${groupNotifications[0].type.replace('_', ' ')} notifications`,
          grouped: true,
          groupCount: groupNotifications.length,
          groupNotifications: groupNotifications
        } as any;
        
        grouped.push(groupedNotification);
      } else {
        grouped.push(groupNotifications[0]);
      }
    });

    return grouped;
  }

  // Filter notifications
  filterNotifications(notifications: Notification[], filters: {
    search?: string;
    type?: string;
    priority?: string;
    unreadOnly?: boolean;
    dateRange?: 'today' | 'week' | 'month' | 'all';
  }): Notification[] {
    return notifications.filter(notification => {
      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = notification.title.toLowerCase().includes(query);
        const matchesMessage = notification.message.toLowerCase().includes(query);
        const matchesType = notification.type.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesMessage && !matchesType) {
          return false;
        }
      }

      // Type filter
      if (filters.type && filters.type !== 'all') {
        if (notification.type !== filters.type) {
          return false;
        }
      }

      // Priority filter
      if (filters.priority && filters.priority !== 'all') {
        if (notification.smart.priority !== filters.priority) {
          return false;
        }
      }

      // Unread filter
      if (filters.unreadOnly) {
        if (notification.interaction.isRead) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        const notificationDate = new Date(notification.createdAt);
        
        switch (filters.dateRange) {
          case 'today':
            if (notificationDate.toDateString() !== now.toDateString()) {
              return false;
            }
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (notificationDate < weekAgo) {
              return false;
            }
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (notificationDate < monthAgo) {
              return false;
            }
            break;
        }
      }

      return true;
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
