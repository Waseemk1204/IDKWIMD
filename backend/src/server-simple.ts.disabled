import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';
import blogRoutes from './routes/blogs';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import communityRoutes from './routes/community';
import connectionRoutes from './routes/connections';
import searchRoutes from './routes/search';
import walletRoutes from './routes/wallet';
import adminRoutes from './routes/admin';
import verificationRoutes from './routes/verification';

// Import middleware
import { errorHandler } from './middlewares/errorHandler';
import { authenticate } from './middlewares/auth';

// Import services
import { initializeSocketService } from './services/socketService';

class Server {
  private app: express.Application;
  private server: any;
  private io: Server;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001');
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSocketService();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/parttimepay';
      await mongoose.connect(mongoUri);
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Cookie parser
    this.app.use(cookieParser());
    
    // Compression
    this.app.use(compression());
    
    // Logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    }

    // Static files
    this.app.use('/uploads', express.static('uploads'));
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });
    });

    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/jobs', jobRoutes);
    this.app.use('/api/v1/applications', applicationRoutes);
    this.app.use('/api/v1/blogs', blogRoutes);
    this.app.use('/api/v1/messages', messageRoutes);
    this.app.use('/api/v1/notifications', notificationRoutes);
    this.app.use('/api/v1/community', communityRoutes);
    this.app.use('/api/v1/connections', connectionRoutes);
    this.app.use('/api/v1/search', searchRoutes);
    this.app.use('/api/v1/wallet', walletRoutes);
    this.app.use('/api/v1/admin', adminRoutes);
    this.app.use('/api/v1/verification', verificationRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private initializeSocketService(): void {
    initializeSocketService(this.io);
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`🚀 Server running on port ${this.port}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  }
}

// Start server
const server = new Server();
server.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default server;
