import express from 'express';
import { authenticate, optionalAuth, AuthRequest } from '../middlewares/auth';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getFeaturedBlogs,
  getBlogCategories,
  getRelatedBlogs,
  addComment,
  getBlogComments,
  likeBlog
} from '../controllers/blogController';
import {
  validateCreateBlog,
  validateCreateComment,
  validatePagination,
  validateSearch
} from '../utils/validation';

const router = express.Router();

// Public routes
router.get('/', validatePagination, validateSearch, getBlogs as any);
router.get('/featured', getFeaturedBlogs as any);
router.get('/categories', getBlogCategories as any);
router.get('/:id', getBlogById as any);
router.get('/:id/related', getRelatedBlogs as any);
router.get('/:id/comments', validatePagination, getBlogComments as any);
router.post('/:id/like', likeBlog as any);

// Protected routes
router.use(authenticate);

router.post('/', validateCreateBlog, createBlog as any);
router.put('/:id', updateBlog as any);
router.delete('/:id', deleteBlog as any);
router.post('/:id/comments', validateCreateComment, addComment as any);

export default router;
