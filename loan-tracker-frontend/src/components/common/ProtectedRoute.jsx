import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  console.log('🔒 ProtectedRoute:', { isAuthenticated, loading }); // Debug

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('🔒 Authenticated, rendering Outlet');
  return <Outlet />;
};

export default ProtectedRoute;