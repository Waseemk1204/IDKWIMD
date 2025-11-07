import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server';
import { CommunityPost } from '../models/CommunityPost';
import { CommunityCategory } from '../models/CommunityCategory';
import { UserReputation } from '../models/UserReputation';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

describe('Enhanced Community Controller', () => {
  let mongoServer: MongoMemoryServer;
  let authToken: string;
  let userId: string;
  let categoryId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();

    // Create test user
    const user = new User({
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      role: 'employee'
    });
    await user.save();
    userId = user._id.toString();

    // Create auth token
    authToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test category
    const category = new CommunityCategory({
      name: 'Technology',
      description: 'Tech discussions',
      slug: 'technology',
      color: '#3B82F6'
    });
    await category.save();
    categoryId = category._id.toString();

    // Create user reputation
    const reputation = new UserReputation({
      user: user._id
    });
    await reputation.save();
  });

  describe('GET /api/v1/community-enhanced/posts', () => {
    it('should get community posts with default parameters', async () => {
      // Create test posts
      const post1 = new CommunityPost({
        title: 'React Best Practices',
        content: 'Here are some React best practices...',
        author: userId,
        category: categoryId,
        type: 'discussion',
        tags: ['react', 'javascript']
      });
      await post1.save();

      const post2 = new CommunityPost({
        title: 'TypeScript Tips',
        content: 'Some useful TypeScript tips...',
        author: userId,
        category: categoryId,
        type: 'insight',
        tags: ['typescript', 'javascript']
      });
      await post2.save();

      const response = await request(app)
        .get('/api/v1/community-enhanced/posts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.totalPosts).toBe(2);
    });

    it('should filter posts by category', async () => {
      // Create posts in different categories
      const techCategory = new CommunityCategory({
        name: 'Technology',
        description: 'Tech discussions',
        slug: 'technology'
      });
      await techCategory.save();

      const designCategory = new CommunityCategory({
        name: 'Design',
        description: 'Design discussions',
        slug: 'design'
      });
      await designCategory.save();

      const techPost = new CommunityPost({
        title: 'React Post',
        content: 'React content',
        author: userId,
        category: techCategory._id,
        type: 'discussion'
      });
      await techPost.save();

      const designPost = new CommunityPost({
        title: 'Design Post',
        content: 'Design content',
        author: userId,
        category: designCategory._id,
        type: 'discussion'
      });
      await designPost.save();

      const response = await request(app)
        .get(`/api/v1/community-enhanced/posts?category=${techCategory._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.posts[0].title).toBe('React Post');
    });

    it('should filter posts by type', async () => {
      const discussionPost = new CommunityPost({
        title: 'Discussion Post',
        content: 'Discussion content',
        author: userId,
        category: categoryId,
        type: 'discussion'
      });
      await discussionPost.save();

      const questionPost = new CommunityPost({
        title: 'Question Post',
        content: 'Question content',
        author: userId,
        category: categoryId,
        type: 'question'
      });
      await questionPost.save();

      const response = await request(app)
        .get('/api/v1/community-enhanced/posts?type=question')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.posts[0].type).toBe('question');
    });

    it('should filter posts by professional context', async () => {
      const techPost = new CommunityPost({
        title: 'Tech Post',
        content: 'Tech content',
        author: userId,
        category: categoryId,
        type: 'discussion',
        professionalContext: {
          industry: 'technology',
          skillLevel: 'intermediate',
          relatedSkills: ['javascript', 'react']
        }
      });
      await techPost.save();

      const financePost = new CommunityPost({
        title: 'Finance Post',
        content: 'Finance content',
        author: userId,
        category: categoryId,
        type: 'discussion',
        professionalContext: {
          industry: 'finance',
          skillLevel: 'advanced'
        }
      });
      await financePost.save();

      const response = await request(app)
        .get('/api/v1/community-enhanced/posts?industry=technology')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.posts[0].professionalContext.industry).toBe('technology');
    });

    it('should search posts by title and content', async () => {
      const reactPost = new CommunityPost({
        title: 'React Best Practices',
        content: 'Here are some React best practices...',
        author: userId,
        category: categoryId,
        type: 'discussion'
      });
      await reactPost.save();

      const vuePost = new CommunityPost({
        title: 'Vue.js Tutorial',
        content: 'Learn Vue.js from scratch...',
        author: userId,
        category: categoryId,
        type: 'discussion'
      });
      await vuePost.save();

      const response = await request(app)
        .get('/api/v1/community-enhanced/posts?search=react')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.posts[0].title).toContain('React');
    });

    it('should sort posts by different criteria', async () => {
      const oldPost = new CommunityPost({
        title: 'Old Post',
        content: 'Old content',
        author: userId,
        category: categoryId,
        type: 'discussion',
        likes: 5,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      });
      await oldPost.save();

      const newPost = new CommunityPost({
        title: 'New Post',
        content: 'New content',
        author: userId,
        category: categoryId,
        type: 'discussion',
        likes: 2,
        createdAt: new Date() // Now
      });
      await newPost.save();

      // Test newest sort
      const newestResponse = await request(app)
        .get('/api/v1/community-enhanced/posts?sortBy=newest')
        .expect(200);

      expect(newestResponse.body.data.posts[0].title).toBe('New Post');

      // Test top sort
      const topResponse = await request(app)
        .get('/api/v1/community-enhanced/posts?sortBy=top')
        .expect(200);

      expect(topResponse.body.data.posts[0].title).toBe('Old Post');
    });
  });

  describe('POST /api/v1/community-enhanced/posts', () => {
    it('should create a new post with authentication', async () => {
      const postData = {
        title: 'New Post',
        content: 'This is a new post content',
        category: categoryId,
        type: 'discussion',
        tags: ['test', 'post']
      };

      const response = await request(app)
        .post('/api/v1/community-enhanced/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Post created successfully');
      expect(response.body.data.post.title).toBe(postData.title);
      expect(response.body.data.post.content).toBe(postData.content);
      expect(response.body.data.post.type).toBe(postData.type);
      expect(response.body.data.post.tags).toEqual(postData.tags);
    });

    it('should create a post with professional context', async () => {
      const postData = {
        title: 'Professional Post',
        content: 'Professional content',
        category: categoryId,
        type: 'insight',
        professionalContext: {
          industry: 'technology',
          skillLevel: 'advanced',
          relatedSkills: ['javascript', 'react', 'nodejs'],
          jobRelevance: true
        }
      };

      const response = await request(app)
        .post('/api/v1/community-enhanced/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.post.professionalContext.industry).toBe('technology');
      expect(response.body.data.post.professionalContext.skillLevel).toBe('advanced');
      expect(response.body.data.post.professionalContext.relatedSkills).toEqual(['javascript', 'react', 'nodejs']);
      expect(response.body.data.post.professionalContext.jobRelevance).toBe(true);
    });

    it('should create a mentorship request post', async () => {
      const postData = {
        title: 'Looking for Mentor',
        content: 'I need guidance in my career',
        category: categoryId,
        type: 'mentorship',
        mentorship: {
          isMentorshipRequest: true,
          menteeLevel: 'beginner',
          preferredMentorSkills: ['javascript', 'react'],
          mentorshipType: 'technical'
        }
      };

      const response = await request(app)
        .post('/api/v1/community-enhanced/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.post.mentorship.isMentorshipRequest).toBe(true);
      expect(response.body.data.post.mentorship.menteeLevel).toBe('beginner');
      expect(response.body.data.post.mentorship.preferredMentorSkills).toEqual(['javascript', 'react']);
      expect(response.body.data.post.mentorship.mentorshipType).toBe('technical');
    });

    it('should require authentication', async () => {
      const postData = {
        title: 'Unauthorized Post',
        content: 'This should fail',
        category: categoryId
      };

      const response = await request(app)
        .post('/api/v1/community-enhanced/posts')
        .send(postData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });

    it('should validate required fields', async () => {
      const postData = {
        title: 'Incomplete Post'
        // Missing content and category
      };

      const response = await request(app)
        .post('/api/v1/community-enhanced/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Title, content, and category are required');
    });

    it('should validate category exists', async () => {
      const postData = {
        title: 'Invalid Category Post',
        content: 'This should fail',
        category: new mongoose.Types.ObjectId().toString()
      };

      const response = await request(app)
        .post('/api/v1/community-enhanced/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid category');
    });

    it('should update user reputation after creating post', async () => {
      const postData = {
        title: 'Reputation Test Post',
        content: 'Testing reputation update',
        category: categoryId
      };

      await request(app)
        .post('/api/v1/community-enhanced/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      const reputation = await UserReputation.findOne({ user: userId });
      expect(reputation).toBeDefined();
      expect(reputation!.totalPoints).toBe(5); // 5 points for creating a post
      expect(reputation!.contributions.postsCreated).toBe(1);
    });
  });

  describe('GET /api/v1/community-enhanced/posts/:id', () => {
    it('should get a post by ID', async () => {
      const post = new CommunityPost({
        title: 'Test Post',
        content: 'Test content',
        author: userId,
        category: categoryId,
        type: 'discussion'
      });
      await post.save();

      const response = await request(app)
        .get(`/api/v1/community-enhanced/posts/${post._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.post.title).toBe('Test Post');
      expect(response.body.data.post.content).toBe('Test content');
    });

    it('should increment view count', async () => {
      const post = new CommunityPost({
        title: 'View Test Post',
        content: 'Testing view count',
        author: userId,
        category: categoryId,
        type: 'discussion',
        views: 0
      });
      await post.save();

      await request(app)
        .get(`/api/v1/community-enhanced/posts/${post._id}`)
        .expect(200);

      const updatedPost = await CommunityPost.findById(post._id);
      expect(updatedPost!.views).toBe(1);
    });

    it('should return 404 for non-existent post', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/v1/community-enhanced/posts/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Post not found');
    });

    it('should return 400 for invalid post ID', async () => {
      const response = await request(app)
        .get('/api/v1/community-enhanced/posts/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid post ID');
    });
  });

  describe('POST /api/v1/community-enhanced/posts/:id/like', () => {
    let postId: string;

    beforeEach(async () => {
      const post = new CommunityPost({
        title: 'Like Test Post',
        content: 'Testing likes',
        author: userId,
        category: categoryId,
        type: 'discussion',
        likes: 0,
        likedBy: []
      });
      await post.save();
      postId = post._id.toString();
    });

    it('should like a post', async () => {
      const response = await request(app)
        .post(`/api/v1/community-enhanced/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Post liked');
      expect(response.body.data.isLiked).toBe(true);
      expect(response.body.data.likesCount).toBe(1);
    });

    it('should unlike a post', async () => {
      // First like the post
      await request(app)
        .post(`/api/v1/community-enhanced/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Then unlike it
      const response = await request(app)
        .post(`/api/v1/community-enhanced/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Post unliked');
      expect(response.body.data.isLiked).toBe(false);
      expect(response.body.data.likesCount).toBe(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/v1/community-enhanced/posts/${postId}/like`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });
  });

  describe('POST /api/v1/community-enhanced/posts/:id/helpful', () => {
    let postId: string;

    beforeEach(async () => {
      const post = new CommunityPost({
        title: 'Helpful Test Post',
        content: 'Testing helpful votes',
        author: userId,
        category: categoryId,
        type: 'discussion',
        engagement: {
          helpfulVotes: 0,
          expertEndorsements: 0,
          shares: 0,
          bookmarks: 0
        }
      });
      await post.save();
      postId = post._id.toString();
    });

    it('should add helpful vote', async () => {
      const response = await request(app)
        .post(`/api/v1/community-enhanced/posts/${postId}/helpful`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Helpful vote added');
      expect(response.body.data.helpfulVotes).toBe(1);
    });

    it('should prevent duplicate helpful votes', async () => {
      // First helpful vote
      await request(app)
        .post(`/api/v1/community-enhanced/posts/${postId}/helpful`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Second helpful vote should fail
      const response = await request(app)
        .post(`/api/v1/community-enhanced/posts/${postId}/helpful`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You have already voted on this post');
    });
  });

  describe('POST /api/v1/community-enhanced/posts/:id/expert-endorsement', () => {
    let postId: string;

    beforeEach(async () => {
      const post = new CommunityPost({
        title: 'Expert Test Post',
        content: 'Testing expert endorsements',
        author: userId,
        category: categoryId,
        type: 'discussion',
        engagement: {
          helpfulVotes: 0,
          expertEndorsements: 0,
          shares: 0,
          bookmarks: 0
        }
      });
      await post.save();
      postId = post._id.toString();
    });

    it('should add expert endorsement', async () => {
      const response = await request(app)
        .post(`/api/v1/community-enhanced/posts/${postId}/expert-endorsement`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Expert endorsement added');
      expect(response.body.data.expertEndorsements).toBe(1);
    });

    it('should prevent self-endorsement', async () => {
      const response = await request(app)
        .post(`/api/v1/community-enhanced/posts/${postId}/expert-endorsement`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot endorse your own post');
    });
  });

  describe('GET /api/v1/community-enhanced/posts/trending', () => {
    it('should get trending posts', async () => {
      // Create posts with different engagement levels
      const trendingPost = new CommunityPost({
        title: 'Trending Post',
        content: 'This post is trending',
        author: userId,
        category: categoryId,
        type: 'discussion',
        likes: 20,
        views: 100,
        engagement: {
          helpfulVotes: 10,
          expertEndorsements: 5,
          shares: 8,
          bookmarks: 15
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      });
      await trendingPost.save();

      const oldPost = new CommunityPost({
        title: 'Old Post',
        content: 'This post is old',
        author: userId,
        category: categoryId,
        type: 'discussion',
        likes: 5,
        views: 20,
        engagement: {
          helpfulVotes: 2,
          expertEndorsements: 1,
          shares: 1,
          bookmarks: 3
        },
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
      });
      await oldPost.save();

      const response = await request(app)
        .get('/api/v1/community-enhanced/posts/trending?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(1); // Only the trending post should be returned
      expect(response.body.data.posts[0].title).toBe('Trending Post');
    });
  });

  describe('GET /api/v1/community-enhanced/bookmarks', () => {
    it('should get user bookmarks', async () => {
      // Create a post
      const post = new CommunityPost({
        title: 'Bookmark Test Post',
        content: 'Testing bookmarks',
        author: userId,
        category: categoryId,
        type: 'discussion'
      });
      await post.save();

      // Bookmark the post
      await request(app)
        .post(`/api/v1/community-enhanced/posts/${post._id}/bookmark`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Get bookmarks
      const response = await request(app)
        .get('/api/v1/community-enhanced/bookmarks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookmarks).toHaveLength(1);
      expect(response.body.data.bookmarks[0].title).toBe('Bookmark Test Post');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/community-enhanced/bookmarks')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });
  });
});

