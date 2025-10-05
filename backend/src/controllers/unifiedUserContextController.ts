import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { UnifiedUserContext } from '../models/UnifiedUserContext';
import { CrossModuleActivity } from '../models/CrossModuleActivity';
import { ConnectionAnalytics } from '../models/ConnectionAnalytics';
import { CommunityPost } from '../models/CommunityPost';
import { Application } from '../models/Application';
import { Message } from '../models/Message';
import User from '../models/User';
import mongoose from 'mongoose';

// Unified User Context Service for Cross-Module Integration

// Get unified user context
export const getUnifiedUserContext = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    // Get or create unified user context
    let userContext = await UnifiedUserContext.findOne({ userId });
    
    if (!userContext) {
      // Create new unified context
      userContext = new UnifiedUserContext({
        userId,
        crossModuleProfile: {
          totalEngagement: 0,
          moduleActivity: {
            jobs: {
              applicationsCount: 0,
              lastApplication: new Date(),
              averageResponseTime: 0,
              successRate: 0
            },
            community: {
              postsCount: 0,
              lastPost: new Date(),
              likesReceived: 0,
              commentsReceived: 0
            },
            gang: {
              connectionsCount: 0,
              lastConnection: new Date(),
              averageConnectionStrength: 0,
              mutualConnectionsCount: 0
            },
            messaging: {
              messagesSent: 0,
              lastMessage: new Date(),
              activeConversations: 0,
              responseRate: 0
            },
            wallet: {
              transactionsCount: 0,
              lastTransaction: new Date(),
              totalEarned: 0,
              totalSpent: 0
            }
          },
          networkMetrics: {
            influenceScore: 0,
            reachScore: 0,
            engagementScore: 0,
            crossModuleActivity: 0
          },
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
      
      await userContext.save();
    }

    // Update context with real-time data
    await updateUserContextMetrics(userId, userContext);

    res.json({
      success: true,
      data: { userContext }
    });
  } catch (error) {
    console.error('Get unified user context error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user context metrics
const updateUserContextMetrics = async (userId: string, userContext: any): Promise<void> => {
  try {
    // Get job activity
    const jobApplications = await Application.find({ applicant: userId });
    const jobActivity = {
      applicationsCount: jobApplications.length,
      lastApplication: jobApplications.length > 0 ? jobApplications[jobApplications.length - 1].createdAt : new Date(),
      averageResponseTime: 0, // This would be calculated from application responses
      successRate: 0 // This would be calculated from application outcomes
    };

    // Get community activity
    const communityPosts = await CommunityPost.find({ author: userId });
    const communityActivity = {
      postsCount: communityPosts.length,
      lastPost: communityPosts.length > 0 ? communityPosts[communityPosts.length - 1].createdAt : new Date(),
      likesReceived: communityPosts.reduce((sum, post) => sum + (post.likes || 0), 0),
      commentsReceived: communityPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)
    };

    // Get gang activity
    const connectionAnalytics = await ConnectionAnalytics.find({
      $or: [{ user1: userId }, { user2: userId }]
    });
    const gangActivity = {
      connectionsCount: connectionAnalytics.length,
      lastConnection: connectionAnalytics.length > 0 ? connectionAnalytics[connectionAnalytics.length - 1].createdAt : new Date(),
      averageConnectionStrength: connectionAnalytics.length > 0 
        ? connectionAnalytics.reduce((sum, conn) => sum + (conn.strength || 0), 0) / connectionAnalytics.length 
        : 0,
      mutualConnectionsCount: 0 // This would be calculated from mutual connections
    };

    // Get messaging activity
    const messages = await Message.find({ sender: userId });
    const messagingActivity = {
      messagesSent: messages.length,
      lastMessage: messages.length > 0 ? messages[messages.length - 1].createdAt : new Date(),
      activeConversations: 0, // This would be calculated from active conversations
      responseRate: 0 // This would be calculated from message responses
    };

    // Calculate network metrics
    const totalEngagement = jobActivity.applicationsCount + communityActivity.postsCount + 
                           gangActivity.connectionsCount + messagingActivity.messagesSent;

    const influenceScore = Math.min(100, (communityActivity.likesReceived + communityActivity.commentsReceived) / 10);
    const reachScore = Math.min(100, gangActivity.connectionsCount * 5);
    const engagementScore = Math.min(100, totalEngagement / 5);
    const crossModuleActivity = Math.min(100, 
      (jobActivity.applicationsCount > 0 ? 25 : 0) +
      (communityActivity.postsCount > 0 ? 25 : 0) +
      (gangActivity.connectionsCount > 0 ? 25 : 0) +
      (messagingActivity.messagesSent > 0 ? 25 : 0)
    );

    // Update user context
    userContext.crossModuleProfile.totalEngagement = totalEngagement;
    userContext.crossModuleProfile.moduleActivity.jobs = jobActivity;
    userContext.crossModuleProfile.moduleActivity.community = communityActivity;
    userContext.crossModuleProfile.moduleActivity.gang = gangActivity;
    userContext.crossModuleProfile.moduleActivity.messaging = messagingActivity;
    userContext.crossModuleProfile.networkMetrics = {
      influenceScore,
      reachScore,
      engagementScore,
      crossModuleActivity
    };
    userContext.lastUpdated = new Date();

    await userContext.save();
  } catch (error) {
    console.error('Update user context metrics error:', error);
  }
};

// Get user's cross-module activity summary
export const getCrossModuleActivitySummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { timeframe = '7d' } = req.query;

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

    // Get activities across all modules
    const activities = await CrossModuleActivity.find({
      userId,
      timestamp: dateFilter
    }).sort({ timestamp: -1 });

    // Group activities by module
    const activitiesByModule = activities.reduce((acc, activity) => {
      if (!acc[activity.module]) {
        acc[activity.module] = [];
      }
      acc[activity.module].push(activity);
      return acc;
    }, {} as any);

    // Calculate summary statistics
    const summary = {
      totalActivities: activities.length,
      byModule: Object.keys(activitiesByModule).map(module => ({
        module,
        count: activitiesByModule[module].length,
        lastActivity: activitiesByModule[module][0]?.timestamp
      })),
      mostActiveModule: Object.keys(activitiesByModule).reduce((a, b) => 
        activitiesByModule[a].length > activitiesByModule[b].length ? a : b, ''),
      timeframe
    };

    res.json({
      success: true,
      data: { summary, activities: activities.slice(0, 20) }
    });
  } catch (error) {
    console.error('Get cross-module activity summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's network insights
export const getUserNetworkInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    // Get user context
    const userContext = await UnifiedUserContext.findOne({ userId });
    if (!userContext) {
      res.status(404).json({
        success: false,
        message: 'User context not found'
      });
      return;
    }

    // Get connection analytics
    const connectionAnalytics = await ConnectionAnalytics.find({
      $or: [{ user1: userId }, { user2: userId }]
    });

    // Get community engagement
    const communityPosts = await CommunityPost.find({ author: userId });
    const totalLikes = communityPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalComments = communityPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);

    // Get job application success rate
    const jobApplications = await Application.find({ applicant: userId });
    const successfulApplications = jobApplications.filter(app => app.status === 'accepted').length;
    const successRate = jobApplications.length > 0 ? (successfulApplications / jobApplications.length) * 100 : 0;

    // Calculate insights
    const insights = {
      networkStrength: userContext.crossModuleProfile.networkMetrics.influenceScore,
      engagementLevel: userContext.crossModuleProfile.networkMetrics.engagementScore,
      crossModuleActivity: userContext.crossModuleProfile.networkMetrics.crossModuleActivity,
      connectionQuality: connectionAnalytics.length > 0 
        ? connectionAnalytics.reduce((sum, conn) => sum + (conn.strength || 0), 0) / connectionAnalytics.length 
        : 0,
      communityInfluence: totalLikes + totalComments,
      jobSuccessRate: successRate,
      recommendations: generateNetworkRecommendations(userContext, connectionAnalytics, communityPosts, jobApplications)
    };

    res.json({
      success: true,
      data: { insights }
    });
  } catch (error) {
    console.error('Get user network insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Generate network recommendations
const generateNetworkRecommendations = (userContext: any, connections: any[], posts: any[], applications: any[]): string[] => {
  const recommendations: string[] = [];

  // Connection recommendations
  if (connections.length < 10) {
    recommendations.push('Connect with more professionals to expand your network');
  }

  // Community recommendations
  if (posts.length < 5) {
    recommendations.push('Share more content in the community to increase your visibility');
  }

  // Job application recommendations
  if (applications.length < 3) {
    recommendations.push('Apply to more jobs to increase your chances of success');
  }

  // Cross-module recommendations
  if (userContext.crossModuleProfile.networkMetrics.crossModuleActivity < 50) {
    recommendations.push('Engage more across different platform features for better networking');
  }

  // Messaging recommendations
  if (userContext.crossModuleProfile.moduleActivity.messaging.messagesSent < 10) {
    recommendations.push('Start more conversations to build stronger professional relationships');
  }

  return recommendations;
};

// Update user preferences
export const updateUserPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { preferences } = req.body;
    const userId = req.user._id;

    const userContext = await UnifiedUserContext.findOne({ userId });
    if (!userContext) {
      res.status(404).json({
        success: false,
        message: 'User context not found'
      });
      return;
    }

    // Update preferences
    if (preferences.notificationSettings) {
      userContext.crossModuleProfile.preferences.notificationSettings = {
        ...userContext.crossModuleProfile.preferences.notificationSettings,
        ...preferences.notificationSettings
      };
    }

    if (preferences.privacySettings) {
      userContext.crossModuleProfile.preferences.privacySettings = {
        ...userContext.crossModuleProfile.preferences.privacySettings,
        ...preferences.privacySettings
      };
    }

    if (preferences.integrationSettings) {
      userContext.crossModuleProfile.preferences.integrationSettings = {
        ...userContext.crossModuleProfile.preferences.integrationSettings,
        ...preferences.integrationSettings
      };
    }

    await userContext.save();

    res.json({
      success: true,
      message: 'User preferences updated successfully'
    });
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's ecosystem integration status
export const getEcosystemIntegrationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    // Check integration status across all modules
    const integrationStatus = {
      messaging: {
        connected: true,
        conversations: 0, // This would be calculated from actual conversations
        lastActivity: new Date()
      },
      community: {
        connected: true,
        posts: 0, // This would be calculated from actual posts
        lastActivity: new Date()
      },
      gang: {
        connected: true,
        connections: 0, // This would be calculated from actual connections
        lastActivity: new Date()
      },
      jobs: {
        connected: true,
        applications: 0, // This would be calculated from actual applications
        lastActivity: new Date()
      },
      notifications: {
        connected: true,
        unreadCount: 0, // This would be calculated from actual notifications
        lastActivity: new Date()
      }
    };

    res.json({
      success: true,
      data: { integrationStatus }
    });
  } catch (error) {
    console.error('Get ecosystem integration status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export {
  getUnifiedUserContext,
  getCrossModuleActivitySummary,
  getUserNetworkInsights,
  updateUserPreferences,
  getEcosystemIntegrationStatus
};
