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
router.get('/', loanValidationRules.list, getLoans);

// POST /api/loans - Create new loan
router.post('/', loanValidationRules.create, createLoan);

// GET /api/loans/:id - Get single loan
router.get('/:id', loanValidationRules.getById, getLoanById);

// PUT /api/loans/:id - Update loan
router.put('/:id', loanValidationRules.update, updateLoan);

// DELETE /api/loans/:id - Delete loan (soft delete)
router.delete('/:id', loanValidationRules.delete, deleteLoan);

// ======================
// Special Action Routes
// ======================

// POST /api/loans/:id/extend - Extend due date
router.post('/:id/extend', loanValidationRules.extendDueDate, extendDueDate);

// POST /api/loans/:id/interest - Update interest
router.post('/:id/interest', loanValidationRules.updateInterest, updateInterest);

// POST /api/loans/:id/complete - Mark as completed
router.post('/:id/complete', loanValidationRules.getById, markLoanCompleted);

module.exports = router;