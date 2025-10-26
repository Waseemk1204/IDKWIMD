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

// Search route MUST come before /:id route
router.get('/search', validateSearch, async (req: any, res: any) => {
  try {
    const { q, limit = 50, role } = req.query;
    
    const query: any = {};
    
    // Add search criteria
    if (q) {
      query.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Filter by role if provided
    if (role) {
      query.role = role;
    }
    
    const users = await require('../models/User').default.find(query)
      .select('_id fullName email username profilePhoto headline role isOnline lastSeen')
      .limit(parseInt(limit as string))
      .lean();
    
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/:id', getUserById as any);
router.put('/:id', validateUpdateProfile, updateUser as any);
router.delete('/:id', deleteUser as any);

// Admin only routes
router.get('/', authorize('admin'), validatePagination, validateSearch, getAllUsers as any);
router.put('/:id/verify', authorize('admin'), verifyUser as any);

export default router;
