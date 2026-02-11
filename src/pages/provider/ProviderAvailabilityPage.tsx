import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  fetchAvailability,
  createAvailability,
  deleteAvailability,
} from '../../store/slices/providerSlice';
import {
  ArrowLeft,
  Clock,
  Trash2,
  Plus,
  Activity,
  Calendar,
  CheckCircle,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';

const DAYS = [
  { name: 'Monday', short: 'Mon' },
  { name: 'Tuesday', short: 'Tue' },
  { name: 'Wednesday', short: 'Wed' },
  { name: 'Thursday', short: 'Thu' },
  { name: 'Friday', short: 'Fri' },
  { name: 'Saturday', short: 'Sat' },
  { name: 'Sunday', short: 'Sun' },
];

const ProviderAvailabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { availability, availabilityLoading } = useAppSelector((state) => state.provider);

  const [form, setForm] = useState({ day_of_week: 0, start_time: '09:00', end_time: '17:00' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    dispatch(fetchAvailability());
  }, [dispatch]);

  // Group slots by day
  const slotsByDay: Record<number, typeof availability> = {};
  availability.forEach((slot) => {
    if (!slotsByDay[slot.day_of_week]) slotsByDay[slot.day_of_week] = [];
    slotsByDay[slot.day_of_week].push(slot);
  });
  // Sort each day's slots by start_time
  Object.keys(slotsByDay).forEach((day) => {
    slotsByDay[Number(day)].sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteAvailability(id)).unwrap();
      setSuccess('Slot deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to delete slot.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAdd = async () => {
    setError(null);
    setSuccess(null);
    if (form.start_time >= form.end_time) {
      setError('Start time must be before end time.');
      return;
    }
    setSaving(true);
    try {
      await dispatch(createAvailability(form)).unwrap();
      setForm({ day_of_week: 0, start_time: '09:00', end_time: '17:00' });
      setSuccess('Slot added successfully');
      setShowAddForm(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage = typeof err === 'string' ? err : 'Failed to add slot.';
      setError(errorMessage);
    }
    setSaving(false);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const totalSlots = availability.length;
  const activeSlots = availability.filter(s => s.is_active).length;
  const daysWithAvailability = Object.keys(slotsByDay).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 -mt-10 mb-4">
              <div className="w-20 h-20 bg-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center">
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Availability</h1>
                    <p className="text-gray-500">Set your working hours for patient appointments</p>
                  </div>
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalSlots}</p>
            <p className="text-sm text-gray-500">Total Slots</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeSlots}</p>
            <p className="text-sm text-gray-500">Active Slots</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{daysWithAvailability}</p>
            <p className="text-sm text-gray-500">Days Available</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Calendar View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Weekly Schedule</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Slot
                </button>
              </div>

              <div className="p-6">
                {availabilityLoading ? (
                  <div className="text-center py-10 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
                    <p>Loading availability...</p>
                  </div>
                ) : availability.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-gray-600">No availability set yet</p>
                    <p className="text-sm mt-1 mb-4">Add your first time slot to get started</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Add Your First Slot
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {DAYS.map((day, dayIndex) => {
                      const slots = slotsByDay[dayIndex] || [];
                      const hasSlots = slots.length > 0;

                      return (
                        <div
                          key={dayIndex}
                          className={`rounded-lg border ${
                            hasSlots ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100 bg-gray-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  hasSlots ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                <span className="text-xs font-bold">{day.short}</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{day.name}</p>
                                <p className="text-xs text-gray-500">
                                  {hasSlots ? `${slots.length} slot${slots.length > 1 ? 's' : ''}` : 'Not available'}
                                </p>
                              </div>
                            </div>
                            {hasSlots && (
                              <div className="flex items-center gap-2">
                                {slots.some(s => parseInt(s.start_time) < 12) && (
                                  <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                                    <Sun className="w-3 h-3" />
                                    AM
                                  </span>
                                )}
                                {slots.some(s => parseInt(s.start_time) >= 12) && (
                                  <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                    <Moon className="w-3 h-3" />
                                    PM
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {hasSlots && (
                            <div className="px-4 pb-3 space-y-2">
                              {slots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                                    slot.is_active
                                      ? 'bg-white border border-blue-200'
                                      : 'bg-gray-100 border border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Clock
                                      className={`w-4 h-4 ${
                                        slot.is_active ? 'text-blue-500' : 'text-gray-400'
                                      }`}
                                    />
                                    <span className="text-sm font-medium text-gray-800">
                                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                                    </span>
                                    {slot.clinic_name && (
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {slot.clinic_name}
                                      </span>
                                    )}
                                    {!slot.is_active && (
                                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                        Inactive
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleDelete(slot.id)}
                                    className="text-gray-400 hover:text-red-500 transition p-1.5 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Add Form */}
          <div className="space-y-6">
            {/* Add New Slot Card */}
            <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all ${
              showAddForm ? 'block' : 'hidden lg:block'
            }`}>
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-900 flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-blue-600" />
                  Add New Slot
                </h2>
              </div>

              <div className="p-5 space-y-4">
                {/* Day selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Day of Week
                  </label>
                  <select
                    value={form.day_of_week}
                    onChange={(e) => setForm({ ...form, day_of_week: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {DAYS.map((day, i) => (
                      <option key={i} value={i}>
                        {day.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time range */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Preview */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-medium mb-1">Preview</p>
                  <p className="text-sm text-blue-800">
                    {DAYS[form.day_of_week].name}: {formatTime(form.start_time)} – {formatTime(form.end_time)}
                  </p>
                </div>

                {/* Submit */}
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {saving ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Slot
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Set multiple slots per day for flexible scheduling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Leave gaps between slots for breaks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Patients can only book within your available times</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderAvailabilityPage;
