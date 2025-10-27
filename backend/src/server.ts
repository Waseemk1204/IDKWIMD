import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import connectDB from './config/database';
import { config } from './config';
import { corsOptions, helmetConfig, mongoSanitizeConfig, xssProtection, requestLogger, errorHandler } from './middlewares/security';
import { generalLimiter } from './middlewares/rateLimiter';
import { injectSocketIO } from './middlewares/socket';
import { configureSocket } from './config/socket';
import { swaggerSpec } from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import { configureLinkedInStrategy } from './services/linkedinService';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';
import blogRoutes from './routes/blogs';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import enhancedNotificationRoutes from './routes/enhancedNotifications';
import searchRoutes from './routes/search';
import walletRoutes from './routes/wallet';
import adminRoutes from './routes/admin';
import verificationRoutes from './routes/verification';
import channelRoutes from './routes/channels';
import callRoutes from './routes/calls';
import onboardingRoutes from './routes/onboarding';
import linkedinRoutes from './routes/linkedin';
// import integrationRoutes from './routes/integration';
// import unifiedMessagingRoutes from './routes/unifiedMessaging';
// import unifiedNotificationRoutes from './routes/unifiedNotifications';
// import unifiedUserContextRoutes from './routes/unifiedUserContext';

// Import socket handlers
import { setupSocketHandlers } from './services/socketService';
import { getNotificationService } from './services/notificationService';

class Server {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;

  constructor() {
    this.app = express();
    
    // Trust Railway proxy for accurate client IPs
    this.app.set('trust proxy', true);
    
    this.server = createServer(this.app);
    this.io = configureSocket(this.server);

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSocket();
  }

  private initializeMiddlewares(): void {
    // Security middlewares
    this.app.use(helmetConfig);
    // Dynamic CORS with request context
    this.app.use((req, res, next) => {
      cors({
        ...corsOptions,
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          // Pass request object to origin function
          (corsOptions.origin as any)(origin, callback, req);
        }
      })(req, res, next);
    });
    this.app.use(mongoSanitizeConfig);
    this.app.use(xssProtection);

    // Rate limiting
    this.app.use(generalLimiter);

    // Body parsing middlewares
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Session middleware (required for OAuth)
    this.app.use(
      session({
        secret: config.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: config.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
      })
    );

    // Initialize Passport
    this.app.use(passport.initialize());
    this.app.use(passport.session());
    
    // Passport serialization
    passport.serializeUser((user: any, done) => {
      done(null, user);
    });
    passport.deserializeUser((user: any, done) => {
      done(null, user);
    });
    
    // Configure OAuth strategies
    configureLinkedInStrategy();

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
    // LinkedIn OAuth must come BEFORE /api/v1/auth to avoid auth middleware
    this.app.use('/api/v1/auth/linkedin', linkedinRoutes);
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/jobs', jobRoutes);
    this.app.use('/api/v1/applications', applicationRoutes);
    this.app.use('/api/v1/blogs', blogRoutes);
    this.app.use('/api/v1/messages', messageRoutes);
    this.app.use('/api/v1/notifications', notificationRoutes);
    this.app.use('/api/v1/notifications-enhanced', enhancedNotificationRoutes);
    this.app.use('/api/v1/search', searchRoutes);
    this.app.use('/api/v1/wallet', walletRoutes);
    this.app.use('/api/v1/admin', adminRoutes);
    this.app.use('/api/v1/verification', verificationRoutes);
    this.app.use('/api/v1/channels', channelRoutes);
    this.app.use('/api/v1/calls', callRoutes);
    this.app.use('/api/v1/onboarding', onboardingRoutes);
    // this.app.use('/api/v1/integration', integrationRoutes);
    // this.app.use('/api/v1/unified-messaging', unifiedMessagingRoutes);
    // this.app.use('/api/v1/unified-notifications', unifiedNotificationRoutes);
    // this.app.use('/api/v1/unified-context', unifiedUserContextRoutes);

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
    // Initialize notification service with Socket.IO instance
    getNotificationService(this.io);
    
    // Setup socket handlers
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
