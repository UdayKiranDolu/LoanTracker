/**
 * Authentication Controller
 * Handles user authentication, registration, and account management
 */

const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const emailService = require('../services/emailService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// ============================================
// HELPER FUNCTIONS
// ============================================

// const createSendToken = (user, statusCode, res, message = 'Success') => {
//   const accessToken = user.generateAccessToken();
//   const refreshToken = user.generateRefreshToken();
  
//   // Save refresh token to database
//   user.save({ validateBeforeSave: false });
  
//   // Cookie options
//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production', // HTTPS only in production
//     sameSite: 'strict'
//   };
  
//   // Send refresh token as HTTP-only cookie
//   res.cookie('refreshToken', refreshToken, cookieOptions);
  
//   // Remove password from output
//   user.password = undefined;
//   user.refreshToken = undefined;
  
//   return ApiResponse.success(
//     res,
//     {
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         isEmailVerified: user.isEmailVerified,
//         avatar: user.avatar,
//         preferences: user.preferences
//       },
//       accessToken,
//       refreshToken // Also send in body for mobile apps
//     },
//     message,
//     statusCode
//   );
// };

// FIXED: Make createSendToken async
const createSendToken = async (user, statusCode, res, message = 'Success') => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  
  // FIXED: Properly save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  
  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  
  // Send refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);
  
  // Remove sensitive fields from output
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: {
        id: userObject._id,
        name: userObject.name,
        email: userObject.email,
        role: userObject.role,
        isEmailVerified: userObject.isEmailVerified,
        avatar: userObject.avatar,
        preferences: userObject.preferences
      },
      accessToken,
      refreshToken
    },
    timestamp: new Date().toISOString()
  });
};

// ============================================
// REGISTRATION
// ============================================

// exports.register = asyncHandler(async (req, res) => {
//   const { name, email, password, passwordConfirm } = req.body;
  
//   // Check if passwords match
//   if (password !== passwordConfirm) {
//     return ApiResponse.error(res, 'Passwords do not match', 400);
//   }
  
//   // Check if user already exists
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     return ApiResponse.error(res, 'Email already registered', 400);
//   }
  
//   // FIXED: Create user with auto-verification for development
//   const user = await User.create({
//     name,
//     email,
//     password,
//     role: 'user',
//     isEmailVerified: true // Auto-verify in development (skip email verification)
//   });
  
//   // FIXED: Skip email verification in development
//   // If you want to enable email verification later, uncomment the code below
  
//   /*
//   // Generate email verification token
//   const verificationToken = user.generateEmailVerificationToken();
//   await user.save({ validateBeforeSave: false });
  
//   // Send verification email
//   try {
//     const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
//     await emailService.sendVerificationEmail(user.email, user.name, verificationUrl);
    
//     createSendToken(
//       user,
//       201,
//       res,
//       'Registration successful! Please check your email to verify your account.'
//     );
//   } catch (error) {
//     user.emailVerificationToken = undefined;
//     user.emailVerificationExpires = undefined;
//     await user.save({ validateBeforeSave: false });
    
//     return ApiResponse.error(
//       res,
//       'Error sending verification email. Please try again later.',
//       500
//     );
//   }
//   */
  
//   // FIXED: Directly create session and log in user
//   createSendToken(
//     user,
//     201,
//     res,
//     'Registration successful! You are now logged in.'
//   );
// });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;
  
  // Check if passwords match
  if (password !== passwordConfirm) {
    return ApiResponse.error(res, 'Passwords do not match', 400);
  }
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return ApiResponse.error(res, 'Email already registered', 400);
  }
  
  // Create user with auto-verification for development
  const user = await User.create({
    name,
    email,
    password,
    role: 'user',
    isEmailVerified: true
  });
  
  // FIXED: Await the async createSendToken
  await createSendToken(
    user,
    201,
    res,
    'Registration successful! You are now logged in.'
  );
});

// ============================================
// LOGIN
// ============================================

// exports.login = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
  
//   // Check if email and password exist
//   if (!email || !password) {
//     return ApiResponse.error(res, 'Please provide email and password', 400);
//   }
  
