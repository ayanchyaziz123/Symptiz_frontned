import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/index';
import {
  MapPin,
  Star,
  User,
  Globe,
  Award,
  Clock,
  AlertCircle,
  Search,
  ChevronRight,
  Stethoscope,
  CheckCircle,
  FileText,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import ConversationalSymptomChecker from '../components/ConversationalSymptomChecker';
import {
  setSearchLocation,
  filterProvidersBySpecialty,
  setFilterAcceptingNew,
  setFilterVideoVisit,
  setFilterMinRating,
  sortProviders,
  resetProviderFilters,
  fetchProviders,
  fetchCities,
} from '../store/slices/providerSlice';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Symptom state
  const {
    analysisResult,
  } = useAppSelector((state) => state.symptom);

  // Provider state
  const {
    allProviders,
    filteredProviders,
    searchLocation,
    loading: ProvidersLoading,
    error: ProvidersError,
    availableCities,
  } = useAppSelector((state) => state.provider);

  // Local state for suggestions dropdown
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [filteredCities, setFilteredCities] = React.useState<string[]>([]);

  // Local state for filters
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>('');
  const [selectedRating, setSelectedRating] = React.useState<number>(0);
  const [acceptingNewOnly, setAcceptingNewOnly] = React.useState(false);
  const [videoVisitOnly, setVideoVisitOnly] = React.useState(false);
  const [selectedSort, setSelectedSort] = React.useState<string>('');

  // Fetch Providers and cities from backend on component mount
  useEffect(() => {
    dispatch(fetchProviders(undefined)); // Fetch all Providers initially
    dispatch(fetchCities()); // Fetch available cities for suggestions
  }, [dispatch]);

  // Filter cities based on search input
  useEffect(() => {
    if (searchLocation.trim()) {
      const filtered = availableCities.filter(city =>
        city.toLowerCase().includes(searchLocation.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(availableCities);
    }
  }, [searchLocation, availableCities]);

  const handleLocationSearch = () => {
    if (searchLocation.trim()) {
      dispatch(fetchProviders(searchLocation));
    } else {
      dispatch(fetchProviders(undefined)); // Fetch all if location is empty
    }
    setShowSuggestions(false);
  };

  const handleCitySelect = (city: string) => {
    dispatch(setSearchLocation(city));
    dispatch(fetchProviders(city));
    setShowSuggestions(false);
  };

  // Helper function to get Provider initials for avatar fallback
  const getInitials = (name: string) => {
    const names = name.replace('Dr. ', '').split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function to get profile picture URL
  const getProfilePictureUrl = (profilePicture: string | null | undefined) => {
    if (!profilePicture) return null;
    // If it's already a full URL, return it
    if (profilePicture.startsWith('http')) return profilePicture;
    // Otherwise, prepend the backend URL
    return `http://127.0.0.1:8000${profilePicture}`;
  };

  // Filter Providers when analysis result changes
  useEffect(() => {
    if (analysisResult) {
      dispatch(filterProvidersBySpecialty(analysisResult.providerType));
    }
  }, [analysisResult, dispatch]);

  // Scroll to results when analysis completes
  useEffect(() => {
    if (analysisResult) {
      setTimeout(() => {
        document.getElementById('analysis-results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [analysisResult]);

  const handleSearchLocationChange = (location: string) => {
    dispatch(setSearchLocation(location));
  };

  // Filter handlers
  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    dispatch(filterProvidersBySpecialty(specialty || null));
  };

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
    dispatch(setFilterMinRating(rating));
  };

  const handleAcceptingNewChange = (value: boolean) => {
    setAcceptingNewOnly(value);
    dispatch(setFilterAcceptingNew(value));
  };

  const handleVideoVisitChange = (value: boolean) => {
    setVideoVisitOnly(value);
    dispatch(setFilterVideoVisit(value));
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    dispatch(sortProviders(sort ? (sort as 'rating' | 'distance' | 'experience') : null));
  };

  const handleClearFilters = () => {
    setSelectedSpecialty('');
    setSelectedRating(0);
    setAcceptingNewOnly(false);
    setVideoVisitOnly(false);
    setSelectedSort('');
    dispatch(resetProviderFilters());
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'emergency':
        return 'bg-red-50 border-red-400 text-red-800';
      case 'urgent_care':
      case 'urgent care':
        return 'bg-orange-50 border-orange-400 text-orange-800';
      case 'Provider_visit':
      case 'schedule appointment':
        return 'bg-blue-50 border-blue-400 text-blue-800';
      case 'home_care':
      case 'self-care':
        return 'bg-green-50 border-green-400 text-green-800';
      default:
        return 'bg-gray-50 border-gray-400 text-gray-800';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'emergency':
        return '🚨';
      case 'urgent_care':
      case 'urgent care':
        return '⚠️';
      case 'Provider_visit':
      case 'schedule appointment':
        return '📅';
      case 'home_care':
      case 'self-care':
        return '✅';
      default:
        return '📋';
    }
  };

  const formatUrgencyText = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'Provider_visit':
        return 'Schedule Appointment';
      case 'home_care':
        return 'Self-Care';
      case 'urgent_care':
        return 'Urgent Care';
      case 'emergency':
        return 'Emergency';
      default:
        return urgency;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 lg:py-12">
        <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Sticky Symptom Checker */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-4">
              <ConversationalSymptomChecker />
            </div>
          </div>

          {/* Right Column - Results and Providers */}
          <div className="lg:col-span-3">
            {/* Analysis Results */}
            {analysisResult ? (
              <div id="analysis-results" className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-1 flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          Clinical Assessment Report
                        </h3>
                        <p className="text-blue-100 text-xs sm:text-sm">AI-Powered Symptom Analysis</p>
                      </div>
                      {analysisResult.confidence && (
                        <div className="text-right">
                          <div className="text-xs text-blue-100 mb-1">Analysis Confidence</div>
                          <div className="text-2xl font-bold text-white">{Math.round(analysisResult.confidence * 100)}%</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    {/* Urgency Alert Box */}
                    <div className={`rounded-lg border-2 mb-6 overflow-hidden ${getUrgencyColor(analysisResult.urgency)}`}>
                      <div className="bg-white bg-opacity-40 px-4 py-2 border-b-2 border-current border-opacity-30">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{getUrgencyIcon(analysisResult.urgency)}</span>
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">Care Priority Level</div>
                            <div className="text-lg sm:text-xl font-bold">
                              {formatUrgencyText(analysisResult.urgency)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 bg-white bg-opacity-60">
                        <div className="mb-3">
                          <div className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Primary Assessment</div>
                          <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">{analysisResult.condition}</div>
                          <p className="text-sm text-gray-700 leading-relaxed">{analysisResult.description}</p>
                        </div>

                        {analysisResult.urgency.toLowerCase() === 'emergency' && (
                          <a href="tel:911" className="block w-full bg-red-600 text-white py-3 rounded-lg font-bold text-center hover:bg-red-700 transition text-sm sm:text-base shadow-lg mt-3">
                            🚨 CALL 911 IMMEDIATELY - Emergency Services
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Clinical Details Section */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 pb-2 border-b-2 border-gray-200">
                          Clinical Recommendations
                        </h4>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {/* Recommendation Card */}
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 text-sm mb-1">Recommended Action</h5>
                                <p className="text-gray-700 text-sm leading-relaxed">{analysisResult.recommendation}</p>
                              </div>
                            </div>
                          </div>

                          {/* When to Seek Care Card */}
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                                <Clock className="w-5 h-5 text-amber-600" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 text-sm mb-1">Timing Guidelines</h5>
                                <p className="text-gray-700 text-sm leading-relaxed">{analysisResult.whenToSeek}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Possible Causes Section */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 pb-2 border-b-2 border-gray-200">
                          Differential Diagnosis
                        </h4>
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                              <AlertCircle className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 text-sm mb-2">Possible Underlying Conditions</h5>
                              <ul className="space-y-1.5">
                                {analysisResult.possibleCauses.map((cause, index) => (
                                  <li key={index} className="text-gray-700 text-sm flex items-start">
                                    <span className="inline-block w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    <span>{cause}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reported Symptoms */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 pb-2 border-b-2 border-gray-200">
                          Patient-Reported Symptoms
                        </h4>
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                              <FileText className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-700 text-sm leading-relaxed italic">"{analysisResult.symptoms}"</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommended Specialties */}
                    {analysisResult.recommendedSpecialties && analysisResult.recommendedSpecialties.length > 0 && (
                      <div className="border-t-2 border-gray-200 pt-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                          Recommended Medical Specialists
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.recommendedSpecialties.map((specialty, index) => (
                            <span key={index} className="inline-flex items-center bg-white border-2 border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                              <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommended Providers */}
                  {analysisResult.urgency.toLowerCase() !== 'emergency' && analysisResult.urgency.toLowerCase() !== 'home_care' && analysisResult.urgency.toLowerCase() !== 'self-care' && (
                    <div className="p-4 sm:p-6 pt-0">
                    <div className="mt-4 sm:mt-6">
                      <div className="bg-blue-600 rounded-lg p-4 mb-4 text-white shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base sm:text-lg font-bold mb-1">Recommended Providers Near You</h4>
                            <p className="text-blue-100 text-xs sm:text-sm">
                              Specialty: {analysisResult.providerType}
                            </p>
                          </div>
                          <Stethoscope className="w-8 sm:w-10 h-8 sm:h-10 opacity-30" />
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        {(filteredProviders.length > 0 ? filteredProviders : allProviders).slice(0, 4).map((Provider) => (
                          <div
                            key={Provider.id}
                            className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 hover:shadow-md transition"
                          >
                            <div className="flex gap-3 sm:gap-4">
                              {/* Provider Avatar */}
                              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-blue-200">
                                {Provider.profilePicture && getProfilePictureUrl(Provider.profilePicture) ? (
                                  <img
                                    src={getProfilePictureUrl(Provider.profilePicture)!}
                                    alt={Provider.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      if (e.currentTarget.nextSibling) {
                                        (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                                      }
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
                                  style={{
                                    display: Provider.profilePicture && getProfilePictureUrl(Provider.profilePicture) ? 'none' : 'flex'
                                  }}
                                >
                                  <span className="text-white font-bold text-base sm:text-lg">
                                    {getInitials(Provider.name)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-sm sm:text-base text-gray-900 mb-0.5">{Provider.name}</h5>
                                <p className="text-blue-600 font-medium text-xs sm:text-sm mb-2">{Provider.specialty}</p>

                                <div className="flex items-center gap-2 mb-2 text-xs flex-wrap">
                                  <div className="flex items-center">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                                    <span className="font-bold">{Provider.rating}</span>
                                    <span className="text-gray-500 ml-1">({Provider.reviews})</span>
                                  </div>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-gray-600">{Provider.distance}</span>
                                </div>

                                <div className="space-y-1 mb-2 sm:mb-3 text-xs">
                                  <div className="flex items-center text-gray-600">
                                    <Clock className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                    <span className="font-medium text-blue-600">{Provider.availability}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <MapPin className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                    <span className="truncate">{Provider.clinic}</span>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => navigate(`/Provider/${Provider.id}`)}
                                    className="flex-1 bg-white border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-50 transition"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() =>
                                      navigate('/book-appointment', {
                                        state: { Provider, urgencyResult: analysisResult },
                                      })
                                    }
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center shadow-sm"
                                  >
                                    Book Now
                                    <ChevronRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 ml-1" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* All Providers Section - Always Visible */}
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 ${analysisResult ? 'mt-4 sm:mt-6' : ''}`}>
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  All Healthcare Providers
                </h2>

                {/* Filter Section */}
                <div className="mb-4 sm:mb-6">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                    {(selectedSpecialty || selectedRating > 0 || acceptingNewOnly || videoVisitOnly || selectedSort) && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {[selectedSpecialty, selectedRating > 0, acceptingNewOnly, videoVisitOnly, selectedSort].filter(Boolean).length}
                      </span>
                    )}
                  </button>

                  {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {/* Specialty Filter */}
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            Specialty
                          </label>
                          <select
                            value={selectedSpecialty}
                            onChange={(e) => handleSpecialtyChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="">All Specialties</option>
                            <option value="Family Medicine">Family Medicine</option>
                            <option value="Internal Medicine">Internal Medicine</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Psychiatry">Psychiatry</option>
                            <option value="Ophthalmology">Ophthalmology</option>
                            <option value="ENT">ENT</option>
                          </select>
                        </div>

                        {/* Rating Filter */}
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            Minimum Rating
                          </label>
                          <select
                            value={selectedRating}
                            onChange={(e) => handleRatingChange(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="0">Any Rating</option>
                            <option value="3">3+ Stars</option>
                            <option value="4">4+ Stars</option>
                            <option value="4.5">4.5+ Stars</option>
                          </select>
                        </div>

                        {/* Sort By */}
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            Sort By
                          </label>
                          <select
                            value={selectedSort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="">Default</option>
                            <option value="rating">Highest Rated</option>
                            <option value="experience">Most Experienced</option>
                            <option value="distance">Nearest</option>
                          </select>
                        </div>
                      </div>

                      {/* Checkbox Filters */}
                      <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={acceptingNewOnly}
                            onChange={(e) => handleAcceptingNewChange(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs sm:text-sm text-gray-700">Accepting New Patients</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={videoVisitOnly}
                            onChange={(e) => handleVideoVisitChange(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs sm:text-sm text-gray-700">Video Visit Available</span>
                        </label>

                        {(selectedSpecialty || selectedRating > 0 || acceptingNewOnly || videoVisitOnly || selectedSort) && (
                          <button
                            onClick={handleClearFilters}
                            className="ml-auto flex items-center gap-1 text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            <X className="w-4 h-4" />
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial relative">
                    <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                    <div className="relative flex-1 sm:flex-initial">
                      <input
                        type="text"
                        value={searchLocation}
                        onChange={(e) => {
                          handleSearchLocationChange(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleLocationSearch();
                          } else if (e.key === 'Escape') {
                            setShowSuggestions(false);
                          }
                        }}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                        placeholder="Enter city or state"
                      />

                      {/* Suggestions Dropdown */}
                      {showSuggestions && filteredCities.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredCities.map((city, index) => (
                            <button
                              key={index}
                              onClick={() => handleCitySelect(city)}
                              className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 hover:text-blue-700 transition flex items-center gap-2"
                            >
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {city}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLocationSearch}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center text-xs sm:text-sm shadow-sm"
                  >
                    <Search className="w-4 h-4 mr-1 sm:mr-2" />
                    Search
                  </button>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">
                  <strong>{allProviders.length} providers</strong> available
                </p>
              </div>

              {/* Loading State */}
              {ProvidersLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600 text-sm">Loading Providers from backend...</p>
                </div>
              )}

              {/* Error State */}
              {ProvidersError && !ProvidersLoading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-800 mb-1">Failed to load Providers</h3>
                      <p className="text-xs text-red-700">{ProvidersError}</p>
                      <button
                        onClick={() => dispatch(fetchProviders())}
                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-red-700 transition"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!ProvidersLoading && !ProvidersError && allProviders.length === 0 && (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm">No Providers available at the moment.</p>
                  <button
                    onClick={() => dispatch(fetchProviders())}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Refresh
                  </button>
                </div>
              )}

              {/* Provider Cards */}
              {!ProvidersLoading && allProviders.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {allProviders.map((Provider) => (
                  <div
                    key={Provider.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-gray-300 hover:shadow-md transition"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Provider Avatar */}
                      <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden">
                        {Provider.profilePicture && getProfilePictureUrl(Provider.profilePicture) ? (
                          <img
                            src={getProfilePictureUrl(Provider.profilePicture)!}
                            alt={Provider.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextSibling) {
                                (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
                          style={{
                            display: Provider.profilePicture && getProfilePictureUrl(Provider.profilePicture) ? 'none' : 'flex'
                          }}
                        >
                          <span className="text-white font-bold text-lg sm:text-xl">
                            {getInitials(Provider.name)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="font-bold text-base sm:text-lg text-gray-900 truncate">{Provider.name}</h4>
                            <p className="text-gray-600 font-medium text-xs sm:text-sm">{Provider.specialty}</p>
                          </div>
                          {Provider.acceptingNew && (
                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 border border-green-200">
                              ✓ New
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-2 flex-wrap text-xs">
                          <div className="flex items-center">
                            <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                            <span className="font-bold text-gray-900">{Provider.rating}</span>
                            <span className="text-gray-500 ml-1">({Provider.reviews})</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center text-gray-600">
                            <Award className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1" />
                            {Provider.experience}
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="text-gray-600">{Provider.distance}</div>
                        </div>

                        <div className="space-y-1 mb-2 sm:mb-3 text-xs">
                          <div className="flex items-center text-gray-600">
                            <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 sm:mr-2 flex-shrink-0" />
                            <span className="truncate">{Provider.languages.join(', ')}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 sm:mr-2 flex-shrink-0" />
                            <span className="truncate">{Provider.clinic}</span>
                          </div>
                          <div className="flex items-center font-medium text-blue-600">
                            <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 sm:mr-2 flex-shrink-0" />
                            {Provider.availability}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 sm:pt-3 border-t border-gray-100">
                          <div className="text-xs hidden sm:block">
                            <span className="text-gray-500">From </span>
                            <span className="font-semibold text-gray-900">{Provider.cost}</span>
                          </div>
                          <div className="flex gap-2 flex-1 sm:flex-initial">
                            <button
                              onClick={() => navigate(`/Provider/${Provider.id}`)}
                              className="flex-1 sm:flex-initial bg-white border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition text-xs sm:text-sm"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() =>
                                navigate('/book-appointment', {
                                  state: { Provider, urgencyResult: analysisResult },
                                })
                              }
                              className="flex-1 sm:flex-initial bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center text-xs sm:text-sm shadow-sm"
                            >
                              Book Now
                              <ChevronRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;