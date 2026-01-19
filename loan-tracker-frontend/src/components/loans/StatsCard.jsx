/**
 * Stats Card Component
 * Displays statistical information with optional icon and trend
 */

import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'blue',
  alert = false // NEW: Alert prop for highlighting important stats
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600', // NEW: Added purple
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className={`card ${alert ? 'border-l-4 border-yellow-500' : ''}`}>
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Title */}
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            
            {/* Value */}
            <p className="text-2xl font-bold text-gray-900">
              {value !== null && value !== undefined ? value : '0'}
            </p>
            
            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
            
            {/* Trend Indicator */}
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          
          {/* Icon */}
          {Icon && (
            <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// PropTypes for type checking
StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.string,
  color: PropTypes.oneOf(['blue', 'green', 'yellow', 'red', 'purple', 'gray']),
  alert: PropTypes.bool
};

// Default props
StatsCard.defaultProps = {
  subtitle: null,
  icon: null,
  trend: null,
  trendValue: null,
  color: 'blue',
  alert: false
};

export default StatsCard;