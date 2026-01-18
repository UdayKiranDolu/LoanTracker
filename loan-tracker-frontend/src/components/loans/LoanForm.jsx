/**
 * Loan Form Component
 * Used for both creating and editing loans
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Save, Loader } from 'lucide-react';
import { formatDateForInput } from '../../utils/helpers';
import toast from 'react-hot-toast';

const LoanForm = ({ initialData = null, onSubmit, isLoading = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    borrowerName: '',
    borrowerEmail: '',
    borrowerPhone: '',
    loanAmount: '',
    loanGivenDate: '',
    dueDate: '',
    interestAmount: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        borrowerName: initialData.borrowerName || '',
        borrowerEmail: initialData.borrowerEmail || '',
        borrowerPhone: initialData.borrowerPhone || '',
        loanAmount: initialData.loanAmount || '',
        loanGivenDate: formatDateForInput(initialData.loanGivenDate) || '',
        dueDate: formatDateForInput(initialData.dueDate) || '',
        interestAmount: initialData.interestAmount || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.borrowerName.trim()) {
      newErrors.borrowerName = 'Borrower name is required';
    }

    if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0) {
      newErrors.loanAmount = 'Loan amount must be greater than 0';
    }

    if (!formData.loanGivenDate) {
      newErrors.loanGivenDate = 'Loan given date is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.loanGivenDate && formData.dueDate) {
      if (new Date(formData.dueDate) <= new Date(formData.loanGivenDate)) {
        newErrors.dueDate = 'Due date must be after loan given date';
      }
    }

    if (!formData.interestAmount || parseFloat(formData.interestAmount) < 0) {
      newErrors.interestAmount = 'Interest amount must be 0 or greater';
    }

    if (formData.borrowerEmail && !/\S+@\S+\.\S+/.test(formData.borrowerEmail)) {
      newErrors.borrowerEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Convert string numbers to actual numbers
    const submitData = {
      ...formData,
      loanAmount: parseFloat(formData.loanAmount),
      interestAmount: parseFloat(formData.interestAmount),
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Borrower Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Borrower Information</h3>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label htmlFor="borrowerName" className="label">
              Borrower Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="borrowerName"
              name="borrowerName"
              value={formData.borrowerName}
              onChange={handleChange}
              className={errors.borrowerName ? 'input-error' : 'input'}
              placeholder="Enter borrower name"
            />
            {errors.borrowerName && (
              <p className="mt-1 text-sm text-red-600">{errors.borrowerName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="borrowerEmail" className="label">
                Email
              </label>
              <input
                type="email"
                id="borrowerEmail"
                name="borrowerEmail"
                value={formData.borrowerEmail}
                onChange={handleChange}
                className={errors.borrowerEmail ? 'input-error' : 'input'}
                placeholder="borrower@example.com"
              />
              {errors.borrowerEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.borrowerEmail}</p>
              )}
            </div>

            <div>
              <label htmlFor="borrowerPhone" className="label">
                Phone
              </label>
              <input
                type="tel"
                id="borrowerPhone"
                name="borrowerPhone"
                value={formData.borrowerPhone}
                onChange={handleChange}
                className="input"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loan Details */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Loan Details</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="loanAmount" className="label">
                Loan Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="loanAmount"
                name="loanAmount"
                value={formData.loanAmount}
                onChange={handleChange}
                className={errors.loanAmount ? 'input-error' : 'input'}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.loanAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.loanAmount}</p>
              )}
            </div>

            <div>
              <label htmlFor="interestAmount" className="label">
                Interest Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="interestAmount"
                name="interestAmount"
                value={formData.interestAmount}
                onChange={handleChange}
                className={errors.interestAmount ? 'input-error' : 'input'}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.interestAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.interestAmount}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="loanGivenDate" className="label">
                Loan Given Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="loanGivenDate"
                name="loanGivenDate"
                value={formData.loanGivenDate}
                onChange={handleChange}
                className={errors.loanGivenDate ? 'input-error' : 'input'}
              />
              {errors.loanGivenDate && (
                <p className="mt-1 text-sm text-red-600">{errors.loanGivenDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="dueDate" className="label">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={errors.dueDate ? 'input-error' : 'input'}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="label">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="input"
              placeholder="Add any additional notes..."
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary"
          disabled={isLoading}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {initialData ? 'Update Loan' : 'Create Loan'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default LoanForm;