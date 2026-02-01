import React from 'react';
import { useAppSelector } from '../store/index';
import { 
  Calendar, 
  FileText, 
  User, 
  Activity, 
  Clock,
  MessageSquare,
  Pill,
  Heart
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { username, firstName, lastName, userType, email } = useAppSelector((state) => state.auth);

  const displayName = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : username || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {displayName}!
              </h1>
              <p className="text-gray-600 mt-2">
                {email} • {userType || 'User'}
              </p>
            </div>
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            title="Appointments"
            value="3"
            subtitle="Upcoming"
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            title="Reports"
            value="12"
            subtitle="Available"
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={<Pill className="w-6 h-6" />}
            title="Medications"
            value="5"
            subtitle="Active"
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            title="Health Score"
            value="85"
            subtitle="Good"
            color="from-teal-500 to-cyan-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                Upcoming Appointments
              </h2>
              <div className="space-y-4">
                <AppointmentCard
                  doctor="Dr. Sarah Johnson"
                  specialty="Cardiologist"
                  date="Feb 5, 2026"
                  time="10:00 AM"
                />
                <AppointmentCard
                  doctor="Dr. Michael Chen"
                  specialty="General Physician"
                  date="Feb 12, 2026"
                  time="2:30 PM"
                />
                <AppointmentCard
                  doctor="Dr. Emily Davis"
                  specialty="Dermatologist"
                  date="Feb 20, 2026"
                  time="11:00 AM"
                />
              </div>
              <button className="w-full mt-4 py-2 text-teal-600 font-semibold hover:bg-teal-50 rounded-lg transition">
                View All Appointments
              </button>
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-teal-600" />
                Recent Reports
              </h2>
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
            </div>
          </div>

          {/* Right Column - Quick Actions & Messages */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <QuickActionButton
                  icon={<Calendar className="w-5 h-5" />}
                  text="Book Appointment"
                  color="bg-teal-500 hover:bg-teal-600"
                />
                <QuickActionButton
                  icon={<MessageSquare className="w-5 h-5" />}
                  text="Consult Doctor"
                  color="bg-blue-500 hover:bg-blue-600"
                />
                <QuickActionButton
                  icon={<FileText className="w-5 h-5" />}
                  text="Upload Reports"
                  color="bg-green-500 hover:bg-green-600"
                />
                <QuickActionButton
                  icon={<Pill className="w-5 h-5" />}
                  text="Refill Prescription"
                  color="bg-purple-500 hover:bg-purple-600"
                />
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-teal-600" />
                Messages
              </h2>
              <div className="space-y-3">
                <MessageItem
                  from="Dr. Sarah Johnson"
                  message="Your test results are ready"
                  time="2 hours ago"
                />
                <MessageItem
                  from="RadTH Support"
                  message="Appointment reminder for tomorrow"
                  time="5 hours ago"
                />
              </div>
              <button className="w-full mt-4 py-2 text-teal-600 font-semibold hover:bg-teal-50 rounded-lg transition">
                View All Messages
              </button>
            </div>
          </div>
        </div>
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
  <div className="bg-white rounded-xl shadow-md p-6">
    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${color} text-white mb-4`}>
      {icon}
    </div>
    <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
  </div>
);

interface AppointmentCardProps {
  doctor: string;
  specialty: string;
  date: string;
  time: string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ doctor, specialty, date, time }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:shadow-md transition">
    <div className="flex items-start justify-between">
      <div className="flex items-start space-x-3">
        <div className="bg-teal-100 p-2 rounded-full">
          <User className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{doctor}</h3>
          <p className="text-sm text-gray-500">{specialty}</p>
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-1" />
            {date}
            <Clock className="w-4 h-4 ml-3 mr-1" />
            {time}
          </div>
        </div>
      </div>
      <button className="text-teal-600 hover:text-teal-700 text-sm font-semibold">
        Details
      </button>
    </div>
  </div>
);

interface ReportItemProps {
  name: string;
  date: string;
  status: string;
}

const ReportItem: React.FC<ReportItemProps> = ({ name, date, status }) => (
  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
    <div className="flex items-center space-x-3">
      <FileText className="w-5 h-5 text-gray-400" />
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
    </div>
    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
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
  <button className={`w-full flex items-center space-x-3 ${color} text-white p-3 rounded-lg font-semibold transition`}>
    {icon}
    <span>{text}</span>
  </button>
);

interface MessageItemProps {
  from: string;
  message: string;
  time: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ from, message, time }) => (
  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
    <div className="flex items-start justify-between mb-1">
      <p className="font-semibold text-gray-900 text-sm">{from}</p>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
    <p className="text-sm text-gray-600">{message}</p>
  </div>
);

export default DashboardPage;