/**
 * Loan Service - API calls for loan operations
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const loanService = {
  /**
   * Get all loans with optional filters
   * @param {Object} params - Query parameters (page, limit, status, search)
   */
  getAll: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.LOANS, { params });
    return response.data; // FIXED: Return response.data
  },

  /**
   * Get single loan by ID
   * @param {string} id - Loan ID
   */
  getById: async (id) => {
    const response = await api.get(API_ENDPOINTS.LOAN_BY_ID(id));
    return response.data; // FIXED: Return response.data
  },

  /**
   * Create new loan
   * @param {Object} loanData - Loan data
   */
  create: async (loanData) => {
    const response = await api.post(API_ENDPOINTS.LOANS, loanData);
    return response.data; // FIXED: Return response.data
  },

  /**
   * Update existing loan
   * @param {string} id - Loan ID
   * @param {Object} loanData - Updated loan data
   */
  update: async (id, loanData) => {
    const response = await api.put(API_ENDPOINTS.LOAN_BY_ID(id), loanData);
    return response.data; // FIXED: Return response.data
  },

  /**
   * Delete loan
   * @param {string} id - Loan ID
   */
  delete: async (id) => {
    const response = await api.delete(API_ENDPOINTS.LOAN_BY_ID(id));
    return response.data; // FIXED: Return response.data
  },

  /**
   * Extend due date
   * @param {string} id - Loan ID
   * @param {Object} data - { extendedDueDate, notes }
   */
  extendDueDate: async (id, data) => {
    const response = await api.post(API_ENDPOINTS.EXTEND_DUE_DATE(id), data);
    return response.data; // FIXED: Return response.data
  },

  /**
   * Update interest
   * @param {string} id - Loan ID
   * @param {Object} data - { additionalInterest, notes }
   */
  updateInterest: async (id, data) => {
    const response = await api.post(API_ENDPOINTS.UPDATE_INTEREST(id), data);
    return response.data; // FIXED: Return response.data
  },

  /**
   * Mark loan as completed
   * @param {string} id - Loan ID
   * @param {string} notes - Completion notes
   */
  markCompleted: async (id, notes = '') => {
    const response = await api.post(API_ENDPOINTS.MARK_COMPLETED(id), { notes });
    return response.data; // FIXED: Return response.data
  },

  /**
   * Get loans due soon
   * @param {number} days - Number of days (default: 2)
   */
  getDueSoon: async (days = 2) => {
    const response = await api.get(API_ENDPOINTS.LOANS_DUE_SOON, { 
      params: { days } 
    });
    return response.data; // FIXED: Return response.data
  },

  /**
   * Get overdue loans
   */
  getOverdue: async () => {
    const response = await api.get(API_ENDPOINTS.LOANS_OVERDUE);
    return response.data; // FIXED: Return response.data
  },

  /**
   * Get loan statistics
   */
  getStatistics: async () => {
    const response = await api.get(API_ENDPOINTS.LOAN_STATISTICS);
    return response.data; // FIXED: Return response.data
  }
};

export default loanService;