import express from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import {
  getUnifiedUserContext,
  getCrossModuleActivitySummary,
  getUserNetworkInsights,
  updateUserPreferences,
  getEcosystemIntegrationStatus
} from '../controllers/unifiedUserContextController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User context management
router.get('/context', getUnifiedUserContext as any);
router.get('/activity-summary', getCrossModuleActivitySummary as any);
router.get('/network-insights', getUserNetworkInsights as any);
router.get('/integration-status', getEcosystemIntegrationStatus as any);

// User preferences
router.put('/preferences', updateUserPreferences as any);

export default router;
