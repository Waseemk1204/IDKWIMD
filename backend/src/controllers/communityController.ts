import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CommunityPost, ICommunityPost } from '../models/CommunityPost';
import { CommunityComment, ICommunityComment } from '../models/CommunityComment';
import { IUser } from '../models/User';
import { AuthRequest } from '../middlewares/auth';

// Get all community posts with filtering and pagination
export const getCommunityPosts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'newest',
      search,
      tag,
      author
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (author) {
      query.author = author;
    }

    // Build sort
    let sort: any = { createdAt: -1 };
    if (sortBy === 'trending') {
      // Trending: combination of recency and popularity
      sort = { likes: -1, createdAt: -1 };
    } else if (sortBy === 'top') {
      sort = { likes: -1 };
    } else if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    }

    const posts = await CommunityPost.find(query)
      .populate('author', 'name email profileImage role')
      .populate({
        path: 'comments',
        select: '_id' // Only fetch comment IDs to count them
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await CommunityPost.countDocuments(query);

    return res.json({
      success: true,
      data: {
        posts: posts.map(post => ({
          ...post,
          comments: post.comments.length // Return count of comments
        })),
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

// Get a single community post by ID
export const getCommunityPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?._id; // Get user ID if authenticated

    const post = await CommunityPost.findById(id)
      .populate('author', 'name email profileImage role');

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await CommunityPost.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // Check if current user has liked this post
    const userHasLiked = userId ? post.likedBy.includes(userId as any) : false;

    return res.json({
      success: true,
      data: {
        post: {
          ...post.toObject(),
          userHasLiked,
          comments: [] // Comments will be fetched separately via the comments endpoint
        }
      }
    });
  } catch (error) {
    console.error('Error fetching community post:', error);
    console.error('Error details:', {
      postId: id,
      userId: (req as any).user?._id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch community post',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
};

// Create a new community post
export const createCommunityPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, tags = [] } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Create the post
    const post = new CommunityPost({
      title: title.trim(),
      content: content.trim(),
      author: userId,
      tags: tags.filter((tag: string) => tag.trim().length > 0)
    });

    await post.save();

    // Populate author information
    await post.populate('author', 'name email profileImage role');

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Error creating community post:', error);
    console.error('Error details:', {
      userId: req.user?._id,
      title: req.body.title,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
};

// Update a community post
export const updateCommunityPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const post = await CommunityPost.findById(id);

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own posts'
      });
    }

    // Update fields
    if (title) post.title = title.trim();
    if (content) post.content = content.trim();
    if (tags) post.tags = tags.filter((tag: string) => tag.trim().length > 0);

    await post.save();
    await post.populate('author', 'name email profileImage role');

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

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    // Soft delete by changing status
    post.status = 'deleted';
    await post.save();

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

// Like/Unlike a community post
export const toggleLikePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // First check if post exists
    const post = await CommunityPost.findById(id);
    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user has already liked this post
    const userHasLiked = post.likedBy.some(
      (likedUserId: any) => likedUserId.toString() === userId.toString()
    );

    let updatedPost;
    if (userHasLiked) {
      // Unlike: remove user from likedBy array using atomic operation
      updatedPost = await CommunityPost.findByIdAndUpdate(
        id,
        { $pull: { likedBy: userId } },
        { new: true }
      );
    } else {
      // Like: add user to likedBy array using atomic operation (only if not already present)
      updatedPost = await CommunityPost.findByIdAndUpdate(
        id,
        { $addToSet: { likedBy: userId } },
        { new: true }
      );
    }

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    return res.json({
      success: true,
      data: {
        liked: !userHasLiked,
        likes: updatedPost.likes
      }
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update like'
    });
  }
};

// Add a comment to a community post
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, parentComment } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post || post.status === 'deleted') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Create the comment
    const comment = new CommunityComment({
      content: content.trim(),
      author: userId,
      post: id,
      parentComment: parentComment || null
    });

    await comment.save();

    // If this is a reply, add it to parent comment's replies array
    if (parentComment) {
      await CommunityComment.findByIdAndUpdate(
        parentComment,
        { $push: { replies: comment._id } }
      );
    } else {
      // Only add top-level comments to post
      post.comments.push(comment._id as any);
      await post.save();
    }

    // Populate author information
    await comment.populate('author', 'name email profileImage role');

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    console.error('Error details:', {
      postId: id,
      userId: req.user?._id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
};

// Get comments for a community post - Simple test version
export const getPostComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Simple test - just return empty comments for now
    return res.json({
      success: true,
      data: {
        comments: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalComments: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    console.error('Error details:', {
      postId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
};

// Get all unique tags from community posts
export const getCommunityTags = async (req: Request, res: Response) => {
  try {
    const tags = await CommunityPost.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    return res.json({
      success: true,
      data: { tags: tags.map(tag => ({ name: tag._id, count: tag.count })) }
    });
  } catch (error) {
    console.error('Error fetching community tags:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tags'
    });
  }
};
