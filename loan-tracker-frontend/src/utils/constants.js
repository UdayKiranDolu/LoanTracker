/**
 * Application Constants
 */

export const LOAN_STATUS = {
  ACTIVE: 'active',
  DUE_SOON: 'dueSoon',
  OVERDUE: 'overdue',
  COMPLETED: 'completed',
};

export const STATUS_CONFIG = {
  [LOAN_STATUS.ACTIVE]: {
    label: 'Active',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-500',
    dotColor: 'bg-green-500',
  },
  [LOAN_STATUS.DUE_SOON]: {
    label: 'Due Soon',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-500',
    dotColor: 'bg-yellow-500',
  },
  [LOAN_STATUS.OVERDUE]: {
    label: 'Overdue',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-500',
    dotColor: 'bg-red-500',
  },
  [LOAN_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-500',
    dotColor: 'bg-gray-500',
  },
};

export const API_ENDPOINTS = {
  LOANS: '/loans',
  LOAN_BY_ID: (id) => `/loans/${id}`,
  EXTEND_DUE_DATE: (id) => `/loans/${id}/extend`,
  UPDATE_INTEREST: (id) => `/loans/${id}/interest`,
  LOANS_DUE_SOON: '/loans/status/duesoon',
  LOANS_OVERDUE: '/loans/status/overdue',
};

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  FULL: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
};

export const MESSAGES = {
  LOAN_CREATED: 'Loan created successfully',
  LOAN_UPDATED: 'Loan updated successfully',
  LOAN_DELETED: 'Loan deleted successfully',
  DUE_DATE_EXTENDED: 'Due date extended successfully',
  INTEREST_UPDATED: 'Interest updated successfully',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_NOT_FOUND: 'Loan not found',
  CONFIRM_DELETE: 'Are you sure you want to delete this loan?',
};