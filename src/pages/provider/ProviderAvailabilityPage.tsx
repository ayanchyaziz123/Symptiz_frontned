import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  fetchAvailability,
  createAvailability,
  deleteAvailability,
} from '../../store/slices/providerSlice';
import { ArrowLeft, Clock, Trash2, Plus, Activity } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ProviderAvailabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { availability, availabilityLoading } = useAppSelector((state) => state.provider);

  const [form, setForm] = useState({ day_of_week: 0, start_time: '09:00', end_time: '17:00' });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    } catch {
      setError('Failed to delete slot.');
    }
  };

  const handleAdd = async () => {
    setError(null);
    if (form.start_time >= form.end_time) {
      setError('Start time must be before end time.');
      return;
    }
    setSaving(true);
    try {
      await dispatch(createAvailability(form)).unwrap();
      setForm({ day_of_week: 0, start_time: '09:00', end_time: '17:00' });
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Failed to add slot.');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/provider/dashboard')}
            className="text-blue-600 hover:text-blue-700 flex items-center mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-blue-600" />
              Manage Availability
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Set the days and times you are available for appointments</p>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Weekly schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Schedule</h2>

          {availabilityLoading ? (
            <div className="text-center py-10 text-gray-500">
              <Activity className="w-7 h-7 mx-auto mb-2 animate-spin text-blue-600" />
              <p className="text-sm">Loading availability...</p>
            </div>
          ) : availability.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-medium text-gray-500">No availability set yet</p>
              <p className="text-sm mt-1">Add your first slot using the form below</p>
            </div>
          ) : (
            <div className="space-y-4">
              {DAYS.map((dayName, dayIndex) => {
                const slots = slotsByDay[dayIndex];
                if (!slots || slots.length === 0) return null;
                return (
                  <div key={dayIndex}>
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-bold text-gray-700 w-24">{dayName}</span>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                    <div className="space-y-2 ml-0">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`flex items-center justify-between px-4 py-2 rounded-lg border ${
                            slot.is_active ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className={`w-4 h-4 ${slot.is_active ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className="text-sm font-semibold text-gray-800">
                              {slot.start_time} – {slot.end_time}
                            </span>
                            {slot.clinic_name && (
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
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
                            className="text-gray-300 hover:text-red-500 transition p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add new slot */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            Add New Slot
          </h2>

          <div className="space-y-4">
            {/* Day selector */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Day of Week</label>
              <select
                value={form.day_of_week}
                onChange={(e) => setForm({ ...form, day_of_week: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {DAYS.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </div>

            {/* Time range */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end pb-2 text-gray-400 text-sm">–</div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleAdd}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {saving ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {saving ? 'Adding...' : 'Add Slot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderAvailabilityPage;
