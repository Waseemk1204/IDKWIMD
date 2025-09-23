import apiService from './api';

export interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    bio?: string;
  };
  category: string;
  tags: string[];
  thumbnail: string;
  status: 'draft' | 'published' | 'archived';
  publishedDate: string;
  views: number;
  likes: number;
  comments: string[];
  isFeatured: boolean;
  readingTime: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogComment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  blog: string;
  parentComment?: string;
  replies: string[];
  likes: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogInteractions {
  likedBlogs: string[];
  bookmarkedBlogs: string[];
}

class BlogService {
  // Get all blogs with filtering and pagination
  async getBlogs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    author?: string;
    tags?: string[];
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ blogs: BlogPost[]; pagination: any }> {
    try {
      const response = await apiService.getBlogs(params);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch blogs');
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  }

  // Get blog by ID
  async getBlogById(id: string): Promise<BlogPost> {
    try {
      const response = await apiService.getBlogById(id);
      if (response.success) {
        return response.data.blog;
      }
      throw new Error(response.message || 'Blog not found');
    } catch (error) {
      console.error('Error fetching blog:', error);
      throw error;
    }
  }

  // Get featured blogs
  async getFeaturedBlogs(limit?: number): Promise<BlogPost[]> {
    try {
      const response = await apiService.getFeaturedBlogs(limit);
      if (response.success) {
        return response.data.blogs;
      }
      throw new Error(response.message || 'Failed to fetch featured blogs');
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
      throw error;
    }
  }

  // Get blog categories
  async getBlogCategories(): Promise<string[]> {
    try {
      const response = await apiService.getBlogCategories();
      if (response.success) {
        return response.data.categories;
      }
      throw new Error(response.message || 'Failed to fetch categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get related blogs
  async getRelatedBlogs(id: string, limit?: number): Promise<BlogPost[]> {
    try {
      const response = await apiService.getRelatedBlogs(id, limit);
      if (response.success) {
        return response.data.blogs;
      }
      throw new Error(response.message || 'Failed to fetch related blogs');
    } catch (error) {
      console.error('Error fetching related blogs:', error);
      throw error;
    }
  }

  // Get blog comments
  async getBlogComments(id: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<{ comments: BlogComment[]; pagination: any }> {
    try {
      const response = await apiService.getBlogComments(id, params);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch comments');
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  // Add comment to blog
  async addBlogComment(id: string, content: string, parentComment?: string): Promise<BlogComment> {
    try {
      const response = await apiService.addBlogComment(id, { content, parentComment });
      if (response.success) {
        return response.data.comment;
      }
      throw new Error(response.message || 'Failed to add comment');
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Toggle like blog
  async toggleLikeBlog(id: string): Promise<{ liked: boolean; likes: number }> {
    try {
      const response = await apiService.toggleLikeBlog(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to toggle like');
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  // Toggle bookmark blog
  async toggleBookmarkBlog(id: string): Promise<{ bookmarked: boolean }> {
    try {
      const response = await apiService.toggleBookmarkBlog(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to toggle bookmark');
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  // Get user's blog interactions
  async getUserBlogInteractions(blogIds: string[]): Promise<BlogInteractions> {
    try {
      const response = await apiService.getUserBlogInteractions(blogIds);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch interactions');
    } catch (error) {
      console.error('Error fetching interactions:', error);
      throw error;
    }
  }

  // Helper functions for formatting
  formatBlogDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatBlogViews(views: number): string {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k views`;
    }
    return `${views} views`;
  }

  formatReadingTime(minutes: number): string {
    return `${minutes} min read`;
  }

  // Get blogs for homepage (featured and recent)
  async getBlogsForHomepage(limit: number = 3): Promise<BlogPost[]> {
    try {
      const response = await this.getBlogs({
        limit,
        sortBy: 'publishedDate',
        sortOrder: 'desc'
      });
      return response.blogs;
    } catch (error) {
      console.error('Error fetching homepage blogs:', error);
      return [];
    }
  }

  // Get blogs for main blogs page with filtering
  async getBlogsForBlogsPage(filters?: {
    category?: string;
    search?: string;
    sortBy?: 'publishedDate' | 'views' | 'likes';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ blogs: BlogPost[]; pagination: any }> {
    try {
      return await this.getBlogs(filters);
    } catch (error) {
      console.error('Error fetching blogs for page:', error);
      return { blogs: [], pagination: { currentPage: 1, totalPages: 0, totalBlogs: 0, hasNext: false, hasPrev: false } };
    }
  }

  // Get related blogs (same category, excluding current blog)
  async getRelatedBlogsForBlog(currentBlogId: string, limit: number = 3): Promise<BlogPost[]> {
    try {
      return await this.getRelatedBlogs(currentBlogId, limit);
    } catch (error) {
      console.error('Error fetching related blogs:', error);
      return [];
    }
  }

  // Get blog categories with counts
  async getBlogCategoriesWithCounts(): Promise<Array<{ name: string; count: number }>> {
    try {
      const categories = await this.getBlogCategories();
      const allCategories = ['All', ...categories];
      
      // Get counts for each category
      const categoryCounts = await Promise.all(
        allCategories.map(async (category) => {
          if (category === 'All') {
            const response = await this.getBlogs({ limit: 1 });
            return { name: category, count: response.pagination?.totalBlogs || 0 };
          } else {
            const response = await this.getBlogs({ category, limit: 1 });
            return { name: category, count: response.pagination?.totalBlogs || 0 };
          }
        })
      );
      
      return categoryCounts;
    } catch (error) {
      console.error('Error fetching category counts:', error);
      return [{ name: 'All', count: 0 }];
    }
  }
}

// Create and export a singleton instance
export const blogService = new BlogService();
export default blogService;
