import express from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import {
  createJobConversation,
  createCommunityConversation,
  createGangConversation,
  getConversationSuggestions,
  updateConnectionStrength,
  getMessagingAnalytics
} from '../controllers/unifiedMessagingController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Cross-module conversation creation
router.post('/job-conversation', createJobConversation as any);
router.post('/community-conversation', createCommunityConversation as any);
router.post('/gang-conversation', createGangConversation as any);

// Smart suggestions and analytics
router.get('/suggestions', getConversationSuggestions as any);
router.get('/analytics', getMessagingAnalytics as any);

// Connection strength updates
router.put('/conversations/:conversationId/connection-strength', updateConnectionStrength as any);

export default router;

