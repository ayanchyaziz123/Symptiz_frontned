import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { resetPassword, clearError, clearMessage } from '../store/slices/authSlice';

interface LocationState {
  email?: string;
  otp?: string;
}

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, message } = useAppSelector((state) => state.auth);

  // Check if we have email and OTP from previous page
  useEffect(() => {
    if (!state?.email || !state?.otp) {
      navigate('/forgot-password');
    }
  }, [state, navigate]);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());

    return () => {
      dispatch(clearError());
      dispatch(clearMessage());
    };
  }, [dispatch]);

  // Redirect to login after successful password reset
  useEffect(() => {
    if (message && !error) {
      const timer = setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successful! Please login with your new password.' }
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, error, navigate]);

  const validate = (): boolean => {
    const errors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      errors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (!state?.email || !state?.otp) {
      return;
    }

    try {
      await dispatch(
        resetPassword({
          email: state.email,
          otp: state.otp,
          new_password: newPassword,
          confirm_password: confirmPassword,
        })
      ).unwrap();
    } catch (err) {
      console.error('Password reset failed:', err);
    }
  };

  const handleInputChange = (field: 'newPassword' | 'confirmPassword', value: string) => {
    if (field === 'newPassword') {
      setNewPassword(value);
    } else {
      setConfirmPassword(value);
    }

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">
            Enter your new password
          </p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">{message}</p>
              <p className="text-sm mt-1">Redirecting to login...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <div
              className={`flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition ${
                validationErrors.newPassword
                  ? 'border-red-300 focus-within:ring-red-200 focus-within:border-red-500'
                  : 'border-gray-300'
              }`}
            >
              <Lock className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Enter new password"
                className="w-full focus:outline-none text-gray-900 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="ml-2 text-gray-400 hover:text-gray-600 transition"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors.newPassword && (
              <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationErrors.newPassword}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div
              className={`flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition ${
                validationErrors.confirmPassword
                  ? 'border-red-300 focus-within:ring-red-200 focus-within:border-red-500'
                  : 'border-gray-300'
              }`}
            >
              <Lock className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
                className="w-full focus:outline-none text-gray-900 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="ml-2 text-gray-400 hover:text-gray-600 transition"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !!message}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-sm"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
