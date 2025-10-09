import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const app = express();

// Check required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please set the following environment variables in Vercel:');
  missingEnvVars.forEach(envVar => {
    console.error(`- ${envVar}`);
  });
}

// Set default JWT_SECRET if not provided (for testing only)
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not set, using default (NOT SECURE FOR PRODUCTION)');
  process.env.JWT_SECRET = 'default-jwt-secret-change-in-production';
}

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://parttimepays.vercel.app',
  'https://parttimepays-git-main-waseemk1204s-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, and OAuth POST flows from Google)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow whitelisted origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow Google OAuth requests
    if (origin && (origin.includes('accounts.google.com') || origin.includes('google.com'))) {
      return callback(null, true);
    }
    
    // For development, allow any localhost origin
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Block all other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connection state
let isConnected = false;

// Connect to MongoDB at startup for better performance
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      return false;
    }
    
    // If already connected, return true
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return true;
    }
    
    console.log('🔄 Attempting to connect to MongoDB...');
    
    // Validate MongoDB URI format
    if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
      console.error('❌ Invalid MongoDB URI format');
      return false;
    }
    
    // Connect with persistent connection
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10, // Increased pool size for better performance
      minPoolSize: 1, // Keep at least 1 connection alive
      maxIdleTimeMS: 30000, // Keep connections alive longer
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB Connected successfully');
    isConnected = true;
    return true;
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

// Ensure connection is available (now just checks if connected)
const ensureConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  
  // If not connected, try to reconnect
  console.log('🔄 MongoDB not connected, attempting to reconnect...');
  return await connectDB();
};

// User Schema - Updated to match existing data structure
const userSchema = new mongoose.Schema({
  name: { type: String, trim: true }, // Keep for compatibility with existing data
  fullName: { type: String, required: false, trim: true }, // Made optional temporarily for OAuth
  username: { type: String, required: false, unique: true, sparse: true, lowercase: true }, // Optional for Google OAuth
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: false }, // Make password optional for Google OAuth users
  googleId: { type: String, unique: true, sparse: true }, // Google OAuth ID
  role: { type: String, enum: ['employee', 'employer', 'admin'], default: 'employee' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  profileImage: { type: String, default: '' }, // Keep for compatibility
  profilePhoto: { type: String, default: '' }, // Keep for compatibility
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  headline: { type: String, default: '' },
  bio: { type: String, default: '' }, // Keep for compatibility
  about: { type: String, default: '' }, // Keep for compatibility
  skills: [{ type: String }],
  companyInfo: {
    companyName: { type: String },
    companySize: { type: String },
    industry: { type: String },
    website: { type: String },
    description: { type: String }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  minHourlyRate: { type: Number, required: true },
  maxHourlyRate: { type: Number, required: true },
  hoursPerWeek: { type: String, required: true },
  duration: { type: String, required: true },
  skills: [{ type: String }],
  requirements: [{ type: String }],
  benefits: [{ type: String }],
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }]
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  featuredImage: { type: String },
  isPublished: { type: Boolean, default: true },
  publishedDate: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: { type: Number, default: 0 },
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

// Community Post Schema - Updated to match existing database structure
const communityPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  likes: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  views: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'deleted'], default: 'active' },
  isActive: { type: Boolean, default: true }, // Keep both for compatibility
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);

// Auth middleware
const authenticate = async (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Auth middleware - Cookies:', JSON.stringify(req.cookies, null, 2));
    console.log('Auth middleware - Cookie header:', req.headers.cookie);
    
    // Check for token in Authorization header (Bearer token)
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If no Bearer token, check for cookie
    if (!token) {
      token = req.cookies?.token;
    }
    
    console.log('Auth middleware - Token found:', !!token);
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working', timestamp: new Date().toISOString() });
});

