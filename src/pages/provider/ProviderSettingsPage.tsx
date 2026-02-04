import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  fetchOwnProfile,
  updateOwnProfile,
  fetchSpecialties,
} from '../../store/slices/providerSlice';
import {
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  Save,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Activity,
} from 'lucide-react';

const ProviderSettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { ownProfile, profileLoading, profileError, allSpecialties } = useAppSelector(
    (state) => state.provider
  );

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  // Editable provider fields
  const [formData, setFormData] = useState({
    license_number: '',
    years_experience: 0,
    bio: '',
    languages: '',
    accepting_new_patients: true,
    video_visit_available: false,
    specialty_ids: [] as number[],
  });

  // Security state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    patientMessages: true,
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    dispatch(fetchOwnProfile());
    dispatch(fetchSpecialties());
  }, [dispatch]);

  // Populate form when profile loads
  useEffect(() => {
    if (ownProfile) {
      setFormData({
        license_number: ownProfile.license_number || '',
        years_experience: ownProfile.years_experience || 0,
        bio: ownProfile.bio || '',
        languages: ownProfile.languages || '',
        accepting_new_patients: ownProfile.accepting_new_patients,
        video_visit_available: ownProfile.video_visit_available,
        specialty_ids: ownProfile.specialties.map((s) => s.id),
      });
    }
  }, [ownProfile]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleToggle = (field: 'accepting_new_patients' | 'video_visit_available') => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSpecialtyToggle = (specialtyId: number) => {
    setFormData((prev) => {
      const ids = prev.specialty_ids;
      return {
        ...prev,
        specialty_ids: ids.includes(specialtyId)
          ? ids.filter((id) => id !== specialtyId)
          : [...ids, specialtyId],
      };
    });
  };

  const handleSave = async () => {
    if (!ownProfile) return;
    setSaveStatus('saving');
    try {
      await dispatch(
        updateOwnProfile({
          id: ownProfile.id,
          data: formData,
        })
      ).unwrap();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Profile</h2>
          <p className="text-gray-600 mb-4">{profileError}</p>
          <button
            onClick={() => dispatch(fetchOwnProfile())}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Settings</h1>
          <p className="text-gray-600">Manage your professional profile and preferences</p>
        </div>

        {/* Save Status Banners */}
        {saveStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">Profile updated successfully!</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">Failed to save changes. Please try again.</span>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>

            {/* Account Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mt-4">
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 p-3 rounded-lg mr-3">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Dr. {ownProfile?.user?.first_name} {ownProfile?.user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">Provider</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Verification Status</p>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${
                    ownProfile?.is_verified
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}
                >
                  {ownProfile?.is_verified ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" /> Pending
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* ── Profile Tab ── */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                    <div className="bg-blue-100 p-3 rounded-lg mr-3">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                      <p className="text-sm text-gray-600">View and update your professional details</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Personal Info — read-only display */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                          Personal Information
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Read-only</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                            {ownProfile?.user?.full_name || '—'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                            <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-gray-600">{ownProfile?.user?.email || '—'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone</label>
                          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                            <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-gray-600">{ownProfile?.user?.phone || '—'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Location</label>
                          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                            {[ownProfile?.user?.city, ownProfile?.user?.state].filter(Boolean).join(', ') || '—'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Professional Info — editable */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                        Professional Information
                      </h3>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">License Number</label>
                            <input
                              type="text"
                              name="license_number"
                              value={formData.license_number}
                              onChange={handleFieldChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Years of Experience</label>
                            <input
                              type="number"
                              name="years_experience"
                              value={formData.years_experience}
                              onChange={handleFieldChange}
                              min={0}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bio</label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleFieldChange}
                            rows={3}
                            placeholder="Write a short bio about yourself..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Languages</label>
                          <input
                            type="text"
                            name="languages"
                            value={formData.languages}
                            onChange={handleFieldChange}
                            placeholder="e.g. English, Spanish, French"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Comma-separated list of languages</p>
                        </div>

                        {/* Specialties */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Specialties</label>
                          <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                            {allSpecialties.length === 0 ? (
                              <p className="text-sm text-gray-500">No specialties available</p>
                            ) : (
                              <div className="grid md:grid-cols-2 gap-2">
                                {allSpecialties.map((specialty) => (
                                  <label
                                    key={specialty.id}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={formData.specialty_ids.includes(specialty.id)}
                                      onChange={() => handleSpecialtyToggle(specialty.id)}
                                      className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">{specialty.name}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Toggles */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">Accepting New Patients</p>
                              <p className="text-xs text-gray-500">Allow new patients to book</p>
                            </div>
                            <button
                              onClick={() => handleToggle('accepting_new_patients')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                formData.accepting_new_patients ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  formData.accepting_new_patients ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">Video Visit</p>
                              <p className="text-xs text-gray-500">Enable video consultations</p>
                            </div>
                            <button
                              onClick={() => handleToggle('video_visit_available')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                formData.video_visit_available ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  formData.video_visit_available ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Security Tab ── */}
              {activeTab === 'security' && (
                <div>
                  <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                    <div className="bg-red-100 p-3 rounded-lg mr-3">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                      <p className="text-sm text-gray-600">Manage your password and security</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current Password</label>
                          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                            <Lock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              name="currentPassword"
                              value={securityData.currentPassword}
                              onChange={(e) => setSecurityData({ ...securityData, [e.target.name]: e.target.value })}
                              className="w-full focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Password</label>
                          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                            <Lock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              name="newPassword"
                              value={securityData.newPassword}
                              onChange={(e) => setSecurityData({ ...securityData, [e.target.name]: e.target.value })}
                              className="w-full focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                            <Lock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              name="confirmPassword"
                              value={securityData.confirmPassword}
                              onChange={(e) => setSecurityData({ ...securityData, [e.target.name]: e.target.value })}
                              className="w-full focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2FA */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                        Two-Factor Authentication
                      </h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm mb-1">
                                Enable Two-Factor Authentication
                              </p>
                              <p className="text-sm text-gray-600">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                          </div>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap ml-4">
                            Enable
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Notifications Tab ── */}
              {activeTab === 'notifications' && (
                <div>
                  <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                    <div className="bg-amber-100 p-3 rounded-lg mr-3">
                      <Bell className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                      <p className="text-sm text-gray-600">Choose how you want to be notified</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <NotificationToggle
                      label="Email Notifications"
                      description="Receive appointment and update notifications via email"
                      checked={notifications.emailNotifications}
                      onChange={() =>
                        setNotifications((prev) => ({ ...prev, emailNotifications: !prev.emailNotifications }))
                      }
                    />
                    <NotificationToggle
                      label="SMS Notifications"
                      description="Receive notifications via text message"
                      checked={notifications.smsNotifications}
                      onChange={() =>
                        setNotifications((prev) => ({ ...prev, smsNotifications: !prev.smsNotifications }))
                      }
                    />
                    <NotificationToggle
                      label="Appointment Reminders"
                      description="Get reminders before upcoming appointments"
                      checked={notifications.appointmentReminders}
                      onChange={() =>
                        setNotifications((prev) => ({ ...prev, appointmentReminders: !prev.appointmentReminders }))
                      }
                    />
                    <NotificationToggle
                      label="New Patient Messages"
                      description="Be notified when patients send messages"
                      checked={notifications.patientMessages}
                      onChange={() =>
                        setNotifications((prev) => ({ ...prev, patientMessages: !prev.patientMessages }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving' || !ownProfile}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Notification Toggle Helper ──
interface NotificationToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
    <div className="flex-1">
      <p className="font-semibold text-gray-900 text-sm mb-1">{label}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-4 flex-shrink-0 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export default ProviderSettingsPage;
