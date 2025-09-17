import express from 'express';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserDashboard,
  getUserStats,
  verifyUser
} from '../controllers/userController';
import {
  validateUpdateProfile,
  validatePagination,
  validateSearch
} from '../utils/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/dashboard', getUserDashboard as any);
router.get('/stats/:id?', getUserStats as any);
router.get('/:id', getUserById as any);
router.put('/:id', validateUpdateProfile, updateUser as any);
router.delete('/:id', deleteUser as any);

// Admin only routes
router.get('/', authorize('admin'), validatePagination, validateSearch, getAllUsers as any);
router.put('/:id/verify', authorize('admin'), verifyUser as any);

export default router;
