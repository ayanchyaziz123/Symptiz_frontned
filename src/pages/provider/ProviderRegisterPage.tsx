import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCircle,
  AlertCircle,
  Stethoscope,
  CheckCircle,
  Shield,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

interface Specialty {
  id: number;
  name: string;
  icon: string;
}

const ProviderRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    specialty_id: '',
  });

  // Fetch specialties on mount
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await axios.get(`${API_URL}/providers/specialties/`);
        const data = response.data.results || response.data;
        setSpecialties(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch specialties:', err);
        setSpecialties([]);
      }
    };
    fetchSpecialties();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Auto-generate username from email
      const username = formData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

      // Prepare registration data with minimal required fields
      const registrationData = new FormData();
      registrationData.append('username', username);
      registrationData.append('email', formData.email);
      registrationData.append('password', formData.password);
      registrationData.append('confirm_password', formData.confirm_password);
      registrationData.append('first_name', formData.first_name);
      registrationData.append('last_name', formData.last_name);
      registrationData.append('user_type', 'provider');
      registrationData.append('phone', ''); // Optional
      registrationData.append('license_number', `TEMP-${Date.now()}`); // Temporary - can update later
      registrationData.append('years_experience', '0'); // Can update later in profile
      registrationData.append('bio', ''); // Can add later
      registrationData.append('education', ''); // Can add later
      registrationData.append('certifications', ''); // Can add later
      registrationData.append('languages', 'English'); // Default

      // Backend expects specialty_ids (plural) - send as array
      if (formData.specialty_id) {
        registrationData.append('specialty_ids', formData.specialty_id);
      }

      const response = await axios.post(`${API_URL}/providers/register/`, registrationData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Navigate to shared OTP verification
      navigate('/verify-otp', {
        state: {
          email: formData.email,
          userId: response.data.user_id,
          message: response.data.message,
        },
      });
    } catch (err: any) {
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          const errorMessages = Object.entries(errors)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          setError(errorMessages);
        } else {
          setError(errors.error || 'Registration failed. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* Left Column - Information */}
          <div className="lg:sticky lg:top-8">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Our Provider Network</h1>
              <p className="text-gray-600 text-lg">Connect with patients and grow your healthcare practice with symptiZ</p>
            </div>

            {/* Benefits Cards */}
            <div className="space-y-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Reach More Patients</h3>
                  <p className="text-sm text-gray-600">Get discovered by patients searching for healthcare providers in your area and specialty.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Easy Appointment Management</h3>
                  <p className="text-sm text-gray-600">Set your availability, manage bookings, and reduce no-shows with automated reminders.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Grow Your Practice</h3>
                  <p className="text-sm text-gray-600">Build your online reputation with patient reviews and increase your visibility.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Verified & Trusted</h3>
                  <p className="text-sm text-gray-600">Our verification process ensures trust and credibility with your patients.</p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                How It Works
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Create Your Account</p>
                    <p className="text-blue-100 text-sm">Fill out the registration form with your basic information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Verify Your Email</p>
                    <p className="text-blue-100 text-sm">Confirm your email address with a one-time code</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Complete Your Profile</p>
                    <p className="text-blue-100 text-sm">Add your credentials, experience, and availability</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium">Start Accepting Patients</p>
                    <p className="text-blue-100 text-sm">Once verified, you'll be visible to patients</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-xs text-gray-600">Active Providers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">10K+</div>
                <div className="text-xs text-gray-600">Patients Served</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4.8</div>
                <div className="text-xs text-gray-600 flex items-center justify-center"><Award className="w-3 h-3 mr-1" />Avg Rating</div>
              </div>
            </div>
          </div>

          {/* Right Column - Registration Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
              <p className="text-gray-600 mt-1 text-sm">Get started in just a few minutes</p>
            </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
              <div className="flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition border-gray-300">
                <UserCircle className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  name="first_name"
                  placeholder="John"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
              <div className="flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition border-gray-300">
                <UserCircle className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  name="last_name"
                  placeholder="Doe"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Specialty</label>
            <div className="flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition border-gray-300">
              <Stethoscope className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
              <select
                name="specialty_id"
                required
                value={formData.specialty_id}
                onChange={handleChange}
                className="w-full focus:outline-none text-gray-900 bg-transparent"
              >
                <option value="">Select your specialty</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.icon} {specialty.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition border-gray-300">
              <Mail className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
              <input
                name="email"
                type="email"
                placeholder="doctor@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full focus:outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition border-gray-300">
              <Lock className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full focus:outline-none text-gray-900 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <div className="flex items-center border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition border-gray-300">
              <Lock className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
              <input
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-sm mt-6"
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
              'Create Provider Account'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            You can complete your professional profile after registration
          </p>
        </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition">
                  Log in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegisterPage;
