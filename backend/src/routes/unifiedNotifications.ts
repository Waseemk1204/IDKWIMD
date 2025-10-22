import express from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
// import {
//   createCrossModuleNotification,
//   getUnifiedNotifications,
//   markNotificationAsRead,
//   markAllNotificationsAsRead,
//   getNotificationPreferences,
//   updateNotificationPreferences,
//   getCrossModuleActivity,
//   getSmartNotificationSuggestions,
//   getNotificationAnalytics
// } from '../controllers/unifiedNotificationController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Notification management
// router.get('/notifications', getUnifiedNotifications as any);
// router.post('/notifications', createCrossModuleNotification as any);
// router.put('/notifications/:notificationId/read', markNotificationAsRead as any);
// router.put('/notifications/read-all', markAllNotificationsAsRead as any);

// Notification preferences
// router.get('/preferences', getNotificationPreferences as any);
// router.put('/preferences', updateNotificationPreferences as any);

// Cross-module activity
// router.get('/activity', getCrossModuleActivity as any);

// Smart features
// router.get('/suggestions', getSmartNotificationSuggestions as any);
// router.get('/analytics', getNotificationAnalytics as any);

export default router;
