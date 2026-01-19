const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, restrictTo, requireEmailVerification } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');

// ============================================
// VALIDATION MIDDLEWARE - FIX: Create inline validator
// ============================================
const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// ============================================
// VALIDATION RULES
// ============================================

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('passwordConfirm')
    .notEmpty().withMessage('Please confirm your password')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  
  body('newPasswordConfirm')
    .notEmpty().withMessage('Please confirm your new password')
];

const resetPasswordValidation = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  
  body('passwordConfirm')
    .notEmpty().withMessage('Please confirm your password')
];

// ============================================
// PUBLIC ROUTES
// ============================================

// Register
router.post(
  '/register',
  authLimiter,
  registerValidation,
  validate,
  authController.register
);

// Login
router.post(
  '/login',
  authLimiter,
  loginValidation,
  validate,
  authController.login
);

// Refresh Token
router.post('/refresh-token', authController.refreshToken);

// Verify Email
router.get('/verify-email/:token', authController.verifyEmail);

// Forgot Password
router.post(
  '/forgot-password',
  passwordResetLimiter,
  body('email').isEmail().withMessage('Please provide a valid email'),
  validate,
  authController.forgotPassword
);

// Reset Password
router.patch(
  '/reset-password/:token',
  resetPasswordValidation,
  validate,
  authController.resetPassword
);

// ============================================
// PROTECTED ROUTES
// ============================================

// Logout
router.post('/logout', protect, authController.logout);

// Get Current User
router.get('/me', protect, authController.getMe);

// Update Profile
router.patch('/update-profile', protect, authController.updateProfile);

// Update Password
router.patch(
  '/update-password',
  protect,
  updatePasswordValidation,
  validate,
  authController.updatePassword
);

// Resend Verification Email
router.post('/resend-verification', protect, authController.resendVerificationEmail);

module.exports = router;