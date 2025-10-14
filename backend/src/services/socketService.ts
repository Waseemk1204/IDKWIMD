import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import User from '../models/User';
import { getNotificationService } from './notificationService';
import { EnhancedNotificationService } from './EnhancedNotificationService';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export const setupSocketHandlers = (io: SocketIOServer): void => {
  // Initialize notification services
  getNotificationService(io);
  EnhancedNotificationService.getInstance(io);
  // Authentication middleware for socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle new messages
    socket.on('send_message', (data: {
      conversationId: string;
      content: string;
      messageType?: string;
      replyTo?: string;
      threadId?: string;
      context?: any;
    }) => {
      // Broadcast message to conversation room
      socket.to(`conversation_${data.conversationId}`).emit('new_message', {
        ...data,
        sender: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle message reactions
    socket.on('add_reaction', (data: {
      messageId: string;
      reactionType: string;
    }) => {
      // Broadcast reaction to conversation room
      socket.broadcast.emit('message_reaction', {
        messageId: data.messageId,
        reactionType: data.reactionType,
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle message editing
    socket.on('edit_message', (data: {
      messageId: string;
      content: string;
    }) => {
      // Broadcast edited message to conversation room
      socket.to(`conversation_${data.conversationId}`).emit('message_edited', {
        messageId: data.messageId,
        content: data.content,
        editedAt: new Date()
      });
    });

    // Handle message deletion
    socket.on('delete_message', (data: {
      messageId: string;
      conversationId: string;
    }) => {
      // Broadcast deleted message to conversation room
      socket.to(`conversation_${data.conversationId}`).emit('message_deleted', {
        messageId: data.messageId,
        deletedAt: new Date()
      });
    });

    // Handle typing indicators
    socket.on('typing_start', (conversationId: string) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        conversationId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (conversationId: string) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        conversationId,
        isTyping: false
      });
    });

    // Handle online status
    socket.on('set_online', () => {
      socket.broadcast.emit('user_online', { userId: socket.userId });
    });

    socket.on('set_offline', () => {
      socket.broadcast.emit('user_offline', { userId: socket.userId });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      socket.broadcast.emit('user_offline', { userId: socket.userId });
    });
  });
};

// Helper function to send notification to specific user
export const sendNotificationToUser = (io: SocketIOServer, userId: string, notification: any): void => {
  io.to(`user_${userId}`).emit('new_notification', notification);
};

// Helper function to send message to conversation
export const sendMessageToConversation = (io: SocketIOServer, conversationId: string, message: any): void => {
  io.to(`conversation_${conversationId}`).emit('new_message', message);
};

// Cross-module real-time updates
export const sendCrossModuleUpdate = (io: SocketIOServer, userId: string, update: {
  type: 'community_post' | 'gang_connection' | 'job_application' | 'message_sent' | 'notification';
  module: string;
  data: any;
  timestamp: Date;
}): void => {
  io.to(`user_${userId}`).emit('cross_module_update', update);
};

// Send unified notification
export const sendUnifiedNotification = (io: SocketIOServer, userId: string, notification: {
  id: string;
  type: string;
  title: string;
  message: string;
  module: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  timestamp: Date;
}): void => {
  io.to(`user_${userId}`).emit('unified_notification', notification);
};

// Send ecosystem integration update
export const sendEcosystemUpdate = (io: SocketIOServer, userId: string, update: {
  type: 'integration_status' | 'context_update' | 'activity_summary';
  data: any;
  timestamp: Date;
}): void => {
  io.to(`user_${userId}`).emit('ecosystem_update', update);
};
