import { Server as SocketIOServer, Socket } from 'socket.io';
import { AuthenticatedSocket } from '../config/socket';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import Channel from '../models/Channel';
import CallHistory from '../models/CallHistory';
import User from '../models/User';

export const setupSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`User ${authSocket.user.username} connected with socket ${authSocket.id}`);

    // Join user to their personal room
    authSocket.join(`user:${authSocket.user.userId}`);

    // Handle joining conversation rooms
    authSocket.on('join_conversation', async (conversationId: string) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          authSocket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Check if user is a participant
        const isParticipant = conversation.participants.some(
          p => p.toString() === authSocket.user.userId
        );

        if (!isParticipant) {
          authSocket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        authSocket.join(`conversation:${conversationId}`);
        console.log(`User ${authSocket.user.username} joined conversation ${conversationId}`);

        // Mark messages as read
        await Message.updateMany(
          { 
            conversation: conversationId,
            sender: { $ne: authSocket.user.userId },
            readBy: { $ne: authSocket.user.userId }
          },
          { 
            $push: { readBy: authSocket.user.userId },
            $set: { isRead: true }
          }
        );

        authSocket.emit('conversation_joined', { conversationId });
      } catch (error) {
        console.error('Error joining conversation:', error);
        authSocket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving conversation rooms
    authSocket.on('leave_conversation', (conversationId: string) => {
      authSocket.leave(`conversation:${conversationId}`);
      console.log(`User ${authSocket.user.username} left conversation ${conversationId}`);
    });

    // Handle joining channel rooms
    authSocket.on('join_channel', async (channelId: string) => {
      try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
          authSocket.emit('error', { message: 'Channel not found' });
          return;
        }

        // Check if user is a member
        const isMember = channel.members.some(
          m => m.user.toString() === authSocket.user.userId
        );

        if (!isMember) {
          authSocket.emit('error', { message: 'Not authorized to join this channel' });
          return;
        }

        authSocket.join(`channel:${channelId}`);
        console.log(`User ${authSocket.user.username} joined channel ${channelId}`);

        // Mark messages as read
        await Message.updateMany(
          { 
            channel: channelId,
            sender: { $ne: authSocket.user.userId },
            readBy: { $ne: authSocket.user.userId }
          },
          { 
            $push: { readBy: authSocket.user.userId },
            $set: { isRead: true }
          }
        );

        authSocket.emit('channel_joined', { channelId });
      } catch (error) {
        console.error('Error joining channel:', error);
        authSocket.emit('error', { message: 'Failed to join channel' });
      }
    });

    // Handle leaving channel rooms
    authSocket.on('leave_channel', (channelId: string) => {
      authSocket.leave(`channel:${channelId}`);
      console.log(`User ${authSocket.user.username} left channel ${channelId}`);
    });

    // Handle sending messages
    authSocket.on('send_message', async (data: {
      conversationId?: string;
      channelId?: string;
      content: string;
      messageType?: string;
      replyTo?: string;
      attachments?: any[];
    }) => {
      try {
        const { conversationId, channelId, content, messageType = 'text', replyTo, attachments } = data;

        if (!conversationId && !channelId) {
          authSocket.emit('error', { message: 'Either conversationId or channelId is required' });
          return;
        }

        // Create message
        const message = new Message({
          conversation: conversationId,
          channel: channelId,
          sender: authSocket.user.userId,
          content,
          messageType,
          replyTo,
          attachments,
          readBy: [authSocket.user.userId]
        });

        await message.save();

        // Populate sender info
        await message.populate('sender', 'fullName email profilePhoto');

        // Update conversation/channel last message
        if (conversationId) {
          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            lastMessageAt: message.createdAt,
            $inc: { 'metadata.messageCount': 1 }
          });
        } else if (channelId) {
          await Channel.findByIdAndUpdate(channelId, {
            lastMessage: message._id,
            lastMessageAt: message.createdAt,
            $inc: { messageCount: 1 }
          });
        }

        // Emit to room
        const room = conversationId ? `conversation:${conversationId}` : `channel:${channelId}`;
        io.to(room).emit('new_message', message);

        authSocket.emit('message_sent', { messageId: message._id });
      } catch (error) {
        console.error('Error sending message:', error);
        authSocket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    authSocket.on('typing_start', (data: { conversationId: string; channelId?: string }) => {
      const room = data.channelId ? `channel:${data.channelId}` : `conversation:${data.conversationId}`;
      authSocket.to(room).emit('user_typing', {
        userId: authSocket.user.userId,
        username: authSocket.user.username,
        conversationId: data.conversationId,
        channelId: data.channelId
      });
    });

    authSocket.on('typing_stop', (data: { conversationId: string; channelId?: string }) => {
      const room = data.channelId ? `channel:${data.channelId}` : `conversation:${data.conversationId}`;
      authSocket.to(room).emit('user_stopped_typing', {
        userId: authSocket.user.userId,
        conversationId: data.conversationId,
        channelId: data.channelId
      });
    });

    // Handle message reactions
    authSocket.on('add_reaction', async (data: {
      messageId: string;
      reactionType: string;
    }) => {
      try {
        const { messageId, reactionType } = data;
        const message = await Message.findById(messageId);
        
        if (!message) {
          authSocket.emit('error', { message: 'Message not found' });
          return;
        }

        // Find existing reaction or create new one
        const reaction = message.reactions?.find(r => r.reactionType === reactionType);
        
        if (reaction) {
          // Toggle reaction
          const userIndex = reaction.users.findIndex(u => u.toString() === authSocket.user.userId);
          if (userIndex > -1) {
            reaction.users.splice(userIndex, 1);
            reaction.count = Math.max(0, reaction.count - 1);
          } else {
            reaction.users.push(authSocket.user.userId as any);
            reaction.count += 1;
          }
        } else {
          // Create new reaction
          if (!message.reactions) message.reactions = [];
          message.reactions.push({
            reactionType,
            count: 1,
            users: [authSocket.user.userId as any]
          });
        }

        await message.save();

        // Emit to room
        const room = message.conversation ? 
          `conversation:${message.conversation}` : 
          `channel:${message.channel}`;
        
        io.to(room).emit('reaction_added', {
          messageId,
          reactionType,
          reactions: message.reactions
        });
      } catch (error) {
        console.error('Error adding reaction:', error);
        authSocket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Handle call signaling
    authSocket.on('call_initiate', async (data: {
      targetUserId: string;
      conversationId?: string;
      channelId?: string;
      callType: 'audio' | 'video';
    }) => {
      try {
        const { targetUserId, conversationId, channelId, callType } = data;
        const callId = `call_${Date.now()}_${authSocket.user.userId}`;

        // Create call history
        const callHistory = new CallHistory({
          callId,
          participants: [{
            user: authSocket.user.userId,
            joinedAt: new Date(),
            status: 'joined'
          }],
          conversation: conversationId,
          channel: channelId,
          callType,
          status: 'ringing',
          initiatedBy: authSocket.user.userId
        });

        await callHistory.save();

        // Emit to target user
        authSocket.to(`user:${targetUserId}`).emit('incoming_call', {
          callId,
          callerId: authSocket.user.userId,
          callerName: authSocket.user.username,
          conversationId,
          channelId,
          callType
        });

        authSocket.emit('call_initiated', { callId });
      } catch (error) {
        console.error('Error initiating call:', error);
        authSocket.emit('error', { message: 'Failed to initiate call' });
      }
    });

    authSocket.on('call_answer', async (data: { callId: string; conversationId?: string; channelId?: string }) => {
      try {
        const { callId, conversationId, channelId } = data;
        
        // Update call history
        await CallHistory.findOneAndUpdate(
          { callId },
          {
            $push: {
              participants: {
                user: authSocket.user.userId,
                joinedAt: new Date(),
                status: 'joined'
              }
            },
            $set: { status: 'active', startedAt: new Date() }
          }
        );

        const room = conversationId ? 
          `conversation:${conversationId}` : 
          `channel:${channelId}`;
        
        io.to(room).emit('call_answered', {
          callId,
          userId: authSocket.user.userId
        });
      } catch (error) {
        console.error('Error answering call:', error);
        authSocket.emit('error', { message: 'Failed to answer call' });
      }
    });

    authSocket.on('call_reject', async (data: { callId: string; conversationId?: string; channelId?: string }) => {
      try {
        const { callId, conversationId, channelId } = data;
        
        // Update call history
        await CallHistory.findOneAndUpdate(
          { callId },
          {
            $push: {
              participants: {
                user: authSocket.user.userId,
                joinedAt: new Date(),
                status: 'declined'
              }
            },
            $set: { status: 'declined' }
          }
        );

        const room = conversationId ? 
          `conversation:${conversationId}` : 
          `channel:${channelId}`;
        
        io.to(room).emit('call_rejected', {
          callId,
          userId: authSocket.user.userId
        });
      } catch (error) {
        console.error('Error rejecting call:', error);
        authSocket.emit('error', { message: 'Failed to reject call' });
      }
    });

    authSocket.on('call_end', async (data: { callId: string; conversationId?: string; channelId?: string }) => {
      try {
        const { callId, conversationId, channelId } = data;
        
        // Update call history
        await CallHistory.findOneAndUpdate(
          { callId },
          {
            $set: { 
              status: 'ended',
              endedAt: new Date()
            },
            $push: {
              'participants.$[elem].leftAt': new Date()
            }
          },
          {
            arrayFilters: [{ 'elem.user': authSocket.user.userId }]
          }
        );

        const room = conversationId ? 
          `conversation:${conversationId}` : 
          `channel:${channelId}`;
        
        io.to(room).emit('call_ended', {
          callId,
          userId: authSocket.user.userId
        });
      } catch (error) {
        console.error('Error ending call:', error);
        authSocket.emit('error', { message: 'Failed to end call' });
      }
    });

    // Handle presence updates
    authSocket.on('update_presence', (status: 'online' | 'away' | 'busy' | 'offline') => {
      authSocket.broadcast.emit('presence_update', {
        userId: authSocket.user.userId,
        status,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    authSocket.on('disconnect', () => {
      console.log(`User ${authSocket.user.username} disconnected`);
      authSocket.broadcast.emit('presence_update', {
        userId: authSocket.user.userId,
        status: 'offline',
        timestamp: new Date()
      });
    });
  });
};