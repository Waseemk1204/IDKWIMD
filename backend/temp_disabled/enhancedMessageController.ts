import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Message, { IMessage } from '../models/Message';
import Conversation, { IConversation } from '../models/Conversation';
import MessageThread from '../models/MessageThread';
import MessageReaction from '../models/MessageReaction';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { sendMessageToConversation } from '../services/socketService';
import mongoose from 'mongoose';

// Enhanced messaging controller with advanced features

// Get user's conversations with enhanced metadata
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, type, search } = req.query;
    const userId = req.user._id;

    const skip = (Number(page) - 1) * Number(limit);
    let query: any = {
      participants: userId,
      isActive: true
    };

    // Filter by conversation type
    if (type && type !== 'all') {
      query.conversationType = type;
    }

    // Search in conversation titles and participant names
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'participants.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    const conversations = await Conversation.find(query)
      .populate('participants', 'fullName email profilePhoto headline isOnline lastSeen')
      .populate('lastMessage')
      .populate('job', 'title company')
      .populate('communityPost', 'title content')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Calculate unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: userId },
          isRead: false
        });

        return {
          ...conv,
          unreadCount,
          metadata: {
            ...conv.metadata,
            unreadCount: { [userId]: unreadCount }
          }
        };
      })
    );

    const total = await Conversation.countDocuments(query);

    res.json({
      success: true,
      data: {
        conversations: conversationsWithUnread,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalConversations: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create or get conversation with smart context detection
export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { participants, title, conversationType = 'direct', job, communityPost, gangId, context } = req.body;
    const userId = req.user._id;

    // Ensure current user is included in participants
    const allParticipants = [...new Set([userId.toString(), ...participants])];

    if (allParticipants.length < 2) {
      res.status(400).json({
        success: false,
        message: 'At least 2 participants are required'
      });
      return;
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: allParticipants },
      conversationType: conversationType === 'direct' ? 'direct' : conversationType,
      ...(job && { job }),
      ...(communityPost && { communityPost }),
      ...(gangId && { gangId })
    }).populate('participants', 'fullName email profilePhoto headline');

    if (!conversation) {
      // Calculate connection strength if it's a direct conversation
      let connectionStrength = 0;
      if (conversationType === 'direct' && allParticipants.length === 2) {
        // This would integrate with the connection analytics system
        // For now, we'll set a default value
        connectionStrength = 50;
      }

      // Create new conversation
      conversation = new Conversation({
        participants: allParticipants,
        title: title || (conversationType === 'direct' ? undefined : title),
        conversationType,
        job: job || null,
        communityPost: communityPost || null,
        gangId: gangId || null,
        metadata: {
          connectionStrength,
          sharedInterests: context?.sharedInterests || [],
          lastActivity: new Date(),
          messageCount: 0,
          unreadCount: {}
        }
      });

      await conversation.save();
      await conversation.populate('participants', 'fullName email profilePhoto headline');
    }

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: { conversation }
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get messages for a conversation with threading support
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50, threadId } = req.query;
    const userId = req.user._id;

    const skip = (Number(page) - 1) * Number(limit);

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
      return;
    }

    let query: any = {
      conversation: conversationId
    };

    // If threadId is provided, get messages from that thread
    if (threadId) {
      query.threadId = threadId;
    } else {
      // Get top-level messages (not in threads)
      query.threadId = { $exists: false };
    }

    const messages = await Message.find(query)
      .populate('sender', 'fullName email profilePhoto headline')
      .populate('replyTo', 'content sender')
      .populate('context.jobId', 'title company')
      .populate('context.communityPostId', 'title content')
      .populate('context.connectionId')
      .populate('context.applicationId', 'status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get reaction counts for each message
    const messagesWithReactions = await Promise.all(
      messages.map(async (message) => {
        const reactions = await MessageReaction.aggregate([
          { $match: { message: message._id } },
          {
            $group: {
              _id: '$reactionType',
              count: { $sum: 1 },
              users: { $push: '$user' }
            }
          }
        ]);

        return {
          ...message,
          reactions: reactions.map(r => ({
            reactionType: r._id,
            count: r.count,
            users: r.users
          }))
        };
      })
    );

    const total = await Message.countDocuments(query);

    res.json({
      success: true,
      data: {
        messages: messagesWithReactions.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalMessages: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send message with enhanced context support
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'text', attachments, replyTo, threadId, context } = req.body;
    const userId = req.user._id;

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
      return;
    }

    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content,
      messageType,
      attachments: attachments || [],
      replyTo: replyTo || null,
      threadId: threadId || null,
      context: context || {},
      isRead: false
    });

    await message.save();
    await message.populate('sender', 'fullName email profilePhoto headline');
    await message.populate('replyTo', 'content sender');
    await message.populate('context.jobId', 'title company');
    await message.populate('context.communityPostId', 'title content');

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    conversation.metadata.messageCount = (conversation.metadata.messageCount || 0) + 1;
    conversation.metadata.lastActivity = new Date();

    // Update unread counts for all participants except sender
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== userId.toString()) {
        const currentUnread = conversation.metadata.unreadCount.get(participantId.toString()) || 0;
        conversation.metadata.unreadCount.set(participantId.toString(), currentUnread + 1);
      }
    });

    await conversation.save();

    // Send real-time update
    sendMessageToConversation(req.io, conversationId, {
      ...message.toObject(),
      reactions: []
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add reaction to message
export const addReaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user._id;

    // Check if user already reacted with this type
    const existingReaction = await MessageReaction.findOne({
      message: messageId,
      user: userId,
      reactionType
    });

    if (existingReaction) {
      res.status(400).json({
        success: false,
        message: 'You have already reacted with this type'
      });
      return;
    }

    // Remove any existing reaction of different type
    await MessageReaction.deleteOne({
      message: messageId,
      user: userId
    });

    // Add new reaction
    const reaction = new MessageReaction({
      message: messageId,
      user: userId,
      reactionType
    });

    await reaction.save();

    // Get updated reaction counts
    const reactions = await MessageReaction.aggregate([
      { $match: { message: new mongoose.Types.ObjectId(messageId) } },
      {
        $group: {
          _id: '$reactionType',
          count: { $sum: 1 },
          users: { $push: '$user' }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Reaction added successfully',
      data: {
        reactions: reactions.map(r => ({
          reactionType: r._id,
          count: r.count,
          users: r.users
        }))
      }
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create message thread
export const createThread = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { parentMessageId, title } = req.body;
    const userId = req.user._id;

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
      return;
    }

    // Verify parent message exists
    const parentMessage = await Message.findOne({
      _id: parentMessageId,
      conversation: conversationId
    });

    if (!parentMessage) {
      res.status(404).json({
        success: false,
        message: 'Parent message not found'
      });
      return;
    }

    // Create thread
    const thread = new MessageThread({
      conversation: conversationId,
      parentMessage: parentMessageId,
      title: title || `Thread: ${parentMessage.content.substring(0, 50)}...`,
      messages: []
    });

    await thread.save();

    res.status(201).json({
      success: true,
      message: 'Thread created successfully',
      data: { thread }
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Update all unread messages in this conversation
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Update conversation unread count
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      conversation.metadata.unreadCount.set(userId.toString(), 0);
      await conversation.save();
    }

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get unread count for user
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      conversation: { $in: await Conversation.find({ participants: userId }).distinct('_id') },
      sender: { $ne: userId },
      isRead: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Search messages across conversations
export const searchMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q, conversationId, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    if (!q) {
      res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    let conversationQuery: any = { participants: userId };
    if (conversationId) {
      conversationQuery._id = conversationId;
    }

    const userConversations = await Conversation.find(conversationQuery).distinct('_id');

    const messages = await Message.find({
      conversation: { $in: userConversations },
      content: { $regex: q, $options: 'i' }
    })
      .populate('sender', 'fullName email profilePhoto')
      .populate('conversation', 'title participants')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Message.countDocuments({
      conversation: { $in: userConversations },
      content: { $regex: q, $options: 'i' }
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalMessages: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

