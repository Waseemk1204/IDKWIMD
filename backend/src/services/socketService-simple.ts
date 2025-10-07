import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthenticatedSocket extends Socket {
  user?: any;
}

export const initializeSocketService = (io: Server): void => {
  // Authentication middleware for socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.user?.fullName} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.user?._id}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.user?.fullName} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.user?.fullName} left conversation ${conversationId}`);
    });

    // Handle typing indicators
    socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId: socket.user?._id,
        fullName: socket.user?.fullName,
        isTyping: data.isTyping
      });
    });

    // Handle new messages
    socket.on('new_message', (data: { conversationId: string; message: any }) => {
      socket.to(`conversation_${data.conversationId}`).emit('message_received', {
        ...data.message,
        sender: {
          _id: socket.user?._id,
          fullName: socket.user?.fullName,
          profilePhoto: socket.user?.profilePhoto
        }
      });
    });

    // Handle message reactions
    socket.on('message_reaction', (data: { conversationId: string; messageId: string; reaction: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit('reaction_added', {
        messageId: data.messageId,
        reaction: data.reaction,
        userId: socket.user?._id,
        fullName: socket.user?.fullName
      });
    });

    // Handle user status updates
    socket.on('update_status', (status: 'online' | 'away' | 'busy') => {
      socket.broadcast.emit('user_status_changed', {
        userId: socket.user?._id,
        fullName: socket.user?.fullName,
        status
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user?.fullName} disconnected`);
      socket.broadcast.emit('user_status_changed', {
        userId: socket.user?._id,
        fullName: socket.user?.fullName,
        status: 'offline'
      });
    });
  });
};
