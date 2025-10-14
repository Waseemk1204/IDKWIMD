import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { EnhancedNotificationService } from '../services/EnhancedNotificationService';
import { NotificationPreferences } from '../models/NotificationPreferences';
import mongoose from 'mongoose';

// Get enhanced notification service instance
const getNotificationService = (req: AuthRequest) => {
  return EnhancedNotificationService.getInstance(req.io);
};

// Get user notifications with advanced filtering and smart grouping
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('EnhancedNotificationController - getNotifications called');
    console.log('User ID:', req.user._id);
    console.log('Query params:', req.query);
    
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type,
      priority,
      grouped = false
    } = req.query;

    const notificationService = getNotificationService(req);
    
    const result = await notificationService.getUserNotifications(new mongoose.Types.ObjectId(req.user._id), {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      unreadOnly: unreadOnly === 'true',
      type: type as string,
      priority: priority as string
    });

    console.log('EnhancedNotificationController - result:', result);

    // Apply smart grouping if requested
    if (grouped === 'true') {
      result.notifications = await groupNotifications(result.notifications);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Mark notification as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    
    const notificationService = getNotificationService(req);
    await notificationService.markAsRead(notificationId, new mongoose.Types.ObjectId(req.user._id));

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await EnhancedNotification.updateMany(
      { recipient: new mongoose.Types.ObjectId(req.user._id), 'interaction.isRead': false },
      { 
        'interaction.isRead': true,
        'interaction.readAt': new Date()
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

// Track notification interaction
export const trackInteraction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const { action } = req.body;

    const notificationService = getNotificationService(req);
    await notificationService.trackInteraction(notificationId, new mongoose.Types.ObjectId(req.user._id), action);

    res.json({
      success: true,
      message: 'Interaction tracked'
    });
  } catch (error) {
    console.error('Track interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track interaction'
    });
  }
};

// Get notification preferences
export const getPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let preferences = await NotificationPreferences.findOne({ userId: new mongoose.Types.ObjectId(req.user._id) });
    
    if (!preferences) {
      preferences = new NotificationPreferences({ userId: new mongoose.Types.ObjectId(req.user._id) });
      await preferences.save();
    }

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences'
    });
  }
};

// Update notification preferences
export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const preferences = await NotificationPreferences.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(req.user._id) },
      req.body,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    
    const [
      totalNotifications,
      unreadNotifications,
      notificationsByType,
      notificationsByPriority,
      recentActivity
    ] = await Promise.all([
      EnhancedNotification.countDocuments({ recipient: userId }),
      EnhancedNotification.countDocuments({ 
        recipient: userId, 
        'interaction.isRead': false 
      }),
      EnhancedNotification.aggregate([
        { $match: { recipient: userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      EnhancedNotification.aggregate([
        { $match: { recipient: userId } },
        { $group: { _id: '$smart.priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      EnhancedNotification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('type createdAt interaction.isRead smart.priority')
    ]);

    res.json({
      success: true,
      data: {
        total: totalNotifications,
        unread: unreadNotifications,
        byType: notificationsByType,
        byPriority: notificationsByPriority,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics'
    });
  }
};

// Create test notification (for development/testing)
export const createTestNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      type = 'system',
      title = 'Test Notification',
      message = 'This is a test notification',
      priority = 'medium',
      channels = ['inApp']
    } = req.body;

    const notificationService = getNotificationService(req);
    
    const notification = await notificationService.createNotification({
      recipient: new mongoose.Types.ObjectId(req.user._id),
      sender: new mongoose.Types.ObjectId(req.user._id),
      type: type as any,
      title,
      message,
      priority: priority as any,
      channels: channels as any,
      context: {
        module: 'profile'
      }
    });

    res.json({
      success: true,
      message: 'Test notification created',
      data: notification
    });
  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification'
    });
  }
};

// Smart grouping helper function
async function groupNotifications(notifications: any[]): Promise<any[]> {
  const grouped: any[] = [];
  const groups: { [key: string]: any[] } = {};

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
      const groupedNotification = {
        ...groupNotifications[0],
        _id: `grouped_${groupKey}_${Date.now()}`,
        title: `${groupNotifications.length} ${groupNotifications[0].type.replace('_', ' ')} notifications`,
        message: `You have ${groupNotifications.length} new ${groupNotifications[0].type.replace('_', ' ')} notifications`,
        grouped: true,
        groupCount: groupNotifications.length,
        groupNotifications: groupNotifications
      };
      
      grouped.push(groupedNotification);
    } else {
      grouped.push(groupNotifications[0]);
    }
  });

  return grouped;
}

// Import EnhancedNotification model
import { EnhancedNotification } from '../models/EnhancedNotification';
