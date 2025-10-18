import React, { useState, useEffect } from "react";
import { ElevatedCard, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { notificationService } from "../../services/notificationService";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Briefcase,
  MessageSquare,
  Shield,
  Star,
  Check,
} from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  richContent?: {
    metadata?: {
      jobTitle?: string;
      companyName?: string;
      amount?: number;
      senderName?: string;
    };
    actionButtons?: Array<{
      label: string;
      action: string;
      url?: string;
    }>;
  };
  smart: {
    priority: 'low' | 'medium' | 'high' | 'urgent';
  };
  interaction: {
    isRead: boolean;
  };
  createdAt: string;
  timeAgo: string;
}

export const Notifications: React.FC = () => {
  const { user } = useAuth(); // TODO: Use user for personalized notifications
  console.log('Notifications user:', user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        unreadOnly: filter === "unread",
        limit: 50
      };
      
      const result = await notificationService.getNotifications(params);
      setNotifications(result.notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(
    (notification) => filter === "all" || !notification.interaction.isRead
  );

  const unreadCount = notifications.filter((n) => !n.interaction.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => 
          n._id === id 
            ? { ...n, interaction: { ...n.interaction, isRead: true } }
            : n
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => 
        prev.map((n) => ({ 
          ...n, 
          interaction: { ...n.interaction, isRead: true } 
        }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
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
        return <Star className="h-5 w-5" />;
      case 'message':
      case 'message_reaction':
        return <MessageSquare className="h-5 w-5" />;
      case 'payment_received':
      case 'payment_sent':
        return <DollarSign className="h-5 w-5" />;
      case 'verification_approved':
      case 'verification_rejected':
        return <Shield className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationStyles = (
    priority: string,
    isRead: boolean
  ) => {
    const base = "p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4";

    if (isRead) {
      return `${base} bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600`;
    }

    switch (priority) {
      case "urgent":
        return `${base} bg-red-50 dark:bg-red-900/20 border-red-500`;
      case "high":
        return `${base} bg-orange-50 dark:bg-orange-900/20 border-orange-500`;
      case "medium":
        return `${base} bg-blue-50 dark:bg-blue-900/20 border-blue-500`;
      case "low":
        return `${base} bg-gray-50 dark:bg-gray-900/20 border-gray-500`;
      default:
        return `${base} bg-primary-50 dark:bg-primary-900/20 border-primary-500`;
    }
  };

  const getIconStyles = (priority: string, isRead: boolean) => {
    const base = "h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors";

    if (isRead) {
      return `${base} bg-neutral-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300`;
    }

    switch (priority) {
      case "urgent":
        return `${base} bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300`;
      case "high":
        return `${base} bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-300`;
      case "medium":
        return `${base} bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300`;
      case "low":
        return `${base} bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300`;
      default:
        return `${base} bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Notifications
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={loadNotifications} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Notifications
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
            Stay updated with your latest activities and important updates
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
            leftIcon={<Check className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-2">
        <Button
          onClick={() => setFilter("all")}
          variant={filter === "all" ? "primary" : "outline"}
          size="sm"
          leftIcon={<Bell className="h-4 w-4" />}
          className="flex-1 sm:flex-none"
        >
          <span className="hidden sm:inline">All ({notifications.length})</span>
          <span className="sm:hidden">All</span>
        </Button>
        <Button
          onClick={() => setFilter("unread")}
          variant={filter === "unread" ? "primary" : "outline"}
          size="sm"
          leftIcon={<AlertCircle className="h-4 w-4" />}
          className="flex-1 sm:flex-none"
        >
          <span className="hidden sm:inline">Unread ({unreadCount})</span>
          <span className="sm:hidden">Unread</span>
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => (
            <div key={n._id} className={getNotificationStyles(n.smart.priority, n.interaction.isRead)}>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className={getIconStyles(n.smart.priority, n.interaction.isRead)}>
                    {getNotificationIcon(n.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {n.title}
                        </p>
                        {!n.interaction.isRead && (
                          <div className="h-2 w-2 bg-primary-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 break-words">
                        {n.message}
                      </p>
                      
                      {/* Rich Content */}
                      {n.richContent?.metadata && (
                        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                          {n.richContent.metadata.jobTitle && (
                            <span>Job: {n.richContent.metadata.jobTitle}</span>
                          )}
                          {n.richContent.metadata.companyName && (
                            <span> • {n.richContent.metadata.companyName}</span>
                          )}
                          {n.richContent.metadata.amount && (
                            <span> • ₹{n.richContent.metadata.amount}</span>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                        {n.timeAgo}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:ml-4">
                      {!n.interaction.isRead && (
                        <Button
                          onClick={() => markAsRead(n._id)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<CheckCircle className="h-4 w-4" />}
                          className="w-full sm:w-auto"
                        >
                          <span className="hidden sm:inline">Mark Read</span>
                          <span className="sm:hidden">Read</span>
                        </Button>
                      )}
                      {n.richContent?.actionButtons?.map((button, index) => (
                        <Link key={index} to={button.url || '#'} className="w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            {button.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <ElevatedCard>
            <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
              <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                No notifications
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </CardContent>
          </ElevatedCard>
        )}
      </div>
    </div>
  );
};
