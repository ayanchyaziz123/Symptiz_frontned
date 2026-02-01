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
  Activity,
  AlertCircle,
  Search,
  ChevronRight,
  Stethoscope,
  TrendingUp,
  CheckCircle,
  FileText,
} from 'lucide-react';
import {
  setSymptomInput,
  analyzeSymptoms,
  clearSymptomError,
} from '../store/slices/symptomSlice';
import {
  setSearchLocation,
  filterDoctorsBySpecialty,
} from '../store/slices/doctorSlice';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Auth state
  const { isAuthenticated, firstName, lastName } = useAppSelector((state) => state.auth);
  
  // Symptom state
  const {
    symptomInput,
    analysisResult,
    isAnalyzing,
    error: symptomError,
  } = useAppSelector((state) => state.symptom);
  
  // Doctor state
  const {
    allDoctors,
    filteredDoctors,
    searchLocation,
  } = useAppSelector((state) => state.doctor);

  const userName = firstName && lastName ? `${firstName} ${lastName}` : firstName || 'there';

  const suggestionChips: string[] = [
    'Headache and fever for 2 days',
    'Persistent cough with mucus',
    'Chest pain and shortness of breath',
    'Skin rash on arms and legs',
    'Severe stomach pain and nausea',
    'Lower back pain for over a week',
    'Anxiety and difficulty sleeping',
    'Severe toothache with swelling',
  ];

  // Filter doctors when analysis result changes
  useEffect(() => {
    if (analysisResult) {
      dispatch(filterDoctorsBySpecialty(analysisResult.providerType));
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

  const handleAnalyzeSymptoms = () => {
    if (symptomInput.trim()) {
      dispatch(analyzeSymptoms(symptomInput));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    dispatch(setSymptomInput(suggestion));
  };

  const handleSearchLocationChange = (location: string) => {
    dispatch(setSearchLocation(location));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'emergency':
        return 'bg-red-50 border-red-500 text-red-700';
      case 'urgent_care':
      case 'urgent care':
        return 'bg-orange-50 border-orange-500 text-orange-700';
      case 'doctor_visit':
      case 'schedule appointment':
        return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      case 'home_care':
      case 'self-care':
        return 'bg-green-50 border-green-500 text-green-700';
      default:
        return 'bg-gray-50 border-gray-500 text-gray-700';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'emergency':
        return '🚨';
      case 'urgent_care':
      case 'urgent care':
        return '⚠️';
      case 'doctor_visit':
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
      case 'doctor_visit':
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 lg:py-12">
        <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Sticky Symptom Checker */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="inline-flex items-center bg-teal-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
                    <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-teal-600 mr-2" />
                    <span className="font-semibold text-teal-700 text-sm sm:text-base">AI Symptom Checker</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {isAuthenticated ? `Hello, ${userName}!` : 'How are you feeling today?'}
                  </h2>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Describe your symptoms in detail
                  </p>
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-lg mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-yellow-800">
                      <strong>Medical Disclaimer:</strong> This AI tool provides general guidance only. If experiencing a medical emergency, call 911 immediately.
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {symptomError && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-lg mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-red-800">
                        {symptomError}
                      </div>
                      <button
                        onClick={() => dispatch(clearSymptomError())}
                        className="ml-auto text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {/* Input Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Describe your symptoms *
                  </label>
                  <textarea
                    value={symptomInput}
                    onChange={(e) => dispatch(setSymptomInput(e.target.value))}
                    placeholder="Be as detailed as possible. Example: 'I've had a persistent headache and fever for 2 days...'"
                    rows={5}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Include: symptoms, duration, severity
                  </p>
                </div>

                <button
                  onClick={handleAnalyzeSymptoms}
                  disabled={!symptomInput.trim() || isAnalyzing}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Stethoscope className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                      Analyze Symptoms with AI
                    </>
                  )}
                </button>

                {/* Suggestion Chips */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">Quick examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestionChips.slice(0, 4).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium hover:bg-teal-100 transition border border-teal-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results and Doctors */}
          <div className="lg:col-span-3">
            {/* Analysis Results */}
            {analysisResult ? (
              <div id="analysis-results" className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6 mr-2 text-teal-600" />
                    AI Analysis Results
                  </h3>

                  {/* Urgency Banner */}
                  <div className={`p-4 sm:p-5 rounded-lg sm:rounded-xl border-2 mb-3 sm:mb-4 ${getUrgencyColor(analysisResult.urgency)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-xl sm:text-2xl mr-2">{getUrgencyIcon(analysisResult.urgency)}</span>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm">Urgency Level</h4>
                            <p className="text-lg sm:text-xl font-bold mt-1">
                              {formatUrgencyText(analysisResult.urgency)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {analysisResult.confidence && (
                        <div className="ml-2">
                          <div className="text-xs font-medium">Confidence</div>
                          <div className="text-lg font-bold">{Math.round(analysisResult.confidence * 100)}%</div>
                        </div>
                      )}
                    </div>

                    <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                      <h5 className="font-semibold text-gray-900 mb-1 text-xs sm:text-sm">Condition Assessment:</h5>
                      <p className="text-base sm:text-lg font-bold text-gray-900 mb-1">{analysisResult.condition}</p>
                      <p className="text-gray-700 text-xs sm:text-sm">{analysisResult.description}</p>
                    </div>

                    {analysisResult.urgency.toLowerCase() === 'emergency' && (
                      <a href="tel:911" className="block w-full bg-red-600 text-white py-3 rounded-lg font-bold text-center hover:bg-red-700 transition text-sm sm:text-base">
                        🚨 CALL 911 NOW - Emergency Services
                      </a>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    {/* Recommendation */}
                    <div className="bg-teal-50 border border-teal-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center text-xs sm:text-sm">
                        <CheckCircle className="w-4 h-4 mr-2 text-teal-600" />
                        Recommendation
                      </h5>
                      <p className="text-gray-700 text-xs sm:text-sm">{analysisResult.recommendation}</p>
                    </div>

                    {/* When to Seek Care */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center text-xs sm:text-sm">
                        <Clock className="w-4 h-4 mr-2 text-blue-600" />
                        When to Seek Care
                      </h5>
                      <p className="text-gray-700 text-xs sm:text-sm">{analysisResult.whenToSeek}</p>
                    </div>

                    {/* Possible Causes */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center text-xs sm:text-sm">
                        <AlertCircle className="w-4 h-4 mr-2 text-purple-600" />
                        Possible Causes
                      </h5>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 text-xs sm:text-sm">
                        {analysisResult.possibleCauses.map((cause, index) => (
                          <li key={index}>{cause}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Your Symptoms */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center text-xs sm:text-sm">
                        <FileText className="w-4 h-4 mr-2 text-gray-600" />
                        Your Symptoms
                      </h5>
                      <p className="text-gray-700 italic text-xs sm:text-sm line-clamp-3">"{analysisResult.symptoms}"</p>
                    </div>
                  </div>

                  {/* Recommended Specialties */}
                  {analysisResult.recommendedSpecialties && analysisResult.recommendedSpecialties.length > 0 && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4">
                      <h5 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm">
                        Recommended Medical Specialties:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.recommendedSpecialties.map((specialty, index) => (
                          <span key={index} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Doctors */}
                  {analysisResult.urgency.toLowerCase() !== 'emergency' && analysisResult.urgency.toLowerCase() !== 'home_care' && analysisResult.urgency.toLowerCase() !== 'self-care' && (
                    <div className="mt-4 sm:mt-6">
                      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg sm:rounded-xl p-4 mb-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base sm:text-lg font-bold mb-1">Recommended Doctors Near You</h4>
                            <p className="text-teal-100 text-xs sm:text-sm">
                              Specialty: {analysisResult.providerType}
                            </p>
                          </div>
                          <Stethoscope className="w-8 sm:w-10 h-8 sm:h-10 opacity-50" />
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        {(filteredDoctors.length > 0 ? filteredDoctors : allDoctors).slice(0, 4).map((doctor) => (
                          <div
                            key={doctor.id}
                            className="bg-white border-2 border-teal-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-teal-400 hover:shadow-lg transition"
                          >
                            <div className="flex gap-3 sm:gap-4">
                              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                <User className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-sm sm:text-base text-gray-900 mb-0.5">{doctor.name}</h5>
                                <p className="text-teal-600 font-medium text-xs sm:text-sm mb-2">{doctor.specialty}</p>

                                <div className="flex items-center gap-2 mb-2 text-xs flex-wrap">
                                  <div className="flex items-center">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                                    <span className="font-bold">{doctor.rating}</span>
                                    <span className="text-gray-500 ml-1">({doctor.reviews})</span>
                                  </div>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-gray-600">{doctor.distance}</span>
                                </div>

                                <div className="space-y-1 mb-2 sm:mb-3 text-xs">
                                  <div className="flex items-center text-gray-600">
                                    <Clock className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                    <span className="font-medium text-teal-600">{doctor.availability}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <MapPin className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                    <span className="truncate">{doctor.clinic}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() =>
                                    navigate('/book-appointment', {
                                      state: { doctor, urgencyResult: analysisResult },
                                    })
                                  }
                                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:shadow-lg transition flex items-center justify-center"
                                >
                                  Book Appointment
                                  <ChevronRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 ml-1" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* All Doctors Section - Always Visible */}
            <div className={`bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 ${analysisResult ? 'mt-4 sm:mt-6' : ''}`}>
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  All Healthcare Providers
                </h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                    <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-teal-600" />
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => handleSearchLocationChange(e.target.value)}
                      className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs sm:text-sm"
                      placeholder="Enter location"
                    />
                  </div>
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center text-xs sm:text-sm">
                    <Search className="w-4 h-4 mr-1 sm:mr-2" />
                    Search
                  </button>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">
                  <strong>{allDoctors.length} providers</strong> available
                </p>
              </div>

              {/* Doctor Cards */}
              <div className="space-y-3 sm:space-y-4">
                {allDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-teal-300 hover:shadow-lg transition"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-7 sm:w-8 h-7 sm:h-8 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="font-bold text-base sm:text-lg text-gray-900 truncate">{doctor.name}</h4>
                            <p className="text-teal-600 font-medium text-xs sm:text-sm">{doctor.specialty}</p>
                          </div>
                          {doctor.acceptingNew && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0">
                              ✓ New
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-2 flex-wrap text-xs">
                          <div className="flex items-center">
                            <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                            <span className="font-bold text-gray-900">{doctor.rating}</span>
                            <span className="text-gray-500 ml-1">({doctor.reviews})</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center text-gray-600">
                            <Award className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1" />
                            {doctor.experience}
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="text-gray-600">{doctor.distance}</div>
                        </div>

                        <div className="space-y-1 mb-2 sm:mb-3 text-xs">
                          <div className="flex items-center text-gray-600">
                            <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 sm:mr-2 flex-shrink-0" />
                            <span className="truncate">{doctor.languages.join(', ')}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 sm:mr-2 flex-shrink-0" />
                            <span className="truncate">{doctor.clinic}</span>
                          </div>
                          <div className="flex items-center font-medium text-teal-600">
                            <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 sm:mr-2 flex-shrink-0" />
                            {doctor.availability}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-2 sm:pt-3 border-t border-gray-100">
                          <div className="text-xs">
                            <span className="text-gray-500">From </span>
                            <span className="font-semibold text-green-700">{doctor.cost}</span>
                          </div>
                          <button
                            onClick={() =>
                              navigate('/book-appointment', {
                                state: { doctor, urgencyResult: analysisResult },
                              })
                            }
                            className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 sm:px-5 py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center text-xs sm:text-sm"
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
        </div>
      </div>
    </div>
  );
};

export default HomePage;