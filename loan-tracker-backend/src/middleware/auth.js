const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');
const ApiResponse = require('../utils/apiResponse');

// ============================================
// PROTECT ROUTES - Require Authentication
// ============================================
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Check if token exists
  if (!token) {
    return ApiResponse.error(res, 'You are not logged in. Please log in to access this resource', 401);
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return ApiResponse.error(res, 'User no longer exists', 401);
    }
    
    // Check if user is active
    if (!user.isActive) {
      return ApiResponse.error(res, 'Your account has been deactivated', 401);
    }
    
    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return ApiResponse.error(res, 'Password recently changed. Please log in again', 401);
    }
    
    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.error(res, 'Invalid token', 401);
    } else if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token expired. Please log in again', 401);
    }
    return ApiResponse.error(res, 'Authentication failed', 401);
  }
});

// ============================================
// RESTRICT TO ROLES
// ============================================
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        'You do not have permission to perform this action',
        403
      );
    }
    next();
  };
};

// ============================================
// OPTIONAL AUTHENTICATION
// ============================================
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
        req.user = user;
      }
    } catch (error) {
      // Continue without authentication
    }
  }
  
  next();
});

// ============================================
// VERIFY EMAIL REQUIRED
// ============================================
exports.requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return ApiResponse.error(
      res,
      'Please verify your email address to access this resource',
      403
    );
  }
  next();
};