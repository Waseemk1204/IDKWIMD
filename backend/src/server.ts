import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import connectDB from './config/database';
import { config } from './config';
import { corsOptions, helmetConfig, mongoSanitizeConfig, xssProtection, requestLogger, errorHandler } from './middlewares/security';
import { generalLimiter } from './middlewares/rateLimiter';
import { injectSocketIO } from './middlewares/socket';
import { swaggerSpec } from './config/swagger';
import swaggerUi from 'swagger-ui-express';

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

// Import socket handlers
import { setupSocketHandlers } from './services/socketService';

class Server {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: corsOptions
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSocket();
  }

  private initializeMiddlewares(): void {
    // Security middlewares
    this.app.use(helmetConfig);
    this.app.use(cors(corsOptions));
    this.app.use(mongoSanitizeConfig);
    this.app.use(xssProtection);

    // Rate limiting
    this.app.use(generalLimiter);

    // Body parsing middlewares
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Compression
    this.app.use(compression());

    // Logging
    if (config.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }
    this.app.use(requestLogger);

    // Inject Socket.IO instance into requests
    this.app.use(injectSocketIO(this.io));

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
        environment: config.NODE_ENV
      });
    });

    // API Documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Part-Time Pay$ API Documentation'
    }));

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

  private initializeSocket(): void {
    setupSocketHandlers(this.io);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDB();

      // Start server
      this.server.listen(config.PORT, config.HOST, () => {
        console.log(`🚀 Server running on ${config.HOST}:${config.PORT}`);
        console.log(`📱 Environment: ${config.NODE_ENV}`);
        console.log(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private shutdown(): void {
    console.log('🛑 Shutting down server...');
    
    this.server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('❌ Forced shutdown');
      process.exit(1);
    }, 10000);
  }
}

// Start server
const server = new Server();
server.start();

export default server;
