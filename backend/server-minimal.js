import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import jwt from 'jsonwebtoken';

// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3001');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Google OAuth login endpoint
app.post('/api/v1/auth/google', (req, res) => {
  try {
    const { googleId, email, fullName, profilePhoto, givenName, familyName } = req.body;

    if (!googleId || !email || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Google user data'
      });
    }

    // Create a mock user object (in production, this would be saved to database)
    const user = {
      id: `google_${googleId}`,
      _id: `google_${googleId}`,
      fullName: fullName,
      displayName: fullName,
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, ''),
      email: email,
      role: 'employee', // Default role for Google users
      profilePhoto: profilePhoto,
      phone: '',
      location: '',
      headline: '',
      about: '',
      website: '',
      socialLinks: {
        linkedin: '',
        twitter: '',
        github: '',
        portfolio: ''
      },
      skills: [],
      experiences: [],
      education: [],
      companyInfo: undefined,
      isVerified: true, // Google users are considered verified
      verificationStatus: 'verified',
      isActive: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: '30d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        user: user,
        token: token,
        refreshToken: refreshToken
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mock other endpoints to prevent 404 errors
app.get('/api/v1/jobs/featured', (req, res) => {
  res.json({
    success: true,
    data: {
      jobs: []
    }
  });
});

app.get('/api/v1/blogs/featured', (req, res) => {
  res.json({
    success: true,
    data: {
      blogs: []
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`✅ Google OAuth endpoint: http://localhost:${port}/api/v1/auth/google`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
