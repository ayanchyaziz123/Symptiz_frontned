import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/index';
import {
  Calendar,
  FileText,
  User,
  Activity,
  Clock,
  MessageSquare,
  Pill,
  Heart,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  MapPin,
  Phone,
  Video,
  Building
} from 'lucide-react';
import {
  fetchUpcomingAppointments,
  fetchAppointmentStatistics,
  Appointment,
} from '../store/slices/appointmentSlice';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { username, firstName, lastName, userType, email, token } = useAppSelector((state) => state.auth);
  const {
    upcomingAppointments,
    statistics,
    loading,
    error
  } = useAppSelector((state) => state.appointment);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const displayName = firstName && lastName
    ? `${firstName} ${lastName}`
    : username || 'User';

  // Fetch appointments and statistics on mount
  useEffect(() => {
    if (token) {
      dispatch(fetchUpcomingAppointments(token));
      dispatch(fetchAppointmentStatistics(token));
    }
  }, [dispatch, token]);

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setTimeout(() => setSelectedAppointment(null), 300);
  };

  // Role-based dashboard title and icon
  const getDashboardConfig = () => {
    switch (userType) {
      case 'doctor':
        return {
          title: 'Doctor Dashboard',
          subtitle: 'Manage your appointments and patients',
          icon: <Activity className="w-8 h-8 text-white" />,
          iconBg: 'bg-teal-600'
        };
      case 'admin':
        return {
          title: 'Admin Dashboard',
          subtitle: 'Platform management and oversight',
          icon: <User className="w-8 h-8 text-white" />,
          iconBg: 'bg-purple-600'
        };
      default: // patient
        return {
          title: 'My Profile',
          subtitle: `Welcome back, ${displayName}!`,
          icon: <Heart className="w-8 h-8 text-white" />,
          iconBg: 'bg-blue-600'
        };
    }
  };

  const config = getDashboardConfig();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section - Role-based */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {config.title}
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                {config.subtitle}
              </p>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                {email} • <span className="capitalize font-semibold text-gray-700">{userType || 'User'}</span>
              </p>
            </div>
            <div className={`hidden sm:flex ${config.iconBg} p-4 rounded-xl`}>
              {config.icon}
            </div>
          </div>
        </div>

        {/* Quick Stats - Role-based */}
        {userType === 'provider' ? (
          // Doctor Stats
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard
              icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Today's Patients"
              value={loading ? "..." : statistics?.upcoming.toString() || "0"}
              subtitle="Appointments"
              color="bg-teal-600"
            />
            <StatCard
              icon={<User className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Total Patients"
              value={loading ? "..." : statistics?.total.toString() || "0"}
              subtitle="All Time"
              color="bg-blue-600"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Pending"
              value={loading ? "..." : statistics?.pending.toString() || "0"}
              subtitle="Confirmations"
              color="bg-yellow-600"
            />
            <StatCard
              icon={<Heart className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Rating"
              value="4.8"
              subtitle="Average"
              color="bg-pink-600"
            />
          </div>
        ) : userType === 'admin' ? (
          // Admin Stats
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard
              icon={<User className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Total Users"
              value="1,234"
              subtitle="Active"
              color="bg-purple-600"
            />
            <StatCard
              icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Doctors"
              value="150"
              subtitle="Verified"
              color="bg-teal-600"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Pending"
              value="12"
              subtitle="Approvals"
              color="bg-yellow-600"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Revenue"
              value="$45K"
              subtitle="This Month"
              color="bg-green-600"
            />
          </div>
        ) : (
          // Patient Stats
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard
              icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Appointments"
              value={loading ? "..." : statistics?.upcoming.toString() || "0"}
              subtitle="Upcoming"
              color="bg-blue-600"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Completed"
              value={loading ? "..." : statistics?.completed.toString() || "0"}
              subtitle="Total"
              color="bg-green-600"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Pending"
              value={loading ? "..." : statistics?.pending.toString() || "0"}
              subtitle="Confirmation"
              color="bg-yellow-600"
            />
            <StatCard
              icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Total"
              value={loading ? "..." : statistics?.total.toString() || "0"}
              subtitle="All Time"
              color="bg-indigo-600"
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Appointments & Reports */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointments */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  Upcoming Appointments
                </h2>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold">
                  {statistics?.upcoming || 0} Active
                </span>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                  <p className="text-sm text-gray-600">Loading appointments...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-red-800 mb-1">Failed to load appointments</h3>
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && upcomingAppointments.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm mb-4">No upcoming appointments</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                    Book New Appointment
                  </button>
                </div>
              )}

              {/* Appointments List */}
              {!loading && !error && upcomingAppointments.length > 0 && (
                <>
                  <div className="space-y-4">
                    {upcomingAppointments.slice(0, 3).map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        doctor={appointment.doctor_info?.full_name || 'Doctor'}
                        specialty={appointment.doctor_info?.specialties?.[0] || 'General Practice'}
                        date={new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        time={new Date(`2000-01-01T${appointment.appointment_time}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                        status={appointment.status}
                        onViewDetails={() => handleViewDetails(appointment)}
                      />
                    ))}
                  </div>
                  {upcomingAppointments.length > 3 && (
                    <button className="w-full mt-4 py-2.5 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition flex items-center justify-center">
                      View All {upcomingAppointments.length} Appointments
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  Recent Reports
                </h2>
              </div>
              <div className="space-y-3">
                <ReportItem
                  name="Blood Test Results"
                  date="Jan 25, 2026"
                  status="Ready"
                />
                <ReportItem
                  name="X-Ray Report"
                  date="Jan 20, 2026"
                  status="Ready"
                />
                <ReportItem
                  name="ECG Report"
                  date="Jan 15, 2026"
                  status="Ready"
                />
              </div>
              <button className="w-full mt-4 py-2.5 text-green-600 font-semibold hover:bg-green-50 rounded-lg transition flex items-center justify-center">
                View All Reports
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Right Column - Quick Actions & Messages */}
          <div className="space-y-6">
            {/* Quick Actions - Role-based */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">Quick Actions</h2>
              <div className="space-y-3">
                {userType === 'provider' ? (
                  // Doctor Quick Actions
                  <>
                    <QuickActionButton
                      icon={<Calendar className="w-5 h-5" />}
                      text="Manage Availability"
                      color="bg-teal-600 hover:bg-teal-700"
                    />
                    <QuickActionButton
                      icon={<User className="w-5 h-5" />}
                      text="View Patients"
                      color="bg-blue-600 hover:bg-blue-700"
                    />
                    <QuickActionButton
                      icon={<FileText className="w-5 h-5" />}
                      text="Patient Records"
                      color="bg-indigo-600 hover:bg-indigo-700"
                    />
                    <QuickActionButton
                      icon={<Activity className="w-5 h-5" />}
                      text="Update Profile"
                      color="bg-green-600 hover:bg-green-700"
                    />
                  </>
                ) : userType === 'admin' ? (
                  // Admin Quick Actions
                  <>
                    <QuickActionButton
                      icon={<User className="w-5 h-5" />}
                      text="Manage Users"
                      color="bg-purple-600 hover:bg-purple-700"
                    />
                    <QuickActionButton
                      icon={<Activity className="w-5 h-5" />}
                      text="Approve Doctors"
                      color="bg-teal-600 hover:bg-teal-700"
                    />
                    <QuickActionButton
                      icon={<FileText className="w-5 h-5" />}
                      text="View Reports"
                      color="bg-blue-600 hover:bg-blue-700"
                    />
                    <QuickActionButton
                      icon={<Calendar className="w-5 h-5" />}
                      text="Platform Settings"
                      color="bg-indigo-600 hover:bg-indigo-700"
                    />
                  </>
                ) : (
                  // Patient Quick Actions
                  <>
                    <QuickActionButton
                      icon={<Calendar className="w-5 h-5" />}
                      text="Book Appointment"
                      color="bg-blue-600 hover:bg-blue-700"
                    />
                    <QuickActionButton
                      icon={<MessageSquare className="w-5 h-5" />}
                      text="Consult Doctor"
                      color="bg-indigo-600 hover:bg-indigo-700"
                    />
                    <QuickActionButton
                      icon={<FileText className="w-5 h-5" />}
                      text="Upload Reports"
                      color="bg-green-600 hover:bg-green-700"
                    />
                    <QuickActionButton
                      icon={<Pill className="w-5 h-5" />}
                      text="Refill Prescription"
                      color="bg-purple-600 hover:bg-purple-700"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Health Reminders */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-2 rounded-lg mr-3">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">Health Tip</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Don't forget to stay hydrated! Aim for 8 glasses of water daily for optimal health.
              </p>
              <div className="flex items-center text-xs text-blue-700 font-medium">
                <CheckCircle className="w-4 h-4 mr-1" />
                Track your water intake
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                  <div className="bg-amber-100 p-2 rounded-lg mr-3">
                    <MessageSquare className="w-5 h-5 text-amber-600" />
                  </div>
                  Messages
                </h2>
                <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-semibold">
                  2 New
                </span>
              </div>
              <div className="space-y-3">
                <MessageItem
                  from="Dr. Sarah Johnson"
                  message="Your test results are ready"
                  time="2 hours ago"
                  unread={true}
                />
                <MessageItem
                  from="symptiZ Support"
                  message="Appointment reminder for tomorrow"
                  time="5 hours ago"
                  unread={false}
                />
              </div>
              <button className="w-full mt-4 py-2.5 text-amber-700 font-semibold hover:bg-amber-50 rounded-lg transition flex items-center justify-center">
                View All Messages
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Appointment Details Modal */}
        {showDetailsModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Appointment Details</h2>
                    <p className="text-blue-100 text-sm">
                      ID: #{selectedAppointment.id}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:bg-blue-800 rounded-lg p-2 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Status</h3>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    selectedAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedAppointment.status_display}
                  </span>
                </div>

                {/* Doctor Information */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-600" />
                    Doctor Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-900 font-semibold text-lg">
                      {selectedAppointment.doctor_info?.full_name}
                    </p>
                    <p className="text-blue-600 font-medium">
                      {selectedAppointment.doctor_info?.specialties?.join(', ') || 'General Practice'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 pt-2">
                      <span className="flex items-center">
                        <Activity className="w-4 h-4 mr-1" />
                        {selectedAppointment.doctor_info?.years_experience} years exp.
                      </span>
                      <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {selectedAppointment.doctor_info?.total_reviews} reviews
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clinic Information */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <Building className="w-4 h-4 mr-2 text-gray-600" />
                    Clinic Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-900 font-semibold">
                      {selectedAppointment.clinic_info?.name}
                    </p>
                    <p className="text-gray-600 text-sm flex items-start">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      {selectedAppointment.clinic_info?.address}, {selectedAppointment.clinic_info?.city}, {selectedAppointment.clinic_info?.state}
                    </p>
                    <p className="text-gray-600 text-sm flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {selectedAppointment.clinic_info?.phone}
                    </p>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-xs font-medium">Date</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-xs font-medium">Time</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {new Date(`2000-01-01T${selectedAppointment.appointment_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Video className="w-4 h-4 mr-2" />
                      <span className="text-xs font-medium">Type</span>
                    </div>
                    <p className="text-gray-900 font-semibold capitalize">
                      {selectedAppointment.appointment_type.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-xs font-medium">Duration</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {selectedAppointment.duration_minutes} minutes
                    </p>
                  </div>
                </div>

                {/* Reason for Visit */}
                {selectedAppointment.reason && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-amber-600" />
                      Reason for Visit
                    </h3>
                    <p className="text-gray-700 text-sm">
                      {selectedAppointment.reason}
                    </p>
                  </div>
                )}

                {/* Insurance Information */}
                {selectedAppointment.insurance_type && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">
                      Insurance
                    </h3>
                    <p className="text-gray-700 text-sm capitalize">
                      {selectedAppointment.insurance_type.replace('_', ' ')}
                    </p>
                  </div>
                )}

                {/* Created Date */}
                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                  Booked on {new Date(selectedAppointment.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-6 rounded-b-2xl flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Close
                </button>
                {selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed' ? (
                  <button
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Cancel Appointment
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== COMPONENT HELPERS ====================

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtitle, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition">
    <div className={`inline-flex p-2.5 sm:p-3 rounded-lg ${color} text-white mb-3 sm:mb-4`}>
      {icon}
    </div>
    <h3 className="text-gray-600 text-xs sm:text-sm font-medium">{title}</h3>
    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
    <p className="text-gray-500 text-xs sm:text-sm mt-1">{subtitle}</p>
  </div>
);

interface AppointmentCardProps {
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  onViewDetails?: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ doctor, specialty, date, time, status, onViewDetails }) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Confirmed</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">Pending</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">Cancelled</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Completed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900">{doctor}</h3>
            <p className="text-sm text-gray-600">{specialty}</p>
            <div className="flex items-center mt-2 text-sm text-gray-600 flex-wrap gap-x-3 gap-y-1">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                <span>{date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                <span>{time}</span>
              </div>
              {status && <div>{getStatusBadge()}</div>}
            </div>
          </div>
        </div>
        <button
          onClick={onViewDetails}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold whitespace-nowrap ml-2 hover:underline"
        >
          Details
        </button>
      </div>
    </div>
  );
};

interface ReportItemProps {
  name: string;
  date: string;
  status: string;
}

const ReportItem: React.FC<ReportItemProps> = ({ name, date, status }) => (
  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
    <div className="flex items-center space-x-3 min-w-0 flex-1">
      <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">
        <FileText className="w-5 h-5 text-gray-600" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-gray-900 truncate">{name}</p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
    </div>
    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold border border-green-200 ml-2 whitespace-nowrap">
      {status}
    </span>
  </div>
);

interface QuickActionButtonProps {
  icon: React.ReactNode;
  text: string;
  color: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, text, color }) => (
  <button className={`w-full flex items-center justify-center space-x-3 ${color} text-white p-3 rounded-lg font-semibold transition shadow-sm`}>
    {icon}
    <span>{text}</span>
  </button>
);

interface MessageItemProps {
  from: string;
  message: string;
  time: string;
  unread?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ from, message, time, unread = false }) => (
  <div className={`p-3 border rounded-lg hover:bg-gray-50 transition cursor-pointer ${
    unread ? 'border-amber-200 bg-amber-50' : 'border-gray-200'
  }`}>
    <div className="flex items-start justify-between mb-1">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-gray-900 text-sm">{from}</p>
        {unread && (
          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
        )}
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{time}</span>
    </div>
    <p className="text-sm text-gray-600 line-clamp-1">{message}</p>
  </div>
);

export default DashboardPage;