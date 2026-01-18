/**
 * Loan Detail Page
 * Shows complete loan information with actions
 */

import { useEffect, useState, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  User, 
  Mail, 
  Phone,
  Clock,
  TrendingUp,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoanHistoryTimeline from '../components/loans/LoanHistoryTimeline';
import useLoans from '../hooks/useLoans';
import { 
  formatDate, 
  formatCurrency, 
  getDaysRemainingText, 
  getEffectiveDueDate,
  formatDateForInput 
} from '../utils/helpers';
import toast from 'react-hot-toast';

const LoanDetail = () => {
    
  const navigate = useNavigate();
  const { id } = useParams();
  const { fetchLoanById, deleteLoan, extendDueDate, updateInterest } = useLoans();

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [extendDialog, setExtendDialog] = useState(false);
  const [interestDialog, setInterestDialog] = useState(false);

  // Form states
  const [extendForm, setExtendForm] = useState({ date: '', notes: '' });
  const [interestForm, setInterestForm] = useState({ amount: '', notes: '' });

  useEffect(() => {
    loadLoan();
  }, [id]);

  const loadLoan = async () => {
    setLoading(true);
    const loanData = await fetchLoanById(id);
    if (loanData) {
      setLoan(loanData);
    } else {
      toast.error('Loan not found');
      navigate('/loans');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    const success = await deleteLoan(id);
    if (success) {
      navigate('/loans');
    }
  };

  const handleExtendDueDate = async (e) => {
    e.preventDefault();
    if (!extendForm.date) {
      toast.error('Please select a new due date');
      return;
    }

    const updated = await extendDueDate(id, extendForm.date, extendForm.notes);
    if (updated) {
      setLoan(updated);
      setExtendDialog(false);
      setExtendForm({ date: '', notes: '' });
    }
  };

  const handleUpdateInterest = async (e) => {
    e.preventDefault();
    if (!interestForm.amount || parseFloat(interestForm.amount) <= 0) {
      toast.error('Please enter a valid interest amount');
      return;
    }

    const updated = await updateInterest(
      id, 
      parseFloat(interestForm.amount), 
      interestForm.notes
    );
    if (updated) {
      setLoan(updated);
      setInterestDialog(false);
      setInterestForm({ amount: '', notes: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!loan) {
    return null;
  }

  const effectiveDueDate = getEffectiveDueDate(loan);
  const daysText = getDaysRemainingText(effectiveDueDate);
  const totalInterest = loan.interestAmount + (loan.increasedInterest || 0);

  return (
    <div className="page-container max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Loans
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{loan.borrowerName}</h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={loan.status} />
              <span className={`text-sm font-medium ${
                loan.daysRemaining < 0 
                  ? 'text-red-600' 
                  : loan.daysRemaining <= 2 
                  ? 'text-yellow-600' 
                  : 'text-green-600'
              }`}>
                {daysText}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/loans/${id}/edit`)}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setDeleteDialog(true)}
              className="btn-danger flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Loan Overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Loan Overview</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loan Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(loan.loanAmount)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Interest</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(totalInterest)}
                    </p>
                    {loan.increasedInterest > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Base: {formatCurrency(loan.interestAmount)} + 
                        Additional: {formatCurrency(loan.increasedInterest)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loan Given Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(loan.loanGivenDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(effectiveDueDate)}
                    </p>
                    {loan.extendedDueDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Original: {formatDate(loan.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-700">Total Repayment</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(loan.loanAmount + totalInterest)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Borrower Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Borrower Information</h2>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{loan.borrowerName}</p>
                </div>
              </div>

              {loan.borrowerEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a 
                      href={`mailto:${loan.borrowerEmail}`}
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      {loan.borrowerEmail}
                    </a>
                  </div>
                </div>
              )}

              {loan.borrowerPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a 
                      href={`tel:${loan.borrowerPhone}`}
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      {loan.borrowerPhone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {loan.notes && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
              </div>
              <div className="card-body">
                <p className="text-gray-700 whitespace-pre-wrap">{loan.notes}</p>
              </div>
            </div>
          )}

          {/* History */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">History</h2>
            </div>
            <div className="card-body">
              <LoanHistoryTimeline history={loan.history} />
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="card-body space-y-3">
              <button
                onClick={() => setExtendDialog(true)}
                className="w-full btn-secondary flex items-center justify-center gap-2"
                disabled={loan.status === 'completed'}
              >
                <Calendar className="w-4 h-4" />
                Extend Due Date
              </button>

              <button
                onClick={() => setInterestDialog(true)}
                className="w-full btn-secondary flex items-center justify-center gap-2"
                disabled={loan.status === 'completed'}
              >
                <TrendingUp className="w-4 h-4" />
                Update Interest
              </button>

              <button
                onClick={() => navigate(`/loans/${id}/edit`)}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Details
              </button>
            </div>
          </div>

          {/* Loan Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Information</h3>
            </div>
            <div className="card-body space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium text-gray-900">
                  {formatDate(loan.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium text-gray-900">
                  {formatDate(loan.updatedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Loan ID</span>
                <span className="font-mono text-xs text-gray-500">{loan._id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extend Due Date Dialog */}
      <Transition appear show={extendDialog} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setExtendDialog(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                    Extend Due Date
                  </Dialog.Title>

                  <form onSubmit={handleExtendDueDate} className="space-y-4">
                    <div>
                      <label className="label">
                        New Due Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={extendForm.date}
                        onChange={(e) => setExtendForm({ ...extendForm, date: e.target.value })}
                        min={formatDateForInput(effectiveDueDate)}
                        className="input"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current due date: {formatDate(effectiveDueDate)}
                      </p>
                    </div>

                    <div>
                      <label className="label">Notes</label>
                      <textarea
                        value={extendForm.notes}
                        onChange={(e) => setExtendForm({ ...extendForm, notes: e.target.value })}
                        rows={3}
                        className="input"
                        placeholder="Reason for extension..."
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setExtendDialog(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Extend Due Date
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Update Interest Dialog */}
      <Transition appear show={interestDialog} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setInterestDialog(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                    Update Interest
                  </Dialog.Title>

                  <form onSubmit={handleUpdateInterest} className="space-y-4">
                    <div>
                      <label className="label">
                        Additional Interest Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={interestForm.amount}
                        onChange={(e) => setInterestForm({ ...interestForm, amount: e.target.value })}
                        step="0.01"
                        min="0"
                        className="input"
                        placeholder="0.00"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current total interest: {formatCurrency(totalInterest)}
                      </p>
                    </div>

                    <div>
                      <label className="label">Notes</label>
                      <textarea
                        value={interestForm.notes}
                        onChange={(e) => setInterestForm({ ...interestForm, notes: e.target.value })}
                        rows={3}
                        className="input"
                        placeholder="Reason for interest update..."
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setInterestDialog(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Update Interest
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Loan"
        message={`Are you sure you want to delete the loan for ${loan.borrowerName}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default LoanDetail;