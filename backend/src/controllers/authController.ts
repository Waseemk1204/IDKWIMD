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

    const { fullName, username, email, password, role } = req.body;

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
      res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'User already exists with this email'
          : 'Username is already taken'
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

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
      return;
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

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
    const { googleId, email, fullName, profilePhoto, givenName, familyName } = req.body;

    if (!googleId || !email || !fullName) {
      res.status(400).json({
        success: false,
        message: 'Missing required Google user data'
      });
      return;
    }

    // Check if user already exists with this Google ID
    let user;
    try {
      user = await User.findOne({ googleId });
    } catch (dbError) {
      console.error('Database error during Google ID lookup:', dbError);
      res.status(503).json({
        success: false,
        message: 'Database temporarily unavailable',
        error: 'database_unavailable'
      });
      return;
    }
    
    if (!user) {
      // Check if user exists with this email
      try {
        user = await User.findOne({ email });
      } catch (dbError) {
        console.error('Database error during email lookup:', dbError);
        res.status(503).json({
          success: false,
          message: 'Database temporarily unavailable',
          error: 'database_unavailable'
        });
        return;
      }
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.profilePhoto = profilePhoto || user.profilePhoto;
        try {
          await user.save();
        } catch (dbError) {
          console.error('Database error saving user:', dbError);
          res.status(503).json({
            success: false,
            message: 'Database temporarily unavailable',
            error: 'database_unavailable'
          });
          return;
        }
      } else {
        // Create new user with Google data
        const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        
        // Ensure username is unique
        let uniqueUsername = username;
        let counter = 1;
        let usernameExists = true;
        while (usernameExists) {
          try {
            const existingUser = await User.findOne({ username: uniqueUsername });
            usernameExists = !!existingUser;
            if (usernameExists) {
              uniqueUsername = `${username}${counter}`;
              counter++;
            }
          } catch (dbError) {
            console.error('Database error during username check:', dbError);
            res.status(503).json({
              success: false,
              message: 'Database temporarily unavailable',
              error: 'database_unavailable'
            });
            return;
          }
        }

        user = new User({
          googleId,
          email,
          fullName,
          username: uniqueUsername,
          profilePhoto,
          role: 'employee', // Default role for Google users
          isVerified: true, // Google users are considered verified
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
        refreshToken
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
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