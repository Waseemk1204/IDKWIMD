import express from 'express';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserProfile,
  deleteUser,
  getUserDashboard,
  getUserStats,
  verifyUser,
  uploadAndParseResume,
  applyParsedResumeData
} from '../controllers/userController';
import {
  validateUpdateProfile,
  validatePagination,
  validateSearch
} from '../utils/validation';
import resumeParserService from '../services/resumeParserService';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Resume upload and parsing routes
const upload = resumeParserService.getMulterConfig();
router.post('/resume/upload', upload.single('resume'), uploadAndParseResume as any);
router.post('/resume/apply', applyParsedResumeData as any);

// User routes
router.get('/dashboard', getUserDashboard as any);
router.get('/stats/:id?', getUserStats as any);
router.put('/profile', validateUpdateProfile, updateUserProfile as any);
router.get('/:id', getUserById as any);
router.put('/:id', validateUpdateProfile, updateUser as any);
router.delete('/:id', deleteUser as any);

// Admin only routes
router.get('/', authorize('admin'), validatePagination, validateSearch, getAllUsers as any);
router.put('/:id/verify', authorize('admin'), verifyUser as any);

export default router;
