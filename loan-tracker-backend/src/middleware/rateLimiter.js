const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/apiResponse');

// Get configuration from environment variables with fallbacks
const isDevelopment = process.env.NODE_ENV === 'development';
const ENABLE_RATE_LIMIT = process.env.ENABLE_RATE_LIMIT !== 'false';

// Helper function to create rate limiter or pass-through
const createRateLimiter = (options) => {
  // Skip rate limiting if disabled or in development (unless explicitly enabled)
  if (!ENABLE_RATE_LIMIT || (isDevelopment && process.env.FORCE_RATE_LIMIT !== 'true')) {
    return (req, res, next) => next();
  }
  
  return rateLimit(options);
};

// General API rate limiter
exports.apiLimiter = createRateLimiter({
  windowMs: parseInt(process.env.API_RATE_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_MAX) || (isDevelopment ? 1000 : 100),
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for localhost in development
    if (isDevelopment) {
      const whitelist = ['::1', '127.0.0.1', '::ffff:127.0.0.1', 'localhost'];
      return whitelist.some(ip => req.ip.includes(ip));
    }
    return false;
  },
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Too many requests from this IP, please try again later',
      429
    );
  }
});

// Strict limiter for auth routes
exports.authLimiter = createRateLimiter({
  windowMs: parseInt(process.env.AUTH_RATE_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_MAX) || (isDevelopment ? 100 : 5),
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later',
  skip: (req) => {
    // Skip for localhost in development
    if (isDevelopment) {
      const whitelist = ['::1', '127.0.0.1', '::ffff:127.0.0.1', 'localhost'];
      return whitelist.some(ip => req.ip.includes(ip));
    }
    return false;
  },
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Too many authentication attempts. Please try again in 15 minutes',
      429
    );
  }
});

// Password reset limiter
exports.passwordResetLimiter = createRateLimiter({
  windowMs: parseInt(process.env.PASSWORD_RATE_WINDOW_MS) || 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.PASSWORD_RATE_MAX) || (isDevelopment ? 20 : 3),
  message: 'Too many password reset requests, please try again later',
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Too many password reset requests. Please try again in 1 hour',
      429
    );
  }
});

// Export a function to reset rate limiters (useful for testing)
exports.resetLimiters = () => {
  if (this.apiLimiter.resetKey) {
    this.apiLimiter.resetKey('*');
  }
  if (this.authLimiter.resetKey) {
    this.authLimiter.resetKey('*');
  }
  if (this.passwordResetLimiter.resetKey) {
    this.passwordResetLimiter.resetKey('*');
  }
};