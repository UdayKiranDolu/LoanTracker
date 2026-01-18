/**
 * Global Error Handler Middleware
 * Catches and formats all errors consistently
 */

const config = require('../config/env');
const ApiResponse = require('../utils/apiResponse');

// Custom Error Class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  if (config.isDevelopment) {
    console.error('❌ Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiResponse.validationError(res, errors);
  }

  // JWT errors (for future auth)
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace in development
  if (config.isDevelopment) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// Not Found Handler
const notFoundHandler = (req, res, next) => {
  const message = `Route not found: ${req.method} ${req.originalUrl}`;
  ApiResponse.notFound(res, message);
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
};