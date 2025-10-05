import { Request, Response } from 'express';
import { Connection, IConnection } from '../models/Connection';
import { Follow, IFollow } from '../models/Follow';
import { ConnectionAnalytics, IConnectionAnalytics } from '../models/ConnectionAnalytics';
import { ConnectionRecommendation, IConnectionRecommendation } from '../models/ConnectionRecommendation';
import { IUser } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';
import User from '../models/User';
import { UnifiedIntegrationService } from '../services/unifiedIntegrationService';

// Send a connection request (Employee to Employee only)
export const sendConnectionRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user?._id;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required'
      });
    }

    // Check if requester is trying to connect to themselves
    if (requesterId.toString() === recipientId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a connection request to yourself'
      });
    }

    // Get requester and recipient from database
    const requester = await mongoose.model('User').findById(requesterId);
    const recipient = await mongoose.model('User').findById(recipientId);

    if (!requester || !recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if requester is an employee
    if (requester.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Only employees can send connection requests'
      });
    }

    // Check if recipient is an employee
    if (recipient.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'You can only connect with other employees'
      });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existingConnection) {
      if (existingConnection.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Connection request already exists'
        });
      } else if (existingConnection.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'You are already connected'
        });
      }
    }

    // Create new connection request
    const connection = new Connection({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    await connection.save();

    // Populate the connection with user details
    await connection.populate([
      { path: 'requester', select: 'name email profileImage role' },
      { path: 'recipient', select: 'name email profileImage role' }
    ]);

    return res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      data: { connection }
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send connection request'
    });
  }
};

// Accept a connection request
export const acceptConnectionRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    // Check if user is the recipient
    if (connection.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only accept connection requests sent to you'
      });
    }

    // Check if request is still pending
    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Connection request is no longer pending'
      });
    }

    // Update connection status to accepted
    connection.status = 'accepted';
    await connection.save();

    // Track cross-module activity
    try {
      await UnifiedIntegrationService.trackActivity(
        connection.requester.toString(),
        'gang',
        'connection_accepted',
        connection._id.toString(),
        'connection',
        {
          recipientId: connection.recipient.toString(),
          connectionStrength: 50
        }
      );
    } catch (trackingError) {
      console.error('Error tracking connection activity:', trackingError);
      // Don't fail the connection if tracking fails
    }

    // Create analytics tracking for the new connection
    try {
      const analytics = new ConnectionAnalytics({
        connectionId: connection._id,
        user1: connection.requester,
        user2: connection.recipient,
        strength: 50, // Initial strength
        lastInteraction: new Date()
      });
      await analytics.save();
    } catch (analyticsError) {
      console.error('Error creating connection analytics:', analyticsError);
      // Don't fail the connection if analytics creation fails
    }

    // Mark any existing recommendations as connected
    try {
      await ConnectionRecommendation.updateMany(
        {
          $or: [
            { userId: connection.requester, recommendedUserId: connection.recipient },
            { userId: connection.recipient, recommendedUserId: connection.requester }
          ],
          status: 'active'
        },
        {
          status: 'connected',
          connectedAt: new Date()
        }
      );
    } catch (recommendationError) {
      console.error('Error updating recommendations:', recommendationError);
      // Don't fail the connection if recommendation update fails
    }

    // Populate the connection with user details
    await connection.populate([
      { path: 'requester', select: 'name email profileImage role' },
      { path: 'recipient', select: 'name email profileImage role' }
    ]);

    return res.json({
      success: true,
      message: 'Connection request accepted',
      data: { connection }
    });
  } catch (error) {
    console.error('Error accepting connection request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to accept connection request'
    });
  }
};

// Reject a connection request
export const rejectConnectionRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    // Check if user is the recipient
    if (connection.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject connection requests sent to you'
      });
    }

    // Check if request is still pending
    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Connection request is no longer pending'
      });
    }

    // Update connection status to rejected
    connection.status = 'rejected';
    await connection.save();

    return res.json({
      success: true,
      message: 'Connection request rejected'
    });
  } catch (error) {
    console.error('Error rejecting connection request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject connection request'
    });
  }
};

