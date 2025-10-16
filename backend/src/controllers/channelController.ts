import { Request, Response } from 'express';
import Channel from '../models/Channel';
import Message from '../models/Message';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

// Get channels for a user
export const getChannels = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {
      'members.user': req.user._id,
      isArchived: false
    };

    if (type) {
      query.type = type;
    }

    const channels = await Channel.find(query)
      .populate('members.user', 'fullName email profilePhoto')
      .populate('lastMessage')
      .populate('createdBy', 'fullName email profilePhoto')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      success: true,
      data: { channels }
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch channels'
    });
  }
};

// Create a new channel
export const createChannel = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, type = 'public', topic, purpose, settings } = req.body;

    // Check if channel name already exists
    const existingChannel = await Channel.findOne({ name });
    if (existingChannel) {
      return res.status(400).json({
        success: false,
        message: 'Channel name already exists'
      });
    }

    const channel = new Channel({
      name,
      description,
      type,
      createdBy: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin',
        joinedAt: new Date(),
        permissions: {
          canPost: true,
          canReact: true,
          canPin: true,
          canInvite: true
        }
      }],
      topic,
      purpose,
      settings: {
        allowFileUploads: true,
        allowReactions: true,
        allowThreads: true,
        allowMentions: true,
        requireApproval: false,
        ...settings
      }
    });

    await channel.save();
    await channel.populate('members.user', 'fullName email profilePhoto');
    await channel.populate('createdBy', 'fullName email profilePhoto');

    return res.status(201).json({
      success: true,
      data: { channel }
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create channel'
    });
  }
};

// Get channel details
export const getChannel = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId)
      .populate('members.user', 'fullName email profilePhoto headline')
      .populate('lastMessage')
      .populate('createdBy', 'fullName email profilePhoto');

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is member
    const isMember = channel.members.some(
      m => m.user.toString() === req.user._id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this channel'
      });
    }

    return res.json({
      success: true,
      data: { channel }
    });
  } catch (error) {
    console.error('Error fetching channel:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch channel'
    });
  }
};

// Update channel
export const updateChannel = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.params;
    const { name, description, topic, purpose, settings } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is admin
    const userMember = channel.members.find(
      m => m.user.toString() === req.user._id
    );

    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this channel'
      });
    }

    // Check if new name already exists
    if (name && name !== channel.name) {
      const existingChannel = await Channel.findOne({ name });
      if (existingChannel) {
        return res.status(400).json({
          success: false,
          message: 'Channel name already exists'
        });
      }
    }

    const updatedChannel = await Channel.findByIdAndUpdate(
      channelId,
      {
        name: name || channel.name,
        description: description !== undefined ? description : channel.description,
        topic: topic !== undefined ? topic : channel.topic,
        purpose: purpose !== undefined ? purpose : channel.purpose,
        settings: { ...channel.settings, ...settings }
      },
      { new: true }
    ).populate('members.user', 'fullName email profilePhoto');

    return res.json({
      success: true,
      data: { channel: updatedChannel }
    });
  } catch (error) {
    console.error('Error updating channel:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update channel'
    });
  }
};

// Add member to channel
export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.params;
    const { userId } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user has permission to add members
    const userMember = channel.members.find(
      m => m.user.toString() === req.user._id
    );

    if (!userMember || !userMember.permissions?.canInvite) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add members to this channel'
      });
    }

    // Check if user is already a member
    const isAlreadyMember = channel.members.some(
      m => m.user.toString() === userId
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this channel'
      });
    }

    // Add member
    channel.members.push({
      user: userId,
      role: 'member',
      joinedAt: new Date(),
      permissions: {
        canPost: true,
        canReact: true,
        canPin: false,
        canInvite: false
      }
    });

    await channel.save();
    await channel.populate('members.user', 'fullName email profilePhoto');

    return res.json({
      success: true,
      data: { channel }
    });
  } catch (error) {
    console.error('Error adding member:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add member'
    });
  }
};

// Remove member from channel
export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId, userId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user has permission to remove members
    const userMember = channel.members.find(
      m => m.user.toString() === req.user._id
    );

    if (!userMember || (userMember.role !== 'admin' && userId !== req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove members from this channel'
      });
    }

    // Remove member
    channel.members = channel.members.filter(
      m => m.user.toString() !== userId
    );

    await channel.save();

    return res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove member'
    });
  }
};

// Update member role
export const updateMemberRole = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId, userId } = req.params;
    const { role, permissions } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is admin
    const userMember = channel.members.find(
      m => m.user.toString() === req.user._id
    );

    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update member roles'
      });
    }

    // Find target member
    const targetMember = channel.members.find(
      m => m.user.toString() === userId
    );

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Update role and permissions
    targetMember.role = role;
    if (permissions) {
      targetMember.permissions = { ...targetMember.permissions, ...permissions };
    }

    await channel.save();

    return res.json({
      success: true,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update member role'
    });
  }
};

// Archive channel
export const archiveChannel = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is admin
    const userMember = channel.members.find(
      m => m.user.toString() === req.user._id
    );

    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to archive this channel'
      });
    }

    channel.isArchived = true;
    channel.archivedAt = new Date();
    channel.archivedBy = req.user._id as any;

    await channel.save();

    return res.json({
      success: true,
      message: 'Channel archived successfully'
    });
  } catch (error) {
    console.error('Error archiving channel:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to archive channel'
    });
  }
};

// Get channel messages
export const getChannelMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Check if user is member
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    const isMember = channel.members.some(
      m => m.user.toString() === req.user._id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this channel'
      });
    }

    const messages = await Message.find({ channel: channelId })
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
    console.error('Error fetching channel messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch channel messages'
    });
  }
};
