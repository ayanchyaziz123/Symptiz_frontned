import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar,
  Clock,
  User,
  FileText,
  CreditCard,
  Video,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Mail,
  Building,
  Stethoscope,
  Star,
  Info,
} from 'lucide-react';
import { Provider } from '../../types';
import { useAppSelector } from '../../store';

interface LocationState {
  doctor?: Provider;
  urgencyResult?: any;
}

const API_URL = 'http://127.0.0.1:8000/api/appointments';

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const selectedDoctor = state?.doctor;
  const { isAuthenticated, firstName, lastName, email: userEmail, token } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: `${firstName || ''} ${lastName || ''}`.trim(),
    email: userEmail || '',
    phone: '',
    date: '',
    time: '',
    appointmentType: 'in_person' as 'in_person' | 'video' | 'phone',
    reason: state?.urgencyResult?.symptoms || '',
    insurance: 'none',
    reminder: true,
  });

  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Helper function to get profile picture URL
  const getProfilePictureUrl = (profilePicture: string | null | undefined) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith('http')) return profilePicture;
    return `http://127.0.0.1:8000${profilePicture}`;
  };

  // Helper function to get initials for avatar
  const getInitials = (name: string) => {
    const names = name.replace('Dr. ', '').split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Fetch available slots when date changes
  useEffect(() => {
    if (formData.date && selectedDoctor) {
      fetchAvailableSlots(formData.date);
    } else {
      setAvailableSlots([]);
    }
  }, [formData.date, selectedDoctor]);

  const fetchAvailableSlots = async (date: string) => {
    if (!selectedDoctor) return;

    setLoadingSlots(true);
    try {
      const response = await axios.get(`${API_URL}/appointments/available_slots/`, {
        params: {
          doctor_id: selectedDoctor.id,
          date: date,
        },
      });

      // Convert 24h format to 12h format with AM/PM
      const slots = response.data.available_slots.map((slot: string) => {
        const [hours, minutes] = slot.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${hour12}:${minutes} ${ampm}`;
      });

      setAvailableSlots(slots);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch available slots:', err);
      // If API fails, use fallback slots
      const fallbackSlots = [
        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
        '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
        '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
      ];
      setAvailableSlots(fallbackSlots);
    } finally {
      setLoadingSlots(false);
    }
  };

  const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0]; // Tomorrow
  const maxDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]; // 30 days from now

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((p) => ({ ...p, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
      if (name === 'date') setFormData((p) => ({ ...p, time: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    if (!formData.date || !formData.time) {
      setError('Please select both date and time for your appointment');
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setError('You must be logged in to book an appointment');
      setLoading(false);
      return;
    }

    try {
      // Convert 12h time to 24h format for API
      const timeParts = formData.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeParts) {
        throw new Error('Invalid time format');
      }

      let hours = parseInt(timeParts[1]);
      const minutes = timeParts[2];
      const ampm = timeParts[3].toUpperCase();

      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const time24h = `${hours.toString().padStart(2, '0')}:${minutes}`;

      // Get clinic from doctor's clinic info
      const clinicId = 1; // You would get this from the doctor's primary clinic

      const appointmentData = {
        doctor: selectedDoctor!.id,
        clinic: clinicId,
        appointment_date: formData.date,
        appointment_time: time24h,
        appointment_type: formData.appointmentType,
        reason: formData.reason,
        insurance_type: formData.insurance,
        duration_minutes: 30,
      };

      await axios.post(`${API_URL}/appointments/`, appointmentData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2500);
    } catch (err: any) {
      console.error('Appointment booking error:', err);
      const errorMessage = err.response?.data?.error ||
                           err.response?.data?.detail ||
                           'Failed to book appointment. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedDoctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Doctor Selected</h2>
          <p className="text-gray-600 mb-6">Please select a doctor to book an appointment.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Browse Doctors
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 text-center max-w-lg animate-fade-in">
          <div className="bg-gradient-to-br from-green-400 to-green-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Appointment Confirmed!</h2>
          <p className="text-gray-600 mb-8 text-lg">Your appointment has been successfully booked.</p>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-8 text-left border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Appointment Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                <span className="text-sm text-gray-600 font-medium">Doctor</span>
                <span className="text-sm font-bold text-gray-900">{selectedDoctor.name}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                <span className="text-sm text-gray-600 font-medium">Date</span>
                <span className="text-sm font-bold text-gray-900">{new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                <span className="text-sm text-gray-600 font-medium">Time</span>
                <span className="text-sm font-bold text-gray-900">{formData.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">Type</span>
                <span className="text-sm font-bold text-gray-900 capitalize">{formData.appointmentType.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 text-left">
                A confirmation email has been sent to <strong>{formData.email}</strong>.
                You'll receive a reminder 24 hours before your appointment.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Go to My Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition font-medium group"
        >
          <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Appointment</h1>
          <p className="text-gray-600 text-lg">Schedule your visit with {selectedDoctor.name}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Doctor Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-4">
              <div className="flex items-center mb-6">
                {/* Doctor Avatar */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 mr-4 border-2 border-blue-200 shadow-md">
                  {selectedDoctor.profilePicture && getProfilePictureUrl(selectedDoctor.profilePicture) ? (
                    <img
                      src={getProfilePictureUrl(selectedDoctor.profilePicture)!}
                      alt={selectedDoctor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextSibling) {
                          (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
                    style={{
                      display: selectedDoctor.profilePicture && getProfilePictureUrl(selectedDoctor.profilePicture) ? 'none' : 'flex'
                    }}
                  >
                    <span className="text-white font-bold text-2xl">
                      {getInitials(selectedDoctor.name)}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{selectedDoctor.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{selectedDoctor.specialty}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mr-2 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-gray-900">{selectedDoctor.rating}</span>
                    <span className="text-gray-600 ml-1">({selectedDoctor.reviews} reviews)</span>
                  </div>
                </div>

                <div className="flex items-start text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <Building className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-gray-500" />
                  <span>{selectedDoctor.clinic}</span>
                </div>

                <div className="flex items-center text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <MapPin className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                  <span>{selectedDoctor.distance}</span>
                </div>

                <div className="flex items-center text-sm text-green-700 font-medium bg-green-50 p-3 rounded-lg border border-green-200">
                  <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{selectedDoctor.availability}</span>
                </div>
              </div>

              {state?.urgencyResult && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Your Assessment</h4>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4">
                    <p className="text-sm font-bold text-blue-900 mb-2">
                      {state.urgencyResult.condition}
                    </p>
                    <p className="text-xs text-blue-700 font-medium">
                      Priority: {state.urgencyResult.urgency}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              {error && (
                <div className="bg-red-50 border-2 border-red-300 text-red-800 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
                  <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
                  Personal Information
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="flex items-center border-2 border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-gray-50 hover:bg-white transition">
                      <User className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                      <input
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full focus:outline-none text-gray-900 placeholder-gray-400 bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="flex items-center border-2 border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-gray-50 hover:bg-white transition">
                        <Mail className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        <input
                          name="email"
                          type="email"
                          placeholder="email@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full focus:outline-none text-gray-900 placeholder-gray-400 bg-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="flex items-center border-2 border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-gray-50 hover:bg-white transition">
                        <Phone className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        <input
                          name="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full focus:outline-none text-gray-900 placeholder-gray-400 bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
                  Appointment Details
                </h3>
                <div className="space-y-5">
                  {/* Appointment Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Appointment Type *
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'in_person', icon: Stethoscope, label: 'In-Person', enabled: true },
                        { value: 'video', icon: Video, label: 'Video Call', enabled: selectedDoctor.videoVisit },
                        { value: 'phone', icon: Phone, label: 'Phone Call', enabled: true },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => type.enabled && setFormData((p) => ({ ...p, appointmentType: type.value as any }))}
                          disabled={!type.enabled}
                          className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition transform hover:scale-105 ${
                            formData.appointmentType === type.value
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-md'
                              : type.enabled
                              ? 'border-gray-300 hover:border-blue-300 text-gray-600 hover:bg-blue-50'
                              : 'border-gray-200 bg-gray-50 text-gray-400 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <type.icon className="w-7 h-7 mb-2" />
                          <span className="text-sm font-semibold">{type.label}</span>
                          {!type.enabled && <span className="text-xs mt-1">Not Available</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Appointment Date *
                      </label>
                      <div className="flex items-center border-2 border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-gray-50 hover:bg-white transition">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        <input
                          name="date"
                          type="date"
                          min={minDate}
                          max={maxDate}
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                          className="w-full focus:outline-none text-gray-900 bg-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Appointment Time *
                      </label>
                      <div className="flex items-center border-2 border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-gray-50 hover:bg-white transition">
                        <Clock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        <select
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.date || loadingSlots}
                          className="w-full focus:outline-none text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed bg-transparent"
                        >
                          <option value="">
                            {loadingSlots ? 'Loading slots...' : 'Select time'}
                          </option>
                          {availableSlots.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formData.date && !loadingSlots && availableSlots.length === 0 && (
                        <p className="text-sm text-amber-600 mt-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          No slots available for this date
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reason for Visit */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Reason for Visit
                    </label>
                    <div className="border-2 border-gray-300 rounded-xl p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-gray-50 hover:bg-white transition">
                      <div className="flex items-center mb-2">
                        <FileText className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Describe your symptoms</span>
                      </div>
                      <textarea
                        name="reason"
                        rows={4}
                        placeholder="Please describe your symptoms, concerns, or reason for this visit..."
                        value={formData.reason}
                        onChange={handleInputChange}
                        className="w-full focus:outline-none text-gray-900 placeholder-gray-400 resize-none bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Insurance */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Insurance Provider
                    </label>
                    <div className="flex items-center border-2 border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-gray-50 hover:bg-white transition">
                      <CreditCard className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                      <select
                        name="insurance"
                        value={formData.insurance}
                        onChange={handleInputChange}
                        className="w-full focus:outline-none text-gray-900 bg-transparent"
                      >
                        <option value="none">No Insurance / Self Pay</option>
                        <option value="aetna">Aetna</option>
                        <option value="bcbs">Blue Cross Blue Shield</option>
                        <option value="cigna">Cigna</option>
                        <option value="united">UnitedHealthcare</option>
                        <option value="medicare">Medicare</option>
                        <option value="medicaid">Medicaid</option>
                      </select>
                    </div>
                  </div>

                  {/* Reminder */}
                  <div className="flex items-start bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <input
                      type="checkbox"
                      name="reminder"
                      checked={formData.reminder}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                    />
                    <label className="ml-3 text-sm text-gray-700 font-medium">
                      Send me appointment reminders via email and SMS 24 hours before my appointment
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || loadingSlots}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 shadow-lg transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                      Booking Appointment...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
