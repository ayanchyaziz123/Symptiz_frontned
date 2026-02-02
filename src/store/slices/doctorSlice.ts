import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Doctor } from '../../types';

interface DoctorState {
  allDoctors: Doctor[];
  filteredDoctors: Doctor[];
  selectedDoctor: Doctor | null;
  searchLocation: string;
  filterSpecialty: string | null;
  filterAcceptingNew: boolean;
  filterVideoVisit: boolean;
  filterMinRating: number;
  sortBy: 'rating' | 'distance' | 'experience' | null;
  loading: boolean;
  error: string | null;
  availableCities: string[];
  citiesLoading: boolean;
}

// Backend doctor interface (matches DoctorListSerializer)
interface BackendDoctorList {
  id: number;
  full_name: string;
  specialties: string[];  // Array of specialty names
  years_experience: number;
  average_rating: string;  // Comes as string from API
  total_reviews: number;
  accepting_new_patients: boolean;
  video_visit_available: boolean;
  primary_clinic: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    clinic_type: string;
    accepts_medicaid: boolean;
    accepts_medicare: boolean;
  } | null;
}

// Backend doctor interface for search (matches DoctorSerializer)
interface BackendDoctorSearch {
  id: number;
  full_name: string;
  user: {
    profile_picture: string | null;
  };
  specialties: Array<{ id: number; name: string; icon: string; description: string }>;
  years_experience: number;
  average_rating: string;
  total_reviews: number;
  accepting_new_patients: boolean;
  video_visit_available: boolean;
  languages: string;
  clinics_info: Array<{
    id: number;
    clinic: {
      id: number;
      name: string;
      address: string;
      city: string;
      state: string;
      phone: string;
      clinic_type: string;
      accepts_medicaid: boolean;
      accepts_medicare: boolean;
    };
    is_primary: boolean;
    consultation_fee: string;
  }>;
}

type BackendDoctor = BackendDoctorList | BackendDoctorSearch;

const API_URL = 'http://127.0.0.1:8000/api/doctors';

const initialDoctors: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialty: 'Family Medicine',
    experience: '12 years',
    rating: 4.8,
    reviews: 247,
    languages: ['English', 'Spanish'],
    distance: '0.5 miles',
    clinic: 'Community Health Center',
    availability: 'Tomorrow at 9:00 AM',
    cost: 'Accepts most insurance',
    acceptingNew: true,
    videoVisit: true,
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'Internal Medicine',
    experience: '8 years',
    rating: 4.6,
    reviews: 182,
    languages: ['English', 'Mandarin'],
    distance: '0.8 miles',
    clinic: 'Wellness Medical Group',
    availability: 'Jan 31 at 10:30 AM',
    cost: 'Sliding scale / Low-cost',
    acceptingNew: true,
    videoVisit: false,
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrics',
    experience: '10 years',
    rating: 4.9,
    reviews: 324,
    languages: ['English', 'Spanish'],
    distance: '1.2 miles',
    clinic: "Children's Health Clinic",
    availability: 'Today at 2:00 PM',
    cost: 'Insurance / Medicaid accepted',
    acceptingNew: true,
    videoVisit: true,
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    specialty: 'Cardiology',
    experience: '15 years',
    rating: 4.7,
    reviews: 198,
    languages: ['English'],
    distance: '1.5 miles',
    clinic: 'Heart & Vascular Center',
    availability: 'Feb 1 at 11:00 AM',
    cost: 'Free / Donation-based',
    acceptingNew: true,
    videoVisit: false,
  },
  {
    id: 5,
    name: 'Dr. Jennifer Lee',
    specialty: 'Dermatology',
    experience: '9 years',
    rating: 4.8,
    reviews: 215,
    languages: ['English', 'Korean'],
    distance: '2.1 miles',
    clinic: 'Skin & Wellness Clinic',
    availability: 'Feb 2 at 3:00 PM',
    cost: 'Insurance accepted',
    acceptingNew: true,
    videoVisit: true,
  },
  {
    id: 6,
    name: 'Dr. Robert Martinez',
    specialty: 'Orthopedics',
    experience: '11 years',
    rating: 4.6,
    reviews: 167,
    languages: ['English', 'Spanish'],
    distance: '2.5 miles',
    clinic: 'Orthopedic & Sports Medicine',
    availability: 'Feb 3 at 9:30 AM',
    cost: 'Most insurance plans',
    acceptingNew: true,
    videoVisit: false,
  },
  {
    id: 7,
    name: 'Dr. Amanda Foster',
    specialty: 'Psychiatry',
    experience: '7 years',
    rating: 4.9,
    reviews: 289,
    languages: ['English'],
    distance: '1.8 miles',
    clinic: 'Mental Health Associates',
    availability: 'Tomorrow at 1:00 PM',
    cost: 'Sliding scale available',
    acceptingNew: true,
    videoVisit: true,
  },
  {
    id: 8,
    name: 'Dr. David Kim',
    specialty: 'Gastroenterology',
    experience: '13 years',
    rating: 4.7,
    reviews: 203,
    languages: ['English', 'Korean'],
    distance: '3.0 miles',
    clinic: 'Digestive Health Center',
    availability: 'Feb 4 at 10:00 AM',
    cost: 'Insurance / Medicare',
    acceptingNew: true,
    videoVisit: false,
  },
];

