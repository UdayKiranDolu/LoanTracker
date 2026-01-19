const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    //   unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Don't include password in queries by default
    },
    
    // Role & Permissions
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    
    // Verification & Status
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    
    // Tokens
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: String,
    
    // Security
    passwordChangedAt: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    
    // Profile
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    avatar: {
      type: String,
      default: null
    },
    
    // Preferences
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      smsNotifications: {
        type: Boolean,
        default: false
      },
      language: {
        type: String,
        default: 'en'
      }
    },
    
    // Audit
    lastLogin: Date,
    lastPasswordChange: Date
  },
  {
    timestamps: true
  }
);

// ============================================
// INDEXES
// ============================================
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ============================================
// MIDDLEWARE - Pre Save
// ============================================
// Hash password before saving
// userSchema.pre('save', async function(next) {
//   // Only hash if password is modified
//   if (!this.isModified('password')) return next();
  
//   // Hash password with cost of 12
//   this.password = await bcrypt.hash(this.password, 12);
  
//   // Set passwordChangedAt
//   if (!this.isNew) {
//     this.passwordChangedAt = Date.now() - 1000; // 1 sec before to ensure JWT is created after
//   }
  
//   next();
// });

userSchema.pre('save', async function(next) {
  // FIXED: Only hash if password field exists and is modified
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  
  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  
  // Set passwordChangedAt
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT Access Token
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

// Generate JWT Refresh Token
userSchema.methods.generateRefreshToken = function() {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  this.refreshToken = refreshToken;
  return refreshToken;
};

// Generate Email Verification Token
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Generate Password Reset Token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Check if password changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Otherwise increment
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return await this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 }
  });
};

// ============================================
// STATIC METHODS
// ============================================

// Find user by credentials
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email }).select('+password');
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }
  
  if (user.isLocked) {
    throw new Error('Account is locked. Try again later');
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incLoginAttempts();
    throw new Error('Invalid credentials');
  }
  
  // Reset login attempts on successful login
  await user.resetLoginAttempts();
  
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;