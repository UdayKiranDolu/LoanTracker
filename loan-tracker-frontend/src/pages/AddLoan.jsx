/**
 * Add Loan Page
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LoanForm from '../components/loans/LoanForm';
import useLoans from '../hooks/useLoans';

const AddLoan = () => {
  const navigate = useNavigate();
  const { createLoan, loading } = useLoans();

  const handleSubmit = async (formData) => {
    const newLoan = await createLoan(formData);
    if (newLoan) {
      navigate('/loans');
    }
  };

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Loan</h1>
        <p className="text-gray-600 mt-1">Create a new loan record</p>
      </div>

      {/* Form */}
      <LoanForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
};

export default AddLoan;