//   try {
//     // Find user and verify credentials
//     const user = await User.findByCredentials(email, password);
    
//     createSendToken(user, 200, res, 'Login successful');
//   } catch (error) {
//     return ApiResponse.error(res, error.message, 401);
//   }
// });

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Check if email and password exist
  if (!email || !password) {
    return ApiResponse.error(res, 'Please provide email and password', 400);
  }
  
  try {
    // Find user and verify credentials
    const user = await User.findByCredentials(email, password);
    
    // FIXED: Await the async createSendToken
    await createSendToken(user, 200, res, 'Login successful');
  } catch (error) {
    return ApiResponse.error(res, error.message, 401);
  }
});

// ============================================
// LOGOUT
// ============================================

exports.logout = asyncHandler(async (req, res) => {
  // Clear refresh token from database
  await User.findByIdAndUpdate(req.user._id, {
    refreshToken: null
  });
  
  // Clear cookie
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  return ApiResponse.success(res, null, 'Logged out successfully');
});

// ============================================
// REFRESH TOKEN
// ============================================

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies || req.body;
  
  if (!refreshToken) {
    return ApiResponse.error(res, 'No refresh token provided', 401);
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user || user.refreshToken !== refreshToken) {
      return ApiResponse.error(res, 'Invalid refresh token', 401);
    }
    
    // Generate new access token
    const newAccessToken = user.generateAccessToken();
    
    return ApiResponse.success(
      res,
      { accessToken: newAccessToken },
      'Token refreshed successfully'
    );
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired refresh token', 401);
  }
});

// ============================================
// EMAIL VERIFICATION (Optional - for future use)
// ============================================

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  // Hash token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  // Find user with valid token
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    return ApiResponse.error(res, 'Invalid or expired verification token', 400);
  }
  
  // Update user
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
  
  return ApiResponse.success(res, null, 'Email verified successfully');
});

// ============================================
// RESEND VERIFICATION EMAIL (Optional - for future use)
// ============================================

exports.resendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user.isEmailVerified) {
    return ApiResponse.error(res, 'Email already verified', 400);
  }
  
  // FIXED: Skip email sending in development
  if (process.env.NODE_ENV === 'development') {
    // Auto-verify in development
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
    return ApiResponse.success(res, null, 'Email auto-verified in development mode');
  }
  
  // Generate new token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  
  // Send email
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    await emailService.sendVerificationEmail(user.email, user.name, verificationUrl);
    
    return ApiResponse.success(res, null, 'Verification email sent');
  } catch (error) {
    return ApiResponse.error(res, 'Error sending verification email', 500);
  }
});

// ============================================
// FORGOT PASSWORD
// ============================================

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  
  if (!user) {
    // Don't reveal if user exists
    return ApiResponse.success(
      res,
      null,
      'If an account exists, a password reset email will be sent'
    );
  }
  
  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });
  
  // FIXED: Handle email errors gracefully
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl);
    
    return ApiResponse.success(
      res,
      null,
      'Password reset email sent'
    );
  } catch (error) {
    console.error('Password reset email error:', error);
    
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    // FIXED: In development, return the reset token for testing
    if (process.env.NODE_ENV === 'development') {
      return ApiResponse.success(
        res,
        { resetToken }, // Send token in response for dev testing
        'Email service not configured. Use this token to reset password (DEV only)'
      );
    }
    
    return ApiResponse.error(
      res,
      'Error sending password reset email',
      500
    );
  }
});

// ============================================
// RESET PASSWORD
// ============================================

// exports.resetPassword = asyncHandler(async (req, res) => {
//   const { token } = req.params;
//   const { password, passwordConfirm } = req.body;
  
//   if (password !== passwordConfirm) {
//     return ApiResponse.error(res, 'Passwords do not match', 400);
//   }
  
//   // Hash token
//   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
//   // Find user with valid token
//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() }
//   });
  
//   if (!user) {
//     return ApiResponse.error(res, 'Invalid or expired reset token', 400);
//   }
  
