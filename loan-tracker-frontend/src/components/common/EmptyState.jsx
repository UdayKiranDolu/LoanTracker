import { Link } from 'react-router-dom';
import { FileX, Plus } from 'lucide-react';

const EmptyState = ({ 
  title = 'No data found', 
  description = 'Get started by adding your first item.',
  actionLabel,
  actionLink,
  icon: Icon = FileX
}) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;