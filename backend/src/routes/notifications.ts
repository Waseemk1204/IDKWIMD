import express from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationSettings,
  updateNotificationSettings
} from '../controllers/notificationController';
import { validatePagination } from '../utils/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Notification routes
router.get('/', validatePagination, getNotifications as any);
router.put('/:id/read', markNotificationAsRead as any);
router.put('/read-all', markAllNotificationsAsRead as any);
router.delete('/:id', deleteNotification as any);
router.delete('/', clearAllNotifications as any);

// Settings routes
router.get('/settings', getNotificationSettings as any);
router.put('/settings', updateNotificationSettings as any);

export default router;
