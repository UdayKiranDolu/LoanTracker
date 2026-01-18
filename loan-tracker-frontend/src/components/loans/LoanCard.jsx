/**
 * Loan Card Component (Mobile-friendly)
 */

import { Calendar, DollarSign, TrendingUp, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatCurrency, getDaysRemainingText, getEffectiveDueDate } from '../../utils/helpers';

const LoanCard = ({ loan, onDelete }) => {
  const navigate = useNavigate();
  
  console.log('LoanCard loan data:', loan); // DEBUG

  const effectiveDueDate = getEffectiveDueDate(loan);
  const daysText = getDaysRemainingText(effectiveDueDate);

  const handleViewDetails = () => {
    console.log('View Details clicked for loan:', loan._id); // DEBUG
    const path = `/loans/${loan._id}`;
    console.log('Navigating to:', path); // DEBUG
    navigate(path);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    console.log('Edit clicked for loan:', loan._id); // DEBUG
    const path = `/loans/${loan._id}/edit`;
    console.log('Navigating to:', path); // DEBUG
    navigate(path);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    console.log('Delete clicked for loan:', loan._id); // DEBUG
    onDelete(loan);
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{loan.borrowerName}</h3>
            <StatusBadge status={loan.status} />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewDetails}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="View Details"
              type="button"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleEdit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit"
              type="button"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
              type="button"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Loan Amount:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(loan.loanAmount)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Interest:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(loan.interestAmount + (loan.increasedInterest || 0))}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Due Date:</span>
            <span className="font-semibold text-gray-900">{formatDate(effectiveDueDate)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Status:</span>
            <span className={`font-semibold ${
              loan.daysRemaining < 0 ? 'text-red-600' : loan.daysRemaining <= 2 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {daysText}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleViewDetails}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            type="button"
          >
            View Full Details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanCard;