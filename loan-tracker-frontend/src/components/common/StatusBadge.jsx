/**
 * Status Badge Component
 * Displays loan status with color coding
 */

import { STATUS_CONFIG } from '../../utils/constants';

const StatusBadge = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;

  return (
    <span className={`badge ${config.bgColor} ${config.textColor} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} mr-1.5`}></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;