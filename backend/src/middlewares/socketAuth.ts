import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { SocketUser, AuthenticatedSocket } from '../config/socket';

export const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!decoded.userId) {
      return next(new Error('Authentication error: Invalid token'));
    }

    // Attach user info to socket
    (socket as AuthenticatedSocket).user = {
      userId: decoded.userId,
      username: decoded.username || decoded.fullName || 'Unknown',
      email: decoded.email,
      role: decoded.role || 'employee',
      profilePhoto: decoded.profilePhoto
    };

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};
