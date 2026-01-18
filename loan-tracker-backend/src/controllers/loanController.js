/**
 * Loan Controller
 * Handles all loan-related business logic
 */

const Loan = require('../models/Loan');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { calculateStatus, updateLoanStatuses } = require('../utils/statusCalculator');

// Helper to ensure status is set
const ensureLoanStatus = (loan) => {
  if (loan.status !== 'completed') {
    loan.status = calculateStatus(loan);
  }
  return loan;
};

// ======================
// @desc    Get all loans with filtering, sorting, and pagination
// @route   GET /api/loans
// @access  Public
// ======================
const getLoans = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  // Build query
  const query = { isDeleted: false };

  // Status filter
  if (status) {
    query.status = status;
  }

  // Search filter
  if (search) {
    query.borrowerName = { $regex: search, $options: 'i' };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [loans, totalItems] = await Promise.all([
    Loan.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
    Loan.countDocuments(query),
  ]);

  // Update statuses dynamically
  const loansWithUpdatedStatus = updateLoanStatuses(loans);

  // Pagination info
  const totalPages = Math.ceil(totalItems / limit);

  return ApiResponse.paginated(
    res,
    loansWithUpdatedStatus,
    {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      totalItems,
    },
    'Loans retrieved successfully'
  );
});

// ======================
// @desc    Get single loan by ID
// @route   GET /api/loans/:id
// @access  Public
// ======================
const getLoanById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const loan = await Loan.findOne({ _id: id, isDeleted: false });

  if (!loan) {
    return ApiResponse.notFound(res, 'Loan not found');
  }

  // Update status dynamically
  const loanObj = loan.toObject();
  loanObj.status = calculateStatus(loan);
  loanObj.daysRemaining = loan.daysRemaining;

  return ApiResponse.success(res, loanObj, 'Loan retrieved successfully');
});

// ======================
// @desc    Create new loan
// @route   POST /api/loans
// @access  Public
// ======================
const createLoan = asyncHandler(async (req, res) => {
  const {
    borrowerName,
    borrowerEmail,
    borrowerPhone,
    loanAmount,
    loanGivenDate,
    dueDate,
    interestAmount,
    notes,
  } = req.body;

  const loan = new Loan({
    borrowerName,
    borrowerEmail,
    borrowerPhone,
    loanAmount,
    loanGivenDate,
    dueDate,
    interestAmount,
    notes,
    history: [{
      prevDueDate: null,
      newDueDate: dueDate,
      prevInterest: null,
      newInterest: interestAmount,
      changeType: 'initial',
      notes: 'Loan created',
      updatedAt: new Date(),
    }]
  });

  // Set initial status
  loan.status = calculateStatus(loan);
  
  await loan.save();

  return ApiResponse.created(res, loan, 'Loan created successfully');
});

// ======================
// @desc    Update loan
// @route   PUT /api/loans/:id
// @access  Public
// ======================
const updateLoan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find loan
  let loan = await Loan.findOne({ _id: id, isDeleted: false });

  if (!loan) {
    return ApiResponse.notFound(res, 'Loan not found');
  }

  // Fields that can be updated directly
  const allowedUpdates = [
    'borrowerName',
    'borrowerEmail',
    'borrowerPhone',
    'loanAmount',
    'loanGivenDate',
    'dueDate',
    'interestAmount',
    'notes',
    'status',
  ];

  // Apply updates
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      loan[field] = req.body[field];
    }
  });

  // Save (triggers pre-save hooks)
  await loan.save();

  return ApiResponse.success(res, loan, 'Loan updated successfully');
});

// ======================
// @desc    Delete loan (soft delete)
// @route   DELETE /api/loans/:id
// @access  Public
// ======================
const deleteLoan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const loan = await Loan.findOne({ _id: id, isDeleted: false });

  if (!loan) {
    return ApiResponse.notFound(res, 'Loan not found');
  }

  // Soft delete
  loan.softDelete();
  await loan.save();

  return ApiResponse.success(res, null, 'Loan deleted successfully');
});

// ======================
// @desc    Extend loan due date
// @route   POST /api/loans/:id/extend
// @access  Public
// ======================
const extendDueDate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { extendedDueDate, notes } = req.body;

  const loan = await Loan.findOne({ _id: id, isDeleted: false });

  if (!loan) {
    return ApiResponse.notFound(res, 'Loan not found');
  }

  try {
    loan.extendDueDate(new Date(extendedDueDate), notes);
    await loan.save();

    return ApiResponse.success(res, loan, 'Due date extended successfully');
  } catch (error) {
    return ApiResponse.badRequest(res, error.message);
  }
});

// ======================
// @desc    Update loan interest
// @route   POST /api/loans/:id/interest
// @access  Public
// ======================
const updateInterest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { additionalInterest, notes } = req.body;

  const loan = await Loan.findOne({ _id: id, isDeleted: false });

  if (!loan) {
    return ApiResponse.notFound(res, 'Loan not found');
  }

  try {
    loan.updateInterest(additionalInterest, notes);
    await loan.save();

    return ApiResponse.success(res, loan, 'Interest updated successfully');
  } catch (error) {
    return ApiResponse.badRequest(res, error.message);
  }
});

// ======================
// @desc    Get loans due soon
// @route   GET /api/loans/status/duesoon
// @access  Public
// ======================
const getLoansDueSoon = asyncHandler(async (req, res) => {
  const { days = 2 } = req.query;

  const loans = await Loan.findDueSoon(parseInt(days));
  const loansWithStatus = updateLoanStatuses(loans);

  return ApiResponse.success(
    res,
    loansWithStatus,
    `Found ${loans.length} loans due within ${days} days`
  );
});

// ======================
// @desc    Get overdue loans
// @route   GET /api/loans/status/overdue
// @access  Public
// ======================
const getLoansOverdue = asyncHandler(async (req, res) => {
  const loans = await Loan.findOverdue();
  const loansWithStatus = updateLoanStatuses(loans);

  return ApiResponse.success(
    res,
    loansWithStatus,
    `Found ${loans.length} overdue loans`
  );
});

// ======================
// @desc    Get loan statistics
// @route   GET /api/loans/statistics
// @access  Public
// ======================
const getLoanStatistics = asyncHandler(async (req, res) => {
  const stats = await Loan.getStatistics();

  // Get due soon and overdue counts
  const [dueSoonCount, overdueCount] = await Promise.all([
    Loan.findDueSoon(2).countDocuments(),
    Loan.findOverdue().countDocuments(),
  ]);

  stats.dueSoonCount = dueSoonCount;
  stats.overdueCount = overdueCount;

  return ApiResponse.success(res, stats, 'Statistics retrieved successfully');
});

// ======================
// @desc    Mark loan as completed
// @route   POST /api/loans/:id/complete
// @access  Public
// ======================
const markLoanCompleted = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  const loan = await Loan.findOne({ _id: id, isDeleted: false });

  if (!loan) {
    return ApiResponse.notFound(res, 'Loan not found');
  }

  loan.markCompleted(notes);
  await loan.save();

  return ApiResponse.success(res, loan, 'Loan marked as completed');
});

module.exports = {
  getLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
  extendDueDate,
  updateInterest,
  getLoansDueSoon,
  getLoansOverdue,
  getLoanStatistics,
  markLoanCompleted,
};