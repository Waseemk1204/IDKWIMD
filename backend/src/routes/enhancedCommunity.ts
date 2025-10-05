import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getCommunityPosts,
  getCommunityPostById,
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  togglePostLike,
  addHelpfulVote,
  addExpertEndorsement,
  togglePostBookmark,
  sharePost,
  getTrendingPosts,
  getPostsByProfessionalContext,
  getUserBookmarks
} from '../controllers/enhancedCommunityController';

import {
  getCommunityCategories,
  createCommunityCategory,
  getUserReputation,
  getReputationLeaderboard,
  getCommunityBadges,
  createCommunityBadge,
  getCommunityEvents,
  createCommunityEvent,
  joinCommunityEvent,
  leaveCommunityEvent,
  submitEventFeedback
} from '../controllers/communityFeaturesController';

const router = Router();

// Community Posts Routes
router.get('/posts', getCommunityPosts);
router.get('/posts/trending', getTrendingPosts);
router.get('/posts/professional-context', getPostsByProfessionalContext);
router.get('/posts/:id', getCommunityPostById);
router.post('/posts', authenticate, createCommunityPost);
router.put('/posts/:id', authenticate, updateCommunityPost);
router.delete('/posts/:id', authenticate, deleteCommunityPost);

// Post Interactions
router.post('/posts/:id/like', authenticate, togglePostLike);
router.post('/posts/:id/helpful', authenticate, addHelpfulVote);
router.post('/posts/:id/expert-endorsement', authenticate, addExpertEndorsement);
router.post('/posts/:id/bookmark', authenticate, togglePostBookmark);
router.post('/posts/:id/share', authenticate, sharePost);

// User Bookmarks
router.get('/bookmarks', authenticate, getUserBookmarks);

// Community Categories Routes
router.get('/categories', getCommunityCategories);
router.post('/categories', authenticate, createCommunityCategory);

// User Reputation Routes
router.get('/reputation', authenticate, getUserReputation);
router.get('/reputation/leaderboard', getReputationLeaderboard);

// Community Badges Routes
router.get('/badges', getCommunityBadges);
router.post('/badges', authenticate, createCommunityBadge);

// Community Events Routes
router.get('/events', getCommunityEvents);
router.post('/events', authenticate, createCommunityEvent);
router.post('/events/:id/join', authenticate, joinCommunityEvent);
router.post('/events/:id/leave', authenticate, leaveCommunityEvent);
router.post('/events/:id/feedback', authenticate, submitEventFeedback);

export default router;

