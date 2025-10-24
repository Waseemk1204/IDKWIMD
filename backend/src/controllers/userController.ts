import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User, { IUser } from '../models/User';
import Job from '../models/Job';
import Application from '../models/Application';
import { AuthRequest } from '../middlewares/auth';
import resumeParserService from '../services/resumeParserService';

// Get all users (admin only)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.query;

    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') },
        { location: new RegExp(search as string, 'i') }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalUsers: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if user can view this profile
    const canView = 
      user._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canView) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update current user's profile
export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const userId = req.user._id;
    const allowedUpdates = [
      'fullName', 'displayName', 'username', 'phone', 'location', 'about', 'headline', 'website', 'skills', 
      'experiences', 'education', 'profilePhoto', 'socialLinks', 'companyInfo', 'jobPreferences'
    ];

    console.log('=== UPDATE USER PROFILE - RAW BODY ===', JSON.stringify(req.body, null, 2));

    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
    const updateData: any = {};

    updates.forEach(update => {
      updateData[update] = req.body[update];
    });

    // Handle skills array conversion
    if (updateData.skills && typeof updateData.skills === 'string') {
      updateData.skills = updateData.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean);
    }

    // Handle experiences array - ensure it's properly formatted
    if (updateData.experiences) {
      if (typeof updateData.experiences === 'string') {
        console.error('❌ Experiences received as STRING:', updateData.experiences);
        try {
          updateData.experiences = JSON.parse(updateData.experiences);
        } catch (e) {
          console.error('Failed to parse experiences string, setting to empty array');
          updateData.experiences = [];
        }
      }
      if (Array.isArray(updateData.experiences)) {
        console.log('✅ Experiences is array with', updateData.experiences.length, 'items');
      }
    }

    // Handle education array - ensure it's properly formatted
    if (updateData.education) {
      if (typeof updateData.education === 'string') {
        console.error('❌ Education received as STRING:', updateData.education);
        try {
          updateData.education = JSON.parse(updateData.education);
        } catch (e) {
          console.error('Failed to parse education string, setting to empty array');
          updateData.education = [];
        }
      }
      if (Array.isArray(updateData.education)) {
        console.log('✅ Education is array with', updateData.education.length, 'items');
      }
    }

    console.log('=== UPDATE USER PROFILE - PROCESSED DATA ===', JSON.stringify(updateData, null, 2));

    const user = await User.findByIdAndUpdate(
      userId,
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
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user profile
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const { id } = req.params;

    // Check if user can update this profile
    if (id !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.'
      });
      return;
    }

    const allowedUpdates = [
      'fullName', 'displayName', 'username', 'phone', 'location', 'about', 'headline', 'website', 'skills', 
      'experiences', 'education', 'profilePhoto', 'socialLinks', 'companyInfo'
    ];

    // Admin can update more fields
    if (req.user.role === 'admin') {
      allowedUpdates.push('role', 'isActive', 'isVerified');
    }

    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
    const updateData: any = {};

    updates.forEach(update => {
      updateData[update] = req.body[update];
    });

    const user = await User.findByIdAndUpdate(
      id,
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
      message: 'User updated successfully',
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
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user can delete this profile
    if (id !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own account.'
      });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // If user is employer, handle their jobs
    if (user.role === 'employer') {
      // Close all active jobs
      await Job.updateMany(
        { employer: id, status: 'active' },
        { status: 'closed' }
      );
    }

    // If user is employee, handle their applications
    if (user.role === 'employee') {
      // Withdraw all pending applications
      await Application.updateMany(
        { applicant: id, status: 'pending' },
        { status: 'withdrawn' }
      );
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user dashboard data
export const getUserDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let dashboardData: any = {};

    if (userRole === 'employee') {
      // Employee dashboard
      const [applications, recentJobs] = await Promise.all([
        Application.find({ applicant: userId })
          .populate('job', 'title company location hourlyRate status')
          .sort({ appliedDate: -1 })
          .limit(5)
          .lean(),
        Job.find({ status: 'active' })
          .populate('employer', 'name profileImage')
          .sort({ postedDate: -1 })
          .limit(5)
          .lean()
      ]);

      const applicationStats = await Application.aggregate([
        { $match: { applicant: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      dashboardData = {
        applications,
        recentJobs,
        applicationStats
      };
    } else if (userRole === 'employer') {
      // Employer dashboard
      const [jobs, applications] = await Promise.all([
        Job.find({ employer: userId })
          .sort({ postedDate: -1 })
          .limit(5)
          .lean(),
        Application.find({ 'job.employer': userId })
          .populate('job', 'title employer')
          .populate('applicant', 'name email profileImage')
          .sort({ appliedDate: -1 })
          .limit(5)
          .lean()
      ]);

      const jobStats = await Job.aggregate([
        { $match: { employer: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      dashboardData = {
        jobs,
        applications,
        jobStats
      };
    } else if (userRole === 'admin') {
      // Admin dashboard
      const [users, jobs, applications] = await Promise.all([
        User.countDocuments(),
        Job.countDocuments(),
        Application.countDocuments()
      ]);

      const recentActivity = await Application.find()
        .populate('job', 'title employer')
        .populate('applicant', 'name email')
        .sort({ appliedDate: -1 })
        .limit(10)
        .lean();

      dashboardData = {
        stats: { users, jobs, applications },
        recentActivity
      };
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user statistics
export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = id || req.user._id;

    // Check if user can view these stats
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    let stats: any = {};

    if (user.role === 'employee') {
      const applicationStats = await Application.aggregate([
        { $match: { applicant: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalApplications = await Application.countDocuments({ applicant: userId });
      const acceptedApplications = await Application.countDocuments({ 
        applicant: userId, 
        status: 'accepted' 
      });

      stats = {
        totalApplications,
        acceptedApplications,
        applicationStats
      };
    } else if (user.role === 'employer') {
      const jobStats = await Job.aggregate([
        { $match: { employer: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalJobs = await Job.countDocuments({ employer: userId });
      const totalViews = await Job.aggregate([
        { $match: { employer: userId } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]);

      stats = {
        totalJobs,
        totalViews: totalViews[0]?.totalViews || 0,
        jobStats
      };
    }

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify user (admin only)
export const verifyUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isVerified },
      { new: true }
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
      message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
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
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Upload and parse resume
export const uploadAndParseResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No resume file uploaded'
      });
      return;
    }

    console.log('Resume upload request from user:', req.user._id);
    console.log('Uploaded file:', req.file.originalname);

    // Validate file
    const validation = resumeParserService.validateFile(req.file);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: validation.error
      });
      return;
    }

    // Parse resume
    const parseResult = await resumeParserService.parseUploadedResume(req.file);

    if (!parseResult.success) {
      res.status(500).json({
        success: false,
        message: parseResult.error || 'Failed to parse resume'
      });
      return;
    }

    // Store resume URL in user profile (if you're using cloud storage)
    // For now, we'll just return the parsed data
    // You can extend this to upload the file to Cloudinary/S3 and store the URL

    res.json({
      success: true,
      message: 'Resume parsed successfully',
      data: {
        parsedData: parseResult.data,
        suggestions: {
          message: 'Review the extracted information and make any necessary corrections',
          missingFields: getMissingFields(parseResult.data)
        }
      }
    });
  } catch (error) {
    console.error('Upload and parse resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Apply parsed resume data to user profile
export const applyParsedResumeData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsedData = req.body;

    if (!parsedData) {
      res.status(400).json({
        success: false,
        message: 'No parsed data provided'
      });
      return;
    }

    // Update user profile with parsed data
    const updateData: any = {};

    if (parsedData.fullName) updateData.fullName = parsedData.fullName;
    if (parsedData.email) updateData.email = parsedData.email;
    if (parsedData.phone) updateData.phone = parsedData.phone;
    if (parsedData.skills && parsedData.skills.length > 0) {
      // Merge with existing skills, avoiding duplicates
      updateData.skills = [...new Set([...(parsedData.skills || [])])];
    }
    if (parsedData.education) updateData.education = parsedData.education;
    if (parsedData.experiences) updateData.experiences = parsedData.experiences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
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
      message: 'Profile updated with resume data',
      data: { user }
    });
  } catch (error) {
    console.error('Apply parsed resume data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to identify missing fields
function getMissingFields(parsedData: any): string[] {
  const missing: string[] = [];
  
  if (!parsedData?.fullName) missing.push('Full Name');
  if (!parsedData?.email) missing.push('Email');
  if (!parsedData?.phone) missing.push('Phone Number');
  if (!parsedData?.skills || parsedData.skills.length === 0) missing.push('Skills');
  if (!parsedData?.education || parsedData.education.length === 0) missing.push('Education');
  if (!parsedData?.experiences || parsedData.experiences.length === 0) missing.push('Work Experience');
  
  return missing;
}
