import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
//   Calendar,
//   Clock,
//   User,
//   FileText,
//   CreditCard,
//   Video,
//   Phone,
//   MapPin,
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

  /** ---------------- Dates ---------------- */

  const availableDates = useMemo(() => {
    const dates: { date: string; available: boolean }[] = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const day = date.getDay();
      const dateStr = date.toISOString().split('T')[0];

      dates.push({
        date: dateStr,
        available: day !== 0 && day !== 6 && Math.random() > 0.2,
      });
    }

    return dates;
  }, []);

  const minDate = availableDates[0]?.date;
  const maxDate = availableDates[availableDates.length - 1]?.date;

  const isDateAvailable = useCallback(
    (dateStr: string) => {
      return availableDates.find((d) => d.date === dateStr)?.available ?? false;
    },
    [availableDates]
  );

  const getAvailableTimesForDate = useCallback(
    (dateStr: string) => {
      if (!dateStr || !isDateAvailable(dateStr)) return [];

      const times = [
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

      return times.filter(() => Math.random() > 0.3);
    },
    [isDateAvailable]
  );

  const availableTimes = useMemo(
    () => getAvailableTimesForDate(formData.date),
    [formData.date, getAvailableTimesForDate]
  );

  /** ---------------- Handlers ---------------- */

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;

    if (!isDateAvailable(date)) {
      setError('This date is not available');
      setFormData((p) => ({ ...p, date: '', time: '' }));
      return;
    }

    setError('');
    setFormData((p) => ({ ...p, date, time: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 1500));
    setSuccess(true);

    setTimeout(() => {
      navigate('/appointments', { state: { bookingSuccess: true } });
    }, 2000);
  };

  /** ---------------- UI ---------------- */

  if (!selectedDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-red-500 mr-2" />
        <span>No doctor selected</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CheckCircle className="w-16 h-16 text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-50 p-6">
      <button onClick={() => navigate(-1)} className="flex items-center mb-4">
        <ChevronLeft className="mr-1" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Book Appointment</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input name="name" placeholder="Name" onChange={handleInputChange} />
        <input name="email" placeholder="Email" onChange={handleInputChange} />
        <input name="phone" placeholder="Phone" onChange={handleInputChange} />

        <input type="date" min={minDate} max={maxDate} value={formData.date} onChange={handleDateChange} />

        <select name="time" value={formData.time} onChange={handleInputChange}>
          <option value="">Select time</option>
          {availableTimes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <button disabled={loading} type="submit">
          {loading ? 'Booking…' : 'Confirm Booking'}
        </button>

        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default BookAppointment;
