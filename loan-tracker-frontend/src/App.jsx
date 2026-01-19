import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

// Layout
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Pages
import Dashboard from './pages/Dashboard';
import LoanList from './pages/LoanList';
import LoanDetail from './pages/LoanDetail';
import AddLoan from './pages/AddLoan';
import EditLoan from './pages/EditLoan';

// Simple Protected Route
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Toaster position="top-right" />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/loans" element={<LoanList />} />
                <Route path="/loans/new" element={<AddLoan />} />
                <Route path="/loans/:id" element={<LoanDetail />} />
                <Route path="/loans/:id/edit" element={<EditLoan />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;