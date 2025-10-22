import { Router } from 'express';
import { body, query, param } from 'express-validator';
import {
  getUnifiedActivityFeed,
  getCrossModuleRecommendations,
  getUserContext,
  updateIntegrationPreferences,
  trackActivity,
  getNetworkInsights
} from '../controllers/unifiedIntegrationController';

const router = Router();

/**
 * @route GET /api/v1/integration/activity-feed
 * @desc Get unified activity feed across all modules
 * @access Private
 */
router.get('/activity-feed', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
], getUnifiedActivityFeed);

/**
 * @route GET /api/v1/integration/recommendations
 * @desc Get cross-module recommendations
 * @access Private
 */
router.get('/recommendations', getCrossModuleRecommendations);

/**
 * @route GET /api/v1/integration/user-context
 * @desc Get unified user context
 * @access Private
 */
router.get('/user-context', getUserContext);

/**
 * @route PUT /api/v1/integration/preferences
 * @desc Update user integration preferences
 * @access Private
 */
router.put('/preferences', [
  body('preferences')
    .isObject()
    .withMessage('Preferences must be an object'),
  body('preferences.notificationSettings')
    .optional()
    .isObject()
    .withMessage('Notification settings must be an object'),
  body('preferences.privacySettings')
    .optional()
    .isObject()
    .withMessage('Privacy settings must be an object'),
  body('preferences.integrationSettings')
    .optional()
    .isObject()
    .withMessage('Integration settings must be an object')
], updateIntegrationPreferences);

/**
 * @route POST /api/v1/integration/track-activity
 * @desc Track cross-module activity
 * @access Private
 */
router.post('/track-activity', [
  body('module')
    .isIn(['jobs', 'community', 'gang', 'messaging', 'wallet', 'timesheet'])
    .withMessage('Module must be one of: jobs, community, gang, messaging, wallet, timesheet'),
  body('action')
    .isString()
    .notEmpty()
    .withMessage('Action is required'),
  body('targetId')
    .optional()
    .isMongoId()
    .withMessage('Target ID must be a valid MongoDB ObjectId'),
  body('targetType')
    .optional()
    .isIn(['job', 'post', 'user', 'message', 'connection', 'transaction'])
    .withMessage('Target type must be one of: job, post, user, message, connection, transaction'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
], trackActivity);

/**
 * @route GET /api/v1/integration/network-insights
 * @desc Get network insights and recommendations
 * @access Private
 */
router.get('/network-insights', getNetworkInsights);

export default router;

