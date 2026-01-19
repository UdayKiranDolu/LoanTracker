const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex justify-center items-center">
      <div 
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;