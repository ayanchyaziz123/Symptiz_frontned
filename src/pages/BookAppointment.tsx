import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { Doctor } from '../types';

interface LocationState {
  doctor?: Doctor;
  urgencyResult?: any;
}

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const selectedDoctor = state?.doctor;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    appointmentType: 'in_person' as 'in_person' | 'video' | 'phone',
    reason: state?.urgencyResult?.symptoms || '',
    insurance: 'none',
    reminder: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Generate available dates (some dates are unavailable)
  const getAvailableDates = useMemo(() => {
    const dates: { date: string; available: boolean }[] = [];
    const today = new Date();
    
    // Generate next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split('T')[0];
      
      // Make weekends unavailable
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Make some random weekdays unavailable (booked)
      const randomUnavailable = Math.random() < 0.2; // 20% chance
      
      // Make certain dates unavailable (holidays, etc.)
      const specificUnavailableDates: string[] = [
        // Example: add specific dates here
        // '2026-02-14', // Valentine's Day
        // '2026-02-15',
      ];
      
      const isSpecificUnavailable = specificUnavailableDates.includes(dateStr);
      
      dates.push({
        date: dateStr,
        available: !isWeekend && !randomUnavailable && !isSpecificUnavailable && i > 0, // Can't book today
      });
    }
    
    return dates;
  }, []);

  // Get min and max dates for date picker
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  const maxDate = useMemo(() => {
    const maxDay = new Date();
    maxDay.setDate(maxDay.getDate() + 30);
    return maxDay.toISOString().split('T')[0];
  }, []);

  // Check if selected date is available
  const isDateAvailable = (dateStr: string) => {
    const dateInfo = getAvailableDates.find((d) => d.date === dateStr);
    return dateInfo ? dateInfo.available : false;
  };

  // Get times available for selected date
  const getAvailableTimesForDate = (dateStr: string) => {
    if (!dateStr || !isDateAvailable(dateStr)) return [];

    const allTimes = [
      '8:00 AM',
      '8:30 AM',
      '9:00 AM',
      '9:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '1:00 PM',
      '1:30 PM',
      '2:00 PM',
      '2:30 PM',
      '3:00 PM',
      '3:30 PM',
      '4:00 PM',
      '4:30 PM',
      '5:00 PM',
    ];

    // Randomly make some times unavailable (simulating booked slots)
    return allTimes.filter(() => Math.random() > 0.3); // 70% of slots available
  };

  const availableTimes = useMemo(
    () => getAvailableTimesForDate(formData.date),
    [formData.date]
  );

  const insuranceOptions = [
    { value: 'none', label: 'No Insurance / Self Pay' },
    { value: 'medicare', label: 'Medicare' },
    { value: 'medicaid', label: 'Medicaid' },
    { value: 'private', label: 'Private Insurance' },
    { value: 'other', label: 'Other' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Reset time when date changes
      if (name === 'date') {
        setFormData((prev) => ({ ...prev, time: '' }));
      }
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    
    // Check if date is available
    if (!isDateAvailable(selectedDate)) {
      setError('This date is not available. Please select another date.');
      setFormData((prev) => ({ ...prev, date: '', time: '' }));
      return;
    }
    
    setError('');
    setFormData((prev) => ({ ...prev, date: selectedDate, time: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Check date availability again
    if (!isDateAvailable(formData.date)) {
      setError('Selected date is not available');
      setLoading(false);
      return;
    }

    try {
      // TODO: API call to book appointment
      // const response = await appointmentAPI.createAppointment({
      //   doctor_id: selectedDoctor?.id,
      //   ...formData
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);
      
      // Show success message then redirect
      setTimeout(() => {
        navigate('/appointments', { state: { bookingSuccess: true } });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedDoctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Doctor Selected</h2>
          <p className="text-gray-600 mb-6">
            Please select a doctor first before booking an appointment.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment with <strong>{selectedDoctor.name}</strong> has been scheduled for{' '}
            <strong>
              {formData.date} at {formData.time}
            </strong>
            .
          </p>
          {formData.reminder && (
            <p className="text-sm text-teal-600 mb-4">
              ✓ You will receive appointment reminders via email and SMS
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-teal-600 hover:text-teal-700 font-medium mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h1>
          <p className="text-gray-600">Schedule your visit with {selectedDoctor.name}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Doctor Info */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-900">{selectedDoctor.name}</h3>
                <p className="text-teal-600 font-medium">{selectedDoctor.specialty}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{selectedDoctor.clinic}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{selectedDoctor.availability}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-gray-500 text-xs">Cost</p>
                  <p className="font-semibold text-green-700">{selectedDoctor.cost}</p>
                </div>
              </div>

              {state?.urgencyResult && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Based on your symptoms
                  </p>
                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
                      state.urgencyResult.urgency === 'Emergency'
                        ? 'bg-red-50 text-red-700'
                        : state.urgencyResult.urgency === 'Home Care'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    {state.urgencyResult.urgency}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-teal-600" />
                    Personal Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="(312) 555-0100"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Appointment Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                    Appointment Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleDateChange}
                        min={minDate}
                        max={maxDate}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ℹ️ Weekends and some dates are unavailable
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time *
                      </label>
                      <select
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.date || availableTimes.length === 0}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!formData.date
                            ? 'Select date first'
                            : availableTimes.length === 0
                            ? 'No times available'
                            : 'Select time'}
                        </option>
                        {availableTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {formData.date && availableTimes.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ {availableTimes.length} slots available
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, appointmentType: 'in_person' }))
                        }
                        className={`p-3 border-2 rounded-lg transition ${
                          formData.appointmentType === 'in_person'
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <MapPin className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">In-Person</div>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, appointmentType: 'video' }))
                        }
                        className={`p-3 border-2 rounded-lg transition ${
                          formData.appointmentType === 'video'
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Video className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">Video Call</div>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, appointmentType: 'phone' }))
                        }
                        className={`p-3 border-2 rounded-lg transition ${
                          formData.appointmentType === 'phone'
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Phone className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">Phone Call</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reason for Visit */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-teal-600" />
                    Reason for Visit
                  </h3>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Please describe your symptoms or reason for visit..."
                  />
                </div>

                {/* Insurance Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-teal-600" />
                    Insurance Information
                  </h3>
                  <select
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {insuranceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reminder Preference */}
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="reminder"
                      name="reminder"
                      checked={formData.reminder}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="reminder" className="ml-3">
                      <span className="font-medium text-gray-900 block">
                        Send me appointment reminders
                      </span>
                      <span className="text-sm text-gray-600">
                        Get SMS and email reminders 24 hours before your appointment
                      </span>
                    </label>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;