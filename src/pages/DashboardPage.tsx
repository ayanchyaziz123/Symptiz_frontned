import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/index';
import {
  Calendar,
  User,
  Clock,
  X,
  Phone,
  Video,
  Building,
  Upload,
  FileText,
  CheckCircle,
  Loader,
  AlertCircle,
  Search,
  ArrowRight,
  Star,
  Edit,
  Mail,
  MapPin,
  Heart,
  Settings as SettingsIcon,
  Camera,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import {
  fetchUpcomingAppointments,
  Appointment,
} from '../store/slices/appointmentSlice';
import {
  fetchUserProfile,
  fetchAppointmentStats,
  uploadProfilePicture,
  deleteProfilePicture,
  uploadInsuranceDocument,
  deleteInsuranceDocument,
} from '../store/slices/userSlice';
import { getMediaUrl } from '../config/api';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { username, firstName, lastName, email, token } = useAppSelector((state) => state.auth);
  const { upcomingAppointments, loading, error } = useAppSelector((state) => state.appointment);
  const {
    profile,
    stats,
    loading: profileLoading,
    statsLoading,
    uploadingProfilePicture,
    uploadingInsuranceDocument,
  } = useAppSelector((state) => state.user);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const insuranceInputRef = useRef<HTMLInputElement>(null);

  // Use profile data if available, fall back to auth data
  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : firstName && lastName
      ? `${firstName} ${lastName}`
      : username || 'User';

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : firstName && lastName
      ? `${firstName[0]}${lastName[0]}`
      : username?.[0]?.toUpperCase() || 'U';

  useEffect(() => {
    if (token) {
      dispatch(fetchUpcomingAppointments(token));
      dispatch(fetchUserProfile(token));
      dispatch(fetchAppointmentStats(token));
    }
  }, [dispatch, token]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => setUploadSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => setUploadError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadError]);

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setTimeout(() => setSelectedAppointment(null), 300);
  };

  // Profile Picture Handlers
  const handleProfilePictureClick = () => {
    profilePictureInputRef.current?.click();
  };

  const handleProfilePictureSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload JPEG, PNG, GIF, or WebP.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size too large. Maximum size is 5MB.');
      return;
    }

    try {
      await dispatch(uploadProfilePicture({ token, file })).unwrap();
      setUploadSuccess('Profile picture updated successfully!');
    } catch (err) {
      setUploadError(typeof err === 'string' ? err : 'Failed to upload profile picture');
    }

    // Reset input
    if (profilePictureInputRef.current) {
      profilePictureInputRef.current.value = '';
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!token || !profile?.profile_picture) return;
    try {
      await dispatch(deleteProfilePicture(token)).unwrap();
      setUploadSuccess('Profile picture removed');
    } catch (err) {
      setUploadError(typeof err === 'string' ? err : 'Failed to delete profile picture');
    }
  };

  // Insurance Document Handlers
  const handleInsuranceClick = () => {
    insuranceInputRef.current?.click();
  };

  const handleInsuranceSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload PDF, JPEG, PNG, or GIF.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size too large. Maximum size is 10MB.');
      return;
    }

    try {
      await dispatch(uploadInsuranceDocument({ token, file })).unwrap();
      setUploadSuccess('Insurance document uploaded successfully!');
    } catch (err) {
      setUploadError(typeof err === 'string' ? err : 'Failed to upload insurance document');
    }

    // Reset input
    if (insuranceInputRef.current) {
      insuranceInputRef.current.value = '';
    }
  };

  const handleDeleteInsurance = async () => {
    if (!token || !profile?.insurance_document) return;
    try {
      await dispatch(deleteInsuranceDocument(token)).unwrap();
      setUploadSuccess('Insurance document removed');
    } catch (err) {
      setUploadError(typeof err === 'string' ? err : 'Failed to delete insurance document');
    }
  };

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not set';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch {
      return 'Not set';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {uploadSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}
        {uploadError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          {/* Cover Photo Area */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-4">
              {/* Profile Picture with Upload */}
              <div className="relative group">
                <div
                  onClick={handleProfilePictureClick}
                  className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  {uploadingProfilePicture ? (
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                  ) : profile?.profile_picture ? (
                    <img
                      src={getMediaUrl(profile.profile_picture)}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-semibold">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Overlay on hover */}
                <div
                  onClick={handleProfilePictureClick}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-white" />
                </div>
                {/* Delete button */}
                {profile?.profile_picture && !uploadingProfilePicture && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProfilePicture();
                    }}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <input
                  ref={profilePictureInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleProfilePictureSelect}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                    <p className="text-gray-500">Patient</p>
                  </div>
                  <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-gray-900 font-medium">{profile?.email || email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Username</p>
                  <p className="text-gray-900 font-medium">{profile?.username || username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <p className="text-gray-900 font-medium">{profile?.phone || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Location</p>
                  <p className="text-gray-900 font-medium">
                    {profile?.city && profile?.state
                      ? `${profile.city}, ${profile.state}`
                      : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {statsLoading && <Loader className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.upcoming ?? upcomingAppointments.length}
            </p>
            <p className="text-sm text-gray-500">Upcoming</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {statsLoading && <Loader className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.completed ?? 0}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              {statsLoading && <Loader className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.pending ?? 0}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-red-600" />
              {statsLoading && <Loader className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.total ?? 0}</p>
            <p className="text-sm text-gray-500">Total Visits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointments Section */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
                {!loading && upcomingAppointments.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {upcomingAppointments.length}
                  </span>
                )}
              </div>

              <div className="p-5">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader className="w-6 h-6 text-blue-600 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Loading...</p>
                  </div>
                )}

                {error && !loading && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {!loading && !error && upcomingAppointments.length === 0 && (
                  <div className="text-center py-10">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-1">No upcoming appointments</p>
                    <p className="text-sm text-gray-500 mb-4">Book your next visit</p>
                    <button
                      onClick={() => navigate('/book-appointment')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Book Appointment
                    </button>
                  </div>
                )}

                {!loading && !error && upcomingAppointments.length > 0 && (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        onClick={() => handleViewDetails(appointment)}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 hover:bg-blue-50/30 transition cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
                            {appointment.doctor_info?.full_name?.split(' ').map(n => n[0]).join('') || 'DR'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {appointment.doctor_info?.full_name || 'Doctor'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {appointment.doctor_info?.specialties?.[0] || 'General Practice'}
                                </p>
                              </div>
                              <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${
                                appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {appointment.status_display}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1" />
                                {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric',
                                })}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1" />
                                {new Date(`2000-01-01T${appointment.appointment_time}`).toLocaleTimeString('en-US', {
                                  hour: 'numeric', minute: '2-digit', hour12: true,
                                })}
                              </span>
                              <span className="flex items-center capitalize">
                                {appointment.appointment_type === 'video' ? (
                                  <Video className="w-3.5 h-3.5 mr-1" />
                                ) : appointment.appointment_type === 'phone' ? (
                                  <Phone className="w-3.5 h-3.5 mr-1" />
                                ) : (
                                  <Building className="w-3.5 h-3.5 mr-1" />
                                )}
                                {appointment.appointment_type.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information Section */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => navigate('/settings')}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  Update
                </button>
              </div>
              <div className="p-5 space-y-4">
                {profileLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(profile?.date_of_birth || null)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Address</p>
                        <p className="text-sm font-medium text-gray-900">
                          {profile?.address || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Insurance Provider</p>
                        <p className="text-sm font-medium text-gray-900">
                          {profile?.insurance_provider || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Insurance ID</p>
                        <p className="text-sm font-medium text-gray-900">
                          {profile?.insurance_id || 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Emergency Contact</p>
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {profile?.emergency_contact_name || 'Not set'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {profile?.emergency_contact_phone || ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Notification Preferences</p>
                      <div className="flex flex-wrap gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          profile?.email_reminders ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          Email: {profile?.email_reminders ? 'On' : 'Off'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          profile?.sms_reminders ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          SMS: {profile?.sms_reminders ? 'On' : 'Off'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Insurance Document */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Insurance Document</h2>
              </div>
              <div className="p-5">
                {uploadingInsuranceDocument ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Uploading...</p>
                  </div>
                ) : profile?.insurance_document ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-green-800 text-sm">Document Uploaded</p>
                          <p className="text-xs text-green-600 truncate">
                            {profile.insurance_document_name || 'insurance_document'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={getMediaUrl(profile.insurance_document)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </a>
                      <button
                        onClick={handleDeleteInsurance}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                    <button
                      onClick={handleInsuranceClick}
                      className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Replace Document
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      onClick={handleInsuranceClick}
                      className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 hover:bg-blue-50/50 transition cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium text-gray-700 text-sm">Click to upload</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  </>
                )}
                <input
                  ref={insuranceInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleInsuranceSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-2">
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <Search className="w-4 h-4 mr-3 text-gray-400" />
                  Find a Doctor
                </button>
                <button
                  onClick={() => navigate('/book-appointment')}
                  className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                  Book Appointment
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <SettingsIcon className="w-4 h-4 mr-3 text-gray-400" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Appointment Details</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  selectedAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedAppointment.status_display}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold">
                    {selectedAppointment.doctor_info?.full_name?.split(' ').map(n => n[0]).join('') || 'DR'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedAppointment.doctor_info?.full_name}</h3>
                    <p className="text-sm text-gray-600">{selectedAppointment.doctor_info?.specialties?.join(', ')}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center">
                        <Star className="w-3.5 h-3.5 text-yellow-500 mr-1" />
                        {selectedAppointment.doctor_info?.average_rating}
                      </span>
                      <span>{selectedAppointment.doctor_info?.years_experience} yrs exp</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Time</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(`2000-01-01T${selectedAppointment.appointment_time}`).toLocaleTimeString('en-US', {
                      hour: 'numeric', minute: '2-digit', hour12: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Type</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{selectedAppointment.appointment_type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Duration</span>
                  <span className="text-sm font-medium text-gray-900">{selectedAppointment.duration_minutes} min</span>
                </div>
                {selectedAppointment.clinic_info && (
                  <div className="py-2">
                    <span className="text-sm text-gray-500">Location</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedAppointment.clinic_info.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedAppointment.clinic_info.address}, {selectedAppointment.clinic_info.city}
                    </p>
                  </div>
                )}
              </div>

              {selectedAppointment.reason && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Reason for visit</p>
                  <p className="text-sm text-gray-900">{selectedAppointment.reason}</p>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={handleCloseModal} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                Close
              </button>
              {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed') && (
                <button className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition text-sm">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
