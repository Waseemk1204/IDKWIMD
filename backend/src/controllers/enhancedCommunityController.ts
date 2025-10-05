import { Request, Response } from 'express';
import { CommunityPost, ICommunityPost } from '../models/CommunityPost';
import { CommunityComment, ICommunityComment } from '../models/CommunityComment';
import { CommunityCategory, ICommunityCategory } from '../models/CommunityCategory';
import { UserReputation, IUserReputation } from '../models/UserReputation';
import { CommunityBadge, ICommunityBadge } from '../models/CommunityBadge';
import { CommunityEvent, ICommunityEvent } from '../models/CommunityEvent';
import { UserBookmark, IUserBookmark } from '../models/UserBookmark';
import { UserFollow, IUserFollow } from '../models/UserFollow';
import { IUser } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';

// Get all community posts with enhanced filtering and professional context
export const getCommunityPosts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'newest',
      search,
      category,
      type,
      industry,
      skillLevel,
      skills,
      author,
      isMentorshipRequest,
      isTrending,
      isFeatured
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    if (industry) {
      query['professionalContext.industry'] = industry;
    }

    if (skillLevel) {
      query['professionalContext.skillLevel'] = skillLevel;
    }

    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query['professionalContext.relatedSkills'] = { $in: skillsArray };
    }

    if (author) {
      query.author = author;
    }

    if (isMentorshipRequest === 'true') {
      query['mentorship.isMentorshipRequest'] = true;
    }

    if (isTrending === 'true') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: oneDayAgo };
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Build sort
    let sort: any = { createdAt: -1 };
    if (sortBy === 'trending') {
      sort = { 'engagementScore': -1, createdAt: -1 };
    } else if (sortBy === 'top') {
      sort = { likes: -1, createdAt: -1 };
    } else if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'most_helpful') {
      sort = { 'engagement.helpfulVotes': -1, createdAt: -1 };
    } else if (sortBy === 'expert_endorsed') {
      sort = { 'engagement.expertEndorsements': -1, createdAt: -1 };
    } else if (sortBy === 'professional_relevance') {
      sort = { 'professionalRelevanceScore': -1, createdAt: -1 };
    }

    const posts = await CommunityPost.find(query)
      .populate('author', 'name email profilePhoto role headline skills')
      .populate('category', 'name slug color icon')
      .populate({
        path: 'comments',
        select: '_id',
        options: { limit: 0 }
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await CommunityPost.countDocuments(query);

    return res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalPosts: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch community posts'
    });
  }
};

// Get community post by ID with enhanced details
export const getCommunityPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    const post = await CommunityPost.findById(id)
      .populate('author', 'name email profilePhoto role headline skills experiences')
      .populate('category', 'name slug color icon description')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name email profilePhoto role'
        },
        options: { sort: { createdAt: -1 } }
      })
      .populate('professionalContext.projectConnection', 'title company location');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await post.incrementViews();

    return res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Error fetching community post:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch community post'
    });
  }
};

// Create a new community post with professional context
export const createCommunityPost = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      content,
      category,
      type = 'discussion',
      tags = [],
      professionalContext = {},
      mentorship = {}
    } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and category are required'
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

    // Create the post
    const post = new CommunityPost({
      title: title.trim(),
      content: content.trim(),
      author: userId,
      category,
      type,
      tags: tags.filter((tag: string) => tag.trim().length > 0),
      professionalContext: {
        industry: professionalContext.industry,
        skillLevel: professionalContext.skillLevel,
        relatedSkills: professionalContext.relatedSkills || [],
        jobRelevance: professionalContext.jobRelevance || false,
        projectConnection: professionalContext.projectConnection
      },
      mentorship: {
        isMentorshipRequest: mentorship.isMentorshipRequest || false,
        menteeLevel: mentorship.menteeLevel,
        preferredMentorSkills: mentorship.preferredMentorSkills || [],
        mentorshipType: mentorship.mentorshipType
      }
    });

    await post.save();

    // Update user reputation
    const reputation = await UserReputation.findOne({ user: userId });
    if (reputation) {
      await reputation.addReputation(5, 'Created a community post', 'post', post._id);
      await reputation.updateContribution('postsCreated');
    }

    // Update category post count
    await CommunityCategory.findByIdAndUpdate(category, {
      $inc: { postCount: 1 }
    });

    // Populate author and category information
    await post.populate('author', 'name email profilePhoto role headline skills');
    await post.populate('category', 'name slug color icon');

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Error creating community post:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
};

// Update a community post
export const updateCommunityPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      category,
      type,
      tags,
      professionalContext,
      mentorship
    } = req.body;
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
        message: 'Invalid post ID'
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // Update fields
    if (title) post.title = title.trim();
    if (content) post.content = content.trim();
    if (category) {
      const categoryExists = await CommunityCategory.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
      post.category = category;
    }
    if (type) post.type = type;
    if (tags) post.tags = tags.filter((tag: string) => tag.trim().length > 0);
    if (professionalContext) {
      post.professionalContext = {
        ...post.professionalContext,
        ...professionalContext
      };
    }
    if (mentorship) {
      post.mentorship = {
        ...post.mentorship,
        ...mentorship
      };
    }

    await post.save();

    // Populate updated information
    await post.populate('author', 'name email profilePhoto role headline skills');
    await post.populate('category', 'name slug color icon');

    return res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Error updating community post:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
};

