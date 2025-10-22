import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
  deactivateAccount,
  loginWithGoogle,
  loginWithLinkedIn
} from '../controllers/authController';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { authLimiter, passwordResetLimiter } from '../middlewares/rateLimiter';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} from '../utils/validation';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/google', authLimiter, loginWithGoogle);
router.post('/linkedin', authLimiter, loginWithLinkedIn);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/me', getMe as any);
router.put('/profile', validateUpdateProfile, updateProfile as any);
router.put('/change-password', passwordResetLimiter, validateChangePassword, changePassword as any);
router.post('/logout', logout as any);
router.delete('/deactivate', deactivateAccount as any);

export default router;
