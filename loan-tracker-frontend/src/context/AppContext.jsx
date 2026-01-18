/**
 * Application Context
 * Global state management for the application
 */

import { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state
const initialState = {
  loans: [],
  selectedLoan: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    status: '',
    sortBy: 'dueDate',
    sortOrder: 'asc',
  },
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  },
  notifications: {
    dueSoon: [],
    overdue: [],
  },
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_LOANS: 'SET_LOANS',
  SET_SELECTED_LOAN: 'SET_SELECTED_LOAN',
  ADD_LOAN: 'ADD_LOAN',
  UPDATE_LOAN: 'UPDATE_LOAN',
  DELETE_LOAN: 'DELETE_LOAN',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  RESET_STATE: 'RESET_STATE',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case ActionTypes.SET_LOANS:
      return { ...state, loans: action.payload, isLoading: false };
    
    case ActionTypes.SET_SELECTED_LOAN:
      return { ...state, selectedLoan: action.payload };
    
    case ActionTypes.ADD_LOAN:
      return { ...state, loans: [action.payload, ...state.loans] };
    
    case ActionTypes.UPDATE_LOAN:
      return {
        ...state,
        loans: state.loans.map((loan) =>
          loan._id === action.payload._id ? action.payload : loan
        ),
        selectedLoan:
          state.selectedLoan?._id === action.payload._id
            ? action.payload
            : state.selectedLoan,
      };
    
    case ActionTypes.DELETE_LOAN:
      return {
        ...state,
        loans: state.loans.filter((loan) => loan._id !== action.payload),
        selectedLoan:
          state.selectedLoan?._id === action.payload ? null : state.selectedLoan,
      };
    
    case ActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case ActionTypes.SET_PAGINATION:
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    
    case ActionTypes.SET_NOTIFICATIONS:
      return { ...state, notifications: { ...state.notifications, ...action.payload } };
    
    case ActionTypes.RESET_STATE:
      return initialState;
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext(null);

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const setLoading = useCallback((isLoading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  }, []);

  const setLoans = useCallback((loans) => {
    dispatch({ type: ActionTypes.SET_LOANS, payload: loans });
  }, []);

  const setSelectedLoan = useCallback((loan) => {
    dispatch({ type: ActionTypes.SET_SELECTED_LOAN, payload: loan });
  }, []);

  const addLoan = useCallback((loan) => {
    dispatch({ type: ActionTypes.ADD_LOAN, payload: loan });
  }, []);

  const updateLoan = useCallback((loan) => {
    dispatch({ type: ActionTypes.UPDATE_LOAN, payload: loan });
  }, []);

  const deleteLoan = useCallback((loanId) => {
    dispatch({ type: ActionTypes.DELETE_LOAN, payload: loanId });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: ActionTypes.SET_FILTERS, payload: filters });
  }, []);

  const setPagination = useCallback((pagination) => {
    dispatch({ type: ActionTypes.SET_PAGINATION, payload: pagination });
  }, []);

  const setNotifications = useCallback((notifications) => {
    dispatch({ type: ActionTypes.SET_NOTIFICATIONS, payload: notifications });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_STATE });
  }, []);

  const value = {
    ...state,
    setLoading,
    setError,
    setLoans,
    setSelectedLoan,
    addLoan,
    updateLoan,
    deleteLoan,
    setFilters,
    setPagination,
    setNotifications,
    resetState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;