const initialState: DoctorState = {
  allDoctors: [],
  filteredDoctors: [],
  selectedDoctor: null,
  searchLocation: '',
  filterSpecialty: null,
  filterAcceptingNew: false,
  filterVideoVisit: false,
  filterMinRating: 0,
  sortBy: null,
  loading: false,
  error: null,
  availableCities: [],
  citiesLoading: false,
};

// Type guard to check if it's a search result
const isSearchResult = (doctor: BackendDoctor): doctor is BackendDoctorSearch => {
  return 'clinics_info' in doctor;
};

// Helper function to map backend doctor to frontend format
const mapBackendDoctor = (backendDoctor: BackendDoctor): Doctor => {
  let primaryClinic: { name: string; city: string; state: string; accepts_medicaid: boolean; accepts_medicare: boolean; } | null;
  let specialty: string;
  let languages: string[];
  let profilePicture: string | null = null;

  // Handle different response formats
  if (isSearchResult(backendDoctor)) {
    // Search endpoint format (DoctorSerializer)
    const clinicAffiliation = backendDoctor.clinics_info.find(c => c.is_primary) || backendDoctor.clinics_info[0];
    primaryClinic = clinicAffiliation ? {
      name: clinicAffiliation.clinic.name,
      city: clinicAffiliation.clinic.city,
      state: clinicAffiliation.clinic.state,
      accepts_medicaid: clinicAffiliation.clinic.accepts_medicaid,
      accepts_medicare: clinicAffiliation.clinic.accepts_medicare,
    } : null;
    specialty = backendDoctor.specialties.length > 0 ? backendDoctor.specialties[0].name : 'General Practice';
    languages = backendDoctor.languages ? backendDoctor.languages.split(',').map(lang => lang.trim()) : ['English'];
    profilePicture = backendDoctor.user?.profile_picture || null;
  } else {
    // List endpoint format (DoctorListSerializer)
    primaryClinic = backendDoctor.primary_clinic;
    specialty = backendDoctor.specialties.length > 0 ? backendDoctor.specialties[0] : 'General Practice';
    languages = ['English']; // Default for list format
    profilePicture = null; // List format doesn't include user details
  }

  // Generate a simple cost description based on clinic type
  let cost = 'Contact for pricing';
  if (primaryClinic) {
    if (primaryClinic.accepts_medicaid && primaryClinic.accepts_medicare) {
      cost = 'Insurance / Medicaid / Medicare';
    } else if (primaryClinic.accepts_medicaid) {
      cost = 'Medicaid accepted';
    } else if (primaryClinic.accepts_medicare) {
      cost = 'Medicare accepted';
    }
  }

  return {
    id: backendDoctor.id,
    name: backendDoctor.full_name,
    specialty,
    experience: `${backendDoctor.years_experience} years`,
    rating: Number(backendDoctor.average_rating),
    reviews: backendDoctor.total_reviews,
    languages,
    distance: primaryClinic ? `${primaryClinic.city}, ${primaryClinic.state}` : 'N/A',
    clinic: primaryClinic?.name || 'Clinic information not available',
    availability: backendDoctor.accepting_new_patients ? 'Available soon' : 'Not accepting new patients',
    cost,
    acceptingNew: backendDoctor.accepting_new_patients,
    videoVisit: backendDoctor.video_visit_available,
    profilePicture,
  };
};

// Backend paginated response
interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BackendDoctorList[];
}

// Async thunk for fetching doctors from backend
export const fetchDoctors = createAsyncThunk(
  'doctor/fetchDoctors',
  async (location: string | undefined, { rejectWithValue }) => {
    try {
      let url = `${API_URL}/doctors/`;

      // Add location filter if provided
      if (location && location.trim()) {
        // Use the custom search endpoint for location filtering
        url = `${API_URL}/doctors/search/`;

        // Extract city from location string (e.g., "Chicago, IL" or "Chicago")
        const locationParts = location.split(',').map(part => part.trim());
        const params = new URLSearchParams();

        if (locationParts.length >= 1) {
          // Search by city
          params.append('city', locationParts[0]);
        }

        url += `?${params.toString()}`;
      }

      const response = await axios.get<BackendDoctor[]>(url);

      // Handle both paginated and non-paginated responses
      let doctors: BackendDoctor[];
      if (Array.isArray(response.data)) {
        doctors = response.data;
      } else {
        doctors = (response.data as PaginatedResponse).results;
      }

      const mappedDoctors = doctors.map(mapBackendDoctor);
      return mappedDoctors;
    } catch (error: any) {
      console.error('Failed to fetch doctors:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch doctors');
    }
  }
);

