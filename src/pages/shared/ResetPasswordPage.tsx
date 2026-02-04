import React, { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { resetPassword, resendOTP, clearError, clearMessage } from '../../store/slices/authSlice';

interface LocationState {
  email?: string;
}

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, message } = useAppSelector((s) => s.auth);

  // Guard: need email from previous page
  useEffect(() => {
    if (!state?.email) {
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

  // Redirect to login after successful reset
  useEffect(() => {
    if (message && !error) {
      const timer = setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successful! Please login with your new password.' },
        });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [message, error, navigate]);

  // ── OTP input handlers ──
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (validationErrors.otp) setValidationErrors((p) => ({ ...p, otp: undefined }));
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Resend OTP ──
  const handleResend = async () => {
    if (!state?.email) return;
    try {
      await dispatch(resendOTP({ email: state.email, purpose: 'password_reset' })).unwrap();
    } catch {
      // error shown via redux state
    }
  };

  // ── Validation ──
  const validate = (): boolean => {
    const errors: typeof validationErrors = {};

    if (otp.join('').length !== 6) {
      errors.otp = 'Enter the full 6-digit OTP';
    }

    if (!newPassword) {
      errors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      errors.newPassword = 'Must contain uppercase, lowercase, and a number';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !state?.email) return;

    try {
      await dispatch(
        resetPassword({
          email: state.email,
          otp: otp.join(''),
          new_password: newPassword,
          confirm_password: confirmPassword,
        })
      ).unwrap();
    } catch {
      // error shown via redux state
    }
  };

  const clearFieldError = (field: keyof typeof validationErrors) => {
    if (validationErrors[field]) {
      setValidationErrors((p) => ({ ...p, [field]: undefined }));
    }
    if (error) dispatch(clearError());
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Back link */}
        <Link
          to="/forgot-password"
          className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Link>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">
            Enter the OTP sent to <span className="font-semibold text-gray-800">{state?.email}</span> and choose a new password
          </p>
        </div>

        {/* Success banner */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">{message}</p>
              <p className="text-sm mt-0.5">Redirecting to login...</p>
            </div>
          </div>
        )}

        {/* API error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Verification Code</label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  disabled={!!message}
                  className={`w-10 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 transition ${
                    validationErrors.otp
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              ))}
            </div>
            {validationErrors.otp && (
              <p className="text-red-600 text-xs mt-1 text-center flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.otp}
              </p>
            )}
            <p className="text-center mt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading || !!message}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium transition disabled:opacity-50"
              >
                Didn't receive it? Resend OTP
              </button>
            </p>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Password</label>
            <div
              className={`flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:border-blue-500 transition ${
                validationErrors.newPassword
                  ? 'border-red-300 focus-within:ring-red-200 focus-within:border-red-500'
                  : 'border-gray-300 focus-within:ring-blue-500'
              }`}
            >
              <Lock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  clearFieldError('newPassword');
                }}
                placeholder="Enter new password"
                disabled={!!message}
                className="w-full focus:outline-none text-gray-900 placeholder-gray-400 text-sm"
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="ml-2 text-gray-400 hover:text-gray-600 transition">
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {validationErrors.newPassword && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.newPassword}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">At least 8 characters with uppercase, lowercase, and a number</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm Password</label>
            <div
              className={`flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:border-blue-500 transition ${
                validationErrors.confirmPassword
                  ? 'border-red-300 focus-within:ring-red-200 focus-within:border-red-500'
                  : 'border-gray-300 focus-within:ring-blue-500'
              }`}
            >
              <Lock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError('confirmPassword');
                }}
                placeholder="Confirm new password"
                disabled={!!message}
                className="w-full focus:outline-none text-gray-900 placeholder-gray-400 text-sm"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="ml-2 text-gray-400 hover:text-gray-600 transition">
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !!message}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
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
