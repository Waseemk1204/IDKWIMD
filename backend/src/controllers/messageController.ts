import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Message, { IMessage } from '../models/Message';
import Conversation, { IConversation } from '../models/Conversation';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

// Get user's conversations
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
      .populate('participants', 'name email profileImage')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Conversation.countDocuments({
      participants: req.user._id,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        conversations,
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

// Create or get conversation
export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { participants, title, conversationType = 'direct', job } = req.body;

    // Ensure current user is included in participants
    const allParticipants = [...new Set([req.user._id.toString(), ...participants])];

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
      conversationType: conversationType === 'direct' ? 'direct' : conversationType
    }).populate('participants', 'name email profileImage');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: allParticipants,
        title,
        conversationType,
        job: job || null
      });

      await conversation.save();
      await conversation.populate('participants', 'name email profileImage');
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

// Get messages for a conversation
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
      return;
    }

    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email profileImage')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Message.countDocuments({ conversation: conversationId });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
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

// Send message
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const { conversationId } = req.params;
    const { content, messageType = 'text', attachments, replyTo } = req.body;

    // Check if user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
      return;
    }

    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Create message
    const message = new Message({
      conversation: conversationId,
      sender: req.user._id,
      content,
      messageType,
      attachments: attachments || [],
      replyTo: replyTo || null
    });

    await message.save();

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: new Date()
    });

    // Populate message data
    await message.populate([
      { path: 'sender', select: 'name email profileImage' },
      { path: 'replyTo' }
    ]);

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

// Mark messages as read
export const markMessagesAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;

    // Check if user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
      return;
    }

    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Mark all unread messages in conversation as read
    await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: req.user._id },
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

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

// Delete conversation
export const deleteConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
      return;
    }

    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Mark conversation as inactive
    await Conversation.findByIdAndUpdate(conversationId, {
      isActive: false
    });

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const unreadCount = await Message.countDocuments({
      conversation: { $in: await Conversation.find({ participants: req.user._id }).distinct('_id') },
      sender: { $ne: req.user._id },
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
