import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlusCircle, Filter, LayoutGrid, LayoutList } from 'lucide-react';
import LoanTable from '../components/loans/LoanTable';
import LoanCard from '../components/loans/LoanCard';
import SearchInput from '../components/common/SearchInput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import useLoans from '../hooks/useLoans';
import { useAppContext } from '../context/AppContext';
import { LOAN_STATUS } from '../utils/constants';

const LoanList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { loans, isLoading, pagination } = useAppContext(); // Remove filters and setFilters from here
  const { fetchLoans, deleteLoan } = useLoans();

  const [viewMode, setViewMode] = useState('table');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loan: null });
  const [currentFilters, setCurrentFilters] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });

  // Load loans effect - only runs when searchParams changes
  useEffect(() => {
    const statusFromUrl = searchParams.get('status') || '';
    const searchFromUrl = searchParams.get('search') || '';
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;

    fetchLoans({
      status: statusFromUrl,
      search: searchFromUrl,
      page: pageFromUrl,
      sortBy: currentFilters.sortBy,
      sortOrder: currentFilters.sortOrder,
    });
  }, [searchParams, currentFilters.sortBy, currentFilters.sortOrder]); // Fixed dependencies

  const handleSearch = useCallback((searchTerm) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      search: searchTerm,
      page: '1',
    });
  }, [searchParams, setSearchParams]);

  const handleStatusFilter = useCallback((status) => {
    const params = { ...Object.fromEntries(searchParams) };
    if (status) {
      params.status = status;
    } else {
      delete params.status;
    }
    params.page = '1';
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleSort = useCallback((sortBy, sortOrder) => {
    setCurrentFilters({ sortBy, sortOrder });
  }, []);

  const handlePageChange = useCallback((page) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: page.toString(),
    });
  }, [searchParams, setSearchParams]);

  const handleDeleteLoan = async () => {
    if (deleteDialog.loan) {
      const success = await deleteLoan(deleteDialog.loan._id);
      if (success) {
        fetchLoans();
      }
    }
  };

  const currentStatus = searchParams.get('status') || '';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Loans</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your loans in one place
          </p>
        </div>
        <button
          onClick={() => navigate('/loans/new')}
          className="btn-primary flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Add Loan
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchParams.get('search') || ''}
                onSearch={handleSearch}
                placeholder="Search by borrower name..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={currentStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="input min-w-[150px]"
              >
                <option value="">All Status</option>
                <option value={LOAN_STATUS.ACTIVE}>Active</option>
                <option value={LOAN_STATUS.DUE_SOON}>Due Soon</option>
                <option value={LOAN_STATUS.OVERDUE}>Overdue</option>
                <option value={LOAN_STATUS.COMPLETED}>Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${
                  viewMode === 'table'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Table View"
              >
                <LayoutList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>

          {(currentStatus || searchParams.get('search')) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Active filters:</span>
              {currentStatus && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Status: {currentStatus}
                  <button
                    onClick={() => handleStatusFilter('')}
                    className="ml-1 hover:text-primary-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchParams.get('search') && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Search: {searchParams.get('search')}
                  <button
                    onClick={() => handleSearch('')}
                    className="ml-1 hover:text-primary-900"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => setSearchParams({})}
                className="text-sm text-gray-600 hover:text-gray-900 ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Loan List */}
      {!isLoading && loans && loans.length > 0 && (
        <>
          {viewMode === 'table' ? (
            <LoanTable
              loans={loans}
              onDelete={(loan) => setDeleteDialog({ isOpen: true, loan })}
              onSort={handleSort}
              sortBy={currentFilters.sortBy}
              sortOrder={currentFilters.sortOrder}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loans.map((loan) => (
                <LoanCard
                  key={loan._id}
                  loan={loan}
                  onDelete={(loan) => setDeleteDialog({ isOpen: true, loan })}
                />
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && (!loans || loans.length === 0) && (
        <EmptyState
          title={
            currentStatus || searchParams.get('search')
              ? 'No loans found'
              : 'No loans yet'
          }
          description={
            currentStatus || searchParams.get('search')
              ? 'Try adjusting your filters or search terms'
              : 'Get started by adding your first loan'
          }
          action={
            !(currentStatus || searchParams.get('search')) && (
              <button
                onClick={() => navigate('/loans/new')}
                className="btn-primary flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Add Your First Loan
              </button>
            )
          }
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, loan: null })}
        onConfirm={handleDeleteLoan}
        title="Delete Loan"
        message={`Are you sure you want to delete the loan for ${deleteDialog.loan?.borrowerName}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default LoanList;