// Async thunk for fetching available cities
export const fetchCities = createAsyncThunk(
  'doctor/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ cities: string[] }>(`${API_URL}/clinics/cities/`);
      return response.data.cities;
    } catch (error: any) {
      console.error('Failed to fetch cities:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch cities');
    }
  }
);

// Helper function to apply all filters
const applyAllFilters = (state: DoctorState) => {
  let filtered = state.allDoctors;

  // Filter by specialty
  if (state.filterSpecialty) {
    filtered = filtered.filter(
      (doctor) =>
        doctor.specialty === state.filterSpecialty ||
        doctor.specialty === 'Family Medicine'
    );
  }

  // Filter by accepting new patients
  if (state.filterAcceptingNew) {
    filtered = filtered.filter((doctor) => doctor.acceptingNew);
  }

  // Filter by video visit
  if (state.filterVideoVisit) {
    filtered = filtered.filter((doctor) => doctor.videoVisit);
  }

  // Filter by minimum rating
  if (state.filterMinRating > 0) {
    filtered = filtered.filter((doctor) => doctor.rating >= state.filterMinRating);
  }

  // Apply sorting if set
  if (state.sortBy) {
    filtered = [...filtered].sort((a, b) => {
      if (state.sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (state.sortBy === 'distance') {
        const aDistance = parseFloat(a.distance);
        const bDistance = parseFloat(b.distance);
        return aDistance - bDistance;
      } else if (state.sortBy === 'experience') {
        const aExp = parseInt(a.experience);
        const bExp = parseInt(b.experience);
        return bExp - aExp;
      }
      return 0;
    });
  }

  state.filteredDoctors = filtered;
};

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    setSelectedDoctor: (state, action: PayloadAction<Doctor | null>) => {
      state.selectedDoctor = action.payload;
    },

    setSearchLocation: (state, action: PayloadAction<string>) => {
      state.searchLocation = action.payload;
    },

    filterDoctorsBySpecialty: (state, action: PayloadAction<string | null>) => {
      state.filterSpecialty = action.payload;
      applyAllFilters(state);
    },

    setFilterAcceptingNew: (state, action: PayloadAction<boolean>) => {
      state.filterAcceptingNew = action.payload;
      applyAllFilters(state);
    },

    setFilterVideoVisit: (state, action: PayloadAction<boolean>) => {
      state.filterVideoVisit = action.payload;
      applyAllFilters(state);
    },

    setFilterMinRating: (state, action: PayloadAction<number>) => {
      state.filterMinRating = action.payload;
      applyAllFilters(state);
    },

    searchDoctors: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload.toLowerCase();
      
      if (!searchTerm) {
        state.filteredDoctors = state.allDoctors;
      } else {
        state.filteredDoctors = state.allDoctors.filter(
          (doctor) =>
            doctor.name.toLowerCase().includes(searchTerm) ||
            doctor.specialty.toLowerCase().includes(searchTerm) ||
            doctor.clinic.toLowerCase().includes(searchTerm)
        );
      }
    },

    sortDoctors: (state, action: PayloadAction<'rating' | 'distance' | 'experience' | null>) => {
      state.sortBy = action.payload;
      applyAllFilters(state);
    },

    resetDoctorFilters: (state) => {
      state.filterSpecialty = null;
      state.filterAcceptingNew = false;
      state.filterVideoVisit = false;
      state.filterMinRating = 0;
      state.sortBy = null;
      state.filteredDoctors = state.allDoctors;
    },

    clearDoctorError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.allDoctors = action.payload;
        state.filteredDoctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCities.pending, (state) => {
        state.citiesLoading = true;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.citiesLoading = false;
        state.availableCities = action.payload;
      })
      .addCase(fetchCities.rejected, (state) => {
        state.citiesLoading = false;
      });
  },
});

export const {
  setSelectedDoctor,
  setSearchLocation,
  filterDoctorsBySpecialty,
  setFilterAcceptingNew,
  setFilterVideoVisit,
  setFilterMinRating,
  searchDoctors,
  sortDoctors,
  resetDoctorFilters,
  clearDoctorError,
} = doctorSlice.actions;

export default doctorSlice.reducer;