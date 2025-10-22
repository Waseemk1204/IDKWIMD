import request from 'supertest';
import { app } from '../server';
import { connectDB, disconnectDB } from '../config/database';
import User from '../models/User';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import MessageReaction from '../models/MessageReaction';
import MessageThread from '../models/MessageThread';
import jwt from 'jsonwebtoken';
import { config } from '../config';

describe('Enhanced Messaging System', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let token1: string;
  let token2: string;
  let token3: string;
  let conversation: any;

  beforeAll(async () => {
    await connectDB();
    
    // Create test users
    user1 = new User({
      fullName: 'Test User 1',
      email: 'user1@test.com',
      password: 'password123',
      role: 'employee',
      isActive: true
    });
    await user1.save();

    user2 = new User({
      fullName: 'Test User 2',
      email: 'user2@test.com',
      password: 'password123',
      role: 'employee',
      isActive: true
    });
    await user2.save();

    user3 = new User({
      fullName: 'Test User 3',
      email: 'user3@test.com',
      password: 'password123',
      role: 'employer',
      isActive: true
    });
    await user3.save();

    // Generate tokens
    token1 = jwt.sign({ userId: user1._id }, config.JWT_SECRET);
    token2 = jwt.sign({ userId: user2._id }, config.JWT_SECRET);
    token3 = jwt.sign({ userId: user3._id }, config.JWT_SECRET);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await MessageReaction.deleteMany({});
    await MessageThread.deleteMany({});
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clean up before each test
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await MessageReaction.deleteMany({});
    await MessageThread.deleteMany({});
  });

  describe('Conversation Management', () => {
    it('should create a new direct conversation', async () => {
      const response = await request(app)
        .post('/api/v1/messages/conversations')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          participants: [user2._id.toString()],
          conversationType: 'direct'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.conversation.participants).toHaveLength(2);
      expect(response.body.data.conversation.conversationType).toBe('direct');
      
      conversation = response.body.data.conversation;
    });

    it('should get user conversations', async () => {
      // Create a conversation first
      await request(app)
        .post('/api/v1/messages/conversations')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          participants: [user2._id.toString()],
          conversationType: 'direct'
        });

      const response = await request(app)
        .get('/api/v1/messages/conversations')
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.conversations).toHaveLength(1);
    });

    it('should not allow access to conversations user is not part of', async () => {
      // Create conversation between user1 and user2
      const convResponse = await request(app)
        .post('/api/v1/messages/conversations')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          participants: [user2._id.toString()],
          conversationType: 'direct'
        });

      const conversationId = convResponse.body.data.conversation._id;

      // Try to access with user3 (not a participant)
      const response = await request(app)
        .get(`/api/v1/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token3}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Message Management', () => {
    beforeEach(async () => {
      // Create a conversation for message tests
      const convResponse = await request(app)
        .post('/api/v1/messages/conversations')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          participants: [user2._id.toString()],
          conversationType: 'direct'
        });

      conversation = convResponse.body.data.conversation;
    });

    it('should send a message', async () => {
      const response = await request(app)
        .post(`/api/v1/messages/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: 'Hello, this is a test message!',
          messageType: 'text'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message.content).toBe('Hello, this is a test message!');
      expect(response.body.data.message.sender._id).toBe(user1._id.toString());
    });

    it('should get messages for a conversation', async () => {
      // Send a message first
      await request(app)
        .post(`/api/v1/messages/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: 'Test message',
          messageType: 'text'
        });

      const response = await request(app)
        .get(`/api/v1/messages/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(1);
      expect(response.body.data.messages[0].content).toBe('Test message');
    });

    it('should mark messages as read', async () => {
      // Send a message from user2 to user1
      await request(app)
        .post(`/api/v1/messages/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          content: 'Message to be marked as read',
          messageType: 'text'
        });

      const response = await request(app)
        .put(`/api/v1/messages/conversations/${conversation._id}/read`)
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should edit a message', async () => {
      // Send a message first
      const messageResponse = await request(app)
        .post(`/api/v1/messages/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: 'Original message',
          messageType: 'text'
        });

      const messageId = messageResponse.body.data.message._id;

      const response = await request(app)
        .put(`/api/v1/messages/messages/${messageId}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: 'Edited message'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should delete a message', async () => {
      // Send a message first
      const messageResponse = await request(app)
        .post(`/api/v1/messages/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: 'Message to be deleted',
          messageType: 'text'
        });

      const messageId = messageResponse.body.data.message._id;

      const response = await request(app)
        .delete(`/api/v1/messages/messages/${messageId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Message Reactions', () => {
    let message: any;

    beforeEach(async () => {
      // Create conversation and message
      const convResponse = await request(app)
        .post('/api/v1/messages/conversations')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          participants: [user2._id.toString()],
          conversationType: 'direct'
        });

      conversation = convResponse.body.data.conversation;

      const messageResponse = await request(app)
        .post(`/api/v1/messages/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: 'Message for reactions',
          messageType: 'text'
        });

      message = messageResponse.body.data.message;
    });

    it('should add a reaction to a message', async () => {
      const response = await request(app)
        .post(`/api/v1/messages/messages/${message._id}/reactions`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          reactionType: 'thumbs_up'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reactions).toHaveLength(1);
      expect(response.body.data.reactions[0].reactionType).toBe('thumbs_up');
      expect(response.body.data.reactions[0].count).toBe(1);
    });

    it('should not allow duplicate reactions from same user', async () => {
      // Add first reaction
      await request(app)
        .post(`/api/v1/messages/messages/${message._id}/reactions`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          reactionType: 'thumbs_up'
        });

      // Try to add same reaction again
      const response = await request(app)
        .post(`/api/v1/messages/messages/${message._id}/reactions`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          reactionType: 'thumbs_up'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should replace existing reaction with new one', async () => {
      // Add first reaction
      await request(app)
        .post(`/api/v1/messages/messages/${message._id}/reactions`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          reactionType: 'thumbs_up'
        });

      // Add different reaction (should replace the first one)
      const response = await request(app)
        .post(`/api/v1/messages/messages/${message._id}/reactions`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          reactionType: 'lightbulb'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reactions).toHaveLength(1);
      expect(response.body.data.reactions[0].reactionType).toBe('lightbulb');
    });
  });

  describe('Message Threading', () => {
    let message: any;

    beforeEach(async () => {
      // Create conversation and message
      const convResponse = await request(app)
        .post('/api/v1/messages/conversations')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          participants: [user2._id.toString()],
          conversationType: 'direct'
        });

      conversation = convResponse.body.data.conversation;

      const messageResponse = await request(app)
        .post(`/api/v1/messages/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: 'Parent message for threading',
          messageType: 'text'
        });

      message = messageResponse.body.data.message;
    });

    it('should create a message thread', async () => {
      const response = await request(app)
        .post(`/api/v1/messages/conversations/${conversation._id}/threads`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          parentMessageId: message._id,
          title: 'Test Thread'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.thread.title).toBe('Test Thread');
      expect(response.body.data.thread.parentMessage).toBe(message._id);
    });

    it('should send a message in a thread', async () => {
      // Create thread first
      const threadResponse = await request(app)
        .post(`/api/v1/messages/conversations/${conversation._id}/threads`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          parentMessageId: message._id,
          title: 'Test Thread'
        });

      const threadId = threadResponse.body.data.thread._id;

      // Send message in thread
      const response = await request(app)
        .post(`/api/v1/messages/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          content: 'Thread message',
          messageType: 'text',
          threadId: threadId
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message.threadId).toBe(threadId);
    });
  });

  describe('Message Search', () => {
    beforeEach(async () => {
      // Create conversation and messages
      const convResponse = await request(app)
        .post('/api/v1/messages/conversations')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          participants: [user2._id.toString()],
          conversationType: 'direct'
        });

      conversation = convResponse.body.data.conversation;

      // Send multiple messages
      await request(app)
        .post(`/api/v1/messages/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: 'This is a test message about JavaScript',
          messageType: 'text'
        });

      await request(app)
        .post(`/api/v1/messages/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          content: 'Another message about React development',
          messageType: 'text'
        });
    });

    it('should search messages across conversations', async () => {
      const response = await request(app)
        .get('/api/v1/messages/search')
        .set('Authorization', `Bearer ${token1}`)
        .query({ q: 'JavaScript' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(1);
      expect(response.body.data.messages[0].content).toContain('JavaScript');
    });

    it('should search messages within specific conversation', async () => {
      const response = await request(app)
        .get('/api/v1/messages/search')
        .set('Authorization', `Bearer ${token1}`)
        .query({ 
          q: 'React',
          conversationId: conversation._id
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toHaveLength(1);
      expect(response.body.data.messages[0].content).toContain('React');
    });
  });

  describe('Unread Count', () => {
    beforeEach(async () => {
      // Create conversation
      const convResponse = await request(app)
        .post('/api/v1/messages/conversations')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          participants: [user2._id.toString()],
          conversationType: 'direct'
        });

      conversation = convResponse.body.data.conversation;
    });

    it('should get unread count for user', async () => {
      // Send a message from user2 to user1
      await request(app)
        .post(`/api/v1/messages/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          content: 'Unread message',
          messageType: 'text'
        });

      const response = await request(app)
        .get('/api/v1/messages/unread-count')
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.unreadCount).toBeGreaterThan(0);
    });
  });

  describe('Unified Messaging Integration', () => {
    it('should create job-related conversation', async () => {
      const response = await request(app)
        .post('/api/v1/unified-messaging/job-conversation')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          applicationId: '507f1f77bcf86cd799439011', // Mock ObjectId
          jobId: '507f1f77bcf86cd799439012' // Mock ObjectId
        });

      // This will fail due to missing application, but should return proper error
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should get conversation suggestions', async () => {
      const response = await request(app)
        .get('/api/v1/unified-messaging/suggestions')
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.suggestions)).toBe(true);
    });

    it('should get messaging analytics', async () => {
      const response = await request(app)
        .get('/api/v1/unified-messaging/analytics')
        .set('Authorization', `Bearer ${token1}`)
        .query({ timeframe: '30d' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.conversationStats).toBeDefined();
      expect(response.body.data.messageStats).toBeDefined();
      expect(response.body.data.responseRate).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid conversation ID', async () => {
      const response = await request(app)
        .get('/api/v1/messages/conversations/invalid-id/messages')
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(500);
    });

    it('should handle missing authorization', async () => {
      const response = await request(app)
        .get('/api/v1/messages/conversations');

      expect(response.status).toBe(401);
    });

    it('should handle invalid message data', async () => {
      const convResponse = await request(app)
        .post('/api/v1/messages/conversations')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          participants: [user2._id.toString()],
          conversationType: 'direct'
        });

      const conversationId = convResponse.body.data.conversation._id;

      const response = await request(app)
        .post(`/api/v1/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          // Missing content
          messageType: 'text'
        });

      expect(response.status).toBe(400);
    });
  });
});

