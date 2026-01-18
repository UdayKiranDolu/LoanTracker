/**
 * Loan Table Component (Desktop)
 */

import { Edit, Trash2, Eye, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatCurrency, getDaysRemainingText, getEffectiveDueDate } from '../../utils/helpers';

const LoanTable = ({ loans, onDelete, onSort, sortBy, sortOrder }) => {
  const navigate = useNavigate();

  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
    >
      {children}
      <ArrowUpDown className={`w-4 h-4 ${sortBy === field ? 'text-primary-600' : 'text-gray-400'}`} />
    </button>
  );

  const handleView = (loanId) => {
    navigate(`/loans/${loanId}`);
  };

  const handleEdit = (loanId) => {
    navigate(`/loans/${loanId}/edit`);
  };

  const handleDelete = (loan) => {
    onDelete(loan);
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead className="table-header">
          <tr>
            <th className="table-header-cell">
              <SortButton field="borrowerName">Borrower</SortButton>
            </th>
            <th className="table-header-cell">
              <SortButton field="loanAmount">Amount</SortButton>
            </th>
            <th className="table-header-cell">Interest</th>
            <th className="table-header-cell">
              <SortButton field="dueDate">Due Date</SortButton>
            </th>
            <th className="table-header-cell">Days Left</th>
            <th className="table-header-cell">
              <SortButton field="status">Status</SortButton>
            </th>
            <th className="table-header-cell text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {loans.map((loan) => {
            const effectiveDueDate = getEffectiveDueDate(loan);
            const daysText = getDaysRemainingText(effectiveDueDate);

            return (
              <tr key={loan._id} className="table-row">
                <td className="table-cell">
                  <div>
                    <div className="font-medium text-gray-900">{loan.borrowerName}</div>
                    {loan.borrowerEmail && (
                      <div className="text-xs text-gray-500">{loan.borrowerEmail}</div>
                    )}
                  </div>
                </td>
                <td className="table-cell font-medium">{formatCurrency(loan.loanAmount)}</td>
                <td className="table-cell">
                  {formatCurrency(loan.interestAmount + (loan.increasedInterest || 0))}
                </td>
                <td className="table-cell">
                  <div>
                    <div className="text-gray-900">{formatDate(effectiveDueDate)}</div>
                    {loan.extendedDueDate && (
                      <div className="text-xs text-gray-500">Extended</div>
                    )}
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`font-medium ${
                    loan.daysRemaining < 0 
                      ? 'text-red-600' 
                      : loan.daysRemaining <= 2 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                  }`}>
                    {daysText}
                  </span>
                </td>
                <td className="table-cell">
                  <StatusBadge status={loan.status} />
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleView(loan._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleEdit(loan._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(loan)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LoanTable;