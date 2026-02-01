import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/index';
import { registerUser, clearError, clearMessage } from '../store/slices/authSlice';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  UserCircle,
  AlertCircle 
} from 'lucide-react';

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error, message, fieldErrors, userId } = useAppSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    user_type: 'patient', // Default to patient
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearMessage());
    };
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error || fieldErrors) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await dispatch(registerUser(formData)).unwrap();
      navigate('/verify-otp', {
        state: { email: result.email, userId: result.user_id },
      });
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const getFieldError = (fieldName: string): string | null => {
    if (fieldErrors && fieldErrors[fieldName]) {
      return fieldErrors[fieldName][0];
    }
    return null;
  };

  const hasFieldError = (fieldName: string): boolean => {
    return !!getFieldError(fieldName);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 px-4 py-8">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join RadTH today</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div
              className={`flex items-center border-2 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-teal-500 transition ${
                hasFieldError('username')
                  ? 'border-red-500 focus-within:ring-red-200'
                  : 'border-gray-300 focus-within:border-transparent'
              }`}
            >
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <input
                name="username"
                placeholder="johndoe"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full focus:outline-none text-gray-700"
              />
            </div>
            {getFieldError('username') && (
              <p className="text-red-500 text-sm mt-1">{getFieldError('username')}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div
              className={`flex items-center border-2 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-teal-500 transition ${
                hasFieldError('email')
                  ? 'border-red-500 focus-within:ring-red-200'
                  : 'border-gray-300 focus-within:border-transparent'
              }`}
            >
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <input
                name="email"
                type="email"
                placeholder="email@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full focus:outline-none text-gray-700"
              />
            </div>
            {getFieldError('email') && (
              <p className="text-red-500 text-sm mt-1">{getFieldError('email')}</p>
            )}
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div
                className={`flex items-center border-2 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-teal-500 transition ${
                  hasFieldError('first_name')
                    ? 'border-red-500 focus-within:ring-red-200'
                    : 'border-gray-300 focus-within:border-transparent'
                }`}
              >
                <UserCircle className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  name="first_name"
                  placeholder="John"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-gray-700"
                />
              </div>
              {getFieldError('first_name') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('first_name')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <div
                className={`flex items-center border-2 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-teal-500 transition ${
                  hasFieldError('last_name')
                    ? 'border-red-500 focus-within:ring-red-200'
                    : 'border-gray-300 focus-within:border-transparent'
                }`}
              >
                <UserCircle className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  name="last_name"
                  placeholder="Doe"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-gray-700"
                />
              </div>
              {getFieldError('last_name') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('last_name')}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div
              className={`flex items-center border-2 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-teal-500 transition ${
                hasFieldError('phone')
                  ? 'border-red-500 focus-within:ring-red-200'
                  : 'border-gray-300 focus-within:border-transparent'
              }`}
            >
              <Phone className="w-5 h-5 text-gray-400 mr-2" />
              <input
                name="phone"
                placeholder="+1 (555) 000-0000"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full focus:outline-none text-gray-700"
              />
            </div>
            {getFieldError('phone') && (
              <p className="text-red-500 text-sm mt-1">{getFieldError('phone')}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div
              className={`flex items-center border-2 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-teal-500 transition ${
                hasFieldError('password')
                  ? 'border-red-500 focus-within:ring-red-200'
                  : 'border-gray-300 focus-within:border-transparent'
              }`}
            >
              <Lock className="w-5 h-5 text-gray-400 mr-2" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full focus:outline-none text-gray-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-500 hover:text-gray-700 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {getFieldError('password') && (
              <p className="text-red-500 text-sm mt-1">{getFieldError('password')}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div
              className={`flex items-center border-2 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-teal-500 transition ${
                hasFieldError('confirm_password')
                  ? 'border-red-500 focus-within:ring-red-200'
                  : 'border-gray-300 focus-within:border-transparent'
              }`}
            >
              <Lock className="w-5 h-5 text-gray-400 mr-2" />
              <input
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="********"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full focus:outline-none text-gray-700"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="ml-2 text-gray-500 hover:text-gray-700 transition"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {getFieldError('confirm_password') && (
              <p className="text-red-500 text-sm mt-1">{getFieldError('confirm_password')}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                Creating account...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-teal-600 font-semibold hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;