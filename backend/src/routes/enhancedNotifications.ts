import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  trackInteraction,
  getPreferences,
  updatePreferences,
  getNotificationStats,
  createTestNotification
} from '../controllers/EnhancedNotificationController';

const router = Router();

// Enhanced notification routes
router.get('/', authenticate, getNotifications);
router.patch('/:notificationId/read', authenticate, markAsRead);
router.patch('/mark-all-read', authenticate, markAllAsRead);
router.post('/:notificationId/interaction', authenticate, trackInteraction);

// Notification preferences
router.get('/preferences', authenticate, getPreferences);
router.put('/preferences', authenticate, updatePreferences);

// Notification statistics
router.get('/stats', authenticate, getNotificationStats);

// Development/testing routes
router.post('/test', authenticate, createTestNotification);

export default router;
