import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  fetchOwnProfile,
  updateOwnProfile,
  fetchSpecialties,
  uploadProfilePicture,
  deleteProfilePicture,
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
  Camera,
  Trash2,
  Upload,
  ArrowLeft,
  Globe,
  Moon,
  Trash,
  Briefcase,
  Settings,
} from 'lucide-react';
import { getMediaUrl } from '../../config/api';

const ProviderSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { ownProfile, profileLoading, profileError, allSpecialties } = useAppSelector(
    (state) => state.provider
  );

  const [activeTab, setActiveTab] = useState<'account' | 'professional' | 'security' | 'notifications' | 'preferences'>('account');

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

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'America/New_York',
    theme: 'light',
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Profile picture state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) || 0 : value,
      }));
    }
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

  // Profile picture handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size too large. Maximum size is 5MB.');
      return;
    }

    setSelectedImage(file);
    setUploadError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setUploadStatus('uploading');
    setUploadError(null);

    try {
      await dispatch(uploadProfilePicture(selectedImage)).unwrap();
      setUploadStatus('success');
      setSelectedImage(null);
      setImagePreview(null);
      dispatch(fetchOwnProfile());
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (err: any) {
      setUploadStatus('error');
      setUploadError(err || 'Failed to upload profile picture');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  const handleImageDelete = async () => {
    if (!ownProfile?.user?.profile_picture) return;

    setUploadStatus('uploading');
    try {
      await dispatch(deleteProfilePicture()).unwrap();
      setUploadStatus('success');
      dispatch(fetchOwnProfile());
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (err: any) {
      setUploadStatus('error');
      setUploadError(err || 'Failed to delete profile picture');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  const cancelImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings },
  ];

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 animate-spin text-teal-600" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Settings</h2>
          <p className="text-gray-600 mb-4">{profileError}</p>
          <button
            onClick={() => dispatch(fetchOwnProfile())}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
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
        <div className="mb-6">
          <button
            onClick={() => navigate('/provider/profile')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Save Status Banners */}
        {saveStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">Settings updated successfully!</span>
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
            <div className="bg-white rounded-xl border border-gray-200 p-2 sticky top-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition ${
                      activeTab === tab.id
                        ? 'bg-teal-50 text-teal-700 font-semibold'
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
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* ── Account Tab ── */}
              {activeTab === 'account' && (
                <div>
                  <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                    <div className="bg-blue-100 p-3 rounded-lg mr-3">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                      <p className="text-sm text-gray-600">Update your profile picture and contact information</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Profile Picture Section */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                        Profile Picture
                      </h3>
                      <div className="flex items-start gap-6">
                        {/* Current/Preview Image */}
                        <div className="relative">
                          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : ownProfile?.user?.profile_picture ? (
                              <img
                                src={getMediaUrl(ownProfile.user.profile_picture)}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-16 h-16 text-gray-400" />
                            )}
                          </div>
                          {uploadStatus === 'uploading' && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                              <Activity className="w-8 h-8 text-white animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="hidden"
                          />

                          {!selectedImage ? (
                            <div className="space-y-3">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                              >
                                <Camera className="w-4 h-4" />
                                {ownProfile?.user?.profile_picture ? 'Change Photo' : 'Upload Photo'}
                              </button>

                              {ownProfile?.user?.profile_picture && (
                                <button
                                  onClick={handleImageDelete}
                                  className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove Photo
                                </button>
                              )}

                              <p className="text-xs text-gray-500">
                                JPEG, PNG, GIF, or WebP. Max 5MB.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-sm text-gray-700 font-medium">{selectedImage.name}</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleImageUpload}
                                  disabled={uploadStatus === 'uploading'}
                                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition disabled:opacity-50"
                                >
                                  <Upload className="w-4 h-4" />
                                  Upload
                                </button>
                                <button
                                  onClick={cancelImageSelection}
                                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Upload status messages */}
                          {uploadStatus === 'success' && (
                            <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Profile picture updated!
                            </div>
                          )}
                          {uploadError && (
                            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              {uploadError}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                        Contact Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Email
                          </label>
                          <input
                            type="email"
                            value={ownProfile?.user?.email || ''}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Phone className="w-4 h-4 inline mr-1" />
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={ownProfile?.user?.phone || ''}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1">Contact support to change your phone</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Professional Tab ── */}
              {activeTab === 'professional' && (
                <div>
                  <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                    <div className="bg-teal-100 p-3 rounded-lg mr-3">
                      <Briefcase className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Professional Information</h2>
                      <p className="text-sm text-gray-600">Update your credentials and practice details</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                        <input
                          type="text"
                          name="license_number"
                          value={formData.license_number}
                          onChange={handleFieldChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                        <input
                          type="number"
                          name="years_experience"
                          value={formData.years_experience}
                          onChange={handleFieldChange}
                          min={0}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleFieldChange}
                        rows={4}
                        placeholder="Write a short bio about yourself and your practice..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Languages Spoken</label>
                      <input
                        type="text"
                        name="languages"
                        value={formData.languages}
                        onChange={handleFieldChange}
                        placeholder="e.g. English, Spanish, French"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Comma-separated list of languages</p>
                    </div>

                    {/* Specialties */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
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
                                  className="w-4 h-4 text-teal-600 rounded"
                                />
                                <span className="text-sm text-gray-700">{specialty.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Availability Toggles */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">Accepting New Patients</p>
                          <p className="text-xs text-gray-500">Allow new patients to book</p>
                        </div>
                        <button
                          onClick={() => handleToggle('accepting_new_patients')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.accepting_new_patients ? 'bg-teal-600' : 'bg-gray-200'
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
                          <p className="font-semibold text-gray-900 text-sm">Video Visits</p>
                          <p className="text-xs text-gray-500">Enable video consultations</p>
                        </div>
                        <button
                          onClick={() => handleToggle('video_visit_available')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.video_visit_available ? 'bg-teal-600' : 'bg-gray-200'
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
                      <p className="text-sm text-gray-600">Manage your password and account security</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              name="currentPassword"
                              value={securityData.currentPassword}
                              onChange={(e) => setSecurityData({ ...securityData, [e.target.name]: e.target.value })}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              name="newPassword"
                              value={securityData.newPassword}
                              onChange={(e) => setSecurityData({ ...securityData, [e.target.name]: e.target.value })}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              name="confirmPassword"
                              value={securityData.confirmPassword}
                              onChange={(e) => setSecurityData({ ...securityData, [e.target.name]: e.target.value })}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

              {/* ── Preferences Tab ── */}
              {activeTab === 'preferences' && (
                <div>
                  <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                    <div className="bg-purple-100 p-3 rounded-lg mr-3">
                      <Settings className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Application Preferences</h2>
                      <p className="text-sm text-gray-600">Customize your experience</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="w-4 h-4 inline mr-1" />
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Moon className="w-4 h-4 inline mr-1" />
                        Theme
                      </label>
                      <select
                        value={preferences.theme}
                        onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide mb-4">Danger Zone</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">Delete Account</h4>
                          <p className="text-xs text-gray-600">
                            Permanently delete your account and all data. This action cannot be undone.
                          </p>
                        </div>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition whitespace-nowrap ml-4 flex items-center gap-2">
                          <Trash className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {(activeTab === 'professional' || activeTab === 'account') && (
                <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving' || !ownProfile}
                    className="flex-1 bg-teal-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
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
              )}
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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ml-4 flex-shrink-0 ${
        checked ? 'bg-teal-600' : 'bg-gray-200'
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