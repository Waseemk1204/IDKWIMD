import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Notification } from '../models/Notification';
import { getNotificationService } from '../services/notificationService';
import { AuthRequest } from '../middlewares/auth';

// Get user's notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    
    const notificationService = getNotificationService();
    const result = await notificationService.getUserNotifications(
      req.user._id,
      Number(page),
      Number(limit),
      unreadOnly === 'true'
    );

    res.json({
      success: true,
      data: {
        notifications: result.notifications,
        unreadCount: result.unreadCount,
        pagination: {
          current: Number(page),
          pages: Math.ceil(result.total / Number(limit)),
          total: result.total
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const notificationService = getNotificationService();
    const success = await notificationService.markAsRead(id, req.user._id);

    if (!success) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notificationService = getNotificationService();
    const count = await notificationService.markAllAsRead(req.user._id);

    res.json({
      success: true,
      message: `${count} notifications marked as read`
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const notificationService = getNotificationService();
    const success = await notificationService.deleteNotification(id, req.user._id);

    if (!success) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Clear all notifications
export const clearAllNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notificationService = getNotificationService();
    const count = await notificationService.deleteAllNotifications(req.user._id);

    res.json({
      success: true,
      message: `${count} notifications cleared`
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notificationService = getNotificationService();
    const stats = await notificationService.getNotificationStats(req.user._id);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get notification settings (placeholder for future implementation)
export const getNotificationSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // This would typically come from user preferences
    const settings = {
      emailNotifications: true,
      pushNotifications: true,
      jobAlerts: true,
      messageNotifications: true,
      applicationUpdates: true,
      blogNotifications: false,
      connectionRequests: true,
      verificationUpdates: true,
      paymentNotifications: true,
      communityInteractions: true
    };

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update notification settings (placeholder for future implementation)
export const updateNotificationSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { settings } = req.body;

    // This would typically update user preferences in the database
    // For now, just return success

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: { settings }
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};