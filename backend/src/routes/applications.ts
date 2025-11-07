import express from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import {
  getUserApplications,
  submitApplication,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  getJobApplications
} from '../controllers/applicationController';
import {
  validateCreateApplication,
  validatePagination
} from '../utils/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User application routes
router.get('/', validatePagination, getUserApplications as any);
router.get('/:id', getApplicationById as any);
router.delete('/:id', withdrawApplication as any);

// Job application routes
router.post('/job/:jobId', validateCreateApplication, submitApplication as any);
router.get('/job/:jobId', validatePagination, getJobApplications as any);
router.put('/:id/status', updateApplicationStatus as any);

export default router;
