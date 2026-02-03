import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  fetchAdminStats,
  fetchPendingProviders,
  approveProvider,
  rejectProvider,
} from '../../store/slices/adminSlice';
import {
  Users,
  UserCheck,
  Calendar,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Settings,
  FileText,
  BarChart3,
} from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { firstName, username } = useAppSelector((state) => state.auth);
  const { stats, pendingProviders, loading, error } = useAppSelector((state) => state.admin);
  const displayName = firstName || username || 'Admin';

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchPendingProviders());
  }, [dispatch]);

  // Handle provider approval
  const handleApproveProvider = async (providerId: number) => {
    try {
      await dispatch(approveProvider(providerId)).unwrap();
      // Refresh data after approval
      dispatch(fetchAdminStats());
      dispatch(fetchPendingProviders());
    } catch (err) {
      console.error('Failed to approve provider:', err);
    }
  };

  // Handle provider rejection
  const handleRejectProvider = async (providerId: number) => {
    try {
      await dispatch(rejectProvider(providerId)).unwrap();
      // Refresh data after rejection
      dispatch(fetchAdminStats());
      dispatch(fetchPendingProviders());
    } catch (err) {
      console.error('Failed to reject provider:', err);
    }
  };

  // Default stats if not loaded yet
  const defaultStats = {
    totalUsers: 0,
    totalPatients: 0,
    totalProviders: 0,
    pendingApprovals: 0,
    totalAppointments: 0,
    activeAppointments: 0,
    systemHealth: 100,
  };

  const currentStats = stats || defaultStats;

  const recentActivities = [
    {
      id: 1,
      type: 'user_registered',
      message: 'New patient registered: John Doe',
      time: '5 minutes ago',
      icon: <Users className="w-4 h-4" />,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 2,
      type: 'provider_approved',
      message: 'Provider approved: Dr. Michael Brown',
      time: '15 minutes ago',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-600 bg-green-50',
    },
    {
      id: 3,
      type: 'appointment_cancelled',
      message: 'Appointment cancelled by patient',
      time: '1 hour ago',
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-red-600 bg-red-50',
    },
    {
      id: 4,
      type: 'system_update',
      message: 'System maintenance completed',
      time: '2 hours ago',
      icon: <Settings className="w-4 h-4" />,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-purple-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome back, {displayName}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin/settings')}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mb-8 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4 text-center">
            Loading dashboard data...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-center">
            Error: {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            label="Total Users"
            value={currentStats.totalUsers.toLocaleString()}
            subValue={`${currentStats.totalPatients} patients, ${currentStats.totalProviders} providers`}
            color="bg-blue-500"
            trend="+12%"
          />
          <StatCard
            icon={<UserCheck className="w-8 h-8" />}
            label="Pending Approvals"
            value={currentStats.pendingApprovals.toString()}
            subValue="Provider registrations"
            color="bg-orange-500"
            alert={currentStats.pendingApprovals > 10}
          />
          <StatCard
            icon={<Calendar className="w-8 h-8" />}
            label="Total Appointments"
            value={currentStats.totalAppointments.toLocaleString()}
            subValue={`${currentStats.activeAppointments} active today`}
            color="bg-green-500"
            trend="+8%"
          />
          <StatCard
            icon={<Activity className="w-8 h-8" />}
            label="System Health"
            value={`${currentStats.systemHealth}%`}
            subValue="All services operational"
            color="bg-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Provider Approvals */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <UserCheck className="w-6 h-6 mr-2 text-orange-600" />
                Pending Provider Approvals
              </h2>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                {pendingProviders.length} Pending
              </span>
            </div>

            <div className="space-y-4">
              {pendingProviders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="font-medium">No pending provider approvals</p>
                  <p className="text-sm mt-1">All provider registrations have been reviewed</p>
                </div>
              ) : (
                pendingProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{provider.specialty}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {provider.registeredDate}
                          </span>
                          <span className="text-xs text-gray-500">{provider.email}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveProvider(provider.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectProvider(provider.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {pendingProviders.length > 0 && (
              <button className="w-full mt-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
                View All Pending ({pendingProviders.length})
              </button>
            )}
          </div>

          {/* Recent Activities & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <QuickActionButton
                  icon={<Users className="w-5 h-5" />}
                  label="Manage Users"
                  onClick={() => navigate('/admin/users')}
                />
                <QuickActionButton
                  icon={<UserCheck className="w-5 h-5" />}
                  label="Review Providers"
                  onClick={() => navigate('/admin/providers')}
                />
                <QuickActionButton
                  icon={<Calendar className="w-5 h-5" />}
                  label="View Appointments"
                  onClick={() => navigate('/admin/appointments')}
                />
                <QuickActionButton
                  icon={<BarChart3 className="w-5 h-5" />}
                  label="Analytics"
                  onClick={() => navigate('/admin/analytics')}
                />
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activities
              </h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${activity.color}`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
                View All Activities
              </button>
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
  subValue: string;
  color: string;
  trend?: string;
  alert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, color, trend, alert }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <span className="text-sm font-semibold text-green-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{subValue}</p>
      </div>
      <div className={`${color} p-3 rounded-lg relative`}>
        <div className="text-white">{icon}</div>
        {alert && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        )}
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
    className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition text-left"
  >
    <div className="text-purple-600">{icon}</div>
    <span className="font-medium text-gray-700">{label}</span>
  </button>
);

export default AdminDashboardPage;
