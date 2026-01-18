/**
 * Edit Loan Page
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LoanForm from '../components/loans/LoanForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useLoans from '../hooks/useLoans';
import toast from 'react-hot-toast';

const EditLoan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { fetchLoanById, updateLoan, loading } = useLoans();

  const [loan, setLoan] = useState(null);
  const [loadingLoan, setLoadingLoan] = useState(true);

  useEffect(() => {
    loadLoan();
  }, [id]);

  const loadLoan = async () => {
    setLoadingLoan(true);
    const loanData = await fetchLoanById(id);
    if (loanData) {
      setLoan(loanData);
    } else {
      toast.error('Loan not found');
      navigate('/loans');
    }
    setLoadingLoan(false);
  };

  const handleSubmit = async (formData) => {
    const updated = await updateLoan(id, formData);
    if (updated) {
      navigate(`/loans/${id}`);
    }
  };

  if (loadingLoan) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!loan) {
    return null;
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Edit Loan</h1>
        <p className="text-gray-600 mt-1">Update loan information for {loan.borrowerName}</p>
      </div>

      {/* Form */}
      <LoanForm initialData={loan} onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
};

export default EditLoan;