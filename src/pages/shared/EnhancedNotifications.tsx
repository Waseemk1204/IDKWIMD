import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { apiService as api } from '../../services/api';

export const EnhancedNotifications: React.FC = () => {
  console.log('EnhancedNotifications component loaded');
  
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    console.log('loadNotifications called');
    setIsLoading(true);
    try {
      const response = await api.getNotifications({
        limit: 10,
        unreadOnly: false
      });
      
      console.log('API response:', response);
      
      if (response.success) {
        const notificationsData = response.data?.notifications || [];
        console.log('Setting notifications:', notificationsData);
        console.log('Notifications length:', notificationsData.length);
        setNotifications(notificationsData);
      } else {
        console.log('API returned success: false');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect called, user:', user);
    if (user) {
      loadNotifications();
    }
  }, [user]);

  if (!user) {
    console.log('No user found, returning loading state');
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('Render - notifications state:', notifications);
  console.log('Render - notifications length:', notifications.length);
  console.log('Render - isLoading:', isLoading);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-neutral-100">
            Notifications
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Manage your notifications and preferences
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
          </CardContent>
        </Card>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(notification => (
            <Card key={notification._id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/20 flex-shrink-0">
                    <Bell className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have any notifications yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};