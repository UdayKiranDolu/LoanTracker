/**
 * Dashboard Page
 * Shows loan statistics and overview
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import StatsCard from '../components/loans/StatsCard';
import LoanCard from '../components/loans/LoanCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import useLoans from '../hooks/useLoans';
import loanService from '../services/loanService';
import { formatCurrency } from '../utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const { fetchDueSoonLoans, fetchOverdueLoans, deleteLoan } = useLoans();

  const [stats, setStats] = useState(null);
  const [dueSoonLoans, setDueSoonLoans] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loan: null });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, dueSoon, overdue] = await Promise.all([
        loanService.getAll({ limit: 1000 }), // Get statistics
        fetchDueSoonLoans(),
        fetchOverdueLoans(),
      ]);

      // Calculate statistics from all loans
      if (statsRes && statsRes.data) {
        const loans = statsRes.data;
        const totalLoans = loans.length;
        const totalAmount = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
        const totalInterest = loans.reduce(
          (sum, loan) => sum + loan.interestAmount + (loan.increasedInterest || 0),
          0
        );

        const activeLoans = loans.filter(l => l.status === 'active').length;
        const completedLoans = loans.filter(l => l.status === 'completed').length;

        setStats({
          totalLoans,
          totalAmount,
          totalInterest,
          activeLoans,
          completedLoans,
          dueSoonCount: dueSoon.length,
          overdueCount: overdue.length,
        });
      }

      setDueSoonLoans(dueSoon);
      setOverdueLoans(overdue);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLoan = async () => {
    if (deleteDialog.loan) {
      const success = await deleteLoan(deleteDialog.loan._id);
      if (success) {
        // Reload dashboard data
        loadDashboardData();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your loan portfolio</p>
        </div>
        <button
          onClick={() => navigate('/loans/new')}
          className="btn-primary flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Add Loan
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Loans"
          value={stats?.totalLoans || 0}
          subtitle="All loans tracked"
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Total Amount"
          value={formatCurrency(stats?.totalAmount || 0)}
          subtitle="Total principal"
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Total Interest"
          value={formatCurrency(stats?.totalInterest || 0)}
          subtitle="Expected earnings"
          icon={TrendingUp}
          color="yellow"
        />
        <StatsCard
          title="Active Loans"
          value={stats?.activeLoans || 0}
          subtitle={`${stats?.completedLoans || 0} completed`}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Overdue Loans Alert */}
        <div className="card border-l-4 border-red-500">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Overdue Loans</h3>
                  <p className="text-sm text-gray-500">Require immediate attention</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {stats?.overdueCount || 0}
              </span>
            </div>
            {overdueLoans.length > 0 && (
              <button
                onClick={() => navigate('/loans?status=overdue')}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                View all overdue loans
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Due Soon Alert */}
        <div className="card border-l-4 border-yellow-500">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Due Soon</h3>
                  <p className="text-sm text-gray-500">Within next 2 days</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {stats?.dueSoonCount || 0}
              </span>
            </div>
            {dueSoonLoans.length > 0 && (
              <button
                onClick={() => navigate('/loans?status=dueSoon')}
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
              >
                View all due soon loans
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Overdue Loans */}
      {overdueLoans.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Overdue Loans</h2>
            <button
              onClick={() => navigate('/loans?status=overdue')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overdueLoans.slice(0, 3).map((loan) => (
              <LoanCard
                key={loan._id}
                loan={loan}
                onDelete={(loan) => setDeleteDialog({ isOpen: true, loan })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Due Soon Loans */}
      {dueSoonLoans.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Due Soon</h2>
            <button
              onClick={() => navigate('/loans?status=dueSoon')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dueSoonLoans.slice(0, 3).map((loan) => (
              <LoanCard
                key={loan._id}
                loan={loan}
                onDelete={(loan) => setDeleteDialog({ isOpen: true, loan })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats?.totalLoans === 0 && (
        <EmptyState
          icon={FileText}
          title="No Loans Yet"
          description="Get started by adding your first loan to track"
          action={
            <button
              onClick={() => navigate('/loans/new')}
              className="btn-primary flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Add Your First Loan
            </button>
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

export default Dashboard;