// Delete a community post
export const deleteCommunityPost = async (req: AuthRequest, res: Response) => {
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
        message: 'Invalid post ID'
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Soft delete
    post.status = 'deleted';
    await post.save();

    // Update category post count
    await CommunityCategory.findByIdAndUpdate(post.category, {
      $inc: { postCount: -1 }
    });

    return res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting community post:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

// Like/unlike a community post
export const togglePostLike = async (req: AuthRequest, res: Response) => {
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
        message: 'Invalid post ID'
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isLiked = post.likedBy.includes(userId);
    
    if (isLiked) {
      // Unlike
      post.likedBy = post.likedBy.filter(id => !id.equals(userId));
    } else {
      // Like
      post.likedBy.push(userId);
      
      // Update user reputation
      const reputation = await UserReputation.findOne({ user: userId });
      if (reputation) {
        await reputation.addReputation(1, 'Liked a community post', 'like', post._id);
        await reputation.updateContribution('postsLiked');
      }
    }

    await post.save();

    return res.json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      data: {
        isLiked: !isLiked,
        likesCount: post.likes
      }
    });
  } catch (error) {
    console.error('Error toggling post like:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

// Add helpful vote to a post
export const addHelpfulVote = async (req: AuthRequest, res: Response) => {
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
        message: 'Invalid post ID'
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked the post
    if (post.likedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this post'
      });
    }

    await post.addHelpfulVote(userId);

    // Update author's reputation
    const authorReputation = await UserReputation.findOne({ user: post.author });
    if (authorReputation) {
      await authorReputation.addReputation(3, 'Received helpful vote', 'helpful', post._id);
    }

    return res.json({
      success: true,
      message: 'Helpful vote added',
      data: {
        helpfulVotes: post.engagement.helpfulVotes
      }
    });
  } catch (error) {
    console.error('Error adding helpful vote:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add helpful vote'
    });
  }
};

// Add expert endorsement to a post
export const addExpertEndorsement = async (req: AuthRequest, res: Response) => {
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
        message: 'Invalid post ID'
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is endorsing their own post
    if (post.author.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot endorse your own post'
      });
    }

    await post.addExpertEndorsement(userId);

    // Update author's reputation significantly
    const authorReputation = await UserReputation.findOne({ user: post.author });
    if (authorReputation) {
      await authorReputation.addReputation(10, 'Received expert endorsement', 'expert', post._id);
    }

    return res.json({
      success: true,
      message: 'Expert endorsement added',
      data: {
        expertEndorsements: post.engagement.expertEndorsements
      }
    });
  } catch (error) {
    console.error('Error adding expert endorsement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add expert endorsement'
    });
  }
};

// Bookmark/unbookmark a post
export const togglePostBookmark = async (req: AuthRequest, res: Response) => {
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
        message: 'Invalid post ID'
      });
    }

    const existingBookmark = await UserBookmark.findOne({
      user: userId,
      post: id
    });

    if (existingBookmark) {
      // Remove bookmark
      await UserBookmark.findByIdAndDelete(existingBookmark._id);
      
      const post = await CommunityPost.findById(id);
      if (post) {
        post.engagement.bookmarks = Math.max(0, post.engagement.bookmarks - 1);
        await post.save();
      }

      return res.json({
        success: true,
        message: 'Post unbookmarked',
        data: { isBookmarked: false }
      });
    } else {
      // Add bookmark
      const bookmark = new UserBookmark({
        user: userId,
        post: id
      });
      await bookmark.save();

      const post = await CommunityPost.findById(id);
      if (post) {
        await post.bookmark();
      }

      return res.json({
        success: true,
        message: 'Post bookmarked',
        data: { isBookmarked: true }
      });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle bookmark'
    });
  }
};

// Share a post
export const sharePost = async (req: AuthRequest, res: Response) => {
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
        message: 'Invalid post ID'
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.share();

    return res.json({
      success: true,
      message: 'Post shared',
      data: {
        shares: post.engagement.shares
      }
    });
  } catch (error) {
    console.error('Error sharing post:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to share post'
    });
  }
};

// Get trending posts
export const getTrendingPosts = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);

    const posts = await CommunityPost.getTrendingPosts(limitNum);

    return res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch trending posts'
    });
  }
};

// Get posts by professional context
export const getPostsByProfessionalContext = async (req: Request, res: Response) => {
  try {
    const { industry, skillLevel, skills } = req.query;
    
    const skillsArray = skills ? (Array.isArray(skills) ? skills : [skills]) : undefined;

    const posts = await CommunityPost.getPostsByProfessionalContext(
      industry as string,
      skillLevel as string,
      skillsArray as string[]
    );

    return res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Error fetching posts by professional context:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
};

// Get user's bookmarked posts
export const getUserBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const bookmarks = await UserBookmark.find({ user: userId })
      .populate({
        path: 'post',
        populate: [
          { path: 'author', select: 'name email profilePhoto role headline' },
          { path: 'category', select: 'name slug color icon' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await UserBookmark.countDocuments({ user: userId });

    return res.json({
      success: true,
      data: {
        bookmarks: bookmarks.map(b => b.post).filter(Boolean),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalBookmarks: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarks'
    });
  }
};

