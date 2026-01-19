// /**
//  * Loan Card Component (Mobile-friendly)
//  */

// import { Calendar, DollarSign, TrendingUp, Edit, Trash2, Eye } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import StatusBadge from '../common/StatusBadge';
// import { formatDate, formatCurrency, getDaysRemainingText, getEffectiveDueDate } from '../../utils/helpers';

// const LoanCard = ({ loan, onDelete }) => {
//   const navigate = useNavigate();
  
//   console.log('LoanCard loan data:', loan); // DEBUG

//   const effectiveDueDate = getEffectiveDueDate(loan);
//   const daysText = getDaysRemainingText(effectiveDueDate);

//   const handleViewDetails = () => {
//     console.log('View Details clicked for loan:', loan._id); // DEBUG
//     const path = `/loans/${loan._id}`;
//     console.log('Navigating to:', path); // DEBUG
//     navigate(path);
//   };

//   const handleEdit = (e) => {
//     e.stopPropagation();
//     console.log('Edit clicked for loan:', loan._id); // DEBUG
//     const path = `/loans/${loan._id}/edit`;
//     console.log('Navigating to:', path); // DEBUG
//     navigate(path);
//   };

//   const handleDelete = (e) => {
//     e.stopPropagation();
//     console.log('Delete clicked for loan:', loan._id); // DEBUG
//     onDelete(loan);
//   };

//   return (
//     <div className="card hover:shadow-md transition-shadow">
//       <div className="card-body">
//         {/* Header */}
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex-1">
//             <h3 className="text-lg font-semibold text-gray-900 mb-1">{loan.borrowerName}</h3>
//             <StatusBadge status={loan.status} />
//           </div>

//           {/* Action Buttons */}
//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleViewDetails}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               title="View Details"
//               type="button"
//             >
//               <Eye className="w-4 h-4 text-gray-600" />
//             </button>
//             <button
//               onClick={handleEdit}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               title="Edit"
//               type="button"
//             >
//               <Edit className="w-4 h-4 text-gray-600" />
//             </button>
//             <button
//               onClick={handleDelete}
//               className="p-2 hover:bg-red-50 rounded-lg transition-colors"
//               title="Delete"
//               type="button"
//             >
//               <Trash2 className="w-4 h-4 text-red-600" />
//             </button>
//           </div>
//         </div>

//         {/* Details Grid */}
//         <div className="space-y-3">
//           <div className="flex items-center gap-2 text-sm">
//             <DollarSign className="w-4 h-4 text-gray-400" />
//             <span className="text-gray-600">Loan Amount:</span>
//             <span className="font-semibold text-gray-900">{formatCurrency(loan.loanAmount)}</span>
//           </div>

//           <div className="flex items-center gap-2 text-sm">
//             <TrendingUp className="w-4 h-4 text-gray-400" />
//             <span className="text-gray-600">Interest:</span>
//             <span className="font-semibold text-gray-900">
//               {formatCurrency(loan.interestAmount + (loan.increasedInterest || 0))}
//             </span>
//           </div>

//           <div className="flex items-center gap-2 text-sm">
//             <Calendar className="w-4 h-4 text-gray-400" />
//             <span className="text-gray-600">Due Date:</span>
//             <span className="font-semibold text-gray-900">{formatDate(effectiveDueDate)}</span>
//           </div>

//           <div className="flex items-center gap-2 text-sm">
//             <Calendar className="w-4 h-4 text-gray-400" />
//             <span className="text-gray-600">Status:</span>
//             <span className={`font-semibold ${
//               loan.daysRemaining < 0 ? 'text-red-600' : loan.daysRemaining <= 2 ? 'text-yellow-600' : 'text-green-600'
//             }`}>
//               {daysText}
//             </span>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-4 pt-4 border-t border-gray-200">
//           <button
//             onClick={handleViewDetails}
//             className="text-sm text-primary-600 hover:text-primary-700 font-medium"
//             type="button"
//           >
//             View Full Details →
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoanCard;














import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

const LoanCard = ({ loan, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'dueSoon':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{loan.borrowerName}</h3>
          {loan.borrowerEmail && (
            <p className="text-sm text-gray-500">{loan.borrowerEmail}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
          {loan.status === 'dueSoon' ? 'Due Soon' : loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1)}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium text-gray-900">${loan.loanAmount?.toLocaleString()}</span>
          {loan.interestAmount > 0 && (
            <span className="ml-1 text-gray-500">
              (+${loan.interestAmount?.toLocaleString()} interest)
            </span>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span>Due: {formatDate(loan.extendedDueDate || loan.dueDate)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <Link
          to={`/loans/${loan._id}`}
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <Eye className="w-4 h-4" />
          View
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(loan._id)}
            className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default LoanCard;