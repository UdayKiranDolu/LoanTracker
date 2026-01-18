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
    return response;
  },

  /**
   * Get single loan by ID
   * @param {string} id - Loan ID
   */
  getById: async (id) => {
    const response = await api.get(API_ENDPOINTS.LOAN_BY_ID(id));
    return response;
  },

  /**
   * Create new loan
   * @param {Object} loanData - Loan data
   */
  create: async (loanData) => {
    const response = await api.post(API_ENDPOINTS.LOANS, loanData);
    return response;
  },

  /**
   * Update existing loan
   * @param {string} id - Loan ID
   * @param {Object} loanData - Updated loan data
   */
  update: async (id, loanData) => {
    const response = await api.put(API_ENDPOINTS.LOAN_BY_ID(id), loanData);
    return response;
  },

  /**
   * Delete loan
   * @param {string} id - Loan ID
   */
  delete: async (id) => {
    const response = await api.delete(API_ENDPOINTS.LOAN_BY_ID(id));
    return response;
  },

  /**
   * Extend due date
   * @param {string} id - Loan ID
   * @param {Object} data - { extendedDueDate }
   */
  extendDueDate: async (id, data) => {
    const response = await api.post(API_ENDPOINTS.EXTEND_DUE_DATE(id), data);
    return response;
  },

  /**
   * Update interest
   * @param {string} id - Loan ID
   * @param {Object} data - { increasedInterest }
   */
  updateInterest: async (id, data) => {
    const response = await api.post(API_ENDPOINTS.UPDATE_INTEREST(id), data);
    return response;
  },

  /**
   * Get loans due soon
   */
  getDueSoon: async () => {
    const response = await api.get(API_ENDPOINTS.LOANS_DUE_SOON);
    return response;
  },

  /**
   * Get overdue loans
   */
  getOverdue: async () => {
    const response = await api.get(API_ENDPOINTS.LOANS_OVERDUE);
    return response;
  },
};

export default loanService;