import { Request, Response } from 'express';
import { CommunityCategory, ICommunityCategory } from '../models/CommunityCategory';
import { UserReputation, IUserReputation } from '../models/UserReputation';
import { CommunityBadge, ICommunityBadge } from '../models/CommunityBadge';
import { CommunityEvent, ICommunityEvent } from '../models/CommunityEvent';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';

// Community Categories Controller
export const getCommunityCategories = async (req: Request, res: Response) => {
  try {
    const { parentOnly = false } = req.query;

    let query: any = { isActive: true };
    if (parentOnly === 'true') {
      query.parentCategory = { $exists: false };
    }

    const categories = await CommunityCategory.find(query)
      .populate('subcategories', 'name slug color icon postCount')
      .sort({ postCount: -1, name: 1 });

    return res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Error fetching community categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

export const createCommunityCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, icon, color, parentCategory } = req.body;
    const userId = req.user?._id;

    if (!userId || req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }

    const category = new CommunityCategory({
      name: name.trim(),
      description: description.trim(),
      icon,
      color: color || '#3B82F6',
      parentCategory: parentCategory || null
    });

    await category.save();

    // If this is a subcategory, add it to parent's subcategories
    if (parentCategory) {
      await CommunityCategory.findByIdAndUpdate(parentCategory, {
        $push: { subcategories: category._id }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Error creating community category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

// User Reputation Controller
export const getUserReputation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    let reputation = await UserReputation.findOne({ user: userId })
      .populate('badges', 'name description icon color category');

    if (!reputation) {
      // Create initial reputation record
      reputation = new UserReputation({
        user: userId,
        totalPoints: 0,
        level: 1
      });
      await reputation.save();
    }

    return res.json({
      success: true,
      data: { reputation }
    });
  } catch (error) {
    console.error('Error fetching user reputation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reputation'
    });
  }
};

export const getReputationLeaderboard = async (req: Request, res: Response) => {
  try {
    const { limit = 50, timeframe = 'alltime' } = req.query;
    const limitNum = parseInt(limit as string);

    let query: any = {};
    
    if (timeframe !== 'alltime') {
      const now = new Date();
      let startDate: Date;
      
      switch (timeframe) {
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'yearly':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      query.lastActivity = { $gte: startDate };
    }

    const leaderboard = await UserReputation.find(query)
      .populate('user', 'name email profilePhoto role headline')
      .populate('badges', 'name icon color')
      .sort({ totalPoints: -1, lastActivity: -1 })
      .limit(limitNum);

    return res.json({
      success: true,
      data: { leaderboard }
    });
  } catch (error) {
    console.error('Error fetching reputation leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
};

// Community Badges Controller
export const getCommunityBadges = async (req: Request, res: Response) => {
  try {
    const { category, isActive = true } = req.query;

    let query: any = {};
    if (isActive === 'true') {
      query.isActive = true;
    }
    if (category) {
      query.category = category;
    }

    const badges = await CommunityBadge.find(query)
      .sort({ awardedCount: -1, name: 1 });

    return res.json({
      success: true,
      data: { badges }
    });
  } catch (error) {
    console.error('Error fetching community badges:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch badges'
    });
  }
};

export const createCommunityBadge = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, icon, color, category, requirements, isRare } = req.body;
    const userId = req.user?._id;

    if (!userId || req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    if (!name || !description || !icon || !color || !category || !requirements) {
      return res.status(400).json({
        success: false,
        message: 'All badge fields are required'
      });
    }

    const badge = new CommunityBadge({
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      category,
      requirements,
      isRare: isRare || false
    });

    await badge.save();

    return res.status(201).json({
      success: true,
      message: 'Badge created successfully',
      data: { badge }
    });
  } catch (error) {
    console.error('Error creating community badge:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create badge'
    });
  }
};

// Community Events Controller
export const getCommunityEvents = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'upcoming',
      type,
      category,
      host
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }
    if (host) {
      query.host = host;
    }

    const events = await CommunityEvent.find(query)
      .populate('host', 'name email profilePhoto role headline')
      .populate('category', 'name slug color icon')
      .populate('participants', 'name email profilePhoto role')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await CommunityEvent.countDocuments(query);

    return res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalEvents: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching community events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
};

export const createCommunityEvent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      type,
      startDate,
      endDate,
      maxParticipants,
      tags = [],
      isPublic = true,
      requirements = {},
      location = {},
      agenda = [],
      resources = []
    } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!title || !description || !category || !type || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, type, and start date are required'
      });
    }

    // Validate category exists
    const categoryExists = await CommunityCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const event = new CommunityEvent({
      title: title.trim(),
      description: description.trim(),
      host: userId,
      category,
      type,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      maxParticipants,
      tags: tags.filter((tag: string) => tag.trim().length > 0),
      isPublic,
      requirements,
      location,
      agenda,
      resources
    });

    await event.save();

    // Update user reputation
    const reputation = await UserReputation.findOne({ user: userId });
    if (reputation) {
      await reputation.addReputation(15, 'Created a community event', 'event', event._id);
      await reputation.updateContribution('eventsHosted');
    }

    // Populate event details
    await event.populate('host', 'name email profilePhoto role headline');
    await event.populate('category', 'name slug color icon');

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Error creating community event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
};

export const joinCommunityEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await CommunityEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.canJoin) {
      return res.status(400).json({
        success: false,
        message: 'Cannot join this event'
      });
    }

    await event.addParticipant(userId);

    return res.json({
      success: true,
      message: 'Successfully joined event',
      data: {
        participantCount: event.participantCount,
        isParticipant: true
      }
    });
  } catch (error) {
    console.error('Error joining community event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to join event'
    });
  }
};

export const leaveCommunityEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await CommunityEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await event.removeParticipant(userId);

    return res.json({
      success: true,
      message: 'Successfully left event',
      data: {
        participantCount: event.participantCount,
        isParticipant: false
      }
    });
  } catch (error) {
    console.error('Error leaving community event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to leave event'
    });
  }
};

export const submitEventFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Valid rating (1-5) is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    const event = await CommunityEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user participated in the event
    if (!event.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You must participate in the event to submit feedback'
      });
    }

    // Check if user already submitted feedback
    const existingFeedback = event.feedback.find(f => f.participant.equals(userId));
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this event'
      });
    }

    event.feedback.push({
      participant: userId,
      rating,
      comment: comment?.trim(),
      createdAt: new Date()
    });

    await event.save();

    return res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        averageRating: event.averageRating,
        feedbackCount: event.feedback.length
      }
    });
  } catch (error) {
    console.error('Error submitting event feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
};

