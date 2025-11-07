import express from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import {
  getUserVerifications,
  createVerification,
  getVerificationById,
  updateVerification,
  getAllVerifications,
  deleteVerification,
  getVerificationStats
} from '../controllers/verificationController';
import {
  validateCreateVerification,
  validateUpdateVerification,
  validatePagination
} from '../utils/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/my-verifications', getUserVerifications as any);
router.post('/submit', validateCreateVerification, createVerification as any);
router.get('/:id', getVerificationById as any);
router.delete('/:id', deleteVerification as any);

// Admin routes
router.get('/admin/all', validatePagination, getAllVerifications as any);
router.put('/admin/:id', validateUpdateVerification, updateVerification as any);
router.get('/admin/stats', getVerificationStats as any);

export default router;
