import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Job, { IJob } from '../models/Job';
import User from '../models/User';
import { AuthRequest, verifyToken } from '../middlewares/auth';

// Get all jobs with filtering and pagination
export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      location,
      skills,
      minRate,
      maxRate,
      minSalary, // Frontend sends minSalary, map to minRate
      maxSalary, // Frontend sends maxSalary, map to maxRate
      jobType,
      experienceLevel,
      isRemote,
      status = 'active',
      search,
      sortBy = 'postedDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = { status };

    // Category filter
    if (category) filter.category = category;

    // Location filter (case-insensitive partial match)
    if (location) {
      // Escape special regex characters and allow partial matches
      const escapedLocation = (location as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.location = new RegExp(escapedLocation, 'i');
    }

    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      filter.skills = { $in: skillsArray };
    }

    // Salary/Rate filter - handle both minSalary/maxSalary (from frontend) and minRate/maxRate
    const minRateValue = (minSalary !== undefined && minSalary !== '' && minSalary !== null)
      ? Number(minSalary)
      : ((minRate !== undefined && minRate !== '' && minRate !== null) ? Number(minRate) : undefined);
    const maxRateValue = (maxSalary !== undefined && maxSalary !== '' && maxSalary !== null)
      ? Number(maxSalary)
      : ((maxRate !== undefined && maxRate !== '' && maxRate !== null) ? Number(maxRate) : undefined);

    if ((minRateValue !== undefined && !isNaN(minRateValue)) || (maxRateValue !== undefined && !isNaN(maxRateValue))) {
      const rateFilter: any = {};
      if (minRateValue !== undefined && !isNaN(minRateValue)) rateFilter.$gte = minRateValue;
      if (maxRateValue !== undefined && !isNaN(maxRateValue)) rateFilter.$lte = maxRateValue;

      // Build complex filter for hourly rate matching
      const rateConditions: any[] = [];

      // Match jobs with fixed hourly rate
      if (Object.keys(rateFilter).length > 0) {
        rateConditions.push({ hourlyRate: rateFilter });
      }

      // Match jobs with pay range that overlaps with filter range
      if (minRateValue !== undefined && !isNaN(minRateValue) && maxRateValue !== undefined && !isNaN(maxRateValue)) {
        // Both min and max specified
        rateConditions.push({
          $and: [
            { minHourlyRate: { $exists: true } },
            { maxHourlyRate: { $exists: true } },
            {
              $and: [
                { minHourlyRate: { $lte: maxRateValue } },
                { maxHourlyRate: { $gte: minRateValue } }
              ]
            }
          ]
        });
      } else if (minRateValue !== undefined && !isNaN(minRateValue)) {
        // Only min rate specified - match if maxHourlyRate >= minRateValue OR hourlyRate >= minRateValue
        rateConditions.push({
          $and: [
            { minHourlyRate: { $exists: true } },
            { maxHourlyRate: { $exists: true } },
            { maxHourlyRate: { $gte: minRateValue } }
          ]
        });
      } else if (maxRateValue !== undefined && !isNaN(maxRateValue)) {
        // Only max rate specified - match if minHourlyRate <= maxRateValue OR hourlyRate <= maxRateValue
        rateConditions.push({
          $and: [
            { minHourlyRate: { $exists: true } },
            { maxHourlyRate: { $exists: true } },
            { minHourlyRate: { $lte: maxRateValue } }
          ]
        });
      }

      // If we have existing $or conditions (from search), merge them
      if (filter.$or && !Array.isArray(filter.$or[0])) {
        // Existing $or is from search, combine with rate conditions
        filter.$and = [
          { $or: filter.$or },
          { $or: rateConditions }
        ];
        delete filter.$or;
      } else if (filter.$or && Array.isArray(filter.$or[0])) {
        // Already have $and structure, add rate conditions
        filter.$and = filter.$and || [];
        filter.$and.push({ $or: rateConditions });
      } else {
        filter.$or = rateConditions;
      }
    }

    // Job Type filter
    if (jobType) {
      // Normalize job type (handle variations like "part-time", "part_time", "parttime")
      const normalizedJobType = (jobType as string).toLowerCase().replace(/[-_]/g, '');
      filter.type = new RegExp(normalizedJobType, 'i');
    }

    // Experience Level filter
    if (experienceLevel) filter.experienceLevel = experienceLevel;

    // Remote filter
    if (isRemote !== undefined) {
      const isRemoteValue = typeof isRemote === 'string'
        ? (isRemote === 'true' || isRemote === '1')
        : Boolean(isRemote);
      filter.isRemote = isRemoteValue;
    }

    // Search filter (title, description, company)
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      const searchConditions = [
        { title: searchRegex },
        { description: searchRegex },
        { company: searchRegex }
      ];

      // If we have existing $or conditions (from rate filter), use $and to combine
      if (filter.$or && !filter.$and) {
        filter.$and = [
          { $or: filter.$or },
          { $or: searchConditions }
        ];
        delete filter.$or;
      } else if (filter.$and) {
        filter.$and.push({ $or: searchConditions });
      } else {
        filter.$or = searchConditions;
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const jobs = await Job.find(filter)
      .populate('employer', 'name email profileImage')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: {
        jobs,
        total,
        hasMore: Number(page) < Math.ceil(total / Number(limit)),
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalJobs: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get job by ID
export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate('employer', 'name email profileImage phone location')
      .populate('applications', 'applicant status appliedDate')
      .lean();

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    // Increment view count
    await Job.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new job
export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const jobData = {
      ...req.body,
      employer: req.user._id
    };

    const job = new Job(jobData);
    await job.save();

    // Populate employer data
    await job.populate('employer', 'name email profileImage');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update job
export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const job = await Job.findById(id);

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    // Check if user owns the job or is admin
    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own jobs.'
      });
      return;
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employer', 'name email profileImage');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete job
export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    // Check if user owns the job or is admin
    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own jobs.'
      });
      return;
    }

    await Job.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get jobs by employer
export const getJobsByEmployer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const employerId = req.params.employerId;

    // Manual authentication check
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
      return;
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found.'
      });
      return;
    }

    const finalEmployerId = employerId || user._id;

    // Check if user can view these jobs
    if (employerId && employerId !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const filter: any = { employer: finalEmployerId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(filter)
      .populate('employer', 'name email profileImage')
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: {
        jobs: jobs || [],
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)) || 1,
          totalJobs: total || 0,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get jobs by employer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get featured jobs
export const getFeaturedJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 8 } = req.query;

    // Show all active jobs, prioritizing featured ones
    const jobs = await Job.find({
      status: 'active'
    })
      .populate('employer', 'name email profileImage')
      .sort({ isFeatured: -1, postedDate: -1 }) // Featured jobs first, then by date
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: { jobs }
    });
  } catch (error) {
    console.error('Get featured jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get job categories
export const getJobCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Job.distinct('category', { status: 'active' });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get job categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get job statistics
export const getJobStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await Job.aggregate([
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          avgHourlyRate: { $avg: '$hourlyRate' }
        }
      }
    ]);

    const categoryStats = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRate: { $avg: '$hourlyRate' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalJobs: 0,
          activeJobs: 0,
          totalViews: 0,
          avgHourlyRate: 0
        },
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
