/**
 * Loan Model
 * MongoDB schema for loan documents
 */

const mongoose = require('mongoose');

// Import status utilities
const LoanStatus = {
  ACTIVE: 'active',
  DUE_SOON: 'dueSoon',
  OVERDUE: 'overdue',
  COMPLETED: 'completed',
};

// History Sub-document Schema
const historySchema = new mongoose.Schema(
  {
    prevDueDate: Date,
    newDueDate: Date,
    prevInterest: Number,
    newInterest: Number,
    changeType: {
      type: String,
      enum: ['due_date_extension', 'interest_update', 'both', 'initial'],
      required: true,
    },
    notes: String,
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Main Loan Schema
const loanSchema = new mongoose.Schema(
  {
    borrowerName: {
      type: String,
      required: [true, 'Borrower name is required'],
      trim: true,
    },
    borrowerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    borrowerPhone: {
      type: String,
      trim: true,
    },
    loanAmount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [0, 'Loan amount cannot be negative'],
    },
    loanGivenDate: {
      type: Date,
      required: [true, 'Loan given date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    extendedDueDate: {
      type: Date,
      default: null,
    },
    interestAmount: {
      type: Number,
      required: [true, 'Interest amount is required'],
      min: [0, 'Interest amount cannot be negative'],
    },
    increasedInterest: {
      type: Number,
      default: 0,
      min: [0, 'Increased interest cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      default: LoanStatus.ACTIVE,
    },
    notes: {
      type: String,
      trim: true,
    },
    history: [historySchema],
    isDeleted: {
      type: Boolean,
      default: false,
    },
        // NEW: User Association
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Loan must belong to a user']
    },
    
    // NEW: Organization/Multi-tenancy (optional for future)
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: false
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
loanSchema.index({ borrowerName: 'text' });
loanSchema.index({ dueDate: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ isDeleted: 1 });
// Add index for user queries
loanSchema.index({ createdBy: 1 });
loanSchema.index({ createdBy: 1, isDeleted: 1 });

// Virtual: Effective due date
loanSchema.virtual('effectiveDueDate').get(function () {
  return this.extendedDueDate || this.dueDate;
});

// Virtual: Total interest
loanSchema.virtual('totalInterest').get(function () {
  return this.interestAmount + (this.increasedInterest || 0);
});

// Virtual: Days remaining
loanSchema.virtual('daysRemaining').get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(this.extendedDueDate || this.dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Instance Methods
loanSchema.methods.extendDueDate = function (newDueDate, notes = '') {
  const prevDueDate = this.extendedDueDate || this.dueDate;
  
  if (new Date(newDueDate) <= new Date(prevDueDate)) {
    throw new Error('New due date must be after current due date');
  }

  this.history.push({
    prevDueDate,
    newDueDate,
    changeType: 'due_date_extension',
    notes: notes || 'Due date extended',
    updatedAt: new Date(),
  });

  this.extendedDueDate = newDueDate;
  return this;
};

loanSchema.methods.updateInterest = function (additionalInterest, notes = '') {
  const prevInterest = this.increasedInterest || 0;
  const newInterest = prevInterest + additionalInterest;

  if (additionalInterest < 0) {
    throw new Error('Additional interest cannot be negative');
  }

  this.history.push({
    prevInterest: this.interestAmount + prevInterest,
    newInterest: this.interestAmount + newInterest,
    changeType: 'interest_update',
    notes: notes || 'Interest increased',
    updatedAt: new Date(),
  });

  this.increasedInterest = newInterest;
  return this;
};

loanSchema.methods.markCompleted = function (notes = '') {
  this.status = LoanStatus.COMPLETED;
  this.history.push({
    changeType: 'status_change',
    notes: notes || 'Loan marked as completed',
    updatedAt: new Date(),
  });
  return this;
};

loanSchema.methods.softDelete = function () {
  this.isDeleted = true;
  return this;
};

// Static Methods
loanSchema.statics.findActive = function (filter = {}) {
  return this.find({ ...filter, isDeleted: false });
};

loanSchema.statics.findDueSoon = function (days = 2) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    isDeleted: false,
    status: { $ne: LoanStatus.COMPLETED },
    $or: [
      { extendedDueDate: { $gte: today, $lte: futureDate } },
      { extendedDueDate: null, dueDate: { $gte: today, $lte: futureDate } },
    ],
  });
};

loanSchema.statics.findOverdue = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.find({
    isDeleted: false,
    status: { $ne: LoanStatus.COMPLETED },
    $or: [
      { extendedDueDate: { $lt: today } },
      { extendedDueDate: null, dueDate: { $lt: today } },
    ],
  });
};

loanSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$loanAmount' },
        totalInterest: {
          $sum: { $add: ['$interestAmount', { $ifNull: ['$increasedInterest', 0] }] },
        },
      },
    },
  ]);

  const result = {
    total: 0,
    totalAmount: 0,
    totalInterest: 0,
    byStatus: {},
  };

  stats.forEach((stat) => {
    result.total += stat.count;
    result.totalAmount += stat.totalAmount;
    result.totalInterest += stat.totalInterest;
    result.byStatus[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount,
      totalInterest: stat.totalInterest,
    };
  });

  return result;
};

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;