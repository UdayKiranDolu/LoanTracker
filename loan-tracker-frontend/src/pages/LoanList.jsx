import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const LoanList = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadLoans();
  }, [statusFilter]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '50');
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/loans?${params.toString()}`);
      console.log('📋 Loans loaded:', response.data);
      
      if (response.data?.success) {
        setLoans(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading loans:', error);
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete loan for "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/loans/${id}`);
      toast.success('Loan deleted successfully');
      loadLoans();
    } catch (error) {
      toast.error('Failed to delete loan');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadLoans();
  };

  const formatCurrency = (amount) => '$' + (amount || 0).toLocaleString();
  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      dueSoon: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">All Loans</h1>
        <Link
          to="/loans/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add Loan
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by borrower name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="dueSoon">Due Soon</option>
            <option value="overdue">Overdue</option>
            <option value="completed">Completed</option>
          </select>

          {/* Refresh */}
          <button
            onClick={loadLoans}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : loans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{loan.borrowerName}</div>
                      {loan.borrowerEmail && (
                        <div className="text-sm text-gray-500">{loan.borrowerEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-medium text-gray-900">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {formatCurrency(loan.loanAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatCurrency(loan.interestAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(loan.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(loan.status)}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/loans/${loan._id}`}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/loans/${loan._id}/edit`}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(loan._id, loan.borrowerName)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter 
                ? 'Try adjusting your search or filters' 
                : 'Get started by adding your first loan'}
            </p>
            <Link
              to="/loans/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Add Loan
            </Link>
          </div>
        )}
      </div>

      {/* Count */}
      {loans.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          Showing {loans.length} loan{loans.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default LoanList;