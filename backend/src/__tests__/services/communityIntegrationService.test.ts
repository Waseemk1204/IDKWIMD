import { CommunityIntegrationService } from '../../services/communityIntegrationService';
import { CommunityPost } from '../../models/CommunityPost';
import { Conversation } from '../../models/Conversation';
import { Message } from '../../models/Message';
import { UnifiedNotification } from '../../models/UnifiedNotification';
import { UnifiedUserContext } from '../../models/UnifiedUserContext';
import { Connection } from '../../models/Connection';
import { CrossModuleActivity } from '../../models/CrossModuleActivity';
import { User } from '../../models/User';
import mongoose from 'mongoose';

// Mock the models
jest.mock('../../models/CommunityPost');
jest.mock('../../models/Conversation');
jest.mock('../../models/Message');
jest.mock('../../models/UnifiedNotification');
jest.mock('../../models/UnifiedUserContext');
jest.mock('../../models/Connection');
jest.mock('../../models/CrossModuleActivity');
jest.mock('../../models/User');

describe('CommunityIntegrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPostConversation', () => {
    it('should create a new conversation with community context', async () => {
      const mockPost = {
        _id: 'post123',
        title: 'Test Post',
        category: { name: 'Technology' },
        author: { _id: 'author123', fullName: 'John Doe' }
      };

      const mockConversation = {
        _id: 'conv123',
        participants: ['user123', 'author123'],
        conversationType: 'community_related',
        metadata: {
          context: {
            communityPostId: 'post123',
            postTitle: 'Test Post',
            postCategory: 'Technology'
          }
        },
        save: jest.fn(),
        populate: jest.fn().mockReturnThis()
      };

      const mockMessage = {
        _id: 'msg123',
        save: jest.fn()
      };

      (CommunityPost.findById as jest.Mock).mockResolvedValue(mockPost);
      (Conversation.findOne as jest.Mock).mockResolvedValue(null);
      (Conversation as any).mockImplementation(() => mockConversation);
      (Message as any).mockImplementation(() => mockMessage);

      const result = await CommunityIntegrationService.createPostConversation(
        'post123',
        'user123',
        'author123'
      );

      expect(CommunityPost.findById).toHaveBeenCalledWith('post123');
      expect(Conversation.findOne).toHaveBeenCalledWith({
        participants: { $all: ['user123', 'author123'] },
        'metadata.context.communityPostId': 'post123'
      });
      expect(mockConversation.save).toHaveBeenCalled();
      expect(mockMessage.save).toHaveBeenCalled();
      expect(result).toBe(mockConversation);
    });

    it('should return existing conversation if it exists', async () => {
      const mockPost = {
        _id: 'post123',
        title: 'Test Post',
        category: { name: 'Technology' },
        author: { _id: 'author123', fullName: 'John Doe' }
      };

      const mockExistingConversation = {
        _id: 'conv123',
        participants: ['user123', 'author123'],
        conversationType: 'community_related'
      };

      (CommunityPost.findById as jest.Mock).mockResolvedValue(mockPost);
      (Conversation.findOne as jest.Mock).mockResolvedValue(mockExistingConversation);

      const result = await CommunityIntegrationService.createPostConversation(
        'post123',
        'user123',
        'author123'
      );

      expect(result).toBe(mockExistingConversation);
    });

    it('should throw error if post not found', async () => {
      (CommunityPost.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        CommunityIntegrationService.createPostConversation('post123', 'user123', 'author123')
      ).rejects.toThrow('Post not found');
    });
  });

  describe('inviteGangToDiscussion', () => {
    it('should send invitations to gang members', async () => {
      const mockPost = {
        _id: 'post123',
        title: 'Test Post',
        category: { name: 'Technology' },
        author: { _id: 'author123', fullName: 'John Doe' }
      };

      const mockNotification = {
        _id: 'notif123',
        save: jest.fn()
      };

      (CommunityPost.findById as jest.Mock).mockResolvedValue(mockPost);
      (Message.findOne as jest.Mock).mockResolvedValue(null); // No existing engagement
      (UnifiedNotification as any).mockImplementation(() => mockNotification);

      const result = await CommunityIntegrationService.inviteGangToDiscussion(
        'post123',
        'user123',
        ['member1', 'member2']
      );

      expect(CommunityPost.findById).toHaveBeenCalledWith('post123');
      expect(UnifiedNotification).toHaveBeenCalledTimes(2);
      expect(mockNotification.save).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('should skip members already engaged with post', async () => {
      const mockPost = {
        _id: 'post123',
        title: 'Test Post',
        category: { name: 'Technology' },
        author: { _id: 'author123', fullName: 'John Doe' }
      };

      (CommunityPost.findById as jest.Mock).mockResolvedValue(mockPost);
      (Message.findOne as jest.Mock).mockResolvedValue({ _id: 'msg123' }); // Existing engagement

      const result = await CommunityIntegrationService.inviteGangToDiscussion(
        'post123',
        'user123',
        ['member1']
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('getPersonalizedDiscussions', () => {
    it('should return personalized discussions based on user context', async () => {
      const mockUser = {
        _id: 'user123',
        skills: ['javascript', 'react'],
        interests: ['web development'],
        industry: 'technology'
      };

      const mockUserContext = {
        userId: mockUser
      };

      const mockConnections = [
        {
          user1: { _id: 'user123' },
          user2: { _id: 'connection1' }
        }
      ];

      const mockPosts = [
        {
          _id: 'post1',
          title: 'React Best Practices',
          author: { _id: 'connection1' },
          category: { name: 'Technology' },
          professionalContext: {
            industry: 'technology',
            relatedSkills: ['react', 'javascript']
          },
          tags: ['web development'],
          createdAt: new Date(),
          toObject: () => ({
            _id: 'post1',
            title: 'React Best Practices',
            author: { _id: 'connection1' },
            category: { name: 'Technology' },
            professionalContext: {
              industry: 'technology',
              relatedSkills: ['react', 'javascript']
            },
            tags: ['web development'],
            createdAt: new Date()
          })
        }
      ];

      (UnifiedUserContext.findOne as jest.Mock).mockResolvedValue(mockUserContext);
      (Connection.find as jest.Mock).mockResolvedValue(mockConnections);
      (CommunityPost.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockPosts)
          })
        })
      });

      const result = await CommunityIntegrationService.getPersonalizedDiscussions('user123', 10);

      expect(UnifiedUserContext.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(Connection.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('relevanceScore');
      expect(result[0]).toHaveProperty('connectionContext');
    });

    it('should return empty array if no user context found', async () => {
      (UnifiedUserContext.findOne as jest.Mock).mockResolvedValue(null);

      const result = await CommunityIntegrationService.getPersonalizedDiscussions('user123', 10);

      expect(result).toEqual([]);
    });
  });

  describe('updateCrossModuleActivity', () => {
    it('should update user context and create activity record', async () => {
      const mockActivity = {
        _id: 'activity123',
        save: jest.fn()
      };

      (UnifiedUserContext.findOneAndUpdate as jest.Mock).mockResolvedValue({});
      (CrossModuleActivity as any).mockImplementation(() => mockActivity);

      await CommunityIntegrationService.updateCrossModuleActivity(
        'user123',
        'community',
        'post_created',
        { postId: 'post123' }
      );

      expect(UnifiedUserContext.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'user123' },
        {
          $inc: { 'crossModuleProfile.totalEngagement': 1 },
          $set: {
            'crossModuleProfile.moduleActivity.community.lastActivity': expect.any(Date),
            'lastUpdated': expect.any(Date)
          }
        },
        { upsert: true }
      );
      expect(CrossModuleActivity).toHaveBeenCalledWith({
        userId: 'user123',
        module: 'community',
        action: 'post_created',
        data: { postId: 'post123' },
        timestamp: expect.any(Date)
      });
      expect(mockActivity.save).toHaveBeenCalled();
    });
  });
});
