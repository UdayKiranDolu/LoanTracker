/**
 * Custom Hook for Loan Operations
 * Handles CRUD operations and state management for loans
 */

import { useState, useCallback } from 'react';
import loanService from '../services/loanService';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { classifyError } from '../utils/helpers';

const useLoans = () => {
  const {
    loans,
    setLoans,
    addLoan,
    updateLoan,
    deleteLoan,
    setLoading,
    setError,
    filters,
    pagination,
    setPagination,
  } = useAppContext();

  const [localLoading, setLocalLoading] = useState(false);

  /**
   * Fetch all loans with filters
   */
  const fetchLoans = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        status: params.status !== undefined ? params.status : filters.status,
        search: params.search !== undefined ? params.search : filters.search,
        sortBy: params.sortBy || filters.sortBy,
        sortOrder: params.sortOrder || filters.sortOrder,
      };

      // FIXED: Response now comes as response.data from loanService
      const response = await loanService.getAll(queryParams);

      if (response && response.success) {
        // FIXED: Data is in response.data
        setLoans(response.data || []);
        
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }

      return response;
    } catch (error) {
      const errorMsg = classifyError(error);
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setLoans, setPagination, pagination, filters]);

  /**
   * Fetch single loan by ID
   */
  const fetchLoanById = useCallback(async (id) => {
    try {
      setLocalLoading(true);
      
      // FIXED: Response now comes as response.data from loanService
      const response = await loanService.getById(id);

      if (response && response.success) {
        // FIXED: Return the loan data from response.data
        return response.data;
      }
      
      // Handle case where response doesn't have success flag
      if (response && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      const errorMsg = classifyError(error);
      toast.error(errorMsg);
      return null;
    } finally {
      setLocalLoading(false);
    }
  }, []);

  /**
   * Create new loan
   */
  const createLoan = useCallback(async (loanData) => {
    try {
      setLocalLoading(true);
      
      // FIXED: Response structure updated
      const response = await loanService.create(loanData);

      if (response && response.success) {
        addLoan(response.data);
        toast.success(response.message || 'Loan created successfully');
        return response.data;
      }
      
      return null;
    } catch (error) {
      const errorMsg = classifyError(error);
      toast.error(errorMsg);
      return null;
    } finally {
      setLocalLoading(false);
    }
  }, [addLoan]);

  /**
   * Update existing loan
   */
  const updateExistingLoan = useCallback(async (id, loanData) => {
    try {
      setLocalLoading(true);
      
      // FIXED: Response structure updated
      const response = await loanService.update(id, loanData);

      if (response && response.success) {
        updateLoan(response.data);
        toast.success(response.message || 'Loan updated successfully');
        return response.data;
      }
      
      return null;
    } catch (error) {
      const errorMsg = classifyError(error);
      toast.error(errorMsg);
      return null;
    } finally {
      setLocalLoading(false);
    }
  }, [updateLoan]);

  /**
   * Delete loan
   */
  const removeLoan = useCallback(async (id) => {
    try {
      setLocalLoading(true);
      
      // FIXED: Response structure updated
      const response = await loanService.delete(id);

      if (response && response.success) {
        deleteLoan(id);
        toast.success(response.message || 'Loan deleted successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      const errorMsg = classifyError(error);
      toast.error(errorMsg);
      return false;
    } finally {
      setLocalLoading(false);
    }
  }, [deleteLoan]);

  /**
   * Extend due date
   */
  const extendLoanDueDate = useCallback(async (id, extendedDueDate, notes) => {
    try {
      setLocalLoading(true);
      
      // FIXED: Response structure updated
      const response = await loanService.extendDueDate(id, {
        extendedDueDate,
        notes,
      });

      if (response && response.success) {
        updateLoan(response.data);
        toast.success(response.message || 'Due date extended successfully');
        return response.data;
      }
      
      return null;
    } catch (error) {
      const errorMsg = classifyError(error);
      toast.error(errorMsg);
      return null;
    } finally {
      setLocalLoading(false);
    }
  }, [updateLoan]);

  /**
   * Update interest
   */
  const updateLoanInterest = useCallback(async (id, additionalInterest, notes) => {
    try {
      setLocalLoading(true);
      
      // FIXED: Response structure updated
      const response = await loanService.updateInterest(id, {
        additionalInterest,
        notes,
      });

      if (response && response.success) {
        updateLoan(response.data);
        toast.success(response.message || 'Interest updated successfully');
        return response.data;
      }
      
      return null;
    } catch (error) {
      const errorMsg = classifyError(error);
      toast.error(errorMsg);
      return null;
    } finally {
      setLocalLoading(false);
    }
  }, [updateLoan]);

  /**
   * Mark loan as completed
   * ADDED: New method for marking loans as completed
   */
  const markLoanCompleted = useCallback(async (id, notes = '') => {
    try {
      setLocalLoading(true);
      
      const response = await loanService.markCompleted(id, notes);

      if (response && response.success) {
        updateLoan(response.data);
        toast.success(response.message || 'Loan marked as completed');
        return response.data;
      }
      
      return null;
    } catch (error) {
      const errorMsg = classifyError(error);
      toast.error(errorMsg);
      return null;
    } finally {
      setLocalLoading(false);
    }
  }, [updateLoan]);

  /**
   * Fetch loans due soon
   */
  const fetchDueSoonLoans = useCallback(async (days = 2) => {
    try {
      // FIXED: Response structure updated
      const response = await loanService.getDueSoon(days);
      
      if (response && response.success) {
        return response.data || [];
      }
      
      // Handle direct data response
      if (response && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching due soon loans:', error);
      return [];
    }
  }, []);

  /**
   * Fetch overdue loans
   */
  const fetchOverdueLoans = useCallback(async () => {
    try {
      // FIXED: Response structure updated
      const response = await loanService.getOverdue();
      
      if (response && response.success) {
        return response.data || [];
      }
      
      // Handle direct data response
      if (response && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching overdue loans:', error);
      return [];
    }
  }, []);

  /**
   * Fetch loan statistics
   * ADDED: New method for fetching statistics
   */
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await loanService.getStatistics();
      
      if (response && response.success) {
        return response.data || {};
      }
      
      // Handle direct data response
      if (response && response.data) {
        return response.data;
      }
      
      return {};
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {};
    }
  }, []);

  return {
    loans,
    loading: localLoading,
    fetchLoans,
    fetchLoanById,
    createLoan,
    updateLoan: updateExistingLoan,
    deleteLoan: removeLoan,
    extendDueDate: extendLoanDueDate,
    updateInterest: updateLoanInterest,
    markCompleted: markLoanCompleted, // ADDED: Export new method
    fetchDueSoonLoans,
    fetchOverdueLoans,
    fetchStatistics, // ADDED: Export new method
  };
};

export default useLoans;
