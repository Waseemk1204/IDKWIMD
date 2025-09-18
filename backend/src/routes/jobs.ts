import express from 'express';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobsByEmployer,
  getFeaturedJobs,
  getJobCategories,
  getJobStats
} from '../controllers/jobController';
import {
  validateCreateJob,
  validateUpdateJob,
  validatePagination,
  validateSearch
} from '../utils/validation';

const router = express.Router();

// Public routes
router.get('/', validatePagination, validateSearch, getJobs as any);
router.get('/featured', getFeaturedJobs as any);
router.get('/categories', getJobCategories as any);
router.get('/stats', getJobStats as any);
// Temporarily move employer routes to public for testing - MUST come before /:id route
router.get('/employer', validatePagination, getJobsByEmployer as any);
router.get('/employer/:employerId', validatePagination, getJobsByEmployer as any);
router.get('/:id', getJobById as any);

// Protected routes
router.use(authenticate);

router.post('/', authorize('employer', 'admin'), validateCreateJob, createJob as any);
router.put('/:id', validateUpdateJob, updateJob as any);
router.delete('/:id', deleteJob as any);

export default router;
