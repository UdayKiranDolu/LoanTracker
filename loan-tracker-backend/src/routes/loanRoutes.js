// /**
//  * Loan Routes
//  * API endpoints for loan operations
//  */

// const express = require('express');
// const router = express.Router();

// const {
//   getLoans,
//   getLoanById,
//   createLoan,
//   updateLoan,
//   deleteLoan,
//   extendDueDate,
//   updateInterest,
//   getLoansDueSoon,
//   getLoansOverdue,
//   getLoanStatistics,
//   markLoanCompleted,
// } = require('../controllers/loanController');

// const { loanValidationRules } = require('../middleware/validate');

// // ======================
// // Statistics & Status Routes (must be before :id routes)
// // ======================
// router.get('/statistics', getLoanStatistics);
// router.get('/status/duesoon', getLoansDueSoon);
// router.get('/status/overdue', getLoansOverdue);

// // ======================
// // CRUD Routes
// // ======================

// // GET /api/loans - Get all loans with filters
// router.get('/', loanValidationRules.list, getLoans);

// // POST /api/loans - Create new loan
// router.post('/', loanValidationRules.create, createLoan);

// // GET /api/loans/:id - Get single loan
// router.get('/:id', loanValidationRules.getById, getLoanById);

// // PUT /api/loans/:id - Update loan
// router.put('/:id', loanValidationRules.update, updateLoan);

// // DELETE /api/loans/:id - Delete loan (soft delete)
// router.delete('/:id', loanValidationRules.delete, deleteLoan);

// // ======================
// // Special Action Routes
// // ======================

// // POST /api/loans/:id/extend - Extend due date
// router.post('/:id/extend', loanValidationRules.extendDueDate, extendDueDate);

// // POST /api/loans/:id/interest - Update interest
// router.post('/:id/interest', loanValidationRules.updateInterest, updateInterest);

// // POST /api/loans/:id/complete - Mark as completed
// router.post('/:id/complete', loanValidationRules.getById, markLoanCompleted);

// module.exports = router;






/**
 * Loan Routes
 * API endpoints for loan operations
 */

const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/loanController');

const { loanValidationRules } = require('../middleware/validate');

// NEW: Import authentication middleware
const { protect, restrictTo } = require('../middleware/auth');

// ======================
// NEW: Apply authentication to all routes
// All routes below this require valid JWT token
// ======================
router.use(protect);

// ======================
// Statistics & Status Routes (must be before :id routes)
// ======================
router.get('/statistics', getLoanStatistics);
router.get('/status/duesoon', getLoansDueSoon);
router.get('/status/overdue', getLoansOverdue);

// ======================
// CRUD Routes
// ======================

// GET /api/loans - Get all loans with filters
// NEW: Users see only their loans, Admins see all loans
router.get('/', loanValidationRules.list, getLoans);

// POST /api/loans - Create new loan
// NEW: Automatically associates loan with logged-in user
router.post('/', loanValidationRules.create, createLoan);

// GET /api/loans/:id - Get single loan
// NEW: Users can only access their own loans
router.get('/:id', loanValidationRules.getById, getLoanById);

// PUT /api/loans/:id - Update loan
// NEW: Users can only update their own loans
router.put('/:id', loanValidationRules.update, updateLoan);

// DELETE /api/loans/:id - Delete loan (soft delete)
// NEW: Both users and admins can delete loans (users can only delete their own)
// NOTE: To make this admin-only, add: restrictTo('admin') before deleteLoan
router.delete('/:id', loanValidationRules.delete, deleteLoan);

// ======================
// Special Action Routes
// ======================

// POST /api/loans/:id/extend - Extend due date
// NEW: Users can only extend their own loans
router.post('/:id/extend', loanValidationRules.extendDueDate, extendDueDate);

// POST /api/loans/:id/interest - Update interest
// NEW: Users can only update interest on their own loans
router.post('/:id/interest', loanValidationRules.updateInterest, updateInterest);

// POST /api/loans/:id/complete - Mark as completed
// NEW: Users can only mark their own loans as completed
router.post('/:id/complete', loanValidationRules.getById, markLoanCompleted);

module.exports = router;