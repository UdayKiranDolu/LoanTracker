/**
 * Validation Middleware
 * Uses express-validator for request validation
 */

const { body, param, query, validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    return ApiResponse.validationError(res, formattedErrors);
  }

  next();
};

// ======================
// Loan Validation Rules
// ======================

const loanValidationRules = {
  // Create loan validation
  create: [
    body('borrowerName')
      .trim()
      .notEmpty()
      .withMessage('Borrower name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Borrower name must be between 2 and 100 characters'),

    body('borrowerEmail')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),

    body('borrowerPhone')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 20 })
      .withMessage('Phone number cannot exceed 20 characters'),

    body('loanAmount')
      .notEmpty()
      .withMessage('Loan amount is required')
      .isFloat({ min: 0 })
      .withMessage('Loan amount must be a positive number')
      .toFloat(),

    body('loanGivenDate')
      .notEmpty()
      .withMessage('Loan given date is required')
      .isISO8601()
      .withMessage('Please provide a valid date')
      .toDate(),

    body('dueDate')
      .notEmpty()
      .withMessage('Due date is required')
      .isISO8601()
      .withMessage('Please provide a valid date')
      .toDate()
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.loanGivenDate)) {
          throw new Error('Due date must be after loan given date');
        }
        return true;
      }),

    body('interestAmount')
      .notEmpty()
      .withMessage('Interest amount is required')
      .isFloat({ min: 0 })
      .withMessage('Interest amount must be a positive number')
      .toFloat(),

    body('notes')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes cannot exceed 1000 characters'),

    handleValidationErrors,
  ],

  // Update loan validation
  update: [
    param('id').isMongoId().withMessage('Invalid loan ID'),

    body('borrowerName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Borrower name cannot be empty')
      .isLength({ min: 2, max: 100 })
      .withMessage('Borrower name must be between 2 and 100 characters'),

    body('borrowerEmail')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),

    body('borrowerPhone')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 20 })
      .withMessage('Phone number cannot exceed 20 characters'),

    body('loanAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Loan amount must be a positive number')
      .toFloat(),

    body('loanGivenDate')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid date')
      .toDate(),

    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid date')
      .toDate(),

    body('interestAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Interest amount must be a positive number')
      .toFloat(),

    body('notes')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes cannot exceed 1000 characters'),

    body('status')
      .optional()
      .isIn(['active', 'dueSoon', 'overdue', 'completed'])
      .withMessage('Invalid status value'),

    handleValidationErrors,
  ],

  // Extend due date validation
  extendDueDate: [
    param('id').isMongoId().withMessage('Invalid loan ID'),

    body('extendedDueDate')
      .notEmpty()
      .withMessage('Extended due date is required')
      .isISO8601()
      .withMessage('Please provide a valid date')
      .toDate(),

    body('notes')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),

    handleValidationErrors,
  ],

  // Update interest validation
  updateInterest: [
    param('id').isMongoId().withMessage('Invalid loan ID'),

    body('additionalInterest')
      .notEmpty()
      .withMessage('Additional interest amount is required')
      .isFloat({ min: 0 })
      .withMessage('Additional interest must be a positive number')
      .toFloat(),

    body('notes')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),

    handleValidationErrors,
  ],

  // Get by ID validation
  getById: [
    param('id').isMongoId().withMessage('Invalid loan ID'),
    handleValidationErrors,
  ],

  // Delete validation
  delete: [
    param('id').isMongoId().withMessage('Invalid loan ID'),
    handleValidationErrors,
  ],

  // List/Search validation
  list: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),

    query('status')
      .optional()
      .isIn(['active', 'dueSoon', 'overdue', 'completed', ''])
      .withMessage('Invalid status filter'),

    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search term cannot exceed 100 characters'),

    query('sortBy')
      .optional()
      .isIn(['borrowerName', 'loanAmount', 'dueDate', 'createdAt', 'status'])
      .withMessage('Invalid sort field'),

    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),

    handleValidationErrors,
  ],
};

module.exports = {
  loanValidationRules,
  handleValidationErrors,
};