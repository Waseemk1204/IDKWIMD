import React, { useState } from "react";
import { ElevatedCard, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Link } from "react-router-dom"; // ✅ FIX: use react-router-dom instead of next/link
import { useAuth } from "../../hooks/useAuth";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Briefcase,
  Clock,
  MessageSquare,
  Shield,
  Star,
  Check, // ✅ FIX: using Check icon for mark all as read
} from "lucide-react";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
}

// Generate role-specific notifications
const generateNotifications = (userRole: string): Notification[] => {
  if (userRole === 'employer') {
    return [
      {
        id: "1",
        type: "info",
        title: "New Job Application",
        message:
          "Aditya Sharma (4.8★) has applied for your 'Content Writer' position. Review their profile and portfolio.",
        timestamp: "30 minutes ago",
        isRead: false,
        icon: <Briefcase className="h-5 w-5" />,
        action: {
          label: "Review Application",
          href: "/employer/jobs",
        },
      },
      {
        id: "2",
        type: "success",
        title: "Payment Processed",
        message:
          "Payment of ₹5,000 has been successfully processed to Janu Patel for web development work.",
        timestamp: "2 hours ago",
        isRead: false,
        icon: <DollarSign className="h-5 w-5" />,
        action: {
          label: "View Transaction",
          href: "/employer/wallet",
        },
      },
      {
        id: "3",
        type: "warning",
        title: "Timesheet Approval Needed",
        message:
          "3 timesheets are pending your approval. Review and approve them to process payments on time.",
        timestamp: "6 hours ago",
        isRead: true,
        icon: <Clock className="h-5 w-5" />,
        action: {
          label: "Review Timesheets",
          href: "/employer/timesheets",
        },
      },
      {
        id: "4",
        type: "success",
        title: "Job Post Approved",
        message:
          'Your job posting "Digital Marketing Specialist" has been approved and is now live on the platform.',
        timestamp: "1 day ago",
        isRead: true,
        icon: <CheckCircle className="h-5 w-5" />,
        action: {
          label: "View Job Post",
          href: "/employer/jobs",
        },
      },
      {
        id: "5",
        type: "info",
        title: "Message from Worker",
        message:
          "Rahul Singh has sent you an update about the project milestone completion and next deliverables.",
        timestamp: "2 days ago",
        isRead: true,
        icon: <MessageSquare className="h-5 w-5" />,
        action: {
          label: "Read Message",
          href: "/messaging",
        },
      },
      {
        id: "6",
        type: "success",
        title: "Company Verification Renewed",
        message:
          "Your company verification has been renewed for another year. All premium employer features are now active.",
        timestamp: "1 week ago",
        isRead: true,
        icon: <Shield className="h-5 w-5" />,
        action: {
          label: "View Profile",
          href: "/profile",
        },
      },
    ];
  } else {
    // Employee notifications
    return [
      {
        id: "1",
        type: "success",
        title: "Payment Received",
        message:
          "You have received a payment of ₹8,000 from TechSolutions for your recent work on the web development project.",
        timestamp: "10 minutes ago",
        isRead: false,
        icon: <DollarSign className="h-5 w-5" />,
        action: {
          label: "View Details",
          href: "/employee/wallet",
        },
      },
      {
        id: "2",
        type: "info",
        title: "Job Application Approved",
        message:
          'Your application for "Content Writer" at Creative Agency has been approved. You can now start working on this project.',
        timestamp: "2 hours ago",
        isRead: false,
        icon: <Briefcase className="h-5 w-5" />,
        action: {
          label: "View Job",
          href: "/employee/jobs",
        },
      },
      {
        id: "3",
        type: "warning",
        title: "Timesheet Reminder",
        message:
          "Don't forget to submit your timesheet for this week. The deadline is tomorrow at 5 PM.",
        timestamp: "4 hours ago",
        isRead: true,
        icon: <Clock className="h-5 w-5" />,
        action: {
          label: "Submit Now",
          href: "/employee/timesheet",
        },
      },
      {
        id: "4",
        type: "info",
        title: "New Message",
        message:
          "Sarah from TechCorp has sent you a message regarding the project timeline and next steps.",
        timestamp: "1 day ago",
        isRead: true,
        icon: <MessageSquare className="h-5 w-5" />,
        action: {
          label: "Read Message",
          href: "/messaging",
        },
      },
      {
        id: "5",
        type: "success",
        title: "Profile Verified",
        message:
          "Congratulations! Your profile has been successfully verified. You now have access to premium job opportunities.",
        timestamp: "2 days ago",
        isRead: true,
        icon: <Shield className="h-5 w-5" />,
        action: {
          label: "View Profile",
          href: "/profile",
        },
      },
      {
        id: "6",
        type: "info",
        title: "New Job Matches",
        message:
          "We found 5 new job opportunities that match your skills and preferences. Check them out now!",
        timestamp: "3 days ago",
        isRead: true,
        icon: <Star className="h-5 w-5" />,
        action: {
          label: "Browse Jobs",
          href: "/employee/jobs",
        },
      },
    ];
  }
};

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] =
    useState<Notification[]>(generateNotifications(user?.role || 'employee'));
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter(
    (notification) => filter === "all" || !notification.isRead
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getNotificationStyles = (
    type: Notification["type"],
    isRead: boolean
  ) => {
    const base =
      "p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4";

    if (isRead) {
      return `${base} bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600`;
    }

    switch (type) {
      case "success":
        return `${base} bg-success-50 dark:bg-success-900/20 border-success-500`;
      case "warning":
        return `${base} bg-warning-50 dark:bg-warning-900/20 border-warning-500`;
      case "error":
        return `${base} bg-error-50 dark:bg-error-900/20 border-error-500`;
      default:
        return `${base} bg-primary-50 dark:bg-primary-900/20 border-primary-500`;
    }
  };

  const getIconStyles = (type: Notification["type"], isRead: boolean) => {
    const base =
      "h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors";

    if (isRead) {
      return `${base} bg-neutral-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300`;
    }

    switch (type) {
      case "success":
        return `${base} bg-success-100 dark:bg-success-800 text-success-600 dark:text-success-300`;
      case "warning":
        return `${base} bg-warning-100 dark:bg-warning-800 text-warning-600 dark:text-warning-300`;
      case "error":
        return `${base} bg-error-100 dark:bg-error-800 text-error-600 dark:text-error-300`;
      default:
        return `${base} bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300`;
    }
  };

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
            <div key={n.id} className={getNotificationStyles(n.type, n.isRead)}>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className={getIconStyles(n.type, n.isRead)}>
                    {n.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <div className="h-2 w-2 bg-primary-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 break-words">
                        {n.message}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                        {n.timestamp}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:ml-4">
                      {!n.isRead && (
                        <Button
                          onClick={() => markAsRead(n.id)}
                          variant="ghost"
                          size="sm"
                          leftIcon={<CheckCircle className="h-4 w-4" />}
                          className="w-full sm:w-auto"
                        >
                          <span className="hidden sm:inline">Mark Read</span>
                          <span className="sm:hidden">Read</span>
                        </Button>
                      )}
                      {n.action && (
                        <Link to={n.action.href} className="w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            {n.action.label}
                          </Button>
                        </Link>
                      )}
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
