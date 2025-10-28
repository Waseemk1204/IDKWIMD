import { Request, Response } from 'express';
import CallHistory from '../models/CallHistory';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import Channel from '../models/Channel';
import { AuthRequest } from '../middlewares/auth';

// Get call history for a user
export const getCallHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, callType, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {
      'participants.user': req.user._id
    };

    if (callType) {
      query.callType = callType;
    }

    if (status) {
      query.status = status;
    }

    const callHistory = await CallHistory.find(query)
      .populate('participants.user', 'fullName email profilePhoto')
      .populate('initiatedBy', 'fullName email profilePhoto')
      .populate('conversation')
      .populate('channel')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      success: true,
      data: { callHistory }
    });
  } catch (error) {
    console.error('Error fetching call history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch call history'
    });
  }
};

// Get call details
export const getCallDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { callId } = req.params;

    const call = await CallHistory.findOne({ callId })
      .populate('participants.user', 'fullName email profilePhoto')
      .populate('initiatedBy', 'fullName email profilePhoto')
      .populate('conversation')
      .populate('channel');

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user was a participant
    const wasParticipant = call.participants.some(
      p => p.user.toString() === req.user._id
    );

    if (!wasParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this call'
      });
    }

    return res.json({
      success: true,
      data: { call }
    });
  } catch (error) {
    console.error('Error fetching call details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch call details'
    });
  }
};

// Create Jitsi meeting room
export const createMeetingRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, channelId, callType = 'video', participants } = req.body;

    // Note: conversationId and channelId are now optional to support instant meetings

    // Generate unique room name
    const roomName = `comms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create Jitsi room URL
    const jitsiRoomUrl = `https://meet.jit.si/${roomName}`;

    // Create call history record
    const callHistoryData: any = {
      callId: roomName,
      participants: [
        {
          user: req.user._id,
          joinedAt: new Date(),
          status: 'joined'
        }
      ],
      callType,
      status: 'initiated',
      initiatedBy: req.user._id,
      jitsiRoomUrl
    };

    // Only add conversation/channel if provided
    if (conversationId) {
      callHistoryData.conversation = conversationId;
    }
    if (channelId) {
      callHistoryData.channel = channelId;
    }

    const callHistory = new CallHistory(callHistoryData);

    await callHistory.save();

    // Add other participants if provided
    if (participants && participants.length > 0) {
      callHistory.participants.push(...participants.map((p: string) => ({
        user: p,
        joinedAt: new Date(),
        status: 'joined'
      })));
      await callHistory.save();
    }

    return res.json({
      success: true,
      data: {
        callId: roomName,
        jitsiRoomUrl,
        callHistory
      }
    });
  } catch (error) {
    console.error('Error creating meeting room:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create meeting room'
    });
  }
};

// Start a call
export const startCall = async (req: AuthRequest, res: Response) => {
  try {
    const { callId } = req.params;

    const call = await CallHistory.findOne({ callId });
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is a participant
    const isParticipant = call.participants.some(
      p => p.user.toString() === req.user._id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start this call'
      });
    }

    // Update call status
    call.status = 'active';
    call.startedAt = new Date();

    await call.save();

    // Create system message
    const messageContent = `${req.user?.fullName || 'User'} started a ${call.callType} call`;
    
    const message = new Message({
      conversation: call.conversation,
      channel: call.channel,
      sender: req.user._id,
      content: messageContent,
      messageType: 'call_start',
      context: {
        callId: call.callId,
        callType: call.callType
      }
    });

    await message.save();

    return res.json({
      success: true,
      data: { call }
    });
  } catch (error) {
    console.error('Error starting call:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start call'
    });
  }
};

// End a call
export const endCall = async (req: AuthRequest, res: Response) => {
  try {
    const { callId } = req.params;

    const call = await CallHistory.findOne({ callId });
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is a participant
    const isParticipant = call.participants.some(
      p => p.user.toString() === req.user._id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this call'
      });
    }

    // Update call status
    call.status = 'ended';
    call.endedAt = new Date();

    // Update participant status
    const participant = call.participants.find(
      p => p.user.toString() === req.user._id
    );
    if (participant) {
      participant.status = 'left';
      participant.leftAt = new Date();
    }

    await call.save();

    // Create system message
    const messageContent = `${req.user?.fullName || 'User'} ended the ${call.callType} call`;
    
    const message = new Message({
      conversation: call.conversation,
      channel: call.channel,
      sender: req.user._id,
      content: messageContent,
      messageType: 'call_end',
      context: {
        callId: call.callId,
        callType: call.callType,
        callDuration: call.duration
      }
    });

    await message.save();

    return res.json({
      success: true,
      data: { call }
    });
  } catch (error) {
    console.error('Error ending call:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to end call'
    });
  }
};

// Join a call
export const joinCall = async (req: AuthRequest, res: Response) => {
  try {
    const { callId } = req.params;

    const call = await CallHistory.findOne({ callId });
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is already a participant
    const existingParticipant = call.participants.find(
      p => p.user.toString() === req.user._id
    );

    if (existingParticipant) {
      existingParticipant.status = 'joined';
      existingParticipant.joinedAt = new Date();
    } else {
      // Add new participant
      call.participants.push({
        user: req.user._id as any,
        joinedAt: new Date(),
        status: 'joined'
      });
    }

    await call.save();

    return res.json({
      success: true,
      data: { call }
    });
  } catch (error) {
    console.error('Error joining call:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to join call'
    });
  }
};

// Leave a call
export const leaveCall = async (req: AuthRequest, res: Response) => {
  try {
    const { callId } = req.params;

    const call = await CallHistory.findOne({ callId });
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Update participant status
    const participant = call.participants.find(
      p => p.user.toString() === req.user._id
    );

    if (participant) {
      participant.status = 'left';
      participant.leftAt = new Date();
    }

    await call.save();

    return res.json({
      success: true,
      data: { call }
    });
  } catch (error) {
    console.error('Error leaving call:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to leave call'
    });
  }
};

// Get active calls
export const getActiveCalls = async (req: AuthRequest, res: Response) => {
  try {
    const activeCalls = await CallHistory.find({
      'participants.user': req.user._id,
      status: { $in: ['ringing', 'active'] }
    })
      .populate('participants.user', 'fullName email profilePhoto')
      .populate('initiatedBy', 'fullName email profilePhoto')
      .populate('conversation')
      .populate('channel');

    return res.json({
      success: true,
      data: { activeCalls }
    });
  } catch (error) {
    console.error('Error fetching active calls:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch active calls'
    });
  }
};
