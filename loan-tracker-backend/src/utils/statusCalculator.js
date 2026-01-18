/**
 * Loan Status Calculator Utility
 * Computes loan status based on due dates
 */

const LoanStatus = {
  ACTIVE: 'active',
  DUE_SOON: 'dueSoon',
  OVERDUE: 'overdue',
  COMPLETED: 'completed',
};

/**
 * Calculate the effective due date (extended or original)
 */
const getEffectiveDueDate = (loan) => {
  return loan.extendedDueDate || loan.dueDate;
};

/**
 * Calculate days remaining until due date
 */
const getDaysRemaining = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Calculate loan status based on due date
 * @param {Object} loan - Loan document
 * @param {Number} dueSoonThreshold - Days before due to mark as 'dueSoon' (default: 2)
 * @returns {String} - Status: active, dueSoon, overdue, completed
 */
const calculateStatus = (loan, dueSoonThreshold = 2) => {
  // If manually completed, keep that status
  if (loan.status === LoanStatus.COMPLETED) {
    return LoanStatus.COMPLETED;
  }

  const effectiveDueDate = getEffectiveDueDate(loan);
  const daysRemaining = getDaysRemaining(effectiveDueDate);

  if (daysRemaining < 0) {
    return LoanStatus.OVERDUE;
  }

  if (daysRemaining <= dueSoonThreshold) {
    return LoanStatus.DUE_SOON;
  }

  return LoanStatus.ACTIVE;
};

/**
 * Get status display info (for frontend)
 */
const getStatusInfo = (status) => {
  const statusMap = {
    [LoanStatus.ACTIVE]: {
      label: 'Active',
      color: 'green',
      priority: 4,
    },
    [LoanStatus.DUE_SOON]: {
      label: 'Due Soon',
      color: 'yellow',
      priority: 2,
    },
    [LoanStatus.OVERDUE]: {
      label: 'Overdue',
      color: 'red',
      priority: 1,
    },
    [LoanStatus.COMPLETED]: {
      label: 'Completed',
      color: 'gray',
      priority: 5,
    },
  };

  return statusMap[status] || statusMap[LoanStatus.ACTIVE];
};

/**
 * Batch update statuses for multiple loans
 */
const updateLoanStatuses = (loans, dueSoonThreshold = 2) => {
  return loans.map((loan) => {
    const loanObj = loan.toObject ? loan.toObject() : loan;
    return {
      ...loanObj,
      status: calculateStatus(loanObj, dueSoonThreshold),
      daysRemaining: getDaysRemaining(getEffectiveDueDate(loanObj)),
    };
  });
};

module.exports = {
  LoanStatus,
  calculateStatus,
  getDaysRemaining,
  getEffectiveDueDate,
  getStatusInfo,
  updateLoanStatuses,
};