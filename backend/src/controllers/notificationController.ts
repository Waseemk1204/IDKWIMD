import { Request, Response } from 'express';
import Notification, { INotification } from '../models/Notification';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

// Get user's notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;

    const filter: any = { user: req.user._id };
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      isRead: false 
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalNotifications: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
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

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
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
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
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

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id
    });

    if (!notification) {
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
    await Notification.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
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
      blogNotifications: false
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
