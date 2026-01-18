/**
 * Helper Utility Functions
 */

import { format, parseISO, differenceInDays, isValid } from 'date-fns';
import { DATE_FORMATS, LOAN_STATUS } from './constants';

/**
 * Format date for display
 */
export const formatDate = (date, formatStr = DATE_FORMATS.DISPLAY) => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

/**
 * Format date for input fields
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, DATE_FORMATS.INPUT);
  } catch (error) {
    return '';
  }
};

/**
 * Calculate days remaining until due date
 */
export const getDaysRemaining = (dueDate) => {
  if (!dueDate) return null;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    due.setHours(0, 0, 0, 0);
    
    return differenceInDays(due, today);
  } catch (error) {
    return null;
  }
};

/**
 * Get effective due date (extended or original)
 */
export const getEffectiveDueDate = (loan) => {
  return loan.extendedDueDate || loan.dueDate;
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Get days remaining text
 */
export const getDaysRemainingText = (dueDate) => {
  const days = getDaysRemaining(dueDate);
  
  if (days === null) return '-';
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day left';
  if (days > 1) return `${days} days left`;
  if (days === -1) return '1 day overdue';
  return `${Math.abs(days)} days overdue`;
};

/**
 * Calculate loan status from due date
 */
export const calculateStatus = (loan, dueSoonThreshold = 2) => {
  if (loan.status === LOAN_STATUS.COMPLETED) {
    return LOAN_STATUS.COMPLETED;
  }

  const effectiveDueDate = getEffectiveDueDate(loan);
  const daysRemaining = getDaysRemaining(effectiveDueDate);

  if (daysRemaining === null) return LOAN_STATUS.ACTIVE;
  if (daysRemaining < 0) return LOAN_STATUS.OVERDUE;
  if (daysRemaining <= dueSoonThreshold) return LOAN_STATUS.DUE_SOON;
  
  return LOAN_STATUS.ACTIVE;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Classify error for user-friendly messages
 */
export const classifyError = (error) => {
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }
  
  const status = error.response.status;
  const message = error.response.data?.message;
  
  switch (status) {
    case 400:
      return message || 'Invalid request. Please check your input.';
    case 404:
      return message || 'Resource not found.';
    case 422:
      return message || 'Validation error. Please check your input.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return message || 'An unexpected error occurred.';
  }
};