// Simple debug endpoint to check all users
app.get('/api/debug/users', async (req, res) => {
  try {
    console.log('Debug: Getting all users');
    
    const users = await User.find({}).limit(10); // Limit to 10 users for debugging
    console.log('Debug: Found users:', users.length);
    
    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        googleId: user.googleId,
        role: user.role,
        username: user.username,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug endpoint to check users by email
app.get('/api/debug/users/:email', async (req, res) => {
  try {
    const email = req.params.email;
    console.log('Debug: Looking for users with email:', email);
    
    const users = await User.find({ email: email });
    console.log('Debug: Found users:', users.length);
    
    res.json({
      success: true,
      email: email,
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        googleId: user.googleId,
        role: user.role,
        username: user.username,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const mongodbStatus = mongoose.connection.readyState;
  const mongodbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[mongodbStatus] || 'unknown';

  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: {
      status: mongodbStatusText,
      readyState: mongodbStatus,
      host: mongoose.connection.host || 'not connected',
      port: mongoose.connection.port || 'not connected',
      name: mongoose.connection.name || 'not connected'
    },
    cors: 'enabled',
    envVars: {
      mongodb_uri_set: !!process.env.MONGODB_URI,
      mongodb_uri_format: process.env.MONGODB_URI ? 
        (process.env.MONGODB_URI.startsWith('mongodb://') || process.env.MONGODB_URI.startsWith('mongodb+srv://') ? 'valid' : 'invalid') : 'not set',
      jwt_secret_set: !!process.env.JWT_SECRET,
      frontend_url_set: !!process.env.FRONTEND_URL
    }
  });
});

// Handle Google OAuth POST requests to /login and /signup
const handleGoogleOAuth = async (req, res, isSignupEndpoint = false, signupRole = null) => {
  try {
    
    // Extract credential and state from POST body
    const credential = req.body.credential;
    const error = req.body.error;
    
    // Determine if this is signup based on the endpoint
    const isSignup = isSignupEndpoint;
    
    console.log('Is signup request:', isSignup);
    
    if (error) {
      console.error('Google OAuth error:', error);
      const redirectPath = isSignup ? '/signup' : '/login';
      return res.redirect(`${redirectPath}?google_auth=error&error=${encodeURIComponent(error)}`);
    }
    
    if (credential) {
      console.log('Google OAuth credential received, processing...');
      
      try {
        // Decode the JWT token to get user info
        const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
        console.log('Decoded JWT payload:', JSON.stringify(payload, null, 2));
        
        // Validate required fields
        if (!payload.sub || !payload.email || !payload.name) {
          console.error('Missing required fields in JWT payload:', {
            sub: payload.sub,
            email: payload.email,
            name: payload.name
          });
          throw new Error('Missing required fields in JWT payload');
        }
        
        const googleUser = {
          googleId: payload.sub,
          email: payload.email,
          fullName: payload.name,
          profilePhoto: payload.picture,
          givenName: payload.given_name,
          familyName: payload.family_name
        };
        
        console.log('Google user data:', JSON.stringify(googleUser, null, 2));
        
        // Ensure MongoDB connection
        const connected = await ensureConnection();
        if (!connected) {
          const redirectPath = isSignup ? '/signup' : '/login';
          return res.redirect(`${redirectPath}?google_auth=error&error=database_unavailable`);
        }
        
        // Check if user exists by Google ID or email
        // Check for existing user by email first
        let user = await User.findOne({ email: googleUser.email });
        
        console.log('Looking for existing user with email:', googleUser.email);
        console.log('Existing user found:', !!user);
        let isNewUser = false;
        
        if (!user) {
          if (isSignup) {
            // Create new user for signup
            // Use role from URL parameter (passed from frontend)
            const userRole = signupRole || 'employee';
            console.log('Creating new user from Google OAuth signup with role:', userRole);
            
            user = new User({
              googleId: googleUser.googleId,
              email: googleUser.email,
              fullName: googleUser.fullName,
              profilePhoto: googleUser.profilePhoto,
              role: userRole, // Use role from URL parameter
              isVerified: true, // Google accounts are pre-verified
              isActive: true
            });
            await user.save();
            isNewUser = true;
            
            console.log('New user created:', {
              id: user._id,
              email: user.email,
              googleId: user.googleId,
              role: user.role
            });
          } else {
            // User doesn't exist - reject Google OAuth login
            console.log('User not found in database, rejecting Google OAuth login');
            return res.redirect('/login?google_auth=error&error=user_not_found&message=Account not found. Please sign up first.');
          }
        } else {
          console.log('Existing user details:', {
            id: user._id,
            email: user.email,
            googleId: user.googleId,
            role: user.role,
            username: user.username
          });
          
          // Update existing user with Google info if needed
          if (!user.googleId) {
            console.log('Linking Google account to existing user');
            user.googleId = googleUser.googleId;
            user.profilePhoto = googleUser.profilePhoto || user.profilePhoto;
            await user.save();
            console.log('Google account linked successfully');
          } else {
            console.log('User already has Google account linked');
          }
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user._id, 
            email: user.email, 
            role: user.role 
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        console.log('Google OAuth successful, redirecting with token');
        console.log('Final user details:', {
          id: user._id,
          email: user.email,
          googleId: user.googleId,
          role: user.role,
          username: user.username,
          isNewUser: isNewUser
        });
        
        // Redirect to frontend with token as URL parameter
        // New signup users go back to signup page to show animation
        // Existing users go directly to dashboard
        let redirectUrl;
        if (isNewUser && isSignup) {
          console.log('Redirecting new signup user back to signup page for animation');
          redirectUrl = '/signup';
        } else if (isNewUser) {
          console.log('Redirecting new user to additional info page');
          redirectUrl = '/additional-info';
        } else {
          console.log('Redirecting existing user to dashboard');
          redirectUrl = user.role === 'employer' ? '/employer' : 
                        user.role === 'admin' ? '/admin' : '/employee';
        }
        
        return res.redirect(`${redirectUrl}?token=${token}&google_auth=success&new_user=${isNewUser}`);
        
      } catch (jwtError) {
        console.error('JWT processing error:', jwtError);
        return res.redirect('/login?google_auth=error&error=jwt_invalid');
      }
    }
    
    // No credential or error, redirect based on signup/login
    const redirectPath = isSignup ? '/signup' : '/login';
    res.redirect(`${redirectPath}?google_auth=no_credential`);
    
  } catch (error) {
    console.error('Google OAuth POST handler error:', error);
    const redirectPath = isSignup ? '/signup' : '/login';
    res.redirect(`${redirectPath}?google_auth=error&error=server_error`);
  }
};

// Register routes for both /login and /signup
app.post('/login', (req, res) => handleGoogleOAuth(req, res, false));
app.post('/signup', (req, res) => handleGoogleOAuth(req, res, true));
app.post('/signup/employee', (req, res) => handleGoogleOAuth(req, res, true, 'employee'));
app.post('/signup/employer', (req, res) => handleGoogleOAuth(req, res, true, 'employer'));

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: true
  });
});

// Even simpler test endpoint
app.get('/api/ping', (req, res) => {
  res.json({ pong: true, timestamp: Date.now() });
});

// Root endpoint test
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API is running!', 
    timestamp: Date.now(),
    endpoints: ['/api/ping', '/api/test', '/api/health', '/api/auth/login', '/api/auth/register', '/api/jobs', '/api/blogs']
  });
});

