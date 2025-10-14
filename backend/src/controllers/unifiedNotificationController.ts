import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { UnifiedNotification } from '../models/UnifiedNotification';
import { CrossModuleActivity } from '../models/CrossModuleActivity';
import { sendNotificationToUser } from '../services/socketService';
import mongoose from 'mongoose';

// Unified Notification System for Cross-Module Integration

// Create cross-module notification
export const createCrossModuleNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      type, 
      title, 
      message, 
      module, 
      targetUserId, 
      relatedData,
      priority = 'medium',
      actionUrl 
    } = req.body;
    const userId = req.user._id;

    // Create unified notification
    const notification = new UnifiedNotification({
      userId: targetUserId || userId,
      type,
      title,
      message,
      module,
      priority,
      actionUrl,
      relatedData: {
        ...relatedData,
        triggeredBy: userId,
        timestamp: new Date()
      },
      isRead: false
    });

    await notification.save();

    // Create cross-module activity record
    const activity = new CrossModuleActivity({
      userId: targetUserId || userId,
      module,
      action: type,
      data: relatedData,
      triggeredBy: userId,
      timestamp: new Date()
    });

    await activity.save();

    // Send real-time notification
    sendNotificationToUser(req.io, targetUserId || userId, {
      id: notification._id,
      type,
      title,
      message,
      module,
      priority,
      actionUrl,
      timestamp: notification.createdAt
    });

    res.status(201).json({
      success: true,
      message: 'Cross-module notification created successfully',
      data: { notification }
    });
  } catch (error) {
    console.error('Create cross-module notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get unified notifications for user
export const getUnifiedNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, module, priority, unreadOnly } = req.query;
    const userId = req.user._id;

    const skip = (Number(page) - 1) * Number(limit);
    let query: any = { userId };

    // Filter by module
    if (module) {
      query.module = module;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by read status
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await UnifiedNotification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await UnifiedNotification.countDocuments(query);
    const unreadCount = await UnifiedNotification.countDocuments({ 
      userId, 
      isRead: false 
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalNotifications: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get unified notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await UnifiedNotification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

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
    const userId = req.user._id;

    await UnifiedNotification.updateMany(
      { userId, isRead: false },
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

// Get notification preferences
export const getNotificationPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    // This would typically come from user preferences
    // For now, return default preferences
    const preferences = {
      messaging: {
        newMessage: true,
        messageReaction: true,
        typingIndicator: false,
        onlineStatus: true
      },
      community: {
        postLiked: true,
        postCommented: true,
        postShared: false,
        newFollower: true
      },
      gang: {
        connectionRequest: true,
        connectionAccepted: true,
        gangActivity: true,
        mutualConnection: true
      },
      jobs: {
        applicationStatus: true,
        jobMatch: true,
        interviewScheduled: true,
        jobPosted: false
      },
      crossModule: {
        activitySummary: true,
        smartSuggestions: true,
        trendingContent: false,
        weeklyDigest: true
      }
    };

    res.json({
      success: true,
      data: { preferences }
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { preferences } = req.body;
    const userId = req.user._id;

    // This would typically update user preferences in the database
    // For now, just return success
    res.json({
      success: true,
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get cross-module activity feed
export const getCrossModuleActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, module, timeframe = '7d' } = req.query;
    const userId = req.user._id;

    const skip = (Number(page) - 1) * Number(limit);
    let query: any = { userId };

    // Filter by module
    if (module) {
      query.module = module;
    }

    // Filter by timeframe
    let dateFilter: any = {};
    switch (timeframe) {
      case '1d':
        dateFilter = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
        break;
      case '7d':
        dateFilter = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
        break;
    }
    query.timestamp = dateFilter;

    const activities = await CrossModuleActivity.find(query)
      .populate('triggeredBy', 'fullName email profilePhoto')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await CrossModuleActivity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalActivities: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get cross-module activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Smart notification suggestions
export const getSmartNotificationSuggestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    // This would analyze user behavior and suggest relevant notifications
    const suggestions = [
      {
        type: 'gang_activity',
        title: 'Gang Member Posted',
        message: 'John Doe shared a new community post about React development',
        priority: 'medium',
        actionUrl: '/community/post/123',
        module: 'community'
      },
      {
        type: 'job_match',
        title: 'Job Match Found',
        message: 'A new job matches your skills and location preferences',
        priority: 'high',
        actionUrl: '/jobs/456',
        module: 'jobs'
      },
      {
        type: 'connection_suggestion',
        title: 'Connection Suggestion',
        message: 'Connect with Sarah Wilson - you have 3 mutual connections',
        priority: 'low',
        actionUrl: '/gang-members',
        module: 'gang'
      }
    ];

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Get smart notification suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Notification analytics
export const getNotificationAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { timeframe = '30d' } = req.query;

    let dateFilter: any = {};
    switch (timeframe) {
      case '7d':
        dateFilter = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) };
        break;
    }

    // Get notification statistics
    const totalNotifications = await UnifiedNotification.countDocuments({
      userId,
      createdAt: dateFilter
    });

    const unreadNotifications = await UnifiedNotification.countDocuments({
      userId,
      isRead: false,
      createdAt: dateFilter
    });

    const notificationsByModule = await UnifiedNotification.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: dateFilter } },
      {
        $group: {
          _id: '$module',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      }
    ]);

    const notificationsByPriority = await UnifiedNotification.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: dateFilter } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalNotifications,
        unreadNotifications,
        readRate: totalNotifications > 0 ? ((totalNotifications - unreadNotifications) / totalNotifications) * 100 : 0,
        byModule: notificationsByModule,
        byPriority: notificationsByPriority,
        timeframe
      }
    });
  } catch (error) {
    console.error('Get notification analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

