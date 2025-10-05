import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CrossModuleActivity, ICrossModuleActivity } from '../models/CrossModuleActivity';
import { UnifiedNotification, IUnifiedNotification } from '../models/UnifiedNotification';
import { UnifiedUserContext, IUnifiedUserContext } from '../models/UnifiedUserContext';
import { ConnectionAnalytics } from '../models/ConnectionAnalytics';
import { Connection } from '../models/Connection';
import { CommunityPost } from '../models/CommunityPost';
import { Job } from '../models/Job';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/auth';

export class UnifiedIntegrationService {
  /**
   * Track cross-module activity
   */
  static async trackActivity(
    userId: string,
    module: 'jobs' | 'community' | 'gang' | 'messaging' | 'wallet' | 'timesheet',
    action: string,
    targetId?: string,
    targetType?: 'job' | 'post' | 'user' | 'message' | 'connection' | 'transaction',
    metadata?: any
  ): Promise<ICrossModuleActivity> {
    const activity = new CrossModuleActivity({
      userId: new mongoose.Types.ObjectId(userId),
      module,
      action,
      targetId: targetId ? new mongoose.Types.ObjectId(targetId) : undefined,
      targetType,
      metadata: metadata || {},
      impactScore: this.calculateImpactScore(module, action, metadata)
    });

    await activity.save();
    
    // Update user context
    await this.updateUserContext(userId);
    
    // Trigger cross-module notifications if impact is high
    if (activity.impactScore > 50) {
      await this.triggerCrossModuleNotifications(userId, activity);
    }

    return activity;
  }

  /**
   * Calculate impact score for cross-module activity
   */
  private static calculateImpactScore(
    module: string,
    action: string,
    metadata?: any
  ): number {
    let score = 0;

    // High impact actions
    if (action === 'connection_accepted' || action === 'job_applied' || action === 'post_created') {
      score = 80;
    } else if (action === 'message_sent' || action === 'post_liked' || action === 'comment_created') {
      score = 60;
    } else if (action === 'profile_viewed' || action === 'job_viewed') {
      score = 30;
    } else {
      score = 20;
    }

    // Adjust based on metadata
    if (metadata?.connectionStrength && metadata.connectionStrength > 70) {
      score += 20;
    }
    if (metadata?.mutualConnections && metadata.mutualConnections > 5) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  /**
   * Update user context with latest activity
   */
  private static async updateUserContext(userId: string): Promise<void> {
    let context = await UnifiedUserContext.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!context) {
      context = new UnifiedUserContext({
        userId: new mongoose.Types.ObjectId(userId),
        crossModuleProfile: {
          totalEngagement: 0,
          moduleActivity: {
            jobs: { applicationsCount: 0, lastApplication: undefined, averageResponseTime: 0, successRate: 0 },
            community: { postsCount: 0, lastPost: undefined, likesReceived: 0, commentsReceived: 0 },
            gang: { connectionsCount: 0, lastConnection: undefined, averageConnectionStrength: 0, mutualConnectionsCount: 0 },
            messaging: { messagesSent: 0, lastMessage: undefined, activeConversations: 0, responseRate: 0 },
            wallet: { transactionsCount: 0, lastTransaction: undefined, totalEarned: 0, totalSpent: 0 }
          },
          networkMetrics: { influenceScore: 0, reachScore: 0, engagementScore: 0, crossModuleActivity: 0 },
          preferences: {
            notificationSettings: {
              crossModuleAlerts: true,
              gangActivityAlerts: true,
              communityEngagementAlerts: true,
              jobRecommendationAlerts: true,
              unifiedActivitySummary: true
            },
            privacySettings: {
              showCrossModuleActivity: true,
              showGangActivityToCommunity: true,
              showJobActivityToGang: true,
              showCommunityActivityToGang: true
            },
            integrationSettings: {
              autoConnectOnJobApplication: false,
              autoShareJobToGang: false,
              autoNotifyGangOnCommunityPost: false,
              enableCrossModuleRecommendations: true
            }
          }
        }
      });
    }

    // Update module activity based on recent activities
    const recentActivities = await CrossModuleActivity.find({
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }).sort({ createdAt: -1 });

    // Reset counters
    context.crossModuleProfile.moduleActivity = {
      jobs: { applicationsCount: 0, lastApplication: undefined, averageResponseTime: 0, successRate: 0 },
      community: { postsCount: 0, lastPost: undefined, likesReceived: 0, commentsReceived: 0 },
      gang: { connectionsCount: 0, lastConnection: undefined, averageConnectionStrength: 0, mutualConnectionsCount: 0 },
      messaging: { messagesSent: 0, lastMessage: undefined, activeConversations: 0, responseRate: 0 },
      wallet: { transactionsCount: 0, lastTransaction: undefined, totalEarned: 0, totalSpent: 0 }
    };

    // Count activities by module
    for (const activity of recentActivities) {
      switch (activity.module) {
        case 'jobs':
          if (activity.action === 'job_applied') {
            context.crossModuleProfile.moduleActivity.jobs.applicationsCount++;
            context.crossModuleProfile.moduleActivity.jobs.lastApplication = activity.createdAt;
          }
          break;
        case 'community':
          if (activity.action === 'post_created') {
            context.crossModuleProfile.moduleActivity.community.postsCount++;
            context.crossModuleProfile.moduleActivity.community.lastPost = activity.createdAt;
          }
          break;
        case 'gang':
          if (activity.action === 'connection_accepted') {
            context.crossModuleProfile.moduleActivity.gang.connectionsCount++;
            context.crossModuleProfile.moduleActivity.gang.lastConnection = activity.createdAt;
          }
          break;
        case 'messaging':
          if (activity.action === 'message_sent') {
            context.crossModuleProfile.moduleActivity.messaging.messagesSent++;
            context.crossModuleProfile.moduleActivity.messaging.lastMessage = activity.createdAt;
          }
          break;
        case 'wallet':
          if (activity.action === 'transaction_completed') {
            context.crossModuleProfile.moduleActivity.wallet.transactionsCount++;
            context.crossModuleProfile.moduleActivity.wallet.lastTransaction = activity.createdAt;
          }
          break;
      }
    }

    // Calculate additional metrics
    await this.calculateAdditionalMetrics(context);

    await context.save();
  }