//   // Update password
//   user.password = password;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   user.lastPasswordChange = Date.now();
//   await user.save();
  
//   // FIXED: Send confirmation email only if email service is configured
//   try {
//     await emailService.sendPasswordChangedEmail(user.email, user.name);
//   } catch (error) {
//     console.error('Password changed email error:', error);
//     // Don't fail the password reset if email fails
//   }
  
//   createSendToken(user, 200, res, 'Password reset successful');
// });

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;
  
  if (password !== passwordConfirm) {
    return ApiResponse.error(res, 'Passwords do not match', 400);
  }
  
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    return ApiResponse.error(res, 'Invalid or expired reset token', 400);
  }
  
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.lastPasswordChange = Date.now();
  await user.save();
  
  try {
    await emailService.sendPasswordChangedEmail(user.email, user.name);
  } catch (error) {
    console.error('Password changed email error:', error);
  }
  
  // FIXED: Await createSendToken
  await createSendToken(user, 200, res, 'Password reset successful');
});

// ============================================
// UPDATE PASSWORD (Logged In)
// ============================================

// exports.updatePassword = asyncHandler(async (req, res) => {
//   const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  
//   if (newPassword !== newPasswordConfirm) {
//     return ApiResponse.error(res, 'Passwords do not match', 400);
//   }
  
//   // Get user with password
//   const user = await User.findById(req.user._id).select('+password');
  
//   // Check current password
//   const isMatch = await user.comparePassword(currentPassword);
//   if (!isMatch) {
//     return ApiResponse.error(res, 'Current password is incorrect', 401);
//   }
  
//   // Update password
//   user.password = newPassword;
//   user.lastPasswordChange = Date.now();
//   await user.save();
  
//   createSendToken(user, 200, res, 'Password updated successfully');
// });

exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  
  if (newPassword !== newPasswordConfirm) {
    return ApiResponse.error(res, 'Passwords do not match', 400);
  }
  
  const user = await User.findById(req.user._id).select('+password');
  
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return ApiResponse.error(res, 'Current password is incorrect', 401);
  }
  
  user.password = newPassword;
  user.lastPasswordChange = Date.now();
  await user.save();
  
  // FIXED: Await createSendToken
  await createSendToken(user, 200, res, 'Password updated successfully');
});

// ============================================
// GET CURRENT USER
// ============================================

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  return ApiResponse.success(res, { user });
});

// ============================================
// UPDATE PROFILE
// ============================================

exports.updateProfile = asyncHandler(async (req, res) => {
  // Fields that can be updated
  const allowedFields = ['name', 'phone', 'preferences'];
  
  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );
  
  return ApiResponse.success(res, { user }, 'Profile updated successfully');
});

module.exports = {
  register: exports.register,
  login: exports.login,
  logout: exports.logout,
  refreshToken: exports.refreshToken,
  verifyEmail: exports.verifyEmail,
  resendVerificationEmail: exports.resendVerificationEmail,
  forgotPassword: exports.forgotPassword,
  resetPassword: exports.resetPassword,
  updatePassword: exports.updatePassword,
  getMe: exports.getMe,
  updateProfile: exports.updateProfile
};









// const User = require('../models/User');
// const asyncHandler = require('../middleware/asyncHandler');
// const ApiResponse = require('../utils/apiResponse');
// const emailService = require('../services/emailService');
// const crypto = require('crypto');
// const jwt = require('jsonwebtoken');

// // ============================================
// // HELPER FUNCTIONS
// // ============================================

// const createSendToken = (user, statusCode, res, message = 'Success') => {
//   const accessToken = user.generateAccessToken();
//   const refreshToken = user.generateRefreshToken();
  
//   // Save refresh token to database
//   user.save({ validateBeforeSave: false });
  
//   // Cookie options
//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production', // HTTPS only in production
//     sameSite: 'strict'
//   };
  
//   // Send refresh token as HTTP-only cookie
//   res.cookie('refreshToken', refreshToken, cookieOptions);
  
//   // Remove password from output
//   user.password = undefined;
//   user.refreshToken = undefined;
  
