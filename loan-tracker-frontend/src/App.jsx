/**
 * Main Application Component
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout Components
import Layout from './components/layout/Layout';

// Page Components
import Dashboard from './pages/Dashboard';
import LoanList from './pages/LoanList';
import LoanDetail from './pages/LoanDetail';
import AddLoan from './pages/AddLoan';
import EditLoan from './pages/EditLoan';

import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#22c55e',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
            
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/loans" element={<LoanList />} />
                <Route path="/loans/new" element={<AddLoan />} />
                <Route path="/loans/:id" element={<LoanDetail />} />
                <Route path="/loans/:id/edit" element={<EditLoan />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;