import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import User from '../models/User';
import Job from '../models/Job';
import Application from '../models/Application';
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
// Removed: Community and Connection models (MVP cleanup)
import { Follow } from '../models/Follow';
import mongoose from 'mongoose';

// Get dashboard analytics
export const getDashboardAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Basic counts
    const [
      totalUsers,
      totalEmployers,
      totalEmployees,
      totalJobs,
      totalApplications,
      totalTransactions,
      totalRevenue,
      pendingVerifications,
      pendingJobApprovals,
      activeDisputes
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'employer' }),
      User.countDocuments({ role: 'employee' }),
      Job.countDocuments(),
      Application.countDocuments(),
      Transaction.countDocuments({ status: 'completed' }),
      Transaction.aggregate([
        { $match: { status: 'completed', type: 'payment' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      User.countDocuments({ verificationStatus: 'pending' }),
      Job.countDocuments({ status: 'pending' }),
      // TODO: Add dispute model and count
      0
    ]);

    // Growth metrics
    const [
      newUsersThisPeriod,
      newJobsThisPeriod,
      newApplicationsThisPeriod,
      revenueThisPeriod
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Job.countDocuments({ createdAt: { $gte: startDate } }),
      Application.countDocuments({ createdAt: { $gte: startDate } }),
      Transaction.aggregate([
        { 
          $match: { 
            status: 'completed', 
            type: 'payment',
            createdAt: { $gte: startDate }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // User activity metrics
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: startDate }
    });

    // Job completion rate
    const completedJobs = await Job.countDocuments({ status: 'completed' });
    const jobCompletionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    // Application success rate
    const acceptedApplications = await Application.countDocuments({ status: 'accepted' });
    const applicationSuccessRate = totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalEmployers,
          totalEmployees,
          totalJobs,
          totalApplications,
          totalTransactions,
          totalRevenue: totalRevenue[0]?.total || 0,
          pendingVerifications,
          pendingJobApprovals,
          activeDisputes
        },
        growth: {
          newUsers: newUsersThisPeriod,
          newJobs: newJobsThisPeriod,
          newApplications: newApplicationsThisPeriod,
          revenue: revenueThisPeriod[0]?.total || 0,
          period: days
        },
        metrics: {
          activeUsers,
          jobCompletionRate: Math.round(jobCompletionRate * 100) / 100,
          applicationSuccessRate: Math.round(applicationSuccessRate * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard analytics'
    });
  }
};

// Get user analytics
export const getUserAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User registration trends
    const registrationTrends = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // User role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Verification status distribution
    const verificationStatus = await User.aggregate([
      { $group: { _id: '$verificationStatus', count: { $sum: 1 } } }
    ]);

    // Top performing users (by earnings)
    const topEarners = await Transaction.aggregate([
      { $match: { type: 'credit', status: 'completed' } },
      { $group: { _id: '$userId', totalEarnings: { $sum: '$amount' } } },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          totalEarnings: 1
        }
      }
    ]);

    // User activity levels
    const activityLevels = await User.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $gte: ['$lastLoginAt', startDate] },
              'active',
              'inactive'
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        registrationTrends,
        roleDistribution,
        verificationStatus,
        topEarners,
        activityLevels,
        period: days
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user analytics'
    });
  }
};

// Get job analytics
export const getJobAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Job posting trends
    const jobTrends = await Job.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Job status distribution
    const jobStatusDistribution = await Job.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Category distribution
    const categoryDistribution = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Top employers by job count
    const topEmployers = await Job.aggregate([
      { $group: { _id: '$employer', jobCount: { $sum: 1 } } },
      { $sort: { jobCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employer'
        }
      },
      { $unwind: '$employer' },
      {
        $project: {
          employerId: '$_id',
          name: '$employer.name',
          email: '$employer.email',
          jobCount: 1
        }
      }
    ]);

    // Average job duration
    const jobDurationStats = await Job.aggregate([
      { $match: { status: 'completed' } },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
          minDuration: { $min: '$duration' },
          maxDuration: { $max: '$duration' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        jobTrends,
        jobStatusDistribution,
        categoryDistribution,
        topEmployers,
        jobDurationStats: jobDurationStats[0] || null,
        period: days
      }
    });
  } catch (error) {
    console.error('Get job analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job analytics'
    });
  }
};

