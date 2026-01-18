/**
 * Loan History Timeline Component
 */

import { Calendar, DollarSign, Clock } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const LoanHistoryTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No history available</p>
      </div>
    );
  }

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'due_date_extension':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'interest_update':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getChangeLabel = (changeType) => {
    switch (changeType) {
      case 'due_date_extension':
        return 'Due Date Extended';
      case 'interest_update':
        return 'Interest Updated';
      case 'initial':
        return 'Loan Created';
      default:
        return 'Updated';
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((entry, idx) => (
          <li key={entry._id || idx}>
            <div className="relative pb-8">
              {idx !== history.length - 1 && (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center ring-2 ring-gray-200">
                    {getChangeIcon(entry.changeType)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {getChangeLabel(entry.changeType)}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {formatDate(entry.updatedAt, 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    {entry.prevDueDate && entry.newDueDate && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-500">Due Date:</span>
                        <span className="line-through text-gray-400">
                          {formatDate(entry.prevDueDate)}
                        </span>
                        <span>→</span>
                        <span className="font-medium text-blue-600">
                          {formatDate(entry.newDueDate)}
                        </span>
                      </div>
                    )}
                    {entry.prevInterest !== null && entry.newInterest !== null && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-500">Interest:</span>
                        <span className="line-through text-gray-400">
                          ${entry.prevInterest?.toLocaleString()}
                        </span>
                        <span>→</span>
                        <span className="font-medium text-green-600">
                          ${entry.newInterest?.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {entry.notes && (
                      <p className="mt-1 text-gray-600 italic">{entry.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoanHistoryTimeline;