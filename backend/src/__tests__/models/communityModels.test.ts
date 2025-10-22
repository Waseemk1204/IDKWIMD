import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CommunityPost } from '../models/CommunityPost';
import { CommunityCategory } from '../models/CommunityCategory';
import { UserReputation } from '../models/UserReputation';
import { CommunityBadge } from '../models/CommunityBadge';
import { CommunityEvent } from '../models/CommunityEvent';
import { UserBookmark } from '../models/UserBookmark';
import { UserFollow } from '../models/UserFollow';
import { User } from '../models/User';

describe('Community Models', () => {
  let mongoServer: MongoMemoryServer;

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
  });

  describe('CommunityCategory', () => {
    it('should create a category with required fields', async () => {
      const categoryData = {
        name: 'Technology',
        description: 'Discussions about technology and programming',
        slug: 'technology',
        color: '#3B82F6',
        icon: '💻'
      };

      const category = new CommunityCategory(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory._id).toBeDefined();
      expect(savedCategory.name).toBe(categoryData.name);
      expect(savedCategory.description).toBe(categoryData.description);
      expect(savedCategory.slug).toBe(categoryData.slug);
      expect(savedCategory.color).toBe(categoryData.color);
      expect(savedCategory.icon).toBe(categoryData.icon);
      expect(savedCategory.isActive).toBe(true);
      expect(savedCategory.postCount).toBe(0);
      expect(savedCategory.memberCount).toBe(0);
    });

    it('should generate slug automatically from name', async () => {
      const categoryData = {
        name: 'Web Development',
        description: 'Web development discussions'
      };

      const category = new CommunityCategory(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.slug).toBe('web-development');
    });

    it('should validate required fields', async () => {
      const category = new CommunityCategory({});

      await expect(category.save()).rejects.toThrow();
    });

    it('should enforce unique name constraint', async () => {
      const categoryData = {
        name: 'Technology',
        description: 'Tech discussions'
      };

      const category1 = new CommunityCategory(categoryData);
      await category1.save();

      const category2 = new CommunityCategory(categoryData);
      await expect(category2.save()).rejects.toThrow();
    });
  });

  describe('CommunityPost', () => {
    let user: any;
    let category: any;

    beforeEach(async () => {
      user = new User({
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee'
      });
      await user.save();

      category = new CommunityCategory({
        name: 'Technology',
        description: 'Tech discussions',
        slug: 'technology'
      });
      await category.save();
    });

    it('should create a post with required fields', async () => {
      const postData = {
        title: 'React Best Practices',
        content: 'Here are some React best practices...',
        author: user._id,
        category: category._id,
        type: 'discussion',
        tags: ['react', 'javascript']
      };

      const post = new CommunityPost(postData);
      const savedPost = await post.save();

      expect(savedPost._id).toBeDefined();
      expect(savedPost.title).toBe(postData.title);
      expect(savedPost.content).toBe(postData.content);
      expect(savedPost.author).toEqual(user._id);
      expect(savedPost.category).toEqual(category._id);
      expect(savedPost.type).toBe(postData.type);
      expect(savedPost.tags).toEqual(postData.tags);
      expect(savedPost.likes).toBe(0);
      expect(savedPost.views).toBe(0);
      expect(savedPost.status).toBe('active');
    });

    it('should create a post with professional context', async () => {
      const postData = {
        title: 'Career Advice',
        content: 'Looking for career advice...',
        author: user._id,
        category: category._id,
        type: 'question',
        professionalContext: {
          industry: 'technology',
          skillLevel: 'intermediate',
          relatedSkills: ['javascript', 'react'],
          jobRelevance: true
        }
      };

      const post = new CommunityPost(postData);
      const savedPost = await post.save();

      expect(savedPost.professionalContext).toBeDefined();
      expect(savedPost.professionalContext.industry).toBe('technology');
      expect(savedPost.professionalContext.skillLevel).toBe('intermediate');
      expect(savedPost.professionalContext.relatedSkills).toEqual(['javascript', 'react']);
      expect(savedPost.professionalContext.jobRelevance).toBe(true);
    });

    it('should create a mentorship request post', async () => {
      const postData = {
        title: 'Looking for a Mentor',
        content: 'I need guidance in my career...',
        author: user._id,
        category: category._id,
        type: 'mentorship',
        mentorship: {
          isMentorshipRequest: true,
          menteeLevel: 'beginner',
          preferredMentorSkills: ['javascript', 'react'],
          mentorshipType: 'technical'
        }
      };

      const post = new CommunityPost(postData);
      const savedPost = await post.save();

      expect(savedPost.mentorship).toBeDefined();
      expect(savedPost.mentorship.isMentorshipRequest).toBe(true);
      expect(savedPost.mentorship.menteeLevel).toBe('beginner');
      expect(savedPost.mentorship.preferredMentorSkills).toEqual(['javascript', 'react']);
      expect(savedPost.mentorship.mentorshipType).toBe('technical');
    });

    it('should calculate engagement score correctly', async () => {
      const post = new CommunityPost({
        title: 'Test Post',
        content: 'Test content',
        author: user._id,
        category: category._id,
        likes: 10,
        views: 100,
        engagement: {
          helpfulVotes: 5,
          expertEndorsements: 2,
          shares: 3,
          bookmarks: 8
        }
      });

      const engagementScore = post.engagementScore;
      // Expected: 10 + (5*2) + (2*3) + (3*1.5) + (8*1) + (100*0.1) = 10 + 10 + 6 + 4.5 + 8 + 10 = 48.5
      expect(engagementScore).toBe(48.5);
    });

    it('should identify trending posts correctly', async () => {
      const recentPost = new CommunityPost({
        title: 'Recent Post',
        content: 'Recent content',
        author: user._id,
        category: category._id,
        likes: 15,
        views: 200,
        engagement: {
          helpfulVotes: 8,
          expertEndorsements: 3,
          shares: 5,
          bookmarks: 10
        }
      });

      const isTrending = recentPost.isTrending;
      expect(isTrending).toBe(true);
    });

    it('should calculate professional relevance score', async () => {
      const post = new CommunityPost({
        title: 'Professional Post',
        content: 'Professional content',
        author: user._id,
        category: category._id,
        type: 'insight',
        professionalContext: {
          industry: 'technology',
          skillLevel: 'advanced',
          relatedSkills: ['javascript', 'react', 'nodejs'],
          jobRelevance: true
        },
        mentorship: {
          isMentorshipRequest: true
        }
      });

      const relevanceScore = post.professionalRelevanceScore;
      // Expected: 5 (jobRelevance) + 3 (relatedSkills) + 3 (mentorship) + 2 (insight type) = 13
      expect(relevanceScore).toBe(13);
    });
  });

  describe('UserReputation', () => {
    let user: any;

    beforeEach(async () => {
      user = new User({
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee'
      });
      await user.save();
    });

    it('should create reputation with default values', async () => {
      const reputation = new UserReputation({
        user: user._id
      });

      const savedReputation = await reputation.save();

      expect(savedReputation._id).toBeDefined();
      expect(savedReputation.user).toEqual(user._id);
      expect(savedReputation.totalPoints).toBe(0);
      expect(savedReputation.level).toBe(1);
      expect(savedReputation.contributions.postsCreated).toBe(0);
      expect(savedReputation.contributions.commentsWritten).toBe(0);
      expect(savedReputation.contributions.postsLiked).toBe(0);
      expect(savedReputation.contributions.commentsLiked).toBe(0);
      expect(savedReputation.contributions.helpfulVotes).toBe(0);
      expect(savedReputation.contributions.expertEndorsements).toBe(0);
      expect(savedReputation.contributions.mentorshipSessions).toBe(0);
      expect(savedReputation.contributions.eventsHosted).toBe(0);
    });

    it('should calculate level name correctly', async () => {
      const reputation = new UserReputation({
        user: user._id,
        totalPoints: 0,
        level: 1
      });

      expect(reputation.levelName).toBe('Newcomer');

      reputation.level = 5;
      expect(reputation.levelName).toBe('Expert');

      reputation.level = 10;
      expect(reputation.levelName).toBe('Master');
    });

    it('should calculate next level points correctly', async () => {
      const reputation = new UserReputation({
        user: user._id,
        totalPoints: 0,
        level: 1
      });

      expect(reputation.nextLevelPoints).toBe(100); // 1^2 * 100

      reputation.level = 2;
      expect(reputation.nextLevelPoints).toBe(400); // 2^2 * 100
    });

    it('should calculate level progress correctly', async () => {
      const reputation = new UserReputation({
        user: user._id,
        totalPoints: 150,
        level: 2
      });

      // Level 2 requires 400 points, level 1 required 100 points
      // So progress = (150 - 100) / (400 - 100) * 100 = 50/300 * 100 = 16.67%
      expect(reputation.levelProgress).toBeCloseTo(16.67, 1);
    });

    it('should add reputation points correctly', async () => {
      const reputation = new UserReputation({
        user: user._id,
        totalPoints: 0,
        level: 1
      });

      await reputation.addReputation(10, 'Created a post', 'post', new mongoose.Types.ObjectId());

      expect(reputation.totalPoints).toBe(10);
      expect(reputation.reputationHistory).toHaveLength(1);
      expect(reputation.reputationHistory[0].points).toBe(10);
      expect(reputation.reputationHistory[0].reason).toBe('Created a post');
      expect(reputation.reputationHistory[0].source).toBe('post');
    });

    it('should level up when reaching threshold', async () => {
      const reputation = new UserReputation({
        user: user._id,
        totalPoints: 0,
        level: 1
      });

      // Add enough points to reach level 2 (400 points)
      await reputation.addReputation(400, 'Level up', 'post', new mongoose.Types.ObjectId());

      expect(reputation.totalPoints).toBe(400);
      expect(reputation.level).toBe(2);
    });

    it('should update contribution counts', async () => {
      const reputation = new UserReputation({
        user: user._id
      });

      await reputation.updateContribution('postsCreated', 5);
      await reputation.updateContribution('commentsWritten', 3);

      expect(reputation.contributions.postsCreated).toBe(5);
      expect(reputation.contributions.commentsWritten).toBe(3);
    });
  });

  describe('CommunityBadge', () => {
    it('should create a badge with required fields', async () => {
      const badgeData = {
        name: 'First Post',
        description: 'Created your first community post',
        icon: '🎉',
        color: '#FFD700',
        category: 'contribution',
        requirements: {
          type: 'posts',
          value: 1,
          timeframe: 'alltime'
        }
      };

      const badge = new CommunityBadge(badgeData);
      const savedBadge = await badge.save();

      expect(savedBadge._id).toBeDefined();
      expect(savedBadge.name).toBe(badgeData.name);
      expect(savedBadge.description).toBe(badgeData.description);
      expect(savedBadge.icon).toBe(badgeData.icon);
      expect(savedBadge.color).toBe(badgeData.color);
      expect(savedBadge.category).toBe(badgeData.category);
      expect(savedBadge.requirements.type).toBe(badgeData.requirements.type);
      expect(savedBadge.requirements.value).toBe(badgeData.requirements.value);
      expect(savedBadge.requirements.timeframe).toBe(badgeData.requirements.timeframe);
      expect(savedBadge.isActive).toBe(true);
      expect(savedBadge.isRare).toBe(false);
      expect(savedBadge.awardedCount).toBe(0);
    });

    it('should validate required fields', async () => {
      const badge = new CommunityBadge({});

      await expect(badge.save()).rejects.toThrow();
    });

    it('should enforce unique name constraint', async () => {
      const badgeData = {
        name: 'First Post',
        description: 'Created your first post',
        icon: '🎉',
        color: '#FFD700',
        category: 'contribution',
        requirements: {
          type: 'posts',
          value: 1
        }
      };

      const badge1 = new CommunityBadge(badgeData);
      await badge1.save();

      const badge2 = new CommunityBadge(badgeData);
      await expect(badge2.save()).rejects.toThrow();
    });
  });

  describe('CommunityEvent', () => {
    let user: any;
    let category: any;

    beforeEach(async () => {
      user = new User({
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee'
      });
      await user.save();

      category = new CommunityCategory({
        name: 'Technology',
        description: 'Tech discussions',
        slug: 'technology'
      });
      await category.save();
    });

    it('should create an event with required fields', async () => {
      const eventData = {
        title: 'React Workshop',
        description: 'Learn React fundamentals',
        host: user._id,
        category: category._id,
        type: 'workshop',
        startDate: new Date('2024-12-31T10:00:00Z'),
        tags: ['react', 'javascript']
      };

      const event = new CommunityEvent(eventData);
      const savedEvent = await event.save();

      expect(savedEvent._id).toBeDefined();
      expect(savedEvent.title).toBe(eventData.title);
      expect(savedEvent.description).toBe(eventData.description);
      expect(savedEvent.host).toEqual(user._id);
      expect(savedEvent.category).toEqual(category._id);
      expect(savedEvent.type).toBe(eventData.type);
      expect(savedEvent.startDate).toEqual(eventData.startDate);
      expect(savedEvent.tags).toEqual(eventData.tags);
      expect(savedEvent.status).toBe('upcoming');
      expect(savedEvent.isPublic).toBe(true);
      expect(savedEvent.participants).toHaveLength(0);
    });

    it('should calculate participant count correctly', async () => {
      const event = new CommunityEvent({
        title: 'Test Event',
        description: 'Test description',
        host: user._id,
        category: category._id,
        type: 'discussion',
        startDate: new Date('2024-12-31T10:00:00Z'),
        participants: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]
      });

      expect(event.participantCount).toBe(2);
    });

    it('should check if event is full', async () => {
      const event = new CommunityEvent({
        title: 'Limited Event',
        description: 'Limited capacity event',
        host: user._id,
        category: category._id,
        type: 'discussion',
        startDate: new Date('2024-12-31T10:00:00Z'),
        maxParticipants: 2,
        participants: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]
      });

      expect(event.isFull).toBe(true);
      expect(event.canJoin).toBe(false);
    });

    it('should calculate time until start', async () => {
      const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
      const event = new CommunityEvent({
        title: 'Future Event',
        description: 'Event in the future',
        host: user._id,
        category: category._id,
        type: 'discussion',
        startDate: futureDate
      });

      const timeUntilStart = event.timeUntilStart;
      expect(timeUntilStart).toContain('2d');
    });

    it('should add and remove participants', async () => {
      const event = new CommunityEvent({
        title: 'Test Event',
        description: 'Test description',
        host: user._id,
        category: category._id,
        type: 'discussion',
        startDate: new Date('2024-12-31T10:00:00Z')
      });

      const participantId = new mongoose.Types.ObjectId();
      await event.addParticipant(participantId);

      expect(event.participants).toContain(participantId);
      expect(event.participantCount).toBe(1);

      await event.removeParticipant(participantId);

      expect(event.participants).not.toContain(participantId);
      expect(event.participantCount).toBe(0);
    });

    it('should calculate average rating from feedback', async () => {
      const event = new CommunityEvent({
        title: 'Rated Event',
        description: 'Event with feedback',
        host: user._id,
        category: category._id,
        type: 'discussion',
        startDate: new Date('2024-12-31T10:00:00Z'),
        feedback: [
          {
            participant: new mongoose.Types.ObjectId(),
            rating: 5,
            comment: 'Great event!',
            createdAt: new Date()
          },
          {
            participant: new mongoose.Types.ObjectId(),
            rating: 4,
            comment: 'Good event',
            createdAt: new Date()
          },
          {
            participant: new mongoose.Types.ObjectId(),
            rating: 3,
            comment: 'Average event',
            createdAt: new Date()
          }
        ]
      });

      // Average should be (5 + 4 + 3) / 3 = 4
      expect(event.averageRating).toBe(4);
    });
  });

  describe('UserBookmark', () => {
    let user: any;
    let post: any;

    beforeEach(async () => {
      user = new User({
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee'
      });
      await user.save();

      const category = new CommunityCategory({
        name: 'Technology',
        description: 'Tech discussions',
        slug: 'technology'
      });
      await category.save();

      post = new CommunityPost({
        title: 'Test Post',
        content: 'Test content',
        author: user._id,
        category: category._id
      });
      await post.save();
    });

    it('should create a bookmark', async () => {
      const bookmark = new UserBookmark({
        user: user._id,
        post: post._id
      });

      const savedBookmark = await bookmark.save();

      expect(savedBookmark._id).toBeDefined();
      expect(savedBookmark.user).toEqual(user._id);
      expect(savedBookmark.post).toEqual(post._id);
    });

    it('should enforce unique user-post combination', async () => {
      const bookmark1 = new UserBookmark({
        user: user._id,
        post: post._id
      });
      await bookmark1.save();

      const bookmark2 = new UserBookmark({
        user: user._id,
        post: post._id
      });

      await expect(bookmark2.save()).rejects.toThrow();
    });
  });

  describe('UserFollow', () => {
    let follower: any;
    let following: any;

    beforeEach(async () => {
      follower = new User({
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee'
      });
      await follower.save();

      following = new User({
        fullName: 'Jane Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'employee'
      });
      await following.save();
    });

    it('should create a follow relationship', async () => {
      const follow = new UserFollow({
        follower: follower._id,
        following: following._id
      });

      const savedFollow = await follow.save();

      expect(savedFollow._id).toBeDefined();
      expect(savedFollow.follower).toEqual(follower._id);
      expect(savedFollow.following).toEqual(following._id);
    });

    it('should enforce unique follower-following combination', async () => {
      const follow1 = new UserFollow({
        follower: follower._id,
        following: following._id
      });
      await follow1.save();

      const follow2 = new UserFollow({
        follower: follower._id,
        following: following._id
      });

      await expect(follow2.save()).rejects.toThrow();
    });
  });
});

