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
    // Allow requests with no origin (like mobile apps, curl requests, and OAuth flows)
    if (!origin) {
      console.log('Allowing request with no origin (OAuth flow)');
      return callback(null, true);
    }
    
    // Allow all origins for now to fix OAuth issues
    console.log('Allowing request from origin:', origin);
    return callback(null, true);
    
    // Original restrictive logic (commented out for debugging)
    /*
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow Google OAuth requests
    if (origin && origin.includes('accounts.google.com')) {
      console.log('Allowing Google OAuth request from:', origin);
      return callback(null, true);
    }
    
    // For development, allow any localhost origin
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
    */
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

// Handle Google OAuth POST requests to /login
app.post('/login', async (req, res) => {
  try {
    console.log('Google OAuth POST request received at /login');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    // Extract credential from POST body
    const credential = req.body.credential;
    const error = req.body.error;
    
    if (error) {
      console.error('Google OAuth error:', error);
      return res.redirect(`/login?google_auth=error&error=${encodeURIComponent(error)}`);
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
          return res.redirect('/login?google_auth=error&error=database_unavailable');
        }
        
        // Check if user exists by Google ID or email
        // Check for existing user by email first
        let user = await User.findOne({ email: googleUser.email });
        
        console.log('Looking for existing user with email:', googleUser.email);
        console.log('Existing user found:', !!user);
        
        if (!user) {
          // User doesn't exist - reject Google OAuth login
          console.log('User not found in database, rejecting Google OAuth login');
          return res.redirect('/login?google_auth=error&error=user_not_found');
        }
        
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
        
        console.log('Google OAuth successful, redirecting to dashboard with token');
        console.log('Final user details:', {
          id: user._id,
          email: user.email,
          googleId: user.googleId,
          role: user.role,
          username: user.username,
          isNewUser: !user.googleId || user.googleId === googleUser.googleId
        });
        
        // Redirect to frontend with token as URL parameter
        const redirectUrl = user.role === 'employer' ? '/employer' : 
                           user.role === 'admin' ? '/admin' : '/employee';
        
        return res.redirect(`${redirectUrl}?token=${token}`);
        
      } catch (jwtError) {
        console.error('JWT processing error:', jwtError);
        return res.redirect('/login?google_auth=error&error=jwt_invalid');
      }
    }
    
    // No credential or error, redirect to login page
    res.redirect('/login?google_auth=no_credential');
    
  } catch (error) {
    console.error('Google OAuth POST handler error:', error);
    res.redirect('/login?google_auth=error&error=server_error');
  }
});

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

export default app;

