import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Job from '../models/Job';
import User from '../models/User';
import Blog from '../models/Blog';
import { CommunityPost } from '../models/CommunityPost';
import { AuthRequest } from '../middlewares/auth';

// Global search across all content types
export const globalSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      q: query,
      type = 'all', // all, jobs, users, blogs, community
      page = 1,
      limit = 10,
      location,
      category,
      skills,
      minRate,
      maxRate,
      experienceLevel,
      isRemote,
      userRole
    } = req.query;

    if (!query || (query as string).trim().length < 2) {
      res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
      return;
    }

    const searchQuery = (query as string).trim();
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const results: any = {
      jobs: [],
      users: [],
      blogs: [],
      community: [],
      totalResults: 0
    };

    // Search Jobs
    if (type === 'all' || type === 'jobs') {
      const jobFilter: any = {
        status: 'active',
        $or: [
          { title: new RegExp(searchQuery, 'i') },
          { description: new RegExp(searchQuery, 'i') },
          { company: new RegExp(searchQuery, 'i') },
          { skills: { $in: [new RegExp(searchQuery, 'i')] } }
        ]
      };

      // Apply additional job filters
      if (location) jobFilter.location = new RegExp(location as string, 'i');
      if (category) jobFilter.category = category;
      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        jobFilter.skills = { $in: skillsArray };
      }
      if (experienceLevel) jobFilter.experienceLevel = experienceLevel;
      if (isRemote !== undefined) jobFilter.isRemote = isRemote === 'true';
      if (minRate || maxRate) {
        const rateFilter: any = {};
        if (minRate) rateFilter.$gte = Number(minRate);
        if (maxRate) rateFilter.$lte = Number(maxRate);
        jobFilter.$or = [
          { hourlyRate: rateFilter },
          {
            $and: [
              { minHourlyRate: { $exists: true } },
              { maxHourlyRate: { $exists: true } },
              {
                $or: [
                  {
                    $and: [
                      { minHourlyRate: { $lte: Number(maxRate || Infinity) } },
                      { maxHourlyRate: { $gte: Number(minRate || 0) } }
                    ]
                  }
                ]
              }
            ]
          }
        ];
      }

      const jobs = await Job.find(jobFilter)
        .populate('employer', 'name email profileImage')
        .sort({ postedDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const totalJobs = await Job.countDocuments(jobFilter);
      results.jobs = jobs;
      results.totalResults += totalJobs;
    }

    // Search Users
    if (type === 'all' || type === 'users') {
      const userFilter: any = {
        isActive: true,
        $or: [
          { name: new RegExp(searchQuery, 'i') },
          { email: new RegExp(searchQuery, 'i') },
          { bio: new RegExp(searchQuery, 'i') },
          { skills: { $in: [new RegExp(searchQuery, 'i')] } },
          { location: new RegExp(searchQuery, 'i') }
        ]
      };

      if (userRole) userFilter.role = userRole;

      const users = await User.find(userFilter)
        .select('name email profileImage role bio skills location experience rating totalJobs')
        .sort({ rating: -1, totalJobs: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const totalUsers = await User.countDocuments(userFilter);
      results.users = users;
      results.totalResults += totalUsers;
    }

    // Search Blogs
    if (type === 'all' || type === 'blogs') {
      const blogFilter: any = {
        status: 'published',
        $or: [
          { title: new RegExp(searchQuery, 'i') },
          { content: new RegExp(searchQuery, 'i') },
          { excerpt: new RegExp(searchQuery, 'i') },
          { tags: { $in: [new RegExp(searchQuery, 'i')] } }
        ]
      };

      if (category) blogFilter.category = category;

      const blogs = await Blog.find(blogFilter)
        .populate('author', 'name email profileImage')
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const totalBlogs = await Blog.countDocuments(blogFilter);
      results.blogs = blogs;
      results.totalResults += totalBlogs;
    }

    // Search Community Posts
    if (type === 'all' || type === 'community') {
      const communityFilter: any = {
        status: 'active',
        $or: [
          { title: new RegExp(searchQuery, 'i') },
          { content: new RegExp(searchQuery, 'i') },
          { tags: { $in: [new RegExp(searchQuery, 'i')] } }
        ]
      };

      const communityPosts = await CommunityPost.find(communityFilter)
        .populate('author', 'name email profileImage role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const totalCommunity = await CommunityPost.countDocuments(communityFilter);
      results.community = communityPosts;
      results.totalResults += totalCommunity;
    }

    res.json({
      success: true,
      data: {
        results,
        query: searchQuery,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(results.totalResults / limitNum),
          totalResults: results.totalResults,
          hasNext: pageNum < Math.ceil(results.totalResults / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};

// Get search suggestions/autocomplete
export const getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q: query, type = 'all' } = req.query;

    if (!query || (query as string).trim().length < 1) {
      res.json({
        success: true,
        data: { suggestions: [] }
      });
      return;
    }

    const searchQuery = (query as string).trim();
    const suggestions: any[] = [];

    // Get job title suggestions
    if (type === 'all' || type === 'jobs') {
      const jobTitles = await Job.aggregate([
        { $match: { status: 'active', title: new RegExp(searchQuery, 'i') } },
        { $group: { _id: '$title', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      suggestions.push(...jobTitles.map(job => ({
        type: 'job',
        text: job._id,
        count: job.count
      })));
    }

    // Get skill suggestions
    if (type === 'all' || type === 'jobs' || type === 'users') {
      const skills = await Job.aggregate([
        { $match: { status: 'active' } },
        { $unwind: '$skills' },
        { $match: { skills: new RegExp(searchQuery, 'i') } },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      suggestions.push(...skills.map(skill => ({
        type: 'skill',
        text: skill._id,
        count: skill.count
      })));
    }

    // Get company suggestions
    if (type === 'all' || type === 'jobs') {
      const companies = await Job.aggregate([
        { $match: { status: 'active', company: new RegExp(searchQuery, 'i') } },
        { $group: { _id: '$company', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      suggestions.push(...companies.map(company => ({
        type: 'company',
        text: company._id,
        count: company.count
      })));
    }

    // Get location suggestions
    if (type === 'all' || type === 'jobs' || type === 'users') {
      const locations = await Job.aggregate([
        { $match: { status: 'active', location: new RegExp(searchQuery, 'i') } },
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      suggestions.push(...locations.map(location => ({
        type: 'location',
        text: location._id,
        count: location.count
      })));
    }

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions'
    });
  }
};

// Get trending searches
export const getTrendingSearches = async (req: Request, res: Response): Promise<void> => {
  try {
    // This would typically come from a search analytics system
    // For now, we'll return popular skills and job titles
    const trendingSkills = await Job.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const trendingJobTitles = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$title', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        trendingSkills: trendingSkills.map(skill => ({
          text: skill._id,
          count: skill.count
        })),
        trendingJobTitles: trendingJobTitles.map(job => ({
          text: job._id,
          count: job.count
        }))
      }
    });
  } catch (error) {
    console.error('Trending searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending searches'
    });
  }
};

// Get search filters/options
export const getSearchFilters = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Job.distinct('category', { status: 'active' });
    const skills = await Job.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);
    const locations = await Job.distinct('location', { status: 'active' });
    const experienceLevels = await Job.distinct('experienceLevel', { status: 'active' });

    res.json({
      success: true,
      data: {
        categories,
        skills: skills.map(skill => ({ name: skill._id, count: skill.count })),
        locations,
        experienceLevels
      }
    });
  } catch (error) {
    console.error('Search filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search filters'
    });
  }
};