// Get financial analytics
export const getFinancialAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Revenue trends
    const revenueTrends = await Transaction.aggregate([
      { 
        $match: { 
          type: 'payment',
          status: 'completed',
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Transaction type distribution
    const transactionTypes = await Transaction.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    // Top earning categories
    const topEarningCategories = await Transaction.aggregate([
      { $match: { type: 'credit', status: 'completed' } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'relatedJobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      { $group: { _id: '$job.category', totalEarnings: { $sum: '$amount' } } },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 }
    ]);

    // Wallet statistics
    const walletStats = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$balance' },
          avgBalance: { $avg: '$balance' },
          activeWallets: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    // Monthly revenue comparison
    const monthlyRevenue = await Transaction.aggregate([
      { 
        $match: { 
          type: 'payment',
          status: 'completed'
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        revenueTrends,
        transactionTypes,
        topEarningCategories,
        walletStats: walletStats[0] || null,
        monthlyRevenue,
        period: days
      }
    });
  } catch (error) {
    console.error('Get financial analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get financial analytics'
    });
  }
};

// Get moderation data
export const getModerationData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Pending verifications
    const pendingVerifications = await User.find({ verificationStatus: 'pending' })
      .select('name email role createdAt verificationDocuments')
      .sort({ createdAt: -1 })
      .limit(20);

    // Pending job approvals
    const pendingJobApprovals = await Job.find({ status: 'pending' })
      .populate('employer', 'name email')
      .select('title company description category createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    // Removed: Community posts and comments (MVP cleanup)
    const recentCommunityPosts: any[] = [];
    const recentComments: any[] = [];

    // User reports (if report model exists)
    // TODO: Implement report model and fetch reports

    res.json({
      success: true,
      data: {
        pendingVerifications,
        pendingJobApprovals,
        recentCommunityPosts,
        recentComments,
        reports: [] // TODO: Add when report model is implemented
      }
    });
  } catch (error) {
    console.error('Get moderation data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get moderation data'
    });
  }
};

// Approve user verification
export const approveUserVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid verification status'
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

    user.verificationStatus = status;
    if (reason) {
      // Add verification notes to user metadata or create a separate field
      (user as any).verificationNotes = reason;
    }
    await user.save();

    res.json({
      success: true,
      message: `User verification ${status} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Approve user verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user verification'
    });
  }
};

// Approve job
export const approveJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid job status'
      });
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    job.status = status === 'approved' ? 'active' : 'closed';
    if (reason) {
      (job as any).adminNotes = reason;
    }
    await job.save();

    res.json({
      success: true,
      message: `Job ${status} successfully`,
      data: { job }
    });
  } catch (error) {
    console.error('Approve job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job status'
    });
  }
};

// Moderate community content
export const moderateCommunityContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { contentId, contentType } = req.params;
    const { action, reason } = req.body;

    if (!['approve', 'reject', 'delete'].includes(action)) {
      res.status(400).json({
        success: false,
        message: 'Invalid moderation action'
      });
      return;
    }

    // Removed: Community content moderation (MVP cleanup)
    const content: any = null;
    
    if (contentType === 'post' || contentType === 'comment') {
      res.status(400).json({
        success: false,
        message: 'Community features have been removed from MVP'
      });
      return;
    }

    if (!content) {
      res.status(404).json({
        success: false,
        message: 'Content not found'
      });
      return;
    }

    res.json({
      success: true,
      message: `Content ${action}d successfully`,
      data: { content }
    });
  } catch (error) {
    console.error('Moderate community content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate content'
    });
  }
};
