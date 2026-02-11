import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  fetchProviderDashboardStats,
  fetchProviderAppointments,
  fetchOwnProfile,
} from '../../store/slices/providerSlice';
import {
  Calendar,
  Users,
  Star,
  Clock,
  CheckCircle,
  Activity,
  User,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Award,
  Briefcase,
  Globe,
  Heart,
  TrendingUp,
  Edit,
  Settings,
} from 'lucide-react';
import { getMediaUrl } from '../../config/api';

const ProviderProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { firstName, email } = useAppSelector((state) => state.auth);
  const { 
    dashboardStats, 
    appointments, 
    ownProfile,
    dashboardLoading, 
    dashboardError 
  } = useAppSelector((state) => state.provider);
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    dispatch(fetchProviderDashboardStats());
    dispatch(fetchProviderAppointments());
    dispatch(fetchOwnProfile());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const defaultStats = {
    totalPatients: 0,
    appointmentsToday: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    averageRating: 0,
    totalReviews: 0,
  };

  const stats = dashboardStats || defaultStats;

  const today = new Date();
  const todayStr = today.toDateString();
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointmentDate).toDateString();
    return aptDate === todayStr;
  });

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'scheduled' && new Date(apt.appointmentDate) > today
  );

  // Calculate this week's appointments
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() + (6 - day);
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);
  const thisWeekAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate >= weekStart && aptDate <= weekEnd;
  });

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

  const displayName = ownProfile?.user?.full_name || `Dr. ${firstName}`;
  const initials = ownProfile?.user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('') || firstName?.[0] || 'D';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {dashboardError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Error: {dashboardError}</span>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-4">
              {/* Profile Picture */}
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {ownProfile?.user?.profile_picture ? (
                  <img
                    src={getMediaUrl(ownProfile.user.profile_picture)}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-semibold">
                    {initials}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                      {ownProfile?.is_verified && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-gray-500">
                      {ownProfile?.specialties?.map(s => s.name).join(', ') || 'Medical Professional'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/provider/settings')}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-gray-900 font-medium">{ownProfile?.user?.email || email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <p className="text-gray-900 font-medium">{ownProfile?.user?.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <div>
                  <p className="text-gray-500 text-xs">Rating</p>
                  <p className="text-gray-900 font-medium">
                    {stats.averageRating.toFixed(1)} ({stats.totalReviews} reviews)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Award className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Experience</p>
                  <p className="text-gray-900 font-medium">{ownProfile?.years_experience || 0} years</p>
                </div>
              </div>
            </div>

            {/* Additional Info Pills */}
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
              {ownProfile?.accepting_new_patients && (
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Accepting New Patients
                </span>
              )}
              {ownProfile?.video_visit_available && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Video Visits Available
                </span>
              )}
              {ownProfile?.languages && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {ownProfile.languages}
                </span>
              )}
              {ownProfile?.license_number && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  License: {ownProfile.license_number}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Patients"
            value={stats.totalPatients.toString()}
            color="bg-blue-500"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="Today's Appointments"
            value={stats.appointmentsToday.toString()}
            subValue={`${stats.completedAppointments} completed`}
            color="bg-green-500"
          />
          <StatCard
            icon={<Star className="w-6 h-6" />}
            label="Rating"
            value={stats.averageRating.toFixed(1)}
            subValue={`${stats.totalReviews} reviews`}
            color="bg-yellow-500"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="This Week"
            value={thisWeekAppointments.length.toString()}
            subValue="appointments"
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                    Today's Schedule
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{formatDate()}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{formatTime()}</div>
                  <div className="text-xs text-gray-500">Current Time</div>
                </div>
              </div>

              <div className="space-y-3">
                {dashboardLoading ? (
                  <div className="text-center py-10 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
                    <p>Loading appointments...</p>
                  </div>
                ) : todayAppointments.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium">No appointments scheduled for today</p>
                    <p className="text-sm mt-1">Enjoy your day off!</p>
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
                        {appointment.status === 'completed' && (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {todayAppointments.length > 0 && (
                <button
                  onClick={() => navigate('/provider/dashboard')}
                  className="w-full mt-4 py-2 text-blue-600 font-medium text-sm hover:bg-blue-50 rounded-lg transition"
                >
                  View Full Schedule
                </button>
              )}
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
                {upcomingAppointments.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {upcomingAppointments.length}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {dashboardLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
                    <p>Loading...</p>
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium">No upcoming appointments</p>
                  </div>
                ) : (
                  upcomingAppointments.slice(0, 5).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            at {appointment.appointmentTime}
                          </p>
                        </div>
                        <span className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                          {appointment.appointmentType}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Professional Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Professional Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {ownProfile?.specialties?.map((specialty) => (
                      <span
                        key={specialty.id}
                        className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {specialty.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Years of Experience</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ownProfile?.years_experience || 0} years
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">License Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ownProfile?.license_number || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Languages Spoken</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ownProfile?.languages || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <QuickActionButton
                  icon={<Briefcase className="w-5 h-5" />}
                  label="Go to Dashboard"
                  onClick={() => navigate('/provider/dashboard')}
                />
                <QuickActionButton
                  icon={<Clock className="w-5 h-5" />}
                  label="Manage Availability"
                  onClick={() => navigate('/provider/availability')}
                />
                <QuickActionButton
                  icon={<Settings className="w-5 h-5" />}
                  label="Settings"
                  onClick={() => navigate('/provider/settings')}
                />
                <QuickActionButton
                  icon={<Heart className="w-5 h-5" />}
                  label="View Reviews"
                  onClick={() => navigate('/provider/reviews')}
                />
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Account Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verification</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      ownProfile?.is_verified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {ownProfile?.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Accepting Patients</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      ownProfile?.accepting_new_patients
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {ownProfile?.accepting_new_patients ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Video Visits</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      ownProfile?.video_visit_available
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {ownProfile?.video_visit_available ? 'Enabled' : 'Disabled'}
                  </span>
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
  <div className="bg-white rounded-xl border border-gray-200 p-6">
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

export default ProviderProfilePage;