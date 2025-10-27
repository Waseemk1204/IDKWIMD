import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { generateToken, generateRefreshToken, verifyToken, AuthRequest } from '../middlewares/auth';
import { config } from '../config';
import bcrypt from 'bcryptjs';

// Register user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log the incoming request for debugging
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', req.headers['content-type']);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', JSON.stringify(errors.array(), null, 2));
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { fullName, username, email, password, role } = req.body;
    console.log('✅ Validation passed, creating user:', { fullName, username, email, role });

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
    } catch (dbError) {
      console.error('Database query error during user lookup:', dbError);
      res.status(503).json({
        success: false,
        message: 'Database temporarily unavailable. Please try again later.',
        error: 'database_unavailable'
      });
      return;
    }
    
    if (existingUser) {
      const errorMessage = existingUser.email === email 
        ? 'User already exists with this email'
        : 'Username is already taken';
      console.log('❌ User exists:', errorMessage, { email: existingUser.email, username: existingUser.username });
      res.status(400).json({
        success: false,
        message: errorMessage
      });
      return;
    }

    // Create user
    const user = new User({
      fullName,
      username,
      email,
      password,
      role: role || 'employee'
    });

    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          displayName: user.displayName,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
          phone: user.phone,
          location: user.location,
          headline: user.headline,
          about: user.about,
          website: user.website,
          skills: user.skills,
          experiences: user.experiences,
          education: user.education,
          socialLinks: user.socialLinks,
          companyInfo: user.companyInfo,
          isVerified: user.isVerified,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log the incoming request for debugging
    console.log('=== LOGIN REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Email provided:', req.body.email);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Login validation failed:', JSON.stringify(errors.array(), null, 2));
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    console.log('User lookup result:', user ? `Found user: ${user.email}` : 'User not found');
    
    if (!user) {
      console.log('❌ No user found with email:', email);
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User account is deactivated:', email);
      res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
      return;
    }

    // Compare password
    console.log('Comparing password...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }
    
    console.log('✅ Login successful for user:', email);

    // Update last login without triggering full validation
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() }, { runValidators: false });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          displayName: user.displayName,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
          phone: user.phone,
          location: user.location,
          headline: user.headline,
          about: user.about,
          website: user.website,
          skills: user.skills,
          experiences: user.experiences,
          education: user.education,
          socialLinks: user.socialLinks,
          companyInfo: user.companyInfo,
          isVerified: user.isVerified,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('token');
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          displayName: user.displayName,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
          phone: user.phone,
          location: user.location,
          headline: user.headline,
          about: user.about,
          website: user.website,
          skills: user.skills,
          experiences: user.experiences,
          education: user.education,
          socialLinks: user.socialLinks,
          companyInfo: user.companyInfo,
          isVerified: user.isVerified,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const allowedUpdates = [
      'fullName', 'displayName', 'username', 'phone', 'location', 'about', 'headline', 'website', 'skills', 
      'experiences', 'education', 'profilePhoto', 'socialLinks', 'companyInfo'
    ];
    
    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
    const updateData: any = {};
    
    updates.forEach(update => {
      updateData[update] = req.body[update];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          displayName: user.displayName,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
          phone: user.phone,
          location: user.location,
          headline: user.headline,
          about: user.about,
          website: user.website,
          skills: user.skills,
          experiences: user.experiences,
          education: user.education,
          socialLinks: user.socialLinks,
          companyInfo: user.companyInfo,
          isVerified: user.isVerified,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { userId: string };
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
      return;
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Google OAuth login
export const loginWithGoogle = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if this is a Google OAuth callback (has 'credential' field)
    const { credential, googleId, email, fullName, profilePhoto, givenName, familyName } = req.body;

    // If credential is present, decode it (Google OAuth redirect callback)
    let userData;
    if (credential) {
      console.log('🔐 Google OAuth callback - decoding credential');
      try {
        // Decode the JWT token
        const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
        console.log('✅ Decoded Google JWT:', { sub: payload.sub, email: payload.email });
        
        userData = {
          googleId: payload.sub,
          email: payload.email,
          fullName: payload.name,
          profilePhoto: payload.picture,
          givenName: payload.given_name,
          familyName: payload.family_name
        };
      } catch (decodeError) {
        console.error('❌ Failed to decode Google credential:', decodeError);
        // Redirect to frontend with error
        res.redirect(`${config.FRONTEND_URL}/login?error=google_auth_failed&message=Failed to decode credential`);
        return;
      }
    } else if (googleId && email && fullName) {
      // Direct API call (from frontend)
      userData = { googleId, email, fullName, profilePhoto, givenName, familyName };
    } else {
      console.error('❌ Missing required Google user data');
      if (req.headers.accept?.includes('text/html')) {
        // Redirect to frontend with error
        res.redirect(`${config.FRONTEND_URL}/login?error=google_auth_failed&message=Missing user data`);
      } else {
        res.status(400).json({
          success: false,
          message: 'Missing required Google user data'
        });
      }
      return;
    }

    console.log('🔐 Google OAuth login attempt:', { googleId: userData.googleId, email: userData.email, fullName: userData.fullName });

    // Check if user already exists with this Google ID
    let user;
    try {
      console.log('🔍 Searching for user by Google ID:', userData.googleId);
      user = await User.findOne({ googleId: userData.googleId }).maxTimeMS(5000); // 5 second timeout
      console.log('✅ Google ID lookup complete:', user ? 'User found' : 'No user found');
    } catch (dbError: any) {
      console.error('❌ Database error during Google ID lookup:', {
        error: dbError.message,
        code: dbError.code,
        name: dbError.name
      });
      if (credential) {
        // OAuth callback - redirect with error
        res.redirect(`${config.FRONTEND_URL}/login?error=database_unavailable&message=Database connection error`);
      } else {
        res.status(503).json({
          success: false,
          message: 'Database temporarily unavailable. Please try again.',
          error: 'database_unavailable'
        });
      }
      return;
    }
    
    if (!user) {
      // Check if user exists with this email
      try {
        console.log('🔍 Searching for user by email:', userData.email);
        user = await User.findOne({ email: userData.email }).maxTimeMS(5000); // 5 second timeout
        console.log('✅ Email lookup complete:', user ? 'User found' : 'No user found');
      } catch (dbError: any) {
        console.error('❌ Database error during email lookup:', {
          error: dbError.message,
          code: dbError.code,
          name: dbError.name
        });
        if (credential) {
          // OAuth callback - redirect with error
          res.redirect(`${config.FRONTEND_URL}/login?error=database_unavailable&message=Database connection error`);
        } else {
          res.status(503).json({
            success: false,
            message: 'Database temporarily unavailable. Please try again.',
            error: 'database_unavailable'
          });
        }
        return;
      }
      
      if (user) {
        // Link Google account to existing user
        user.googleId = userData.googleId;
        user.profilePhoto = userData.profilePhoto || user.profilePhoto;
        
        // Clean corrupted data before saving (fix empty strings in array/object fields)
        if (!Array.isArray(user.skills) || typeof user.skills === 'string') {
          user.skills = [];
        }
        if (!Array.isArray(user.experiences) || typeof user.experiences === 'string') {
          user.experiences = [];
        }
        if (!Array.isArray(user.education) || typeof user.education === 'string') {
          user.education = [];
        }
        if (typeof user.jobPreferences !== 'object' || user.jobPreferences === null || typeof (user.jobPreferences as any) === 'string') {
          user.jobPreferences = undefined;
        }
        if (typeof user.companyInfo !== 'object' || user.companyInfo === null || typeof (user.companyInfo as any) === 'string') {
          user.companyInfo = undefined;
        }
        if (typeof user.socialLinks !== 'object' || user.socialLinks === null || typeof (user.socialLinks as any) === 'string') {
          user.socialLinks = undefined;
        }
        
        try {
          console.log('💾 Saving existing user with Google ID linked');
          await user.save();
          console.log('✅ User saved successfully');
        } catch (dbError: any) {
          console.error('❌ Database error saving user:', {
            error: dbError.message,
            code: dbError.code,
            name: dbError.name,
            errors: dbError.errors
          });
          res.status(503).json({
            success: false,
            message: 'Database temporarily unavailable. Please try again.',
            error: 'database_unavailable'
          });
          return;
        }
      } else {
        // Create new user with Google data
        const username = userData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        
        // Ensure username is unique
        let uniqueUsername = username;
        let counter = 1;
        let usernameExists = true;
        while (usernameExists) {
          try {
            console.log('🔍 Checking username availability:', uniqueUsername);
            const existingUser = await User.findOne({ username: uniqueUsername }).maxTimeMS(5000);
            usernameExists = !!existingUser;
            if (usernameExists) {
              uniqueUsername = `${username}${counter}`;
              counter++;
            }
          } catch (dbError: any) {
            console.error('❌ Database error during username check:', {
              error: dbError.message,
              code: dbError.code,
              name: dbError.name
            });
            res.status(503).json({
              success: false,
              message: 'Database temporarily unavailable. Please try again.',
              error: 'database_unavailable'
            });
            return;
          }
        }

        console.log('👤 Creating new Google user:', { email: userData.email, username: uniqueUsername });
        user = new User({
          googleId: userData.googleId,
          email: userData.email,
          fullName: userData.fullName,
          username: uniqueUsername,
          profilePhoto: userData.profilePhoto,
          role: 'employee', // Default role for Google users
          isVerified: true, // Google users are considered verified
          verificationStatus: 'verified',
          isActive: true
        });

        try {
          await user.save();
          console.log('✅ New user created successfully');
        } catch (dbError: any) {
          console.error('❌ Database error creating new user:', {
            error: dbError.message,
            code: dbError.code,
            name: dbError.name,
            errors: dbError.errors
          });
          res.status(503).json({
            success: false,
            message: 'Failed to create user account. Please try again.',
            error: 'database_unavailable'
          });
          return;
        }
      }
    }

    // Track if this is a new user
    const isNewUser = user.createdAt && (Date.now() - new Date(user.createdAt).getTime()) < 60000;
    
    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() }, { runValidators: false });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshTokenStr = generateRefreshToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // If this is an OAuth callback (credential present), redirect to frontend
    if (credential) {
      console.log('✅ Google OAuth successful - redirecting to frontend');
      
      // NEW users go to /signup with success animation, then onboarding
      // EXISTING users go to /login and then dashboard
      if (isNewUser) {
        console.log('🎉 New user created - redirecting to signup page with animation');
        const redirectUrl = `${config.FRONTEND_URL}/signup?token=${encodeURIComponent(token)}&google_auth=success&new_user=true&role=${user.role}`;
        res.redirect(redirectUrl);
      } else {
        console.log('👤 Existing user - redirecting to login page');
        const redirectUrl = `${config.FRONTEND_URL}/login?token=${encodeURIComponent(token)}&google_auth=success`;
        res.redirect(redirectUrl);
      }
    } else {
      // Direct API call - return JSON
      res.json({
        success: true,
        message: 'Google login successful',
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            displayName: user.displayName,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePhoto: user.profilePhoto,
            phone: user.phone,
            location: user.location,
            headline: user.headline,
            about: user.about,
            website: user.website,
            skills: user.skills,
            experiences: user.experiences,
            education: user.education,
            socialLinks: user.socialLinks,
            companyInfo: user.companyInfo,
            isVerified: user.isVerified,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
          },
          token,
          refreshToken: refreshTokenStr
        }
      });
    }
  } catch (error) {
    console.error('Google login error:', error);
    
    // Check if this is an OAuth callback
    const { credential } = req.body;
    if (credential) {
      res.redirect(`${config.FRONTEND_URL}/login?error=google_auth_failed&message=An unexpected error occurred`);
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

// LinkedIn OAuth login
export const loginWithLinkedIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { linkedInId, email, fullName, profilePhoto, headline, location } = req.body;

    if (!linkedInId || !email || !fullName) {
      res.status(400).json({
        success: false,
        message: 'Missing required LinkedIn user data'
      });
      return;
    }

    // Check if user already exists with this LinkedIn ID
    let user = await User.findOne({ linkedInId });
    
    if (!user) {
      // Check if user exists with this email
      user = await User.findOne({ email });
      
      if (user) {
        // Link LinkedIn account to existing user
        user.linkedInId = linkedInId;
        user.profilePhoto = profilePhoto || user.profilePhoto;
        user.headline = headline || user.headline;
        user.location = location || user.location;
        await user.save();
      } else {
        // Create new user with LinkedIn data
        const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        
        // Ensure username is unique
        let uniqueUsername = username;
        let counter = 1;
        while (await User.findOne({ username: uniqueUsername })) {
          uniqueUsername = `${username}${counter}`;
          counter++;
        }

        user = new User({
          linkedInId,
          email,
          fullName,
          username: uniqueUsername,
          profilePhoto,
          headline,
          location,
          role: 'employee', // Default role for LinkedIn users
          isVerified: true, // LinkedIn users are considered verified
          verificationStatus: 'verified',
          isActive: true
        });

        await user.save();
      }
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() }, { runValidators: false });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'LinkedIn login successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          displayName: user.displayName,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
          phone: user.phone,
          location: user.location,
          headline: user.headline,
          about: user.about,
          website: user.website,
          skills: user.skills,
          experiences: user.experiences,
          education: user.education,
          socialLinks: user.socialLinks,
          companyInfo: user.companyInfo,
          isVerified: user.isVerified,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('LinkedIn login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Deactivate account
export const deactivateAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};