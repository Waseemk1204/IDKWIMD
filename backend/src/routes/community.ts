import express from 'express';
import { authenticate, optionalAuth, AuthRequest } from '../middlewares/auth';
import {
  getCommunityPosts,
  getCommunityPostById,
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  toggleLikePost,
  addComment,
  getPostComments,
  getCommunityTags
} from '../controllers/communityController';
import {
  validatePagination,
  validateSearch
} from '../utils/validation';

const router = express.Router();

// Public routes
router.get('/', validatePagination, validateSearch, getCommunityPosts as any);
router.get('/tags', getCommunityTags as any);
router.get('/:id', optionalAuth, getCommunityPostById as any);
router.get('/:id/comments', validatePagination, getPostComments as any);

// Protected routes
router.use(authenticate);

// Post CRUD operations
router.post('/', createCommunityPost as any);
router.put('/:id', updateCommunityPost as any);
router.delete('/:id', deleteCommunityPost as any);

// Post interactions
router.post('/:id/like', toggleLikePost as any);
router.post('/:id/comments', addComment as any);

export default router;
