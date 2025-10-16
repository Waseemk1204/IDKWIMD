import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { authenticateSocket } from '../middlewares/socketAuth';

export interface SocketUser {
  userId: string;
  username: string;
  email: string;
  role: string;
  profilePhoto?: string;
}

export interface AuthenticatedSocket extends Socket {
  user: SocketUser;
}

export const configureSocket = (server: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(authenticateSocket);

  // Connection handling
  io.on('connection', (socket: Socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;
    console.log(`User ${authenticatedSocket.user.username} connected with socket ${authenticatedSocket.id}`);

    // Join user to their personal room
    authenticatedSocket.join(`user:${authenticatedSocket.user.userId}`);

    // Handle joining conversation rooms
    authenticatedSocket.on('join_conversation', (conversationId: string) => {
      authenticatedSocket.join(`conversation:${conversationId}`);
      console.log(`User ${authenticatedSocket.user.username} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    authenticatedSocket.on('leave_conversation', (conversationId: string) => {
      authenticatedSocket.leave(`conversation:${conversationId}`);
      console.log(`User ${authenticatedSocket.user.username} left conversation ${conversationId}`);
    });

    // Handle joining channel rooms
    authenticatedSocket.on('join_channel', (channelId: string) => {
      authenticatedSocket.join(`channel:${channelId}`);
      console.log(`User ${authenticatedSocket.user.username} joined channel ${channelId}`);
    });

    // Handle leaving channel rooms
    authenticatedSocket.on('leave_channel', (channelId: string) => {
      authenticatedSocket.leave(`channel:${channelId}`);
      console.log(`User ${authenticatedSocket.user.username} left channel ${channelId}`);
    });

    // Handle typing indicators
    authenticatedSocket.on('typing_start', (data: { conversationId: string; channelId?: string }) => {
      const room = data.channelId ? `channel:${data.channelId}` : `conversation:${data.conversationId}`;
      authenticatedSocket.to(room).emit('user_typing', {
        userId: authenticatedSocket.user.userId,
        username: authenticatedSocket.user.username,
        conversationId: data.conversationId,
        channelId: data.channelId
      });
    });

    authenticatedSocket.on('typing_stop', (data: { conversationId: string; channelId?: string }) => {
      const room = data.channelId ? `channel:${data.channelId}` : `conversation:${data.conversationId}`;
      authenticatedSocket.to(room).emit('user_stopped_typing', {
        userId: authenticatedSocket.user.userId,
        conversationId: data.conversationId,
        channelId: data.channelId
      });
    });

    // Handle call signaling
    authenticatedSocket.on('call_initiate', (data: {
      targetUserId: string;
      conversationId: string;
      callType: 'audio' | 'video';
    }) => {
      authenticatedSocket.to(`user:${data.targetUserId}`).emit('incoming_call', {
        callerId: authenticatedSocket.user.userId,
        callerName: authenticatedSocket.user.username,
        conversationId: data.conversationId,
        callType: data.callType,
        callId: `call_${Date.now()}_${authenticatedSocket.user.userId}`
      });
    });

    authenticatedSocket.on('call_answer', (data: { callId: string; conversationId: string }) => {
      authenticatedSocket.to(`conversation:${data.conversationId}`).emit('call_answered', {
        callId: data.callId,
        userId: authenticatedSocket.user.userId
      });
    });

    authenticatedSocket.on('call_reject', (data: { callId: string; conversationId: string }) => {
      authenticatedSocket.to(`conversation:${data.conversationId}`).emit('call_rejected', {
        callId: data.callId,
        userId: authenticatedSocket.user.userId
      });
    });

    authenticatedSocket.on('call_end', (data: { callId: string; conversationId: string }) => {
      authenticatedSocket.to(`conversation:${data.conversationId}`).emit('call_ended', {
        callId: data.callId,
        userId: authenticatedSocket.user.userId
      });
    });

    // Handle presence updates
    authenticatedSocket.on('update_presence', (status: 'online' | 'away' | 'busy' | 'offline') => {
      authenticatedSocket.broadcast.emit('presence_update', {
        userId: authenticatedSocket.user.userId,
        status,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    authenticatedSocket.on('disconnect', () => {
      console.log(`User ${authenticatedSocket.user.username} disconnected`);
      authenticatedSocket.broadcast.emit('presence_update', {
        userId: authenticatedSocket.user.userId,
        status: 'offline',
        timestamp: new Date()
      });
    });
  });

  return io;
};