//   return ApiResponse.success(
//     res,
//     {
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         isEmailVerified: user.isEmailVerified,
//         avatar: user.avatar,
//         preferences: user.preferences
//       },
//       accessToken,
//       refreshToken // Also send in body for mobile apps
//     },
//     message,
//     statusCode
//   );
// };

// // ============================================
// // REGISTRATION
// // ============================================

// exports.register = asyncHandler(async (req, res) => {
//   const { name, email, password, passwordConfirm } = req.body;
  
//   // Check if passwords match
//   if (password !== passwordConfirm) {
//     return ApiResponse.error(res, 'Passwords do not match', 400);
//   }
  
//   // Check if user already exists
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     return ApiResponse.error(res, 'Email already registered', 400);
//   }
  
//   // Create user
//   const user = await User.create({
//     name,
//     email,
//     password,
//     role: 'user', // Default role
//     isEmailVerified: true // NEW: Auto-verify in development (skip email)
//   });
  
//   // Generate email verification token
//   const verificationToken = user.generateEmailVerificationToken();
//   await user.save({ validateBeforeSave: false });
  
//   // Send verification email
//   try {
//     const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
//     await emailService.sendVerificationEmail(user.email, user.name, verificationUrl);
    
//     createSendToken(
//       user,
//       201,
//       res,
//       'Registration successful! Please check your email to verify your account.'
//     );
//   } catch (error) {
//     user.emailVerificationToken = undefined;
//     user.emailVerificationExpires = undefined;
//     await user.save({ validateBeforeSave: false });
    
//     return ApiResponse.error(
//       res,
//       'Error sending verification email. Please try again later.',
//       500
//     );
//   }
// });

// // ============================================
// // LOGIN
// // ============================================

// exports.login = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
  
//   // Check if email and password exist
//   if (!email || !password) {
//     return ApiResponse.error(res, 'Please provide email and password', 400);
//   }
  
//   try {
//     // Find user and verify credentials
//     const user = await User.findByCredentials(email, password);
    
//     createSendToken(user, 200, res, 'Login successful');
//   } catch (error) {
//     return ApiResponse.error(res, error.message, 401);
//   }
// });

// // ============================================
// // LOGOUT
// // ============================================

// exports.logout = asyncHandler(async (req, res) => {
//   // Clear refresh token from database
//   await User.findByIdAndUpdate(req.user._id, {
//     refreshToken: null
//   });
  
//   // Clear cookie
//   res.cookie('refreshToken', 'loggedout', {
//     expires: new Date(Date.now() + 10 * 1000),
//     httpOnly: true
//   });
  
//   return ApiResponse.success(res, null, 'Logged out successfully');
// });

// // ============================================
// // REFRESH TOKEN
// // ============================================

// exports.refreshToken = asyncHandler(async (req, res) => {
//   const { refreshToken } = req.cookies || req.body;
  
//   if (!refreshToken) {
//     return ApiResponse.error(res, 'No refresh token provided', 401);
//   }
  
//   try {
//     // Verify refresh token
//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
//     // Find user
//     const user = await User.findById(decoded.id);
    
//     if (!user || user.refreshToken !== refreshToken) {
//       return ApiResponse.error(res, 'Invalid refresh token', 401);
//     }
    
//     // Generate new access token
//     const newAccessToken = user.generateAccessToken();
    
//     return ApiResponse.success(
//       res,
//       { accessToken: newAccessToken },
//       'Token refreshed successfully'
//     );
//   } catch (error) {
//     return ApiResponse.error(res, 'Invalid or expired refresh token', 401);
//   }
// });

// // ============================================
// // EMAIL VERIFICATION
// // ============================================

// exports.verifyEmail = asyncHandler(async (req, res) => {
//   const { token } = req.params;
  
//   // Hash token
//   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
//   // Find user with valid token
//   const user = await User.findOne({
//     emailVerificationToken: hashedToken,
//     emailVerificationExpires: { $gt: Date.now() }
//   });
  
//   if (!user) {
//     return ApiResponse.error(res, 'Invalid or expired verification token', 400);
//   }
  
