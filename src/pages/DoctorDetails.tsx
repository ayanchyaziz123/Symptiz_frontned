import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Phone,
  Mail,
  Calendar,
  Clock,
  Star,
  Award,
  Video,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Languages,
  Building2,
  Stethoscope,
  AlertCircle,
} from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api/doctors';

interface Specialty {
  id: number;
  name: string;
  description?: string;
}

interface Clinic {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email?: string;
}

interface Affiliation {
  id: number;
  clinic: Clinic;
  is_primary: boolean;
  office_phone: string;
  office_address: string;
}

interface Availability {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  clinic: Clinic;
  is_active: boolean;
}

interface Review {
  id: number;
  patient_name?: string;
  patient_id?: number;
  rating: number;
  comment: string;
  would_recommend: boolean;
  created_at: string;
}

interface DoctorDetail {
  id: number;
  full_name: string;
  user?: {
    email: string;
    phone: string;
  };
  specialties: Specialty[];
  bio: string;
  years_experience: number;
  education?: string;
  certifications?: string;
  languages: string;
  profile_picture?: string | null;
  average_rating: number | string; // Can be string from DecimalField
  total_reviews: number;
  accepting_new_patients: boolean;
  video_visit_available: boolean;
  is_verified: boolean;
  clinics_info?: Affiliation[];
  availability?: Availability[];
  all_reviews?: Review[];
}

const DoctorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'availability'>('overview');

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<DoctorDetail>(`${API_URL}/doctors/${id}/`);
      setDoctor(response.data);
    } catch (err: any) {
      console.error('Failed to fetch doctor details:', err);
      setError(err.response?.data?.error || 'Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    if (!doctor) return;

    const affiliations = doctor.clinics_info || [];
    const primaryAffiliation = affiliations.find((a) => a.is_primary) || affiliations[0];

    // Transform DoctorDetail to Doctor format expected by BookAppointment
    const doctorForBooking = {
      id: doctor.id,
      name: doctor.full_name,
      specialty: doctor.specialties.map(s => s.name).join(', '),
      experience: `${doctor.years_experience} years`,
      rating: Number(doctor.average_rating),
      reviews: doctor.total_reviews,
      languages: doctor.languages.split(',').map(l => l.trim()),
      distance: primaryAffiliation?.clinic.city || 'N/A',
      clinic: primaryAffiliation?.clinic.name || 'N/A',
      availability: doctor.accepting_new_patients ? 'Available' : 'Not Available',
      cost: 'Contact clinic',
      acceptingNew: doctor.accepting_new_patients,
      videoVisit: doctor.video_visit_available,
      profilePicture: doctor.profile_picture,
    };

    navigate('/book-appointment', {
      state: {
        doctor: doctorForBooking,
      },
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getDayName = (day: string) => {
    const days: Record<string, string> = {
      MON: 'Monday',
      TUE: 'Tuesday',
      WED: 'Wednesday',
      THU: 'Thursday',
      FRI: 'Friday',
      SAT: 'Saturday',
      SUN: 'Sunday',
    };
    return days[day] || day;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Doctor not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const affiliations = doctor.clinics_info || [];
  const primaryAffiliation = affiliations.find((a) => a.is_primary) || affiliations[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                {doctor.profile_picture ? (
                  <img
                    src={doctor.profile_picture}
                    alt={doctor.full_name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Stethoscope className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
                )}
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex-grow">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap justify-center md:justify-start">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{doctor.full_name}</h1>
                    {doctor.is_verified && (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3 justify-center md:justify-start">
                    {doctor.specialties.map((specialty) => (
                      <span
                        key={specialty.id}
                        className="bg-blue-100 text-blue-700 px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium"
                      >
                        {specialty.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      {renderStars(Number(doctor.average_rating))}
                      <span className="font-semibold ml-1">{Number(doctor.average_rating).toFixed(1)}</span>
                      <span className="text-gray-400">({doctor.total_reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{doctor.years_experience} years experience</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm justify-center md:justify-start">
                    {doctor.accepting_new_patients ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Accepting new patients
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Not accepting new patients
                      </span>
                    )}
                    {doctor.video_visit_available && (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Video visits available
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleBookAppointment}
                  disabled={!doctor.accepting_new_patients}
                  className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-4 sm:gap-6 min-w-max sm:min-w-0">
            {['overview', 'reviews', 'availability'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`py-3 sm:py-4 px-2 border-b-2 font-medium transition text-sm sm:text-base whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              {doctor.bio && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">About</h2>
                  <p className="text-gray-600 whitespace-pre-line text-sm sm:text-base">{doctor.bio}</p>
                </div>
              )}

              {/* Professional Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Professional Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">Years of Experience</p>
                    <p className="text-gray-900 text-sm sm:text-base">{doctor.years_experience} years</p>
                  </div>
                  {doctor.languages && (
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">Languages</p>
                      <p className="text-gray-900 text-sm sm:text-base">{doctor.languages}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">Verification Status</p>
                    <p className="text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                      {doctor.is_verified ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                          <span className="text-green-600">Verified Healthcare Provider</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">Pending Verification</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {doctor.user?.phone && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900 text-sm sm:text-base break-all">{doctor.user.phone}</p>
                      </div>
                    </div>
                  )}
                  {doctor.user?.email && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500">Email</p>
                        <p className="text-gray-900 text-sm sm:text-base break-all">{doctor.user.email}</p>
                      </div>
                    </div>
                  )}
                  {doctor.languages && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500">Languages</p>
                        <p className="text-gray-900 text-sm sm:text-base">{doctor.languages}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Clinic */}
              {primaryAffiliation && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Primary Location</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{primaryAffiliation.clinic.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {primaryAffiliation.clinic.address}
                          <br />
                          {primaryAffiliation.clinic.city}, {primaryAffiliation.clinic.state}{' '}
                          {primaryAffiliation.clinic.zip_code}
                        </p>
                      </div>
                    </div>
                    {primaryAffiliation.office_phone && (
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-gray-500">Office Phone</p>
                          <p className="text-gray-900 text-sm sm:text-base">{primaryAffiliation.office_phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* All Locations */}
              {affiliations.length > 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Other Locations</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {affiliations
                      .filter((a) => !a.is_primary)
                      .map((affiliation) => (
                        <div key={affiliation.id} className="border-t border-gray-100 pt-3 sm:pt-4 first:border-t-0 first:pt-0">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">{affiliation.clinic.name}</p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            {affiliation.clinic.city}, {affiliation.clinic.state}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Patient Reviews</h2>
            {doctor.all_reviews && doctor.all_reviews.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {doctor.all_reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 sm:pb-6 last:border-b-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {review.patient_name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-xs sm:text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {review.would_recommend && (
                        <span className="text-xs sm:text-sm text-green-600 font-medium">
                          Would recommend
                        </span>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 mt-2 text-sm sm:text-base">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No reviews yet</p>
            )}
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Office Hours</h2>
            {doctor.availability && doctor.availability.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {doctor.availability
                  .filter((a) => a.is_active)
                  .sort((a, b) => {
                    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
                    return days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week);
                  })
                  .map((availability) => (
                    <div
                      key={availability.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 last:border-b-0 gap-2"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          {getDayName(availability.day_of_week)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base ml-6 sm:ml-0">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>
                          {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
                Availability information not provided
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDetails;
