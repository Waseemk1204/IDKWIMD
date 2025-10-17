import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User, { IUser } from '../models/User';
import Job from '../models/Job';
import Application from '../models/Application';
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middlewares/auth';

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
      'experiences', 'education', 'profilePhoto', 'socialLinks', 'companyInfo'
    ];

    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
    const updateData: any = {};

    updates.forEach(update => {
      updateData[update] = req.body[update];
    });

    // Handle skills array conversion
    if (updateData.skills && typeof updateData.skills === 'string') {
      updateData.skills = updateData.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean);
    }

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
      // Application statistics
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
      const activeApplications = await Application.countDocuments({ 
        applicant: userId, 
        status: { $in: ['pending', 'reviewed'] }
      });
      const acceptedApplications = await Application.countDocuments({ 
        applicant: userId, 
        status: 'accepted' 
      });

      // Wallet and earnings statistics
      const wallet = await Wallet.findOne({ userId, isActive: true });
      const walletBalance = wallet?.balance || 0;

      // Monthly earnings calculation
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const monthlyEarnings = await Transaction.aggregate([
        {
          $match: {
            userId: userId,
            type: 'credit',
            createdAt: { $gte: currentMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$amount' }
          }
        }
      ]);

      // Hours worked this month (placeholder - would need timesheet integration)
      const hoursThisMonth = 0; // TODO: Implement timesheet integration

      // Completed jobs
      const completedJobs = await Application.countDocuments({ 
        applicant: userId, 
        status: 'completed' 
      });

      // User rating (placeholder - would need rating system)
      const rating = 4.5; // TODO: Implement rating system

      stats = {
        activeApplications,
        totalEarnings: monthlyEarnings[0]?.totalEarnings || 0,
        hoursThisMonth,
        completedJobs,
        rating,
        walletBalance,
        totalApplications,
        acceptedApplications,
        applicationStats
      };
    } else if (user.role === 'employer') {
      // Job statistics
      const jobStats = await Job.aggregate([
        { $match: { employer: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const activeJobs = await Job.countDocuments({ 
        employer: userId, 
        status: 'active' 
      });
      const totalJobs = await Job.countDocuments({ employer: userId });
      const totalApplications = await Application.countDocuments({
        job: { $in: await Job.find({ employer: userId }).distinct('_id') }
      });

      // Wallet statistics
      const wallet = await Wallet.findOne({ userId, isActive: true });
      const walletBalance = wallet?.balance || 0;

      // Total spent calculation
      const totalSpent = await Transaction.aggregate([
        {
          $match: {
            userId: userId,
            type: 'debit'
          }
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$amount' }
          }
        }
      ]);

      // Pending timesheets (placeholder - would need timesheet integration)
      const pendingTimesheets = 0; // TODO: Implement timesheet integration

      // Average rating (placeholder - would need rating system)
      const averageRating = 4.2; // TODO: Implement rating system

      // Active workers (placeholder - would need worker tracking)
      const activeWorkers = 0; // TODO: Implement worker tracking

      stats = {
        activeJobs,
        totalApplications,
        pendingTimesheets,
        walletBalance,
        totalSpent: totalSpent[0]?.totalSpent || 0,
        averageRating,
        activeWorkers,
        totalJobs,
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