// Cancel a connection request (by the requester)
export const cancelConnectionRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    // Check if user is the requester
    if (connection.requester.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own connection requests'
      });
    }

    // Check if request is still pending
    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Connection request is no longer pending'
      });
    }

    // Update connection status to cancelled
    connection.status = 'cancelled';
    await connection.save();

    return res.json({
      success: true,
      message: 'Connection request cancelled'
    });
  } catch (error) {
    console.error('Error cancelling connection request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel connection request'
    });
  }
};

// Remove a connection (unfriend)
export const removeConnection = async (req: AuthRequest, res: Response) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    // Check if user is part of this connection
    if (connection.requester.toString() !== userId.toString() && 
        connection.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove your own connections'
      });
    }

    // Check if connection is accepted
    if (connection.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Connection is not active'
      });
    }

    // Delete the connection
    await Connection.findByIdAndDelete(connectionId);

    return res.json({
      success: true,
      message: 'Connection removed successfully'
    });
  } catch (error) {
    console.error('Error removing connection:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove connection'
    });
  }
};

// Get user's connections (Gang Members)
export const getUserConnections = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { status = 'accepted' } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const connections = await Connection.find({
      $or: [
        { requester: userId, status },
        { recipient: userId, status }
      ]
    })
    .populate('requester', 'name email profileImage role')
    .populate('recipient', 'name email profileImage role')
    .sort({ updatedAt: -1 });

    // Transform connections to show the other user
    const transformedConnections = connections.map(connection => {
      const isRequester = connection.requester._id.toString() === userId.toString();
      return {
        _id: connection._id,
        user: isRequester ? connection.recipient : connection.requester,
        status: connection.status,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt
      };
    });

    return res.json({
      success: true,
      data: { connections: transformedConnections }
    });
  } catch (error) {
    console.error('Error fetching user connections:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch connections'
    });
  }
};

// Get pending connection requests
export const getPendingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { type = 'received' } = req.query; // 'sent' or 'received'

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    let query: any = { status: 'pending' };

    if (type === 'sent') {
      query.requester = userId;
    } else {
      query.recipient = userId;
    }

    const requests = await Connection.find(query)
      .populate('requester', 'name email profileImage role')
      .populate('recipient', 'name email profileImage role')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { requests }
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests'
    });
  }
};

// Follow an employer (Employee to Employer only)
export const followEmployer = async (req: AuthRequest, res: Response) => {
  try {
    const { employerId } = req.body;
    const followerId = req.user?._id;

    if (!followerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!employerId) {
      return res.status(400).json({
        success: false,
        message: 'Employer ID is required'
      });
    }

    // Check if follower is trying to follow themselves
    if (followerId.toString() === employerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Get follower and employer from database
    const follower = await mongoose.model('User').findById(followerId);
    const employer = await mongoose.model('User').findById(employerId);

    if (!follower || !employer) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if follower is an employee
    if (follower.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Only employees can follow employers'
      });
    }

    // Check if target is an employer
    if (employer.role !== 'employer') {
      return res.status(403).json({
        success: false,
        message: 'You can only follow employers'
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: employerId
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this employer'
      });
    }

    // Create new follow
    const follow = new Follow({
      follower: followerId,
      following: employerId
    });

    await follow.save();

    // Populate the follow with user details
    await follow.populate([
      { path: 'follower', select: 'name email profileImage role' },
      { path: 'following', select: 'name email profileImage role' }
    ]);

    return res.status(201).json({
      success: true,
      message: 'Successfully followed employer',
      data: { follow }
    });
  } catch (error) {
    console.error('Error following employer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to follow employer'
    });
  }
};

