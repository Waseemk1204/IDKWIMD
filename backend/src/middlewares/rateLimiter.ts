import rateLimit from 'express-rate-limit';
import { config } from '../config';

// Secure key generator for proxied environments
const secureKeyGenerator = (req: any) => {
  // Use X-Forwarded-For header in production (Railway), real IP in development
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // Take the first IP if multiple are present
    return typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
  }
  return req.ip || req.connection.remoteAddress || 'unknown';
};

// General rate limiter - more lenient for development
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.NODE_ENV === 'development' ? 1000 : config.RATE_LIMIT_MAX_REQUESTS, // 1000 for dev, 100 for prod
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: secureKeyGenerator,
  validate: { trustProxy: false }, // Disable trust proxy validation since we handle it manually
});

// Strict rate limiter for authentication - more lenient for development
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes (reduced for faster reset)
  max: config.NODE_ENV === 'development' ? 200 : 100, // 200 for dev, 100 for prod
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: secureKeyGenerator,
  validate: { trustProxy: false },
  skipSuccessfulRequests: true,
  skip: (req) => {
    // Skip rate limiting for Google OAuth callback to prevent blocking OAuth flow
    return req.path === '/api/v1/auth/google' && req.method === 'POST';
  }
});

// Moderate rate limiter for API endpoints - more lenient for development
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.NODE_ENV === 'development' ? 500 : 50, // 500 for dev, 50 for prod
  message: {
    success: false,
    message: 'Too many API requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: secureKeyGenerator,
  validate: { trustProxy: false },
});

// Upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: secureKeyGenerator,
  validate: { trustProxy: false },
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: secureKeyGenerator,
  validate: { trustProxy: false },
});
