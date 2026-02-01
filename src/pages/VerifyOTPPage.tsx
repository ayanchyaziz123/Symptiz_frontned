import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/index';
import { verifyOTP, resendOTP, clearError } from '../store/slices/authSlice';

const VerifyOTPPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { loading, error, message } = useAppSelector((state) => state.auth);
  const [localSuccess, setLocalSuccess] = useState(false);

  // Get email from navigation state
  const email = location.state?.email || '';

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Clear errors on unmount
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    // If no email, redirect to register
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or next empty one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      return;
    }

    try {
      await dispatch(
        verifyOTP({
          email,
          otp: otpValue,
          purpose: 'registration',
        })
      ).unwrap();

      setLocalSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('OTP verification failed:', err);
    }
  };

  const handleResend = async () => {
    try {
      await dispatch(
        resendOTP({
          email,
          purpose: 'registration',
        })
      ).unwrap();
    } catch (err) {
      console.error('Resend OTP failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <CheckCircle className="w-12 h-12 mx-auto text-teal-500" />
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Verify OTP</h1>
          <p className="text-gray-600 mt-1">
            Enter the 6-digit code sent to
          </p>
          <p className="text-teal-600 font-semibold">{email}</p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {localSuccess ? (
          <div className="bg-green-50 border border-green-400 text-green-700 rounded-lg p-4 mb-4 text-center">
            ✓ OTP verified successfully! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter OTP
              </label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none transition"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the OTP?{' '}
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-teal-600 font-semibold hover:underline disabled:opacity-50"
            >
              Resend
            </button>
          </p>
          <Link
            to="/register"
            className="text-sm text-gray-500 hover:text-gray-700 mt-2 inline-block"
          >
            ← Back to Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;