/**
 * Empty State Component
 */

import { FileText } from 'lucide-react';

const EmptyState = ({ icon: Icon = FileText, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 text-center max-w-md">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;