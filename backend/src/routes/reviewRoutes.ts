import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { createReview, getUserReviews } from '../controllers/reviewController';

const router = Router();

// Public routes (or authenticated but accessible to all)
router.get('/user/:userId', authenticate, getUserReviews as any);

// Protected routes
router.post('/', authenticate, createReview as any);

export default router;
