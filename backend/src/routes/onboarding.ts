import express from 'express';
import {
  saveOnboardingProgress,
  loadOnboardingProgress,
  completeOnboarding,
  deleteOnboardingDraft,
  getOnboardingStatus
} from '../controllers/onboardingController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All onboarding routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/onboarding/save
 * @desc    Save onboarding progress as draft
 * @access  Private
 */
router.post('/save', saveOnboardingProgress as any);

/**
 * @route   GET /api/onboarding/load/:role
 * @desc    Load onboarding progress
 * @access  Private
 */
router.get('/load/:role', loadOnboardingProgress as any);

/**
 * @route   POST /api/onboarding/complete
 * @desc    Complete onboarding and update user profile
 * @access  Private
 */
router.post('/complete', completeOnboarding as any);

/**
 * @route   DELETE /api/onboarding/draft/:role
 * @desc    Delete onboarding draft
 * @access  Private
 */
router.delete('/draft/:role', deleteOnboardingDraft as any);

/**
 * @route   GET /api/onboarding/status
 * @desc    Get onboarding completion status
 * @access  Private
 */
router.get('/status', getOnboardingStatus as any);

export default router;

