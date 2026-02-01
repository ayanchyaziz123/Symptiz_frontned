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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <Link
          to="/login"
          className="flex items-center text-sm text-teal-600 hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to login
        </Link>

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Forgot Password
          </h1>
          <p className="text-gray-600 mt-2">
            We’ll send an OTP to your email
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div
              className={`flex items-center border-2 rounded-xl px-3 py-2 ${
                validationError
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            >
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationError(null);
                  if (error) dispatch(clearError());
                }}
                placeholder="email@example.com"
                className="w-full focus:outline-none"
              />
            </div>
            {validationError && (
              <p className="text-red-500 text-sm mt-1">
                {validationError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Sending OTP…' : 'Send Reset OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