// Debug endpoint to check users (remove in production)
app.get('/api/debug/users', async (req, res) => {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ success: false, message: 'Database not available' });
    }

    const userCount = await User.countDocuments();
    const users = await User.find({}, 'email fullName username role').limit(5);
    
    res.json({
      success: true,
      data: {
        totalUsers: userCount,
        sampleUsers: users
      }
    });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Debug endpoint to check all collections data
app.get('/api/debug/collections', async (req, res) => {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ success: false, message: 'Database not available' });
    }

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const collectionData = {};
    
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        const sample = await db.collection(collection.name).find({}).limit(2).toArray();
        collectionData[collection.name] = {
          count: count,
          sample: sample
        };
      } catch (error) {
        collectionData[collection.name] = {
          count: 'error',
          error: error.message
        };
      }
    }
    
    res.json({
      success: true,
      data: collectionData
    });
  } catch (error) {
    console.error('Debug collections error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Debug endpoint to check database info
app.get('/api/debug/database', async (req, res) => {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ success: false, message: 'Database not available' });
    }

    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    const collections = await db.listCollections().toArray();
    
    // Show connection string format (without password)
    const connectionString = process.env.MONGODB_URI ? 
      process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@') : 'Not set';
    
    res.json({
      success: true,
      data: {
        databaseName: dbName,
        connectionState: mongoose.connection.readyState,
        connectionString: connectionString,
        collections: collections.map(col => ({
          name: col.name,
          type: col.type
        }))
      }
    });
  } catch (error) {
    console.error('Debug database error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Debug endpoint to test MongoDB connection with detailed error info
app.get('/api/debug/mongodb', async (req, res) => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI format:', process.env.MONGODB_URI ? 
      (process.env.MONGODB_URI.startsWith('mongodb://') || process.env.MONGODB_URI.startsWith('mongodb+srv://') ? 'valid' : 'invalid') : 'not set');
    
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        success: false,
        message: 'MONGODB_URI environment variable is not set',
        error: 'Missing environment variable'
      });
    }

    // Test connection with detailed error handling
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        maxPoolSize: 1,
        minPoolSize: 0,
        maxIdleTimeMS: 10000,
        retryWrites: true,
        w: 'majority'
      });
      
      console.log('✅ MongoDB connected successfully');
      
      res.json({
        success: true,
        message: 'MongoDB connected successfully',
        data: {
          connectionState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name,
          readyState: mongoose.connection.readyState
        }
      });
      
    } catch (connectionError) {
      console.error('❌ MongoDB connection error:', connectionError);
      
      res.status(500).json({
        success: false,
        message: 'MongoDB connection failed',
        error: {
          name: connectionError.name,
          message: connectionError.message,
          code: connectionError.code,
          codeName: connectionError.codeName
        }
      });
    }
    
  } catch (error) {
    console.error('Debug MongoDB error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Debug endpoint to check community posts specifically
app.get('/api/debug/community', async (req, res) => {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ success: false, message: 'Database not available' });
    }

    const db = mongoose.connection.db;
    const communityCollection = db.collection('communityposts');
    
    const totalCount = await communityCollection.countDocuments();
    const samplePosts = await communityCollection.find({}).limit(3).toArray();
    
    res.json({
      success: true,
      data: {
        totalPosts: totalCount,
        samplePosts: samplePosts,
        collectionName: 'communityposts'
      }
    });
  } catch (error) {
    console.error('Debug community error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Auth routes
app.post('/api/auth/register', [
  body('fullName').trim().isLength({ min: 2, max: 50 }),
  body('username').trim().isLength({ min: 3, max: 30 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    const { fullName, username, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'User already exists with this email' : 'Username is already taken'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
      role: role || 'employee'
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          name: user.name || user.fullName, // Fallback for compatibility
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    const { email, password } = req.body;

    console.log(`Login attempt for email: ${email}`);

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    console.log(`User found: ${user.fullName} (${user.email})`);

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${user.email}`);
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    console.log(`Login successful for user: ${user.email}`);

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName || user.name, // Use fullName if available, otherwise name
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profilePhoto: user.profilePhoto || user.profileImage
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Logout
app.post('/api/auth/logout', authenticate, async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    // For now, we'll just return success
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Google OAuth login/signup
app.post('/api/auth/google', [
  body('googleId').notEmpty().withMessage('Google ID is required'),
  body('email').isEmail().normalizeEmail(),
  body('fullName').trim().isLength({ min: 2, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    const { googleId, email, fullName, profilePhoto, givenName, familyName } = req.body;

    console.log(`Google OAuth attempt for email: ${email}, Google ID: ${googleId}`);

    // Check if user exists by Google ID or email
    let user = await User.findOne({ 
      $or: [
        { googleId: googleId },
        { email: email }
      ]
    });

    if (user) {
      // User exists - update Google ID if not set and login
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      console.log(`Google OAuth login successful for existing user: ${user.email}`);
    } else {
      // Create new user
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      
      // Ensure username is unique
      let uniqueUsername = username;
      let counter = 1;
      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${username}${counter}`;
        counter++;
      }

      user = new User({
        googleId: googleId,
        fullName: fullName,
        name: fullName, // Keep for compatibility
        username: uniqueUsername,
        email: email,
        profilePhoto: profilePhoto || '',
        profileImage: profilePhoto || '', // Keep for compatibility
        role: 'employee', // Default role
        isVerified: true, // Google users are considered verified
        password: undefined // No password for Google OAuth users
      });

      await user.save();
      console.log(`Google OAuth signup successful for new user: ${user.email}`);
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName || user.name,
          name: user.name || user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profilePhoto: user.profilePhoto || user.profileImage,
          googleId: user.googleId
        },
        token
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== APPLICATIONS ROUTES =====

// Get user's applications
app.get('/api/applications/user', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { applicant: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    const applications = await Application.find(query)
      .populate('job', 'title company location salary')
      .populate('applicant', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Application.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

// Submit job application
app.post('/api/applications/job/:jobId', authenticate, [
  body('coverLetter').optional().trim().isLength({ max: 2000 }),
  body('resume').optional().trim(),
  body('additionalInfo').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { jobId } = req.params;
    const { coverLetter, resume, additionalInfo } = req.body;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check if user already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }
    
    // Create application
    const application = new Application({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      resume,
      additionalInfo,
      status: 'pending'
    });
    
    await application.save();
    
    // Populate the response
    await application.populate('job', 'title company location salary');
    await application.populate('applicant', 'fullName email');
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
});

// Get application by ID
app.get('/api/applications/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await Application.findById(id)
      .populate('job', 'title company location salary description requirements')
      .populate('applicant', 'fullName email profilePhoto');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if user has permission to view this application
    if (application.applicant._id.toString() !== req.user._id.toString() && 
        application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application'
    });
  }
});

// Update application status (employer only)
app.put('/api/applications/:id/status', authenticate, [
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']),
  body('notes').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const application = await Application.findById(id).populate('job');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if user is the employer
    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    application.status = status;
    if (notes) {
      application.employerNotes = notes;
    }
    
    await application.save();
    
    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
});

// Withdraw application
app.delete('/api/applications/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if user is the applicant
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Only allow withdrawal if status is pending or reviewed
    if (!['pending', 'reviewed'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw application at this stage'
      });
    }
    
    await Application.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application'
    });
  }
});

