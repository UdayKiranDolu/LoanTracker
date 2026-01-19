// /**
//  * Application Constants
//  */

// export const LOAN_STATUS = {
//   ACTIVE: 'active',
//   DUE_SOON: 'dueSoon',
//   OVERDUE: 'overdue',
//   COMPLETED: 'completed',
// };

// export const STATUS_CONFIG = {
//   [LOAN_STATUS.ACTIVE]: {
//     label: 'Active',
//     color: 'green',
//     bgColor: 'bg-green-100',
//     textColor: 'text-green-800',
//     borderColor: 'border-green-500',
//     dotColor: 'bg-green-500',
//   },
//   [LOAN_STATUS.DUE_SOON]: {
//     label: 'Due Soon',
//     color: 'yellow',
//     bgColor: 'bg-yellow-100',
//     textColor: 'text-yellow-800',
//     borderColor: 'border-yellow-500',
//     dotColor: 'bg-yellow-500',
//   },
//   [LOAN_STATUS.OVERDUE]: {
//     label: 'Overdue',
//     color: 'red',
//     bgColor: 'bg-red-100',
//     textColor: 'text-red-800',
//     borderColor: 'border-red-500',
//     dotColor: 'bg-red-500',
//   },
//   [LOAN_STATUS.COMPLETED]: {
//     label: 'Completed',
//     color: 'gray',
//     bgColor: 'bg-gray-100',
//     textColor: 'text-gray-800',
//     borderColor: 'border-gray-500',
//     dotColor: 'bg-gray-500',
//   },
// };

// // export const API_ENDPOINTS = {
// //   LOANS: '/loans',
// //   LOAN_BY_ID: (id) => `/loans/${id}`,
// //   EXTEND_DUE_DATE: (id) => `/loans/${id}/extend`,
// //   UPDATE_INTEREST: (id) => `/loans/${id}/interest`,
// //   LOANS_DUE_SOON: '/loans/status/duesoon',
// //   LOANS_OVERDUE: '/loans/status/overdue',
// // };


// export const API_ENDPOINTS = {
//   LOANS: '/loans',
//   LOAN_BY_ID: (id) => `/loans/${id}`,
//   LOANS_DUE_SOON: '/loans/status/duesoon',
//   LOANS_OVERDUE: '/loans/status/overdue',
//   EXTEND_DUE_DATE: (id) => `/loans/${id}/extend`,
//   UPDATE_INTEREST: (id) => `/loans/${id}/interest`,
// };


// export const DATE_FORMATS = {
//   DISPLAY: 'MMM dd, yyyy',
//   INPUT: 'yyyy-MM-dd',
//   FULL: 'MMMM dd, yyyy',
//   WITH_TIME: 'MMM dd, yyyy HH:mm',
// };

// export const PAGINATION = {
//   DEFAULT_PAGE: 1,
//   DEFAULT_LIMIT: 10,
//   LIMIT_OPTIONS: [10, 25, 50, 100],
// };

// export const MESSAGES = {
//   LOAN_CREATED: 'Loan created successfully',
//   LOAN_UPDATED: 'Loan updated successfully',
//   LOAN_DELETED: 'Loan deleted successfully',
//   DUE_DATE_EXTENDED: 'Due date extended successfully',
//   INTEREST_UPDATED: 'Interest updated successfully',
//   ERROR_GENERIC: 'Something went wrong. Please try again.',
//   ERROR_NOT_FOUND: 'Loan not found',
//   CONFIRM_DELETE: 'Are you sure you want to delete this loan?',
// };











/**
 * Application Constants
 */

// ============================================
// API ENDPOINTS
// ============================================
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/update-profile',
    UPDATE_PASSWORD: '/auth/update-password',
    VERIFY_EMAIL: (token) => `/auth/verify-email/${token}`,
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: (token) => `/auth/reset-password/${token}`,
  },

  // Loan endpoints
  LOANS: '/loans',
  LOAN_BY_ID: (id) => `/loans/${id}`,
  EXTEND_DUE_DATE: (id) => `/loans/${id}/extend`,
  UPDATE_INTEREST: (id) => `/loans/${id}/interest`,
  MARK_COMPLETED: (id) => `/loans/${id}/complete`,
  LOANS_DUE_SOON: '/loans/status/duesoon',
  LOANS_OVERDUE: '/loans/status/overdue',
  LOAN_STATISTICS: '/loans/statistics',

  // Notification endpoints (if needed)
  NOTIFICATIONS: {
    TEST_CONNECTION: '/notifications/test-connection',
    TEST_EMAIL: '/notifications/test-email',
    TRIGGER_REMINDERS: '/notifications/trigger-reminders',
    SCHEDULER_STATUS: '/notifications/scheduler-status',
  }
};

// ============================================
// LOAN STATUS
// ============================================
export const LOAN_STATUS = {
  ACTIVE: 'active',
  DUE_SOON: 'dueSoon',
  OVERDUE: 'overdue',
  COMPLETED: 'completed'
};

// ============================================
// STATUS COLORS
// ============================================
export const STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  },
  dueSoon: {
    label: 'Due Soon',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  overdue: {
    label: 'Overdue',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  },
  completed: {
    label: 'Completed',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200'
  }
};

// ============================================
// USER ROLES
// ============================================
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// ============================================
// PAGINATION
// ============================================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [5, 10, 20, 50, 100]
};

// ============================================
// DATE FORMATS
// ============================================
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  FULL: 'MMMM dd, yyyy HH:mm',
  TIME: 'HH:mm'
};

// ============================================
// VALIDATION
// ============================================
export const VALIDATION = {
  MIN_LOAN_AMOUNT: 0,
  MAX_LOAN_AMOUNT: 10000000,
  MIN_INTEREST: 0,
  MAX_INTEREST: 1000000,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_NOTES_LENGTH: 0,
  MAX_NOTES_LENGTH: 1000
};

// ============================================
// CHANGE TYPES
// ============================================
export const CHANGE_TYPES = {
  INITIAL: 'initial',
  DUE_DATE_EXTENSION: 'due_date_extension',
  INTEREST_UPDATE: 'interest_update',
  LOAN_UPDATE: 'loan_update',
  COMPLETION: 'completion'
};

// ============================================
// SORT OPTIONS
// ============================================
export const SORT_OPTIONS = {
  CREATED_AT_DESC: { field: 'createdAt', order: 'desc', label: 'Newest First' },
  CREATED_AT_ASC: { field: 'createdAt', order: 'asc', label: 'Oldest First' },
  DUE_DATE_ASC: { field: 'dueDate', order: 'asc', label: 'Due Date (Earliest)' },
  DUE_DATE_DESC: { field: 'dueDate', order: 'desc', label: 'Due Date (Latest)' },
  AMOUNT_ASC: { field: 'loanAmount', order: 'asc', label: 'Amount (Low to High)' },
  AMOUNT_DESC: { field: 'loanAmount', order: 'desc', label: 'Amount (High to Low)' },
  NAME_ASC: { field: 'borrowerName', order: 'asc', label: 'Name (A-Z)' },
  NAME_DESC: { field: 'borrowerName', order: 'desc', label: 'Name (Z-A)' }
};

// ============================================
// LOCAL STORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme'
};

// ============================================
// APP INFO
// ============================================
export const APP_INFO = {
  NAME: 'Loan Tracker',
  VERSION: '1.0.0',
  DESCRIPTION: 'Manage and track loans efficiently'
};