import { CommunityPost } from '../models/CommunityPost';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { UnifiedNotification } from '../models/UnifiedNotification';
import { UnifiedUserContext } from '../models/UnifiedUserContext';
import { Connection } from '../models/Connection';
import { CrossModuleActivity } from '../models/CrossModuleActivity';
import { User } from '../models/User';
import mongoose from 'mongoose';

export class CommunityIntegrationService {
  // Create contextual conversation from community post
  static async createPostConversation(postId: string, userId: string, targetUserId: string) {
    const post = await CommunityPost.findById(postId)
      .populate('author', 'fullName email profilePhoto headline skills')
      .populate('category', 'name color icon');

    if (!post) throw new Error('Post not found');

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, targetUserId] },
      'metadata.context.communityPostId': postId
    });

    if (!conversation) {
      // Create new conversation with community context
      conversation = new Conversation({
        participants: [userId, targetUserId],
        conversationType: 'community_related',
        metadata: {
          context: {
            communityPostId: postId,
            postTitle: post.title,
            postCategory: post.category.name,
            sharedInterests: this.calculateSharedInterests(post, userId, targetUserId)
          },
          connectionStrength: await this.calculateConnectionStrength(userId, targetUserId),
          lastActivity: new Date(),
          messageCount: 0,
          unreadCount: new Map()
        }
      });

      await conversation.save();
      await conversation.populate('participants', 'fullName email profilePhoto headline skills');

      // Send contextual welcome message
      const welcomeMessage = new Message({
        conversation: conversation._id,
        sender: userId,
        content: `Hi! I saw your post "${post.title}" in the ${post.category.name} category. I'd love to discuss this further!`,
        messageType: 'text',
        context: {
          communityPostId: postId,
          postTitle: post.title,
          postCategory: post.category.name
        }
      });

      await welcomeMessage.save();

      // Update conversation
      conversation.lastMessage = welcomeMessage._id;
      conversation.lastMessageAt = new Date();
      conversation.metadata.messageCount = 1;
      await conversation.save();

      // Send notification
      await this.sendPostConversationNotification(targetUserId, userId, post);
    }

    return conversation;
  }

  // Invite gang members to community discussion
  static async inviteGangToDiscussion(postId: string, userId: string, gangMemberIds: string[]) {
    const post = await CommunityPost.findById(postId)
      .populate('author', 'fullName email profilePhoto')
      .populate('category', 'name');

    if (!post) throw new Error('Post not found');

    const invitations = [];
    
    for (const memberId of gangMemberIds) {
      // Check if member is already engaged with this post
      const existingEngagement = await this.checkPostEngagement(postId, memberId);
      if (existingEngagement) continue;

      // Create invitation notification
      const notification = new UnifiedNotification({
        userId: memberId,
        type: 'gang_invitation',
        title: 'Gang Invitation to Discussion',
        message: `${post.author.fullName} invited you to join a discussion about "${post.title}"`,
        module: 'community',
        priority: 'medium',
        actionUrl: `/community/post/${postId}`,
        relatedData: {
          postId,
          postTitle: post.title,
          postCategory: post.category.name,
          invitedBy: userId,
          gangContext: true
        }
      });

      await notification.save();
      invitations.push(notification);

      // Update user context
      await this.updateUserContext(memberId, 'community', 'invitation_received');
    }

    return invitations;
  }

  // Surface relevant discussions based on connections and interests
  static async getPersonalizedDiscussions(userId: string, limit: number = 10) {
    const user = await UnifiedUserContext.findOne({ userId })
      .populate('userId', 'skills interests location industry');

    if (!user) return [];

    // Get user's connections and their activity
    const connections = await Connection.find({
      $or: [
        { user1: userId, status: 'accepted' },
        { user2: userId, status: 'accepted' }
      ]
    }).populate('user1 user2', 'skills interests location industry');

    const connectionIds = connections.flatMap(conn => [
      conn.user1._id.toString(),
      conn.user2._id.toString()
    ]).filter(id => id !== userId);

    // Get posts from connections and similar users
    const personalizedPosts = await CommunityPost.find({
      $or: [
        { author: { $in: connectionIds } },
        { 'professionalContext.industry': user.userId.industry },
        { 'professionalContext.relatedSkills': { $in: user.userId.skills } },
        { tags: { $in: user.userId.interests } }
      ],
      status: 'active'
    })
    .populate('author', 'fullName email profilePhoto headline skills')
    .populate('category', 'name color icon')
    .sort({ createdAt: -1 })
    .limit(limit);

    // Enhance with connection context
    return personalizedPosts.map(post => ({
      ...post.toObject(),
      connectionContext: this.getConnectionContext(post.author._id, userId, connections),
      relevanceScore: this.calculateRelevanceScore(post, user.userId)
    }));
  }

  // Cross-module activity integration
  static async updateCrossModuleActivity(userId: string, module: string, action: string, data: any) {
    // Update unified user context
    await UnifiedUserContext.findOneAndUpdate(
      { userId },
      {
        $inc: { 'crossModuleProfile.totalEngagement': 1 },
        $set: {
          [`crossModuleProfile.moduleActivity.${module}.lastActivity`]: new Date(),
          'lastUpdated': new Date()
        }
      },
      { upsert: true }
    );

    // Create cross-module activity record
    const activity = new CrossModuleActivity({
      userId,
      module,
      action,
      data,
      timestamp: new Date()
    });

    await activity.save();

    // Trigger relevant notifications
    await this.triggerRelevantNotifications(userId, module, action, data);
  }

  // Helper methods
  private static async calculateConnectionStrength(userId1: string, userId2: string): Promise<number> {
    // Get connection between users
    const connection = await Connection.findOne({
      $or: [
        { user1: userId1, user2: userId2 },
        { user1: userId2, user2: userId1 }
      ]
    });

    if (!connection) return 0;

    // Calculate strength based on interaction history
    const messageCount = await Message.countDocuments({
      conversation: { $in: await Conversation.find({
        participants: { $all: [userId1, userId2] }
      }).select('_id') }
    });

    const communityInteractions = await CommunityPost.countDocuments({
      $or: [
        { author: userId1, 'likedBy': userId2 },
        { author: userId2, 'likedBy': userId1 }
      ]
    });

    // Calculate strength score (0-100)
    const baseStrength = connection.strength || 50;
    const interactionBonus = Math.min(messageCount * 2 + communityInteractions * 5, 30);
    
    return Math.min(baseStrength + interactionBonus, 100);
  }

  private static calculateSharedInterests(post: any, userId1: string, userId2: string): string[] {
    // Calculate shared interests based on post content and user profiles
    return post.tags || [];
  }

  private static async checkPostEngagement(postId: string, userId: string): Promise<boolean> {
    // Check if user has already engaged with this post
    const engagement = await Message.findOne({
      'context.communityPostId': postId,
      sender: userId
    });
    return !!engagement;
  }

  private static async updateUserContext(userId: string, module: string, action: string) {
    // Update user context based on module activity
    await UnifiedUserContext.findOneAndUpdate(
      { userId },
      {
        $inc: { [`crossModuleProfile.moduleActivity.${module}.${action}`]: 1 },
        $set: { 'lastUpdated': new Date() }
      },
      { upsert: true }
    );
  }

  private static getConnectionContext(authorId: string, userId: string, connections: any[]) {
    const connection = connections.find(conn => 
      conn.user1._id.toString() === authorId || conn.user2._id.toString() === authorId
    );
    
    if (!connection) return null;

    return {
      connectionStrength: connection.strength || 50,
      mutualConnections: connection.mutualConnections || 0,
      sharedSkills: connection.sharedSkills || [],
      lastInteraction: connection.lastInteraction
    };
  }

  private static calculateRelevanceScore(post: any, user: any): number {
    let score = 0;
    
    // Industry match
    if (post.professionalContext?.industry === user.industry) score += 30;
    
    // Skills match
    const sharedSkills = post.professionalContext?.relatedSkills?.filter((skill: string) => 
      user.skills?.includes(skill)
    ) || [];
    score += sharedSkills.length * 10;
    
    // Interests match
    const sharedInterests = post.tags?.filter((tag: string) => 
      user.interests?.includes(tag)
    ) || [];
    score += sharedInterests.length * 5;
    
    // Recency bonus
    const daysSincePost = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePost < 7) score += 20;
    else if (daysSincePost < 30) score += 10;
    
    return Math.min(score, 100);
  }

  private static async sendPostConversationNotification(targetUserId: string, userId: string, post: any) {
    const notification = new UnifiedNotification({
      userId: targetUserId,
      type: 'community_message',
      title: 'New Discussion Started',
      message: `Someone wants to discuss your post "${post.title}"`,
      module: 'community',
      priority: 'medium',
      actionUrl: `/messages`,
      relatedData: {
        postId: post._id,
        postTitle: post.title,
        initiatedBy: userId
      }
    });

    await notification.save();
  }

  private static async triggerRelevantNotifications(userId: string, module: string, action: string, data: any) {
    // Trigger notifications based on cross-module activity
    // Implementation depends on specific action and module
    switch (module) {
      case 'community':
        if (action === 'post_created') {
          // Notify connections about new post
          const connections = await Connection.find({
            $or: [{ user1: userId }, { user2: userId }],
            status: 'accepted'
          });

          for (const conn of connections) {
            const targetUserId = conn.user1._id.toString() === userId ? 
              conn.user2._id.toString() : conn.user1._id.toString();

            const notification = new UnifiedNotification({
              userId: targetUserId,
              type: 'connection_activity',
              title: 'Connection Posted',
              message: `Your connection posted in the community`,
              module: 'community',
              priority: 'low',
              actionUrl: `/community/post/${data.postId}`,
              relatedData: {
                postId: data.postId,
                connectionId: conn._id
              }
            });

            await notification.save();
          }
        }
        break;
      // Add more cases as needed
    }
  }
}