// Get job applications (employer only)
app.get('/api/applications/job/:jobId', authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    
    // Check if job exists and user is the employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const query = { job: jobId };
    if (status) {
      query.status = status;
    }
    
    const applications = await Application.find(query)
      .populate('applicant', 'fullName email profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Application.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job applications'
    });
  }
});

// Jobs routes
app.get('/api/jobs', async (req, res) => {
  try {
    const { limit = 20, page = 1, search, location, skills } = req.query;
    
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    const query = { status: 'active' }; // Use status instead of isActive

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (skills) {
      query.skills = { $in: skills.split(',') };
    }

    const jobs = await Job.find(query)
      .populate('employer', 'name email') // Use name instead of fullName
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({ success: true, data: { jobs } });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/jobs/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      console.log('MongoDB not connected, cannot fetch jobs');
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    const jobs = await Job.find({ status: 'active', isFeatured: true })
      .populate('employer', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: { jobs } });
  } catch (error) {
    console.error('Get featured jobs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get jobs by employer
app.get('/api/jobs/employer', authenticate, async (req, res) => {
  try {
    const { limit = 20, page = 1, status } = req.query;
    
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    const query = { employer: req.user._id };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .populate('employer', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalJobs = await Job.countDocuments(query);

    res.json({ 
      success: true, 
      data: { 
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalJobs / parseInt(limit)),
          totalJobs,
          hasNext: parseInt(page) * parseInt(limit) < totalJobs
        }
      } 
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Blogs routes
app.get('/api/blogs', async (req, res) => {
  try {
    const { limit = 20, page = 1, category, sortBy = 'publishedDate', sortOrder = 'desc' } = req.query;
    
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    // Handle both isPublished and status fields for compatibility
    const query = { 
      $or: [
        { isPublished: true },
        { status: 'published' }
      ]
    };

    if (category) {
      query.category = category;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const blogs = await Blog.find(query)
      .populate('author', 'fullName name profilePhoto profileImage email role')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalBlogs = await Blog.countDocuments(query);

    res.json({ 
      success: true, 
      data: { 
        blogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalBlogs / parseInt(limit)),
          totalBlogs,
          hasNext: parseInt(page) * parseInt(limit) < totalBlogs,
          hasPrev: parseInt(page) > 1
        }
      } 
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/blogs/featured', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      console.log('MongoDB not connected, cannot fetch blogs');
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    // Handle both isPublished and status fields for compatibility
    const query = { 
      $or: [
        { isPublished: true },
        { status: 'published' }
      ]
    };
    
    const blogs = await Blog.find(query)
      .populate('author', 'fullName name profilePhoto profileImage email role')
      .sort({ views: -1, publishedDate: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: { blogs } });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/blogs/categories', async (req, res) => {
  try {
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    // Handle both isPublished and status fields for compatibility
    const query = { 
      $or: [
        { isPublished: true },
        { status: 'published' }
      ]
    };
    
    const categories = await Blog.distinct('category', query);
    res.json({ success: true, data: { categories } });
  } catch (error) {
    console.error('Get blog categories error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get blog by ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid blog ID format' 
      });
    }

    const blog = await Blog.findById(id)
      .populate('author', 'fullName name profilePhoto profileImage email role');

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }

    // Increment view count
    await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({ 
      success: true, 
      data: { blog } 
    });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get related blogs
app.get('/api/blogs/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 3 } = req.query;
    
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid blog ID format' 
      });
    }

    // First get the current blog to find its category
    const currentBlog = await Blog.findById(id);
    if (!currentBlog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }

    // Find related blogs in the same category, excluding the current blog
    const relatedBlogs = await Blog.find({
      _id: { $ne: id }, // Exclude current blog
      category: currentBlog.category,
      $or: [
        { isPublished: true },
        { status: 'published' }
      ]
    })
      .populate('author', 'fullName name profilePhoto profileImage email role')
      .sort({ views: -1, publishedDate: -1 })
      .limit(parseInt(limit));

    res.json({ 
      success: true, 
      data: { blogs: relatedBlogs } 
    });
  } catch (error) {
    console.error('Get related blogs error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Community routes
app.get('/api/community', async (req, res) => {
  try {
    const { limit = 20, page = 1, tags, tag, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    // Try both status and isActive fields for compatibility
    const query = { 
      $or: [
        { status: 'active' },
        { isActive: true },
        { status: { $exists: false }, isActive: { $exists: false } } // Include posts with neither field
      ]
    };

    // Handle both 'tags' and 'tag' parameters for compatibility
    const tagParam = tags || tag;
    if (tagParam) {
      query.tags = { $in: tagParam.split(',') };
    }

    // Handle search functionality
    if (search) {
      query.$and = [
        query.$or,
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete query.$or; // Remove the original $or since we're using $and
    }

    // Handle different sort options
    let sort = {};
    if (sortBy === 'trending') {
      sort = { likes: -1, views: -1, createdAt: -1 };
    } else if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'top') {
      sort = { likes: -1, createdAt: -1 };
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const posts = await CommunityPost.find(query)
      .populate('author', 'name email profileImage role')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    console.log(`Found ${posts.length} community posts with query:`, JSON.stringify(query));

    res.json({ success: true, data: { posts } });
  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/community/tags', async (req, res) => {
  try {
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    // Try both status and isActive fields for compatibility
    const query = { 
      $or: [
        { status: 'active' },
        { isActive: true },
        { status: { $exists: false }, isActive: { $exists: false } }
      ]
    };

    const tags = await CommunityPost.distinct('tags', query);
    const flattenedTags = tags.flat().filter(tag => tag && tag.trim());
    const uniqueTags = [...new Set(flattenedTags)];
    
    console.log(`Found ${uniqueTags.length} unique community tags`);
    
    res.json({ success: true, data: { tags: uniqueTags } });
  } catch (error) {
    console.error('Get community tags error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get single community post by ID
app.get('/api/community/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    const post = await CommunityPost.findById(id)
      .populate('author', 'name email profileImage role');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, data: { post } });
  } catch (error) {
    console.error('Get community post error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create community post
app.post('/api/community', authenticate, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    const post = new CommunityPost({
      title,
      content,
      tags: tags || [],
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'name email profileImage role');

    res.status(201).json({ success: true, data: { post } });
  } catch (error) {
    console.error('Create community post error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Toggle like on community post
app.post('/api/community/:id/like', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userLiked = post.likedBy.includes(req.user._id);
    
    if (userLiked) {
      // Unlike
      post.likes = Math.max(0, post.likes - 1);
      post.likedBy = post.likedBy.filter(userId => !userId.equals(req.user._id));
    } else {
      // Like
      post.likes += 1;
      post.likedBy.push(req.user._id);
    }

    await post.save();

    res.json({ 
      success: true, 
      data: { 
        likes: post.likes, 
        liked: !userLiked 
      } 
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add comment to community post
app.post('/api/community/:id/comments', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Create comment (simplified - in real app you'd have a separate Comment model)
    const comment = {
      _id: new mongoose.Types.ObjectId(),
      content,
      author: req.user._id,
      createdAt: new Date()
    };

    post.comments.push(comment._id);
    await post.save();

    // Populate author info for the comment
    const populatedComment = {
      ...comment,
      author: {
        _id: req.user._id,
        name: req.user.name || req.user.fullName,
        email: req.user.email,
        profileImage: req.user.profileImage || req.user.profilePhoto
      }
    };

    res.status(201).json({ 
      success: true, 
      data: { comment: populatedComment } 
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get comments for community post
app.get('/api/community/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure MongoDB connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database not available. Please try again later.' 
      });
    }

    const post = await CommunityPost.findById(id).populate('comments');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // For now, return empty comments array since we're using a simplified approach
    // In a real app, you'd have a separate Comment model and populate it properly
    res.json({ 
      success: true, 
      data: { comments: [] } 
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ===== WALLET ROUTES =====

// Get wallet information
app.get('/api/wallet', authenticate, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = new Wallet({
        user: req.user._id,
        balance: 0,
        currency: 'INR'
      });
      await wallet.save();
    }
    
    res.json({
      success: true,
      data: wallet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet information'
    });
  }
});

// Get wallet transactions
app.get('/api/wallet/transactions', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const query = { user: req.user._id };
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet transactions'
    });
  }
});

// Get wallet statistics
app.get('/api/wallet/stats', authenticate, async (req, res) => {
  try {
    const { period = 30 } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const stats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalEarnings = stats.find(s => s._id === 'earning')?.totalAmount || 0;
    const totalSpent = stats.find(s => s._id === 'expense')?.totalAmount || 0;
    const totalWithdrawn = stats.find(s => s._id === 'withdrawal')?.totalAmount || 0;
    
    res.json({
      success: true,
      data: {
        totalEarnings,
        totalSpent,
        totalWithdrawn,
        netBalance: totalEarnings - totalSpent - totalWithdrawn,
        transactionCount: stats.reduce((sum, s) => sum + s.count, 0),
        period: parseInt(period)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet statistics'
    });
  }
});

// Create top-up order
app.post('/api/wallet/topup', authenticate, [
  body('amount').isNumeric().isFloat({ min: 100, max: 100000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { amount } = req.body;
    
    // Create transaction record
    const transaction = new Transaction({
      user: req.user._id,
      type: 'topup',
      amount: parseFloat(amount),
      status: 'pending',
      description: 'Wallet top-up',
      metadata: {
        orderId: `topup_${Date.now()}_${req.user._id}`
      }
    });
    
    await transaction.save();
    
    res.json({
      success: true,
      message: 'Top-up order created successfully',
      data: {
        transactionId: transaction._id,
        amount: transaction.amount,
        orderId: transaction.metadata.orderId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create top-up order'
    });
  }
});

// Verify payment (Razorpay integration)
app.post('/api/wallet/verify-payment', authenticate, [
  body('razorpay_order_id').notEmpty(),
  body('razorpay_payment_id').notEmpty(),
  body('razorpay_signature').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Find the transaction
    const transaction = await Transaction.findOne({
      'metadata.orderId': razorpay_order_id,
      user: req.user._id,
      status: 'pending'
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // In a real implementation, you would verify the signature with Razorpay
    // For now, we'll simulate successful verification
    
    // Update transaction status
    transaction.status = 'completed';
    transaction.metadata.paymentId = razorpay_payment_id;
    transaction.metadata.signature = razorpay_signature;
    await transaction.save();
    
    // Update wallet balance
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (wallet) {
      wallet.balance += transaction.amount;
      await wallet.save();
    } else {
      // Create wallet if it doesn't exist
      const newWallet = new Wallet({
        user: req.user._id,
        balance: transaction.amount,
        currency: 'INR'
      });
      await newWallet.save();
    }
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

// Withdraw funds
app.post('/api/wallet/withdraw', authenticate, [
  body('amount').isNumeric().isFloat({ min: 100, max: 50000 }),
  body('bankDetails.accountNumber').notEmpty().isLength({ min: 9, max: 18 }),
  body('bankDetails.ifscCode').notEmpty().isLength({ min: 11, max: 11 }),
  body('bankDetails.accountHolderName').notEmpty().trim().isLength({ min: 2, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { amount, bankDetails } = req.body;
    
    // Check wallet balance
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }
    
    // Create withdrawal transaction
    const transaction = new Transaction({
      user: req.user._id,
      type: 'withdrawal',
      amount: parseFloat(amount),
      status: 'pending',
      description: 'Fund withdrawal',
      metadata: {
        bankDetails,
        withdrawalId: `withdraw_${Date.now()}_${req.user._id}`
      }
    });
    
    await transaction.save();
    
    // Deduct from wallet balance
    wallet.balance -= amount;
    await wallet.save();
    
    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal request'
    });
  }
});

// Transfer funds
app.post('/api/wallet/transfer', authenticate, [
  body('recipientId').notEmpty().isMongoId(),
  body('amount').isNumeric().isFloat({ min: 10, max: 10000 }),
  body('description').optional().trim().isLength({ max: 200 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { recipientId, amount, description, relatedJobId, relatedApplicationId } = req.body;
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    // Check sender's wallet balance
    const senderWallet = await Wallet.findOne({ user: req.user._id });
    if (!senderWallet || senderWallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }
    
    // Create transfer transactions (debit for sender, credit for recipient)
    const debitTransaction = new Transaction({
      user: req.user._id,
      type: 'transfer_out',
      amount: parseFloat(amount),
      status: 'completed',
      description: description || `Transfer to ${recipient.fullName}`,
      metadata: {
        recipientId,
        relatedJobId,
        relatedApplicationId,
        transferId: `transfer_${Date.now()}_${req.user._id}`
      }
    });
    
    const creditTransaction = new Transaction({
      user: recipientId,
      type: 'transfer_in',
      amount: parseFloat(amount),
      status: 'completed',
      description: description || `Transfer from ${req.user.fullName}`,
      metadata: {
        senderId: req.user._id,
        relatedJobId,
        relatedApplicationId,
        transferId: `transfer_${Date.now()}_${req.user._id}`
      }
    });
    
    await Promise.all([debitTransaction.save(), creditTransaction.save()]);
    
    // Update wallet balances
    senderWallet.balance -= amount;
    await senderWallet.save();
    
    let recipientWallet = await Wallet.findOne({ user: recipientId });
    if (!recipientWallet) {
      recipientWallet = new Wallet({
        user: recipientId,
        balance: amount,
        currency: 'INR'
      });
    } else {
      recipientWallet.balance += amount;
    }
    await recipientWallet.save();
    
    res.json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        debitTransaction,
        creditTransaction,
        newBalance: senderWallet.balance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process transfer'
    });
  }
});

// User profile routes
app.get('/api/users/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.put('/api/users/profile', authenticate, [
  body('fullName').optional().trim().isLength({ min: 2, max: 50 }),
  body('username').optional().trim().isLength({ min: 3, max: 30 }),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('headline').optional().trim().isLength({ max: 100 }),
  body('about').optional().trim().isLength({ max: 1000 }),
  body('location').optional().trim().isLength({ max: 100 }),
  body('website').optional().isURL(),
  body('skills').optional().isArray(),
  body('companyInfo').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const updateData = { ...req.body };
    
    // Remove sensitive fields
    delete updateData.password;
    delete updateData.email; // Email should not be changeable via profile update
    delete updateData.role; // Role should not be changeable via profile update

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Server startup - establish MongoDB connection immediately
console.log('🚀 Server ready to handle requests');
console.log('📡 Establishing MongoDB connection...');

// Connect to MongoDB immediately on startup
connectDB().then(connected => {
  if (connected) {
    console.log('✅ MongoDB connection established successfully');
  } else {
    console.error('❌ Failed to establish MongoDB connection');
  }
}).catch(error => {
  console.error('❌ MongoDB connection error on startup:', error);
});

// ===== CONNECTIONS/GANG MEMBERS ROUTES =====

// Send connection request
app.post('/api/connections/request', authenticate, [
  body('recipientId').notEmpty().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { recipientId } = req.body;
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if trying to connect to self
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot connect to yourself'
      });
    }
    
    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id }
      ]
    });
    
    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: 'Connection already exists'
      });
    }
    
    // Create connection request
    const connection = new Connection({
      requester: req.user._id,
      recipient: recipientId,
      status: 'pending'
    });
    
    await connection.save();
    
    // Populate the response
    await connection.populate('requester', 'fullName email profilePhoto');
    await connection.populate('recipient', 'fullName email profilePhoto');
    
    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      data: connection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send connection request'
    });
  }
});

// Accept connection request
app.post('/api/connections/accept/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await Connection.findById(id);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }
    
    // Check if user is the recipient
    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Check if already accepted
    if (connection.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Connection already accepted'
      });
    }
    
    connection.status = 'accepted';
    connection.acceptedAt = new Date();
    await connection.save();
    
    res.json({
      success: true,
      message: 'Connection request accepted',
      data: connection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to accept connection request'
    });
  }
});

// Reject connection request
app.post('/api/connections/reject/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await Connection.findById(id);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }
    
    // Check if user is the recipient
    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    connection.status = 'rejected';
    await connection.save();
    
    res.json({
      success: true,
      message: 'Connection request rejected',
      data: connection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject connection request'
    });
  }
});

// Cancel connection request
app.post('/api/connections/cancel/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await Connection.findById(id);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }
    
    // Check if user is the requester
    if (connection.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Only allow cancellation if status is pending
    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this connection request'
      });
    }
    
    await Connection.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Connection request cancelled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel connection request'
    });
  }
});