// Unfollow an employer
export const unfollowEmployer = async (req: AuthRequest, res: Response) => {
  try {
    const { followId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const follow = await Follow.findById(followId);

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'Follow relationship not found'
      });
    }

    // Check if user is the follower
    if (follow.follower.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only unfollow employers you are following'
      });
    }

    // Delete the follow
    await Follow.findByIdAndDelete(followId);

    return res.json({
      success: true,
      message: 'Successfully unfollowed employer'
    });
  } catch (error) {
    console.error('Error unfollowing employer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unfollow employer'
    });
  }
};

// Get user's follows (Employers they follow)
export const getUserFollows = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const follows = await Follow.find({ follower: userId })
      .populate('following', 'name email profileImage role company')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { follows }
    });
  } catch (error) {
    console.error('Error fetching user follows:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch follows'
    });
  }
};

// Get connection status between two users
export const getConnectionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if trying to get status with themselves
    if (currentUserId.toString() === userId.toString()) {
      return res.json({
        success: true,
        data: { status: 'self' }
      });
    }

    // Get current user and target user
    const currentUser = await mongoose.model('User').findById(currentUserId);
    const targetUser = await mongoose.model('User').findById(userId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If current user is employer and target is employee, check follow status
    if (currentUser.role === 'employee' && targetUser.role === 'employer') {
      const follow = await Follow.findOne({
        follower: currentUserId,
        following: userId
      });

      return res.json({
        success: true,
        data: { 
          status: follow ? 'following' : 'not_following',
          type: 'follow'
        }
      });
    }

    // If both are employees, check connection status
    if (currentUser.role === 'employee' && targetUser.role === 'employee') {
      const connection = await Connection.findOne({
        $or: [
          { requester: currentUserId, recipient: userId },
          { requester: userId, recipient: currentUserId }
        ]
      });

      if (!connection) {
        return res.json({
          success: true,
          data: { 
            status: 'not_connected',
            type: 'connection'
          }
        });
      }

      return res.json({
        success: true,
        data: { 
          status: connection.status,
          type: 'connection',
          connectionId: connection._id,
          isRequester: connection.requester.toString() === currentUserId.toString()
        }
      });
    }

    // If current user is employer, they can't connect or follow
    if (currentUser.role === 'employer') {
      return res.json({
        success: true,
        data: { 
          status: 'not_available',
          type: 'none'
        }
      });
    }

    return res.json({
      success: true,
      data: { 
        status: 'not_available',
        type: 'none'
      }
    });
  } catch (error) {
    console.error('Error getting connection status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get connection status'
    });
  }
};

// Get all available employees for discovery (excluding current user and already connected)
export const getAvailableEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user._id;
    const { search, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let searchQuery: any = {
      role: 'employee',
      _id: { $ne: currentUserId }, // Exclude current user
      isActive: true
    };

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    // Get all employees matching the search criteria
    const allEmployees = await User.find(searchQuery)
      .select('name email profileImage role skills bio company')
      .sort({ name: 1 })
      .lean();

    // Get current user's connections and pending requests to exclude them
    const userConnections = await Connection.find({
      $or: [
        { requester: currentUserId },
        { recipient: currentUserId }
      ],
      status: { $in: ['pending', 'accepted'] }
    }).lean();

    // Get list of user IDs that are already connected or have pending requests
    const connectedUserIds = new Set();
    userConnections.forEach(connection => {
      if (connection.requester.toString() === currentUserId.toString()) {
        // If current user sent the request, exclude the recipient
        connectedUserIds.add(connection.recipient.toString());
      } else {
        // If current user received the request, only exclude if it's accepted
        // For pending requests received, we should still show them in discover
        if (connection.status === 'accepted') {
          connectedUserIds.add(connection.requester.toString());
        }
      }
    });

    // Filter out already connected users
    const availableEmployees = allEmployees.filter(employee => 
      !connectedUserIds.has(employee._id.toString())
    );

    // Apply pagination
    const paginatedEmployees = availableEmployees.slice(skip, skip + limitNum);
    const total = availableEmployees.length;

    return res.json({
      success: true,
      data: {
        employees: paginatedEmployees,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalEmployees: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting available employees:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get available employees'
    });
  }
};
