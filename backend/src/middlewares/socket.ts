import { Request, Response, NextFunction } from 'express';
import { Server as SocketIOServer } from 'socket.io';

// Extend Request interface to include io
declare global {
  namespace Express {
    interface Request {
      io?: SocketIOServer;
    }
  }
}

export const injectSocketIO = (io: SocketIOServer) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    req.io = io;
    next();
  };
};
