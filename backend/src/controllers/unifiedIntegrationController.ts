import { Request, Response } from 'express';
import { validationResult, query, param } from 'express-validator';
import { UnifiedIntegrationService } from '../services/unifiedIntegrationService';
import { UnifiedUserContext } from '../models/UnifiedUserContext';
import { AuthRequest } from '../middlewares/auth';

/**
 * Get unified activity feed for the current user
 */
export const getUnifiedActivityFeed = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user?._id;
    const { limit = 20, page = 1 } = req.query;
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const result = await UnifiedIntegrationService.getUnifiedActivityFeed(
      userId.toString(),
      limitNum,
      pageNum
    );

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting unified activity feed:', error);
    return res.status(500).json({ success: false, message: 'Failed to get activity feed' });
  }
};

/**
 * Get cross-module recommendations for the current user
 */
export const getCrossModuleRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const recommendations = await UnifiedIntegrationService.getCrossModuleRecommendations(
      userId.toString()
    );

    return res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting cross-module recommendations:', error);
    return res.status(500).json({ success: false, message: 'Failed to get recommendations' });
  }
};

/**
 * Get unified user context
 */
export const getUserContext = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let context = await UnifiedUserContext.findOne({ userId });

    if (!context) {
      // Create initial context if it doesn't exist
      await UnifiedIntegrationService.trackActivity(
        userId.toString(),
        'gang',
        'context_initialized'
      );
      context = await UnifiedUserContext.findOne({ userId });
    }

    return res.json({
      success: true,
      data: context
    });
  } catch (error) {
    console.error('Error getting user context:', error);
    return res.status(500).json({ success: false, message: 'Failed to get user context' });
  }
};

/**
 * Update user integration preferences
 */
export const updateIntegrationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { preferences } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let context = await UnifiedUserContext.findOne({ userId });

    if (!context) {
      return res.status(404).json({ success: false, message: 'User context not found' });
    }

    // Update preferences
    if (preferences.notificationSettings) {
      context.crossModuleProfile.preferences.notificationSettings = {
        ...context.crossModuleProfile.preferences.notificationSettings,
        ...preferences.notificationSettings
      };
    }

    if (preferences.privacySettings) {
      context.crossModuleProfile.preferences.privacySettings = {
        ...context.crossModuleProfile.preferences.privacySettings,
        ...preferences.privacySettings
      };
    }

    if (preferences.integrationSettings) {
      context.crossModuleProfile.preferences.integrationSettings = {
        ...context.crossModuleProfile.preferences.integrationSettings,
        ...preferences.integrationSettings
      };
    }

    await context.save();

    return res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: context.crossModuleProfile.preferences
    });
  } catch (error) {
    console.error('Error updating integration preferences:', error);
    return res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
};

/**
 * Track cross-module activity (internal endpoint)
 */
export const trackActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { module, action, targetId, targetType, metadata } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const activity = await UnifiedIntegrationService.trackActivity(
      userId.toString(),
      module,
      action,
      targetId,
      targetType,
      metadata
    );

    return res.json({
      success: true,
      message: 'Activity tracked successfully',
      data: activity
    });
  } catch (error) {
    console.error('Error tracking activity:', error);
    return res.status(500).json({ success: false, message: 'Failed to track activity' });
  }
};

/**
 * Get network insights for the current user
 */
export const getNetworkInsights = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const context = await UnifiedUserContext.findOne({ userId });

    if (!context) {
      return res.status(404).json({ success: false, message: 'User context not found' });
    }

    const insights = {
      networkMetrics: context.crossModuleProfile.networkMetrics,
      moduleActivity: context.crossModuleProfile.moduleActivity,
      totalEngagement: context.crossModuleProfile.totalEngagement,
      recommendations: {
        improveInfluence: context.crossModuleProfile.networkMetrics.influenceScore < 70,
        increaseReach: context.crossModuleProfile.networkMetrics.reachScore < 60,
        boostEngagement: context.crossModuleProfile.networkMetrics.engagementScore < 50,
        crossModuleActivity: context.crossModuleProfile.networkMetrics.crossModuleActivity < 40
      }
    };

    return res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error getting network insights:', error);
    return res.status(500).json({ success: false, message: 'Failed to get network insights' });
  }
};