//   // Update user
//   user.isEmailVerified = true;
//   user.emailVerificationToken = undefined;
//   user.emailVerificationExpires = undefined;
//   await user.save({ validateBeforeSave: false });
  
//   return ApiResponse.success(res, null, 'Email verified successfully');
// });

// // ============================================
// // RESEND VERIFICATION EMAIL
// // ============================================

// exports.resendVerificationEmail = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);
  
//   if (user.isEmailVerified) {
//     return ApiResponse.error(res, 'Email already verified', 400);
//   }
  
//   // Generate new token
//   const verificationToken = user.generateEmailVerificationToken();
//   await user.save({ validateBeforeSave: false });
  
//   // Send email
//   const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  
//   await emailService.sendVerificationEmail(user.email, user.name, verificationUrl);
  
//   return ApiResponse.success(res, null, 'Verification email sent');
// });

// // ============================================
// // FORGOT PASSWORD
// // ============================================

// exports.forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body;
  
//   const user = await User.findOne({ email });
  
//   if (!user) {
//     // Don't reveal if user exists
//     return ApiResponse.success(
//       res,
//       null,
//       'If an account exists, a password reset email will be sent'
//     );
//   }
  
//   // Generate reset token
//   const resetToken = user.generatePasswordResetToken();
//   await user.save({ validateBeforeSave: false });
  
//   // Send email
//   try {
//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
//     await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl);
    
//     return ApiResponse.success(
//       res,
//       null,
//       'Password reset email sent'
//     );
//   } catch (error) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });
    
//     return ApiResponse.error(
//       res,
//       'Error sending password reset email',
//       500
//     );
//   }
// });

// // ============================================
// // RESET PASSWORD
// // ============================================

// exports.resetPassword = asyncHandler(async (req, res) => {
//   const { token } = req.params;
//   const { password, passwordConfirm } = req.body;
  
//   if (password !== passwordConfirm) {
//     return ApiResponse.error(res, 'Passwords do not match', 400);
//   }
  
//   // Hash token
//   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
//   // Find user with valid token
//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() }
//   });
  
//   if (!user) {
//     return ApiResponse.error(res, 'Invalid or expired reset token', 400);
//   }
  
//   // Update password
//   user.password = password;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   user.lastPasswordChange = Date.now();
//   await user.save();
  
//   // Send confirmation email
//   await emailService.sendPasswordChangedEmail(user.email, user.name);
  
//   createSendToken(user, 200, res, 'Password reset successful');
// });

// // ============================================
// // UPDATE PASSWORD (Logged In)
// // ============================================

// exports.updatePassword = asyncHandler(async (req, res) => {
//   const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  
//   if (newPassword !== newPasswordConfirm) {
//     return ApiResponse.error(res, 'Passwords do not match', 400);
//   }
  
//   // Get user with password
//   const user = await User.findById(req.user._id).select('+password');
  
//   // Check current password
//   const isMatch = await user.comparePassword(currentPassword);
//   if (!isMatch) {
//     return ApiResponse.error(res, 'Current password is incorrect', 401);
//   }
  
//   // Update password
//   user.password = newPassword;
//   user.lastPasswordChange = Date.now();
//   await user.save();
  
//   createSendToken(user, 200, res, 'Password updated successfully');
// });

// // ============================================
// // GET CURRENT USER
// // ============================================

// exports.getMe = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);
  
//   return ApiResponse.success(res, { user });
// });

// // ============================================
// // UPDATE PROFILE
// // ============================================

// exports.updateProfile = asyncHandler(async (req, res) => {
//   // Fields that can be updated
//   const allowedFields = ['name', 'phone', 'preferences'];
  
//   const updates = {};
//   allowedFields.forEach(field => {
//     if (req.body[field] !== undefined) {
//       updates[field] = req.body[field];
//     }
//   });
  
//   const user = await User.findByIdAndUpdate(
//     req.user._id,
//     updates,
//     { new: true, runValidators: true }
//   );
  
//   return ApiResponse.success(res, { user }, 'Profile updated successfully');
// });