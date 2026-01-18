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

      const response = await loanService.getAll(queryParams);

      if (response.success) {
        setLoans(response.data);
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
//   const fetchLoanById = useCallback(async (id) => {
//     try {
//       setLocalLoading(true);
//       const response = await loanService.getById(id);

//       if (response.success) {
//         return response.data;
//       }
//       return null;
//     } catch (error) {
//       const errorMsg = classifyError(error);
//       toast.error(errorMsg);
//       return null;
//     } finally {
//       setLocalLoading(false);
//     }
//   }, []);

/**
 * Fetch single loan by ID
 */
const fetchLoanById = useCallback(async (id) => {
  try {
    setLocalLoading(true);
    console.log('useLoans - Fetching loan by ID:', id); // DEBUG
    
    const response = await loanService.getById(id);
    console.log('useLoans - API Response:', response); // DEBUG
    
    if (response && response.success && response.data) {
      console.log('useLoans - Returning loan data:', response.data); // DEBUG
      return response.data;
    } else if (response && response.data) {
      // Some APIs return data directly without success flag
      console.log('useLoans - Returning direct data:', response.data); // DEBUG
      return response.data;
    } else {
      console.error('useLoans - Invalid response format:', response); // DEBUG
      toast.error('Invalid response from server');
      return null;
    }
  } catch (error) {
    console.error('useLoans - Error fetching loan:', error); // DEBUG
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
      const response = await loanService.create(loanData);

      if (response.success) {
        addLoan(response.data);
        toast.success('Loan created successfully');
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
      const response = await loanService.update(id, loanData);

      if (response.success) {
        updateLoan(response.data);
        toast.success('Loan updated successfully');
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
      const response = await loanService.delete(id);

      if (response.success) {
        deleteLoan(id);
        toast.success('Loan deleted successfully');
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
      const response = await loanService.extendDueDate(id, {
        extendedDueDate,
        notes,
      });

      if (response.success) {
        updateLoan(response.data);
        toast.success('Due date extended successfully');
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
      const response = await loanService.updateInterest(id, {
        additionalInterest,
        notes,
      });

      if (response.success) {
        updateLoan(response.data);
        toast.success('Interest updated successfully');
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
  const fetchDueSoonLoans = useCallback(async () => {
    try {
      const response = await loanService.getDueSoon();
      if (response.success) {
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
      const response = await loanService.getOverdue();
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching overdue loans:', error);
      return [];
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
    fetchDueSoonLoans,
    fetchOverdueLoans,
  };
};

export default useLoans;