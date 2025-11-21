import { Request, Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import Channel from '../models/Channel';
import CallHistory from '../models/CallHistory';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

// Get conversations for a user
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
    .populate('participants', 'fullName email profilePhoto headline')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(Number(limit));

    return res.json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};

// Create a new conversation
export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { participants, title, conversationType = 'direct' } = req.body;

    if (!participants || participants.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'At least one participant is required'
      });
    }

    // Add current user to participants
    const allParticipants = [...participants, req.user._id];

    // Check if direct conversation already exists
    if (conversationType === 'direct' && allParticipants.length === 2) {
      const existingConversation = await Conversation.findOne({
        participants: { $all: allParticipants },
        conversationType: 'direct'
      });

      if (existingConversation) {
        return res.json({
          success: true,
          data: { conversation: existingConversation }
        });
      }
    }

    const conversation = new Conversation({
      participants: allParticipants,
      title,
      conversationType,
      metadata: {
        messageCount: 0,
        unreadCount: {}
      }
    });

    await conversation.save();
    await conversation.populate('participants', 'fullName email profilePhoto headline');

    return res.status(201).json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
};

// Get messages for a conversation
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Check if user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'fullName email profilePhoto')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      success: true,
      data: { messages: messages.reverse() }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Send a message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'text', replyTo, attachments } = req.body;

    // Check if user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages to this conversation'
      });
    }

    const message = new Message({
      conversation: conversationId,
      sender: req.user._id,
      content,
      messageType,
      replyTo,
      attachments,
      readBy: [req.user._id]
    });

    await message.save();
    await message.populate('sender', 'fullName email profilePhoto');

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
      $inc: { 'metadata.messageCount': 1 }
    });

    return res.status(201).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      { 
        conversation: conversationId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      { 
        $push: { readBy: req.user._id },
        $set: { isRead: true }
      }
    );

    return res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
};

// Edit a message
export const editMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.sender.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this message'
      });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    return res.json({
      success: true,
      data: { message }
    });
  } catch (error) {
    console.error('Error editing message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to edit message'
    });
  }
};

// Delete a message
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.sender.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await Message.findByIdAndDelete(messageId);

    return res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// Add reaction to message
export const addReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { reactionType } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Find existing reaction or create new one
    const reaction = message.reactions?.find(r => r.reactionType === reactionType);
    
    if (reaction) {
      // Toggle reaction
      const userIndex = reaction.users.findIndex(u => u.toString() === req.user._id);
      if (userIndex > -1) {
        reaction.users.splice(userIndex, 1);
        reaction.count = Math.max(0, reaction.count - 1);
      } else {
        reaction.users.push(req.user._id as any);
        reaction.count += 1;
      }
    } else {
      // Create new reaction
      if (!message.reactions) message.reactions = [];
      message.reactions.push({
        reactionType,
        count: 1,
        users: [req.user._id as any]
      });
    }

    await message.save();

    return res.json({
      success: true,
      data: { reactions: message.reactions }
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add reaction'
    });
  }
};

// Search messages
export const searchMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { q, conversationId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const query: any = {
      content: { $regex: q, $options: 'i' }
    };

    if (conversationId) {
      query.conversation = conversationId;
    }

    const messages = await Message.find(query)
      .populate('sender', 'fullName email profilePhoto')
      .populate('conversation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search messages'
    });
  }
};

// Get unread count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const unreadCount = await Message.countDocuments({
      sender: { $ne: req.user._id },
      readBy: { $ne: req.user._id }
    });

    return res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

// Delete conversation
export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.some((p: any) => p.equals(req.user._id))) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this conversation' });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversation: conversationId });

    // Delete conversation
    await Conversation.findByIdAndDelete(conversationId);

    return res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete conversation' });
  }
};

// Get conversation participants
export const getConversationParticipants = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'fullName profilePhoto email headline');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.some((p: any) => p._id.equals(req.user._id))) {
      return res.status(403).json({ success: false, message: 'Not authorized to view participants' });
    }

    return res.json({
      success: true,
      data: conversation.participants
    });
  } catch (error) {
    console.error('Get participants error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get participants' });
  }
};

// Create thread
export const createThread = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { messageId, content } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.some((p: any) => p.equals(req.user._id))) {
      return res.status(403).json({ success: false, message: 'Not authorized to create thread' });
    }

    const parentMessage = await Message.findById(messageId);
    if (!parentMessage) {
      return res.status(404).json({ success: false, message: 'Parent message not found' });
    }

    const threadMessage = new Message({
      conversation: conversationId,
      sender: req.user._id,
      content,
      messageType: 'text',
      replyTo: messageId,
      threadId: messageId
    });

    await threadMessage.save();
    await threadMessage.populate('sender', 'fullName profilePhoto');

    return res.status(201).json({
      success: true,
      data: threadMessage
    });
  } catch (error) {
    console.error('Create thread error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create thread' });
  }
};
