import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  fetchProviderDashboardStats,
  fetchProviderAppointments,
  updateAppointmentStatus,
} from '../../store/slices/providerSlice';
import {
  Calendar,
  Users,
  Star,
  Clock,
  CheckCircle,
  Settings,
  Bell,
  TrendingUp,
  MapPin,
  FileText,
  Activity,
  User,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const ProviderDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { firstName, email } = useAppSelector((state) => state.auth);
  const { dashboardStats, appointments, dashboardLoading, dashboardError } = useAppSelector(
    (state) => state.provider
  );
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch dashboard data on mount
  useEffect(() => {
    dispatch(fetchProviderDashboardStats());
    dispatch(fetchProviderAppointments());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle appointment status update
  const handleUpdateStatus = async (appointmentId: number, status: string) => {
    try {
      await dispatch(updateAppointmentStatus({ appointmentId, status })).unwrap();
      // Refresh data
      dispatch(fetchProviderDashboardStats());
      dispatch(fetchProviderAppointments());
    } catch (err) {
      console.error('Failed to update appointment:', err);
    }
  };

  // Default stats if not loaded
  const defaultStats = {
    totalPatients: 0,
    appointmentsToday: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    averageRating: 0,
    totalReviews: 0,
  };

  const stats = dashboardStats || defaultStats;

  // Filter today's appointments
  const today = new Date().toDateString();
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointmentDate).toDateString();
    return aptDate === today;
  });

  // Filter pending appointment requests
  const pendingAppointments = appointments.filter(
    (apt) => apt.status === 'scheduled' && new Date(apt.appointmentDate) > new Date()
  );

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, Dr. {firstName}
                </h1>
                <p className="text-gray-600 mt-1">{formatDate()}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{formatTime()}</div>
                <div className="text-sm text-gray-500">Current Time</div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {dashboardError && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>Error: {dashboardError}</span>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Users className="w-8 h-8" />}
              label="Total Patients"
              value={stats.totalPatients.toString()}
              color="bg-blue-500"
            />
            <StatCard
              icon={<Calendar className="w-8 h-8" />}
              label="Appointments Today"
              value={stats.appointmentsToday.toString()}
              subValue={`${stats.completedAppointments} completed`}
              color="bg-green-500"
            />
            <StatCard
              icon={<Star className="w-8 h-8" />}
              label="Average Rating"
              value={stats.averageRating.toFixed(1)}
              subValue={`${stats.totalReviews} reviews`}
              color="bg-yellow-500"
            />
            <StatCard
              icon={<TrendingUp className="w-8 h-8" />}
              label="This Week"
              value="32"
              subValue="appointments"
              color="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Today's Schedule */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Appointments */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                    Today's Schedule
                  </h2>
                  <button
                    onClick={() => navigate('/provider/appointments')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {dashboardLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
                      <p>Loading appointments...</p>
                    </div>
                  ) : todayAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">No appointments scheduled for today</p>
                    </div>
                  ) : (
                    todayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`p-4 rounded-lg border-2 transition ${
                          appointment.status === 'completed'
                            ? 'border-green-200 bg-green-50'
                            : 'border-blue-200 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="bg-white p-2 rounded-full">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {appointment.patientName}
                                </h3>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-sm text-gray-600 flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {appointment.appointmentTime}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-700">
                                    {appointment.appointmentType}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {appointment.status === 'completed' ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : appointment.status === 'confirmed' ? (
                            <button
                              onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                            >
                              Complete
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                            >
                              Confirm
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Appointment Requests */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Bell className="w-6 h-6 mr-2 text-orange-600" />
                    Pending Requests
                  </h2>
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                    {pendingAppointments.length} New
                  </span>
                </div>

                <div className="space-y-3">
                  {dashboardLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
                      <p>Loading requests...</p>
                    </div>
                  ) : pendingAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                      <p className="font-medium">No pending requests</p>
                      <p className="text-sm mt-1">All appointments have been reviewed</p>
                    </div>
                  ) : (
                    pendingAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {appointment.patientName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                              {appointment.appointmentTime}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Type: {appointment.appointmentType}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions & Info */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <QuickActionButton
                    icon={<Calendar className="w-5 h-5" />}
                    label="Manage Availability"
                    onClick={() => navigate('/provider/availability')}
                  />
                  <QuickActionButton
                    icon={<Users className="w-5 h-5" />}
                    label="View Patients"
                    onClick={() => navigate('/provider/patients')}
                  />
                  <QuickActionButton
                    icon={<FileText className="w-5 h-5" />}
                    label="Medical Records"
                    onClick={() => navigate('/provider/records')}
                  />
                  <QuickActionButton
                    icon={<Settings className="w-5 h-5" />}
                    label="Profile Settings"
                    onClick={() => navigate('/settings')}
                  />
                </div>
              </div>

              {/* Profile Completion */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Profile Completion</h3>
                  <Activity className="w-6 h-6" />
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>85% Complete</span>
                    <span>Almost there!</span>
                  </div>
                  <div className="w-full bg-blue-800 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition text-sm">
                  Complete Profile
                </button>
              </div>

              {/* This Week Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">This Week</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Total Appointments</span>
                    <span className="font-bold text-gray-900">32</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">New Patients</span>
                    <span className="font-bold text-gray-900">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Follow-ups</span>
                    <span className="font-bold text-gray-900">24</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

// Helper Components
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <div className="text-white">{icon}</div>
      </div>
    </div>
  </div>
);

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition text-left"
  >
    <div className="text-blue-600">{icon}</div>
    <span className="font-medium text-gray-700">{label}</span>
  </button>
);

export default ProviderDashboardPage;
