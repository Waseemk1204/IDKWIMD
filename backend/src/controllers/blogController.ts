import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Blog, { IBlog } from '../models/Blog';
import Comment from '../models/Comment';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

// Get all blogs with filtering and pagination
export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      author,
      tags,
      status = 'published',
      search,
      sortBy = 'publishedDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = { status };

    if (category) filter.category = category;
    if (author) filter.author = author;
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagsArray };
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search as string, 'i') },
        { content: new RegExp(search as string, 'i') },
        { excerpt: new RegExp(search as string, 'i') }
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const blogs = await Blog.find(filter)
      .populate('author', 'name email profileImage')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalBlogs: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get blog by ID
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id)
      .populate('author', 'name email profileImage bio')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name email profileImage'
        }
      })
      .lean();

    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
      return;
    }

    // Increment view count
    await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: { blog }
    });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new blog
export const createBlog = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const blogData = {
      ...req.body,
      author: req.user._id
    };

    const blog = new Blog(blogData);
    await blog.save();

    // Populate author data
    await blog.populate('author', 'name email profileImage');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog }
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update blog
export const updateBlog = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
      return;
    }

    // Check if user owns the blog or is admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own blogs.'
      });
      return;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email profileImage');

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog: updatedBlog }
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete blog
export const deleteBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
      return;
    }

    // Check if user owns the blog or is admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own blogs.'
      });
      return;
    }

    // Delete associated comments
    await Comment.deleteMany({ blog: id });

    // Delete blog
    await Blog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get featured blogs
export const getFeaturedBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 6 } = req.query;

    const blogs = await Blog.find({ 
      status: 'published', 
      isFeatured: true 
    })
      .populate('author', 'name email profileImage')
      .sort({ publishedDate: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: { blogs }
    });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get blog categories
export const getBlogCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Blog.distinct('category', { status: 'published' });
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get blog categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get related blogs
export const getRelatedBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit = 3 } = req.query;

    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
      return;
    }

    const relatedBlogs = await Blog.find({
      _id: { $ne: id },
      status: 'published',
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags } }
      ]
    })
      .populate('author', 'name email profileImage')
      .sort({ publishedDate: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: { blogs: relatedBlogs }
    });
  } catch (error) {
    console.error('Get related blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add comment to blog
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const { content, parentComment } = req.body;

    // Check if blog exists
    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
      return;
    }

    // Create comment
    const comment = new Comment({
      content,
      author: req.user._id,
      blog: id,
      parentComment: parentComment || null
    });

    await comment.save();

    // Add comment to blog
    await Blog.findByIdAndUpdate(id, {
      $push: { comments: comment._id }
    });

    // If it's a reply, add to parent comment
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id }
      });
    }

    // Populate comment data
    await comment.populate('author', 'name email profileImage');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get blog comments
export const getBlogComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const comments = await Comment.find({ 
      blog: id, 
      parentComment: null,
      isApproved: true 
    })
      .populate('author', 'name email profileImage')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name email profileImage'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Comment.countDocuments({ 
      blog: id, 
      parentComment: null,
      isApproved: true 
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalComments: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get blog comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Like blog
export const likeBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
      return;
    }

    // Increment likes
    await Blog.findByIdAndUpdate(id, { $inc: { likes: 1 } });

    res.json({
      success: true,
      message: 'Blog liked successfully'
    });
  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