  /**
   * Calculate additional metrics for user context
   */
  private static async calculateAdditionalMetrics(context: IUnifiedUserContext): Promise<void> {
    const userId = context.userId;

    // Calculate gang metrics
    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    });

    context.crossModuleProfile.moduleActivity.gang.connectionsCount = connections.length;

    // Calculate average connection strength
    const analytics = await ConnectionAnalytics.find({
      $or: [{ user1: userId }, { user2: userId }]
    });

    if (analytics.length > 0) {
      const totalStrength = analytics.reduce((sum, a) => sum + a.strength, 0);
      context.crossModuleProfile.moduleActivity.gang.averageConnectionStrength = totalStrength / analytics.length;
    }

    // Calculate community metrics
    const posts = await CommunityPost.find({ author: userId });
    context.crossModuleProfile.moduleActivity.community.postsCount = posts.length;

    // Calculate messaging metrics
    const messages = await Message.find({ sender: userId });
    context.crossModuleProfile.moduleActivity.messaging.messagesSent = messages.length;

    // Calculate active conversations
    const conversations = await Message.aggregate([
      { $match: { sender: userId } },
      { $group: { _id: '$conversation' } },
      { $count: 'activeConversations' }
    ]);

    context.crossModuleProfile.moduleActivity.messaging.activeConversations = 
      conversations.length > 0 ? conversations[0].activeConversations : 0;
  }

  /**
   * Trigger cross-module notifications
   */
  private static async triggerCrossModuleNotifications(
    userId: string,
    activity: ICrossModuleActivity
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;

    // Get user's connections
    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    });

    const connectedUserIds = connections.map(conn =>
      conn.requester.toString() === userId ? conn.recipient : conn.requester
    );

    // Create notifications based on activity type
    switch (activity.module) {
      case 'jobs':
        if (activity.action === 'job_applied') {
          // Notify gang members about job application
          for (const connectedUserId of connectedUserIds) {
            await this.createCrossModuleNotification(
              connectedUserId.toString(),
              userId,
              'gang_job_post',
              'Job Application Update',
              `${user.fullName} applied to a new job`,
              {
                sourceModule: 'jobs',
                targetModule: 'gang',
                sourceId: activity.targetId,
                crossModuleContext: {
                  connectionStrength: 50, // Default, could be calculated
                  activityRelevance: activity.impactScore
                }
              }
            );
          }
        }
        break;

      case 'community':
        if (activity.action === 'post_created') {
          // Notify gang members about community post
          for (const connectedUserId of connectedUserIds) {
            await this.createCrossModuleNotification(
              connectedUserId.toString(),
              userId,
              'community_connection',
              'New Community Post',
              `${user.fullName} shared a new post in the community`,
              {
                sourceModule: 'community',
                targetModule: 'gang',
                sourceId: activity.targetId,
                crossModuleContext: {
                  connectionStrength: 50,
                  activityRelevance: activity.impactScore
                }
              }
            );
          }
        }
        break;

      case 'gang':
        if (activity.action === 'connection_accepted') {
          // Notify about new connection
          const targetUser = await User.findById(activity.targetId);
          if (targetUser) {
            await this.createCrossModuleNotification(
              userId,
              activity.targetId!.toString(),
              'cross_module_activity',
              'Connection Accepted',
              `${targetUser.fullName} accepted your connection request`,
              {
                sourceModule: 'gang',
                targetModule: 'gang',
                sourceId: activity._id,
                crossModuleContext: {
                  connectionStrength: 100,
                  activityRelevance: activity.impactScore
                }
              }
            );
          }
        }
        break;
    }
  }

  /**
   * Create cross-module notification
   */
  private static async createCrossModuleNotification(
    recipientId: string,
    senderId: string,
    type: string,
    title: string,
    message: string,
    data: any
  ): Promise<IUnifiedNotification> {
    const notification = new UnifiedNotification({
      recipient: new mongoose.Types.ObjectId(recipientId),
      sender: new mongoose.Types.ObjectId(senderId),
      type: type as any,
      title,
      message,
      data,
      priority: 'medium'
    });

    await notification.save();
    return notification;
  }

  /**
   * Get unified activity feed for a user
   */
  static async getUnifiedActivityFeed(
    userId: string,
    limit: number = 20,
    page: number = 1
  ): Promise<{
    activities: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalActivities: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const skip = (page - 1) * limit;

    // Get user's connections for filtering
    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    });

    const connectedUserIds = connections.map(conn =>
      conn.requester.toString() === userId ? conn.recipient : conn.requester
    );

    // Get activities from connected users
    const activities = await CrossModuleActivity.find({
      userId: { $in: [...connectedUserIds, new mongoose.Types.ObjectId(userId)] },
      impactScore: { $gte: 30 } // Only show high-impact activities
    })
      .populate('userId', 'fullName profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CrossModuleActivity.countDocuments({
      userId: { $in: [...connectedUserIds, new mongoose.Types.ObjectId(userId)] },
      impactScore: { $gte: 30 }
    });

    return {
      activities: activities.map(activity => ({
        id: activity._id,
        userId: activity.userId,
        module: activity.module,
        action: activity.action,
        targetId: activity.targetId,
        targetType: activity.targetType,
        metadata: activity.metadata,
        impactScore: activity.impactScore,
        createdAt: activity.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalActivities: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get cross-module recommendations
   */
  static async getCrossModuleRecommendations(userId: string): Promise<{
    jobRecommendations: any[];
    connectionRecommendations: any[];
    communityRecommendations: any[];
  }> {
    const userContext = await UnifiedUserContext.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!userContext) {
      return { jobRecommendations: [], connectionRecommendations: [], communityRecommendations: [] };
    }

    // Get user's connections for context
    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    });

    const connectedUserIds = connections.map(conn =>
      conn.requester.toString() === userId ? conn.recipient : conn.requester
    );

    // Job recommendations based on gang member activity
    const gangJobRecommendations = await Job.aggregate([
      { $match: { status: 'active' } },
      { $lookup: {
        from: 'applications',
        localField: '_id',
        foreignField: 'job',
        as: 'applications'
      }},
      { $match: { 'applications.user': { $in: connectedUserIds } } },
      { $limit: 5 }
    ]);

    // Connection recommendations based on community activity
    const communityConnectionRecommendations = await User.aggregate([
      { $match: { 
        _id: { $nin: [...connectedUserIds, new mongoose.Types.ObjectId(userId)] },
        role: 'employee'
      }},
      { $lookup: {
        from: 'communityposts',
        localField: '_id',
        foreignField: 'author',
        as: 'posts'
      }},
      { $match: { 'posts.0': { $exists: true } } },
      { $limit: 5 }
    ]);

    // Community recommendations based on job interests
    const communityRecommendations = await CommunityPost.aggregate([
      { $match: { status: 'active' } },
      { $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }},
      { $unwind: '$author' },
      { $limit: 5 }
    ]);

    return {
      jobRecommendations: gangJobRecommendations,
      connectionRecommendations: communityConnectionRecommendations,
      communityRecommendations: communityRecommendations
    };
  }
}

