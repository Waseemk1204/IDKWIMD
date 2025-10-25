import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import config from '../config';
import { extractUserDataFromLinkedIn, LinkedInProfile } from '../services/linkedinService';
import User from '../models/User';

const router = express.Router();

/**
 * @route   GET /api/v1/auth/linkedin
 * @desc    Initiate LinkedIn OAuth login
 * @access  Public
 */
router.get(
  '/',
  (req, res, next) => {
    // Store role in session for later use
    const role = req.query.role as string;
    if (role && (role === 'employee' || role === 'employer')) {
      (req.session as any).linkedInRole = role;
    }
    next();
  },
  passport.authenticate('linkedin', {
    session: false,
  })
);

/**
 * @route   GET /api/v1/auth/linkedin/callback
 * @desc    LinkedIn OAuth callback
 * @access  Public
 */
router.get(
  '/callback',
  passport.authenticate('linkedin', {
    session: false,
    failureRedirect: `${config.FRONTEND_URL}/login?error=linkedin_auth_failed`,
  }),
  async (req, res) => {
    try {
      const authData = req.user as { profile: LinkedInProfile; accessToken: string };
      const linkedInProfile = authData.profile;
      
      // Get role from session or default to employee
      const role = ((req.session as any)?.linkedInRole as 'employee' | 'employer') || 'employee';

      // Check if user exists
      let user = await User.findOne({
        $or: [
          { email: linkedInProfile.email },
          { 'linkedinProfile.linkedinId': linkedInProfile.linkedinId },
        ],
      });

      if (user) {
        // User exists - update LinkedIn profile data
        const profileData = extractUserDataFromLinkedIn(linkedInProfile, role);
        
        // Store LinkedIn profile data (if field exists in User model)
        (user as any).linkedinProfile = {
          linkedinId: linkedInProfile.linkedinId,
          profileUrl: linkedInProfile.profileUrl || '',
          lastSynced: new Date(),
          autoImportEnabled: true,
        };
        
        // Update profile photo if not set
        if (!user.profilePhoto && profileData.profilePhoto) {
          user.profilePhoto = profileData.profilePhoto;
        }

        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
          expiresIn: config.JWT_EXPIRE,
        });

        // Redirect to frontend with token and profile data
        const queryParams = new URLSearchParams({
          token,
          linkedin_auth: 'success',
          has_profile: 'true',
        });

        // Clear role from session
        delete (req.session as any)?.linkedInRole;

        res.redirect(`${config.FRONTEND_URL}/login?${queryParams.toString()}`);
      } else {
        // New user - send profile data for signup
        const profileData = extractUserDataFromLinkedIn(linkedInProfile, role);

        // Encode profile data
        const encodedProfile = Buffer.from(JSON.stringify(profileData)).toString('base64');

        // Redirect to signup with profile data
        const queryParams = new URLSearchParams({
          linkedin_auth: 'new_user',
          profile_data: encodedProfile,
          role,
        });

        // Clear role from session
        delete (req.session as any)?.linkedInRole;

        res.redirect(`${config.FRONTEND_URL}/signup?${queryParams.toString()}`);
      }
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      res.redirect(`${config.FRONTEND_URL}/login?error=linkedin_callback_failed`);
    }
  }
);

/**
 * @route   POST /api/v1/auth/linkedin/signup
 * @desc    Complete signup with LinkedIn profile data
 * @access  Public
 */
router.post('/signup', async (req, res) => {
  try {
    const { profileData, password, role } = req.body;

    if (!profileData || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Profile data, password, and role are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: profileData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user
    const user = await User.create({
      ...profileData,
      password,
      role,
      isVerified: false,
    });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully with LinkedIn profile',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          profilePhoto: user.profilePhoto,
        },
      },
    });
  } catch (error) {
    console.error('LinkedIn signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user with LinkedIn profile',
    });
  }
});

export default router;


