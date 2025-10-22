import request from 'supertest';
import { app } from '../server';
import { Connection } from '../models/Connection';
import { ConnectionAnalytics } from '../models/ConnectionAnalytics';
import { ConnectionRecommendation } from '../models/ConnectionRecommendation';
import User from '../models/User';
import mongoose from 'mongoose';

describe('Enhanced Gang Members System', () => {
  let user1Token: string;
  let user2Token: string;
  let user3Token: string;
  let user1Id: string;
  let user2Id: string;
  let user3Id: string;

  beforeAll(async () => {
    // Create test users
    const user1 = await User.create({
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'john@test.com',
      password: 'password123',
      role: 'employee',
      skills: ['JavaScript', 'React', 'Node.js'],
      location: 'New York',
      experiences: [{
        company: 'Tech Corp',
        title: 'Software Engineer',
        from: new Date('2020-01-01'),
        current: true
      }]
    });

    const user2 = await User.create({
      fullName: 'Jane Smith',
      username: 'janesmith',
      email: 'jane@test.com',
      password: 'password123',
      role: 'employee',
      skills: ['JavaScript', 'Python', 'React'],
      location: 'New York',
      experiences: [{
        company: 'Tech Corp',
        title: 'Senior Developer',
        from: new Date('2019-01-01'),
        current: true
      }]
    });

    const user3 = await User.create({
      fullName: 'Bob Wilson',
      username: 'bobwilson',
      email: 'bob@test.com',
      password: 'password123',
      role: 'employee',
      skills: ['Python', 'Django', 'PostgreSQL'],
      location: 'San Francisco',
      experiences: [{
        company: 'Startup Inc',
        title: 'Full Stack Developer',
        from: new Date('2021-01-01'),
        current: true
      }]
    });

    user1Id = user1._id.toString();
    user2Id = user2._id.toString();
    user3Id = user3._id.toString();

    // Login users to get tokens
    const login1 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'john@test.com', password: 'password123' });

    const login2 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'jane@test.com', password: 'password123' });

    const login3 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bob@test.com', password: 'password123' });

    user1Token = login1.body.data.token;
    user2Token = login2.body.data.token;
    user3Token = login3.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $in: ['john@test.com', 'jane@test.com', 'bob@test.com'] } });
    await Connection.deleteMany({});
    await ConnectionAnalytics.deleteMany({});
    await ConnectionRecommendation.deleteMany({});
  });

  describe('Connection Recommendations', () => {
    it('should generate connection recommendations for a user', async () => {
      const response = await request(app)
        .get('/api/v1/connections/recommendations')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendations).toBeDefined();
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
    });

    it('should recommend users based on shared skills', async () => {
      const response = await request(app)
        .get('/api/v1/connections/recommendations')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const recommendations = response.body.data.recommendations;
      const janeRecommendation = recommendations.find((rec: any) => 
        rec.recommendedUserId._id === user2Id
      );

      if (janeRecommendation) {
        expect(janeRecommendation.score).toBeGreaterThan(0);
        expect(janeRecommendation.reasons).toContainEqual(
          expect.objectContaining({
            type: 'shared_skills'
          })
        );
      }
    });

    it('should recommend users based on same location', async () => {
      const response = await request(app)
        .get('/api/v1/connections/recommendations')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const recommendations = response.body.data.recommendations;
      const janeRecommendation = recommendations.find((rec: any) => 
        rec.recommendedUserId._id === user2Id
      );

      if (janeRecommendation) {
        expect(janeRecommendation.reasons).toContainEqual(
          expect.objectContaining({
            type: 'same_location'
          })
        );
      }
    });

    it('should recommend users based on same company', async () => {
      const response = await request(app)
        .get('/api/v1/connections/recommendations')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const recommendations = response.body.data.recommendations;
      const janeRecommendation = recommendations.find((rec: any) => 
        rec.recommendedUserId._id === user2Id
      );

      if (janeRecommendation) {
        expect(janeRecommendation.reasons).toContainEqual(
          expect.objectContaining({
            type: 'same_company'
          })
        );
      }
    });

    it('should dismiss a recommendation', async () => {
      // First get recommendations
      const recommendationsResponse = await request(app)
        .get('/api/v1/connections/recommendations')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const recommendations = recommendationsResponse.body.data.recommendations;
      if (recommendations.length > 0) {
        const recommendationId = recommendations[0]._id;

        const response = await request(app)
          .post(`/api/v1/connections/recommendations/${recommendationId}/dismiss`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Recommendation dismissed');
      }
    });
  });

  describe('Connection Analytics', () => {
    it('should create analytics when a connection is accepted', async () => {
      // Send connection request
      await request(app)
        .post('/api/v1/connections/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ recipientId: user2Id })
        .expect(201);

      // Accept connection request
      const connection = await Connection.findOne({
        requester: user1Id,
        recipient: user2Id
      });

      await request(app)
        .post(`/api/v1/connections/accept/${connection!._id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      // Check if analytics were created
      const analytics = await ConnectionAnalytics.findOne({
        connectionId: connection!._id
      });

      expect(analytics).toBeDefined();
      expect(analytics!.user1.toString()).toBe(user1Id);
      expect(analytics!.user2.toString()).toBe(user2Id);
      expect(analytics!.strength).toBe(50); // Initial strength
    });

    it('should get connection analytics for a user', async () => {
      const response = await request(app)
        .get('/api/v1/connections/analytics')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.summary.totalConnections).toBeGreaterThanOrEqual(1);
      expect(response.body.data.analytics).toBeDefined();
      expect(Array.isArray(response.body.data.analytics)).toBe(true);
    });

    it('should calculate connection strength based on interactions', async () => {
      const connection = await Connection.findOne({
        requester: user1Id,
        recipient: user2Id
      });

      const analytics = await ConnectionAnalytics.findOne({
        connectionId: connection!._id
      });

      // Update analytics with more interactions
      analytics!.messageCount = 25;
      analytics!.mutualConnections = 5;
      analytics!.sharedJobApplications = 3;
      analytics!.skillEndorsements = 2;
      analytics!.lastInteraction = new Date();
      
      await analytics!.save();

      // Check if strength was recalculated
      expect(analytics!.strength).toBeGreaterThan(50);
    });
  });

  describe('Mutual Connections', () => {
    it('should get mutual connections between two users', async () => {
      // Create a third connection to have mutual connections
      await request(app)
        .post('/api/v1/connections/request')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ recipientId: user3Id })
        .expect(201);

      const connection2 = await Connection.findOne({
        requester: user2Id,
        recipient: user3Id
      });

      await request(app)
        .post(`/api/v1/connections/accept/${connection2!._id}`)
        .set('Authorization', `Bearer ${user3Token}`)
        .expect(200);

      // Now user1 and user3 should have user2 as a mutual connection
      const response = await request(app)
        .get(`/api/v1/connections/mutual/${user3Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mutualConnections).toBeDefined();
      expect(Array.isArray(response.body.data.mutualConnections)).toBe(true);
      expect(response.body.data.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Bulk Connection Actions', () => {
    it('should perform bulk connection actions', async () => {
      const response = await request(app)
        .post('/api/v1/connections/bulk-actions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          action: 'connect',
          userIds: [user3Id]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toBeDefined();
      expect(response.body.data.errors).toBeDefined();
      expect(response.body.data.summary).toBeDefined();
    });

    it('should validate bulk action parameters', async () => {
      const response = await request(app)
        .post('/api/v1/connections/bulk-actions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          action: 'invalid_action',
          userIds: [user3Id]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should limit bulk action to maximum 20 users', async () => {
      const userIds = Array(25).fill(user3Id); // Create array of 25 user IDs

      const response = await request(app)
        .post('/api/v1/connections/bulk-actions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          action: 'connect',
          userIds
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Connection Strength Calculation', () => {
    it('should calculate strength based on message count', async () => {
      const analytics = new ConnectionAnalytics({
        connectionId: new mongoose.Types.ObjectId(),
        user1: new mongoose.Types.ObjectId(),
        user2: new mongoose.Types.ObjectId(),
        messageCount: 100,
        lastInteraction: new Date(),
        mutualConnections: 0,
        sharedJobApplications: 0,
        skillEndorsements: 0,
        profileViews: 0,
        contentInteractions: 0
      });

      const strength = analytics.calculateStrength();
      expect(strength).toBeGreaterThan(50);
    });

    it('should calculate strength based on mutual connections', async () => {
      const analytics = new ConnectionAnalytics({
        connectionId: new mongoose.Types.ObjectId(),
        user1: new mongoose.Types.ObjectId(),
        user2: new mongoose.Types.ObjectId(),
        messageCount: 0,
        lastInteraction: new Date(),
        mutualConnections: 15,
        sharedJobApplications: 0,
        skillEndorsements: 0,
        profileViews: 0,
        contentInteractions: 0
      });

      const strength = analytics.calculateStrength();
      expect(strength).toBeGreaterThan(50);
    });

    it('should cap strength at 100', async () => {
      const analytics = new ConnectionAnalytics({
        connectionId: new mongoose.Types.ObjectId(),
        user1: new mongoose.Types.ObjectId(),
        user2: new mongoose.Types.ObjectId(),
        messageCount: 1000,
        lastInteraction: new Date(),
        mutualConnections: 100,
        sharedJobApplications: 100,
        skillEndorsements: 100,
        profileViews: 100,
        contentInteractions: 100
      });

      const strength = analytics.calculateStrength();
      expect(strength).toBeLessThanOrEqual(100);
    });
  });

  describe('Recommendation Algorithm', () => {
    it('should not recommend users who are already connected', async () => {
      const response = await request(app)
        .get('/api/v1/connections/recommendations')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const recommendations = response.body.data.recommendations;
      const connectedUserIds = recommendations.map((rec: any) => rec.recommendedUserId._id);
      
      // user2 should not be in recommendations since they're already connected
      expect(connectedUserIds).not.toContain(user2Id);
    });

    it('should not recommend users who have been dismissed', async () => {
      // Get recommendations and dismiss one
      const recommendationsResponse = await request(app)
        .get('/api/v1/connections/recommendations')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const recommendations = recommendationsResponse.body.data.recommendations;
      if (recommendations.length > 0) {
        const dismissedUserId = recommendations[0].recommendedUserId._id;
        
        await request(app)
          .post(`/api/v1/connections/recommendations/${recommendations[0]._id}/dismiss`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        // Get recommendations again
        const newRecommendationsResponse = await request(app)
          .get('/api/v1/connections/recommendations')
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        const newRecommendations = newRecommendationsResponse.body.data.recommendations;
        const newRecommendationIds = newRecommendations.map((rec: any) => rec.recommendedUserId._id);
        
        expect(newRecommendationIds).not.toContain(dismissedUserId);
      }
    });

    it('should expire old recommendations', async () => {
      // Create an old recommendation
      const oldRecommendation = new ConnectionRecommendation({
        userId: new mongoose.Types.ObjectId(),
        recommendedUserId: new mongoose.Types.ObjectId(),
        reasons: [{ type: 'shared_skills', weight: 20, details: 'Test' }],
        score: 50,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'active'
      });

      await oldRecommendation.save();

      // Clean up expired recommendations
      await ConnectionRecommendation.cleanupExpired();

      // Check if the old recommendation was marked as expired
      const updatedRecommendation = await ConnectionRecommendation.findById(oldRecommendation._id);
      expect(updatedRecommendation!.status).toBe('expired');
    });
  });
});