// Remove connection
app.delete('/api/connections/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await Connection.findById(id);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }
    
    // Check if user is part of this connection
    if (connection.requester.toString() !== req.user._id.toString() && 
        connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await Connection.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Connection removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove connection'
    });
  }
});

// Get user connections
app.get('/api/connections/my-connections', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    const connections = await Connection.find(query)
      .populate('requester', 'fullName email profilePhoto role')
      .populate('recipient', 'fullName email profilePhoto role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Connection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        connections,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connections'
    });
  }
});

// Get pending requests
app.get('/api/connections/pending-requests', authenticate, async (req, res) => {
  try {
    const { type = 'received', page = 1, limit = 20 } = req.query;
    
    let query;
    if (type === 'sent') {
      query = { requester: req.user._id, status: 'pending' };
    } else {
      query = { recipient: req.user._id, status: 'pending' };
    }
    
    const requests = await Connection.find(query)
      .populate('requester', 'fullName email profilePhoto role')
      .populate('recipient', 'fullName email profilePhoto role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Connection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests'
    });
  }
});

// Follow employer
app.post('/api/connections/follow', authenticate, [
  body('employerId').notEmpty().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { employerId } = req.body;
    
    // Check if employer exists and has employer role
    const employer = await User.findById(employerId);
    if (!employer || employer.role !== 'employer') {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }
    
    // Check if trying to follow self
    if (employerId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }
    
    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: employerId
    });
    
    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this employer'
      });
    }
    
    // Create follow relationship
    const follow = new Follow({
      follower: req.user._id,
      following: employerId
    });
    
    await follow.save();
    
    // Populate the response
    await follow.populate('follower', 'fullName email profilePhoto');
    await follow.populate('following', 'fullName email profilePhoto company');
    
    res.status(201).json({
      success: true,
      message: 'Successfully following employer',
      data: follow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to follow employer'
    });
  }
});

