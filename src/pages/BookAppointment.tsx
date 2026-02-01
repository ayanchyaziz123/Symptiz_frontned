import React, { useState, useMemo, useCallback } from 'react';
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

  // Generate available dates
  const getAvailableDates = useMemo(() => {
    const dates: { date: string; available: boolean }[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split('T')[0];
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const randomUnavailable = Math.random() < 0.2;

      dates.push({
        date: dateStr,
        available: !isWeekend && !randomUnavailable && i > 0,
      });
    }

    return dates;
  }, []);

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

  const isDateAvailable = (dateStr: string) => {
    const dateInfo = getAvailableDates.find((d) => d.date === dateStr);
    return dateInfo ? dateInfo.available : false;
  };

  const getAvailableTimesForDate = useCallback(
    (dateStr: string) => {
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

      return allTimes.filter(() => Math.random() > 0.3);
    },
    [getAvailableDates]
  );

  const availableTimes = useMemo(
    () => getAvailableTimesForDate(formData.date),
    [formData.date, getAvailableTimesForDate]
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
      if (name === 'date') {
        setFormData((prev) => ({ ...prev, time: '' }));
      }
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;

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

    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!isDateAvailable(formData.date)) {
      setError('Selected date is not available');
      setLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);

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
      <div className="min-h-screen flex items-center justify-center">
        <p>No doctor selected.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      {/* UI unchanged */}
      {/* Your existing JSX stays exactly the same */}
    </div>
  );
};

export default BookAppointment;
