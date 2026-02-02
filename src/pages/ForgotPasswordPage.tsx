import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
  requestPasswordReset,
  clearError,
  clearMessage,
} from '../store/slices/authSlice';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, message } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());

    return () => {
      dispatch(clearError());
      dispatch(clearMessage());
    };
  }, [dispatch]);

  const validate = () => {
    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setValidationError('Invalid email address');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(requestPasswordReset({ email })).unwrap();

      navigate('/verify-otp', {
        state: { email, purpose: 'password_reset' },
      });
    } catch (err) {
      console.error('Password reset request failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <Link
          to="/login"
          className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to login
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">
            We'll send an OTP to your email to reset your password
          </p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div
              className={`flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition ${
                validationError
                  ? 'border-red-300 focus-within:ring-red-200 focus-within:border-red-500'
                  : 'border-gray-300'
              }`}
            >
              <Mail className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationError(null);
                  if (error) dispatch(clearError());
                }}
                placeholder="email@example.com"
                className="w-full focus:outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
            {validationError && (
              <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
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
                Sending OTP...
              </>
            ) : (
              'Send Reset OTP'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