// Unfollow employer
app.delete('/api/connections/follow/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const follow = await Follow.findById(id);
    
    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'Follow relationship not found'
      });
    }
    
    // Check if user is the follower
    if (follow.follower.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await Follow.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Successfully unfollowed employer'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unfollow employer'
    });
  }
});

// Get user follows
app.get('/api/connections/my-follows', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const follows = await Follow.find({ follower: req.user._id })
      .populate('following', 'fullName email profilePhoto company')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Follow.countDocuments({ follower: req.user._id });
    
    res.json({
      success: true,
      data: {
        follows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch follows'
    });
  }
});

// Get connection status with another user
app.get('/api/connections/status/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check connection status
    const connection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: userId },
        { requester: userId, recipient: req.user._id }
      ]
    });
    
    // Check follow status
    const follow = await Follow.findOne({
      follower: req.user._id,
      following: userId
    });
    
    res.json({
      success: true,
      data: {
        connection: connection ? {
          id: connection._id,
          status: connection.status,
          isRequester: connection.requester.toString() === req.user._id.toString()
        } : null,
        follow: follow ? {
          id: follow._id,
          isFollowing: true
        } : { isFollowing: false }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get connection status'
    });
  }
});

// Discover available employees
app.get('/api/connections/discover', authenticate, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    // Build search query
    const query = { role: 'employee' };
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Exclude current user and already connected users
    const existingConnections = await Connection.find({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ]
    });
    
    const connectedUserIds = existingConnections.map(conn => 
      conn.requester.toString() === req.user._id.toString() 
        ? conn.recipient.toString() 
        : conn.requester.toString()
    );
    
    query._id = { $nin: [req.user._id, ...connectedUserIds] };
    
    const users = await User.find(query)
      .select('fullName email profilePhoto skills location bio')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to discover users'
    });
  }
});

export default app;

