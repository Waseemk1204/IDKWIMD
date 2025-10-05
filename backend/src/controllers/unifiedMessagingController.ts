import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import User from '../models/User';
import { Connection } from '../models/Connection';
import { CommunityPost } from '../models/CommunityPost';
import { Application } from '../models/Application';
import { sendMessageToConversation } from '../services/socketService';
import mongoose from 'mongoose';

// Unified Integration Service for Cross-Module Messaging

// Create conversation from job application
export const createJobConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { applicationId, jobId } = req.body;
    const userId = req.user._id;

    // Get application details
    const application = await Application.findById(applicationId)
      .populate('job', 'title company employer')
      .populate('applicant', 'fullName email profilePhoto');

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found'
      });
      return;
    }

    // Determine participants based on user role
    let participants: string[] = [];
    let conversationType = 'job_related';
    let title = `Job Discussion: ${application.job.title}`;

    if (req.user.role === 'employee') {
      // Employee messaging employer
      participants = [application.job.employer.toString()];
    } else if (req.user.role === 'employer') {
      // Employer messaging employee
      participants = [application.applicant._id.toString()];
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: participants },
      job: jobId,
      conversationType: 'job_related'
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [...participants, userId.toString()],
        job: jobId,
        conversationType,
        title,
        metadata: {
          connectionStrength: 0, // Will be calculated based on interaction
          sharedInterests: [],
          lastActivity: new Date(),
          messageCount: 0,
          unreadCount: new Map()
        }
      });

      await conversation.save();
      await conversation.populate('participants', 'fullName email profilePhoto headline');
    }

    // Send initial context message
    const contextMessage = new Message({
      conversation: conversation._id,
      sender: userId,
      content: `Application discussion for ${application.job.title} at ${application.job.company}`,
      messageType: 'job_context',
      context: {
        jobId: jobId,
        applicationId: applicationId
      }
    });

    await contextMessage.save();
    await contextMessage.populate('sender', 'fullName email profilePhoto');

    // Update conversation
    conversation.lastMessage = contextMessage._id;
    conversation.lastMessageAt = new Date();
    conversation.metadata.messageCount = 1;
    await conversation.save();

    // Send real-time update
    sendMessageToConversation(req.io, conversation._id.toString(), contextMessage.toObject());

    res.status(201).json({
      success: true,
      message: 'Job conversation created successfully',
      data: { conversation, initialMessage: contextMessage }
    });
  } catch (error) {
    console.error('Create job conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create conversation from community post interaction
export const createCommunityConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId, authorId } = req.body;
    const userId = req.user._id;

    // Get post details
    const post = await CommunityPost.findById(postId)
      .populate('author', 'fullName email profilePhoto');

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Community post not found'
      });
      return;
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId.toString(), authorId] },
      communityPost: postId,
      conversationType: 'community_related'
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [userId.toString(), authorId],
        communityPost: postId,
        conversationType: 'community_related',
        title: `Community Discussion: ${post.title}`,
        metadata: {
          connectionStrength: 0,
          sharedInterests: post.tags || [],
          lastActivity: new Date(),
          messageCount: 0,
          unreadCount: new Map()
        }
      });

      await conversation.save();
      await conversation.populate('participants', 'fullName email profilePhoto headline');
    }

    // Send initial context message
    const contextMessage = new Message({
      conversation: conversation._id,
      sender: userId,
      content: `Discussion about your post: "${post.title}"`,
      messageType: 'community_context',
      context: {
        communityPostId: postId
      }
    });

    await contextMessage.save();
    await contextMessage.populate('sender', 'fullName email profilePhoto');

    // Update conversation
    conversation.lastMessage = contextMessage._id;
    conversation.lastMessageAt = new Date();
    conversation.metadata.messageCount = 1;
    await conversation.save();

    // Send real-time update
    sendMessageToConversation(req.io, conversation._id.toString(), contextMessage.toObject());

    res.status(201).json({
      success: true,
      message: 'Community conversation created successfully',
      data: { conversation, initialMessage: contextMessage }
    });
  } catch (error) {
    console.error('Create community conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create conversation from gang connection
export const createGangConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { connectionId, targetUserId } = req.body;
    const userId = req.user._id;

    // Get connection details
    const connection = await Connection.findById(connectionId)
      .populate('user1', 'fullName email profilePhoto skills')
      .populate('user2', 'fullName email profilePhoto skills');

    if (!connection) {
      res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
      return;
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId.toString(), targetUserId] },
      conversationType: 'gang_related'
    });

    if (!conversation) {
      // Calculate shared interests
      const user1Skills = connection.user1.skills || [];
      const user2Skills = connection.user2.skills || [];
      const sharedInterests = user1Skills.filter((skill: string) => 
        user2Skills.includes(skill)
      );

      // Create new conversation
      conversation = new Conversation({
        participants: [userId.toString(), targetUserId],
        conversationType: 'gang_related',
        metadata: {
          connectionStrength: 50, // Default strength, will be updated based on interaction
          sharedInterests,
          lastActivity: new Date(),
          messageCount: 0,
          unreadCount: new Map()
        }
      });

      await conversation.save();
      await conversation.populate('participants', 'fullName email profilePhoto headline skills');
    }

    // Send initial context message
    const contextMessage = new Message({
      conversation: conversation._id,
      sender: userId,
      content: 'Connected through Gang Members! Let\'s chat.',
      messageType: 'text',
      context: {
        connectionId: connectionId
      }
    });

    await contextMessage.save();
    await contextMessage.populate('sender', 'fullName email profilePhoto');

    // Update conversation
    conversation.lastMessage = contextMessage._id;
    conversation.lastMessageAt = new Date();
    conversation.metadata.messageCount = 1;
    await conversation.save();

    // Send real-time update
    sendMessageToConversation(req.io, conversation._id.toString(), contextMessage.toObject());

    res.status(201).json({
      success: true,
      message: 'Gang conversation created successfully',
      data: { conversation, initialMessage: contextMessage }
    });
  } catch (error) {
    console.error('Create gang conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get conversation suggestions based on user activity
export const getConversationSuggestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const suggestions = [];

    // Get recent job applications
    const recentApplications = await Application.find({
      applicant: userId,
      status: { $in: ['pending', 'reviewed', 'shortlisted'] }
    })
      .populate('job', 'title company employer')
      .populate('job.employer', 'fullName email profilePhoto')
      .sort({ createdAt: -1 })
      .limit(3);

    // Get recent community interactions
    const recentCommunityPosts = await CommunityPost.find({
      author: { $ne: userId },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })
      .populate('author', 'fullName email profilePhoto')
      .sort({ createdAt: -1 })
      .limit(3);

    // Get strong connections without recent conversations
    const strongConnections = await Connection.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'accepted'
    })
      .populate('user1', 'fullName email profilePhoto skills')
      .populate('user2', 'fullName email profilePhoto skills')
      .limit(3);

    // Format suggestions
    recentApplications.forEach(app => {
      suggestions.push({
        type: 'job_application',
        title: `Discuss ${app.job.title}`,
        description: `Message the employer about your application`,
        targetUser: app.job.employer,
        context: {
          jobId: app.job._id,
          applicationId: app._id
        },
        priority: 'high'
      });
    });

    recentCommunityPosts.forEach(post => {
      suggestions.push({
        type: 'community_post',
        title: `Discuss "${post.title}"`,
        description: `Connect with the author about this post`,
        targetUser: post.author,
        context: {
          postId: post._id
        },
        priority: 'medium'
      });
    });

    strongConnections.forEach(conn => {
      const otherUser = conn.user1._id.toString() === userId.toString() ? conn.user2 : conn.user1;
      suggestions.push({
        type: 'gang_connection',
        title: `Connect with ${otherUser.fullName}`,
        description: `You have a strong connection - start chatting!`,
        targetUser: otherUser,
        context: {
          connectionId: conn._id
        },
        priority: 'medium'
      });
    });

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Get conversation suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update connection strength based on messaging activity
export const updateConnectionStrength = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Get conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
      return;
    }

    // Calculate message count and interaction frequency
    const messageCount = await Message.countDocuments({
      conversation: conversationId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    // Update connection strength based on activity
    let newStrength = Math.min(100, messageCount * 2); // Simple calculation
    
    if (conversation.metadata) {
      conversation.metadata.connectionStrength = newStrength;
      conversation.metadata.lastActivity = new Date();
      await conversation.save();
    }

    // Update connection analytics if it's a gang conversation
    if (conversation.conversationType === 'gang_related') {
      const otherParticipant = conversation.participants.find(p => p.toString() !== userId.toString());
      if (otherParticipant) {
        // Update connection analytics
        // This would integrate with the ConnectionAnalytics model
        console.log(`Updating connection strength between ${userId} and ${otherParticipant} to ${newStrength}`);
      }
    }

    res.json({
      success: true,
      data: { connectionStrength: newStrength }
    });
  } catch (error) {
    console.error('Update connection strength error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get cross-module messaging analytics
export const getMessagingAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { timeframe = '30d' } = req.query;

    let dateFilter: any = {};
    switch (timeframe) {
      case '7d':
        dateFilter = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) };
        break;
    }

    // Get conversation statistics
    const conversations = await Conversation.find({
      participants: userId,
      createdAt: dateFilter
    });

    const conversationStats = {
      total: conversations.length,
      byType: {
        direct: conversations.filter(c => c.conversationType === 'direct').length,
        job_related: conversations.filter(c => c.conversationType === 'job_related').length,
        community_related: conversations.filter(c => c.conversationType === 'community_related').length,
        gang_related: conversations.filter(c => c.conversationType === 'gang_related').length
      }
    };

    // Get message statistics
    const messages = await Message.find({
      sender: userId,
      createdAt: dateFilter
    });

    const messageStats = {
      total: messages.length,
      byType: {
        text: messages.filter(m => m.messageType === 'text').length,
        job_context: messages.filter(m => m.messageType === 'job_context').length,
        community_context: messages.filter(m => m.messageType === 'community_context').length
      }
    };

    // Get response rate
    const sentMessages = await Message.countDocuments({
      sender: userId,
      createdAt: dateFilter
    });

    const receivedMessages = await Message.countDocuments({
      conversation: { $in: conversations.map(c => c._id) },
      sender: { $ne: userId },
      createdAt: dateFilter
    });

    const responseRate = sentMessages > 0 ? (receivedMessages / sentMessages) * 100 : 0;

    res.json({
      success: true,
      data: {
        conversationStats,
        messageStats,
        responseRate: Math.round(responseRate),
        timeframe
      }
    });
  } catch (error) {
    console.error('Get messaging analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export {
  createJobConversation,
  createCommunityConversation,
  createGangConversation,
  getConversationSuggestions,
  updateConnectionStrength,
  getMessagingAnalytics
};

