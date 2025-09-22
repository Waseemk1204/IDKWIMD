import express from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getDashboardAnalytics,
  getUserAnalytics,
  getJobAnalytics,
  getFinancialAnalytics,
  getModerationData,
  approveUserVerification,
  approveJob,
  moderateCommunityContent
} from '../controllers/adminController';
import { validatePagination } from '../utils/validation';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Analytics routes
router.get('/analytics/dashboard', getDashboardAnalytics as any);
router.get('/analytics/users', validatePagination, getUserAnalytics as any);
router.get('/analytics/jobs', validatePagination, getJobAnalytics as any);
router.get('/analytics/financial', validatePagination, getFinancialAnalytics as any);

// Moderation routes
router.get('/moderation', getModerationData as any);
router.put('/verification/:userId', approveUserVerification as any);
router.put('/jobs/:jobId', approveJob as any);
router.put('/moderate/:contentType/:contentId', moderateCommunityContent as any);

export default router;
