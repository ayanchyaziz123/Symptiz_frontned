import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Provider } from '../../types';
import { API_BASE_URL } from '../../config/api';

// Provider Dashboard Types
interface ProviderStats {
  totalPatients: number;
  appointmentsToday: number;
  upcomingAppointments: number;
  completedAppointments: number;
  averageRating: number;
  totalReviews: number;
}

interface Appointment {
  id: number;
  patientName: string;
  patientAge: number;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'confirmed';
  symptoms?: string;
  notes?: string;
}

interface AvailabilitySlot {
  id: number;
  clinic_name: string;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface SpecialtyItem {
  id: number;
  name: string;
  icon: string;
  description: string;
}

interface ProviderProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    user_type: string;
    phone: string;
    profile_picture: string | null;
    city: string;
    state: string;
  };
  full_name: string;
  specialties: SpecialtyItem[];
  license_number: string;
  years_experience: number;
  bio: string;
  languages: string;
  average_rating: number;
  total_reviews: number;
  accepting_new_patients: boolean;
  video_visit_available: boolean;
  is_verified: boolean;
}

interface ProviderState {
  allProviders: Provider[];
  filteredProviders: Provider[];
  selectedProvider: Provider | null;
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

  // Provider Dashboard
  dashboardStats: ProviderStats | null;
  appointments: Appointment[];
  dashboardLoading: boolean;
  dashboardError: string | null;

  // Availability
  availability: AvailabilitySlot[];
  availabilityLoading: boolean;

  // Own Provider Profile
  ownProfile: ProviderProfile | null;
  profileLoading: boolean;
  profileError: string | null;

  // All specialties (for settings dropdown)
  allSpecialties: SpecialtyItem[];
  specialtiesLoading: boolean;
}

// Backend provider interface (matches ProviderListSerializer)
interface BackendProviderList {
  id: number;
  full_name: string;
  specialties: string[];  // Array of specialty names
  years_experience: number;
  average_rating: string;  // Comes as string from API
  total_reviews: number;
  accepting_new_patients: boolean;
  video_visit_available: boolean;
  profile_picture: string | null;  // Added for profile picture
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

// Backend provider interface for search (matches ProviderSerializer)
interface BackendProviderSearch {
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

type BackendProvider = BackendProviderList | BackendProviderSearch;

const API_URL = `${API_BASE_URL}/api`;

const initialProviders: Provider[] = [
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

const initialState: ProviderState = {
  allProviders: [],
  filteredProviders: [],
  selectedProvider: null,
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

  // Provider Dashboard
  dashboardStats: null,
  appointments: [],
  dashboardLoading: false,
  dashboardError: null,

  // Availability
  availability: [],
  availabilityLoading: false,

  // Own Provider Profile
  ownProfile: null,
  profileLoading: false,
  profileError: null,

  // All specialties
  allSpecialties: [],
  specialtiesLoading: false,
};

// Type guard to check if it's a search result
const isSearchResult = (provider: BackendProvider): provider is BackendProviderSearch => {
  return 'clinics_info' in provider;
};

// Helper function to map backend provider to frontend format
const mapBackendProvider = (backendProvider: BackendProvider): Provider => {
  let primaryClinic: { id: number; name: string; city: string; state: string; accepts_medicaid: boolean; accepts_medicare: boolean; } | null;
  let specialty: string;
  let languages: string[];
  let profilePicture: string | null = null;

  // Handle different response formats
  if (isSearchResult(backendProvider)) {
    // Search endpoint format (ProviderSerializer)
    const clinicAffiliation = backendProvider.clinics_info.find(c => c.is_primary) || backendProvider.clinics_info[0];
    primaryClinic = clinicAffiliation ? {
      id: clinicAffiliation.clinic.id,
      name: clinicAffiliation.clinic.name,
      city: clinicAffiliation.clinic.city,
      state: clinicAffiliation.clinic.state,
      accepts_medicaid: clinicAffiliation.clinic.accepts_medicaid,
      accepts_medicare: clinicAffiliation.clinic.accepts_medicare,
    } : null;
    specialty = backendProvider.specialties.length > 0 ? backendProvider.specialties[0].name : 'General Practice';
    languages = backendProvider.languages ? backendProvider.languages.split(',').map(lang => lang.trim()) : ['English'];
    profilePicture = backendProvider.user?.profile_picture || null;
  } else {
    // List endpoint format (ProviderListSerializer)
    primaryClinic = backendProvider.primary_clinic;
    specialty = backendProvider.specialties.length > 0 ? backendProvider.specialties[0] : 'General Practice';
    languages = ['English']; // Default for list format
    profilePicture = backendProvider.profile_picture || null;  // Now includes profile_picture
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
    id: backendProvider.id,
    name: backendProvider.full_name,
    specialty,
    experience: `${backendProvider.years_experience} years`,
    rating: Number(backendProvider.average_rating),
    reviews: backendProvider.total_reviews,
    languages,
    distance: primaryClinic ? `${primaryClinic.city}, ${primaryClinic.state}` : 'N/A',
    clinic: primaryClinic?.name || 'Clinic information not available',
    availability: backendProvider.accepting_new_patients ? 'Available soon' : 'Not accepting new patients',
    cost,
    acceptingNew: backendProvider.accepting_new_patients,
    videoVisit: backendProvider.video_visit_available,
    profilePicture,
    clinicId: primaryClinic?.id,
  };
};

// Backend paginated response
interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BackendProviderList[];
}

// Async thunk for fetching providers from backend
export const fetchProviders = createAsyncThunk(
  'provider/fetchProviders',
  async (location: string | undefined, { rejectWithValue }) => {
    try {
      let url = `${API_URL}/providers/providers/`;

      // Add location filter if provided
      if (location && location.trim()) {
        // Use the custom search endpoint for location filtering
        url = `${API_URL}/providers/providers/search/`;

        // Extract city from location string (e.g., "Chicago, IL" or "Chicago")
        const locationParts = location.split(',').map(part => part.trim());
        const params = new URLSearchParams();

        if (locationParts.length >= 1) {
          // Search by city
          params.append('city', locationParts[0]);
        }

        url += `?${params.toString()}`;
      }

      const response = await axios.get<BackendProvider[]>(url);

      // Handle both paginated and non-paginated responses
      let providers: BackendProvider[];
      if (Array.isArray(response.data)) {
        providers = response.data;
      } else {
        providers = (response.data as PaginatedResponse).results;
      }

      const mappedProviders = providers.map(mapBackendProvider);
      return mappedProviders;
    } catch (error: any) {
      console.error('Failed to fetch providers:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch providers');
    }
  }
);

// Async thunk for fetching available cities
export const fetchCities = createAsyncThunk(
  'provider/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ cities: string[] }>(`${API_URL}/providers/clinics/cities/`);
      return response.data.cities;
    } catch (error: any) {
      console.error('Failed to fetch cities:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch cities');
    }
  }
);

// Async thunk for fetching provider dashboard stats
export const fetchProviderDashboardStats = createAsyncThunk(
  'provider/fetchDashboardStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const headers = { Authorization: `Token ${token}` };
      const [statsRes, todayRes] = await Promise.all([
        axios.get(`${API_URL}/appointments/appointments/statistics/`, { headers }),
        axios.get(`${API_URL}/appointments/appointments/today/`, { headers }),
      ]);
      const stats = statsRes.data;
      const todayAppointments = Array.isArray(todayRes.data) ? todayRes.data : (todayRes.data.results || []);
      return {
        totalPatients: stats.total || 0,
        appointmentsToday: todayAppointments.length,
        upcomingAppointments: stats.upcoming || 0,
        completedAppointments: stats.completed || 0,
        averageRating: 0,
        totalReviews: 0,
      } as ProviderStats;
    } catch (error: any) {
      console.error('Failed to fetch provider dashboard stats:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch dashboard stats');
    }
  }
);

// Async thunk for fetching provider appointments
export const fetchProviderAppointments = createAsyncThunk(
  'provider/fetchAppointments',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await axios.get(`${API_URL}/appointments/appointments/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      const raw = response.data.results || response.data;
      return raw.map((apt: any) => ({
        id: apt.id,
        patientName: apt.patient_info?.full_name || 'Unknown',
        patientAge: apt.patient_info?.age || 0,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        appointmentType: apt.appointment_type,
        status: apt.status,
        symptoms: apt.reason,
        notes: apt.provider_notes,
      })) as Appointment[];
    } catch (error: any) {
      console.error('Failed to fetch provider appointments:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch appointments');
    }
  }
);

// Async thunk for updating appointment status
export const updateAppointmentStatus = createAsyncThunk(
  'provider/updateAppointmentStatus',
  async ({ appointmentId, status }: { appointmentId: number; status: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      await axios.patch(
        `${API_URL}/appointments/appointments/${appointmentId}/`,
        { status },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      return { id: appointmentId, status };
    } catch (error: any) {
      console.error('Failed to update appointment status:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to update appointment');
    }
  }
);

// Async thunk for fetching provider availability
export const fetchAvailability = createAsyncThunk(
  'provider/fetchAvailability',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await axios.get(`${API_URL}/providers/availability/`, {
        headers: { Authorization: `Token ${token}` },
      });
      return (response.data.results || response.data) as AvailabilitySlot[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch availability');
    }
  }
);

// Async thunk for creating availability slot
export const createAvailability = createAsyncThunk(
  'provider/createAvailability',
  async ({ day_of_week, start_time, end_time }: { day_of_week: number; start_time: string; end_time: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await axios.post(`${API_URL}/providers/availability/`, {
        day_of_week,
        start_time,
        end_time,
        is_active: true,
      }, {
        headers: { Authorization: `Token ${token}` },
      });
      return response.data as AvailabilitySlot;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.response?.data || 'Failed to create availability');
    }
  }
);

// Async thunk for deleting availability slot
export const deleteAvailability = createAsyncThunk(
  'provider/deleteAvailability',
  async (slotId: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      await axios.delete(`${API_URL}/providers/availability/${slotId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      return slotId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete availability');
    }
  }
);

// Async thunk for fetching all specialties
export const fetchSpecialties = createAsyncThunk(
  'provider/fetchSpecialties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/providers/specialties/`);
      return (Array.isArray(response.data) ? response.data : response.data.results || []) as SpecialtyItem[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch specialties');
    }
  }
);

// Async thunk for fetching own provider profile
export const fetchOwnProfile = createAsyncThunk(
  'provider/fetchOwnProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await axios.get<ProviderProfile>(`${API_URL}/providers/providers/me/`, {
        headers: { Authorization: `Token ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

// Async thunk for updating own provider profile
export const updateOwnProfile = createAsyncThunk(
  'provider/updateOwnProfile',
  async ({ id, data }: { id: number; data: Record<string, any> }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await axios.patch<ProviderProfile>(`${API_URL}/providers/providers/${id}/`, data, {
        headers: { Authorization: `Token ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.response?.data || 'Failed to update profile');
    }
  }
);

// Async thunk for uploading profile picture
export const uploadProfilePicture = createAsyncThunk(
  'provider/uploadProfilePicture',
  async (file: File, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await axios.post<{ message: string; profile_picture: string | null }>(
        `${API_URL}/users/profile/picture/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upload profile picture');
    }
  }
);

// Async thunk for deleting profile picture
export const deleteProfilePicture = createAsyncThunk(
  'provider/deleteProfilePicture',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      await axios.delete(`${API_URL}/users/profile/picture/`, {
        headers: { Authorization: `Token ${token}` },
      });
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete profile picture');
    }
  }
);

// Helper function to apply all filters
const applyAllFilters = (state: ProviderState) => {
  let filtered = state.allProviders;

  // Filter by specialty
  if (state.filterSpecialty) {
    filtered = filtered.filter(
      (provider) =>
        provider.specialty === state.filterSpecialty ||
        provider.specialty === 'Family Medicine'
    );
  }

  // Filter by accepting new patients
  if (state.filterAcceptingNew) {
    filtered = filtered.filter((provider) => provider.acceptingNew);
  }

  // Filter by video visit
  if (state.filterVideoVisit) {
    filtered = filtered.filter((provider) => provider.videoVisit);
  }

  // Filter by minimum rating
  if (state.filterMinRating > 0) {
    filtered = filtered.filter((provider) => provider.rating >= state.filterMinRating);
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

  state.filteredProviders = filtered;
};

const providerSlice = createSlice({
  name: 'provider',
  initialState,
  reducers: {
    setSelectedProvider: (state, action: PayloadAction<Provider | null>) => {
      state.selectedProvider = action.payload;
    },

    setSearchLocation: (state, action: PayloadAction<string>) => {
      state.searchLocation = action.payload;
    },

    filterProvidersBySpecialty: (state, action: PayloadAction<string | null>) => {
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

    searchProviders: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload.toLowerCase();
      
      if (!searchTerm) {
        state.filteredProviders = state.allProviders;
      } else {
        state.filteredProviders = state.allProviders.filter(
          (provider) =>
            provider.name.toLowerCase().includes(searchTerm) ||
            provider.specialty.toLowerCase().includes(searchTerm) ||
            provider.clinic.toLowerCase().includes(searchTerm)
        );
      }
    },

    sortProviders: (state, action: PayloadAction<'rating' | 'distance' | 'experience' | null>) => {
      state.sortBy = action.payload;
      applyAllFilters(state);
    },

    resetProviderFilters: (state) => {
      state.filterSpecialty = null;
      state.filterAcceptingNew = false;
      state.filterVideoVisit = false;
      state.filterMinRating = 0;
      state.sortBy = null;
      state.filteredProviders = state.allProviders;
    },

    clearProviderError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.allProviders = action.payload;
        state.filteredProviders = action.payload;
      })
      .addCase(fetchProviders.rejected, (state, action) => {
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
      })
      // Provider Dashboard Stats
      .addCase(fetchProviderDashboardStats.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchProviderDashboardStats.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchProviderDashboardStats.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload as string;
      })
      // Provider Appointments
      .addCase(fetchProviderAppointments.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchProviderAppointments.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchProviderAppointments.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload as string;
      })
      // Update Appointment Status
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index].status = action.payload.status as Appointment['status'];
        }
      })
      // Availability
      .addCase(fetchAvailability.pending, (state) => {
        state.availabilityLoading = true;
      })
      .addCase(fetchAvailability.fulfilled, (state, action) => {
        state.availabilityLoading = false;
        state.availability = action.payload;
      })
      .addCase(fetchAvailability.rejected, (state) => {
        state.availabilityLoading = false;
      })
      .addCase(createAvailability.fulfilled, (state, action) => {
        state.availability.push(action.payload);
      })
      .addCase(deleteAvailability.fulfilled, (state, action) => {
        state.availability = state.availability.filter(slot => slot.id !== action.payload);
      })
      // Specialties
      .addCase(fetchSpecialties.pending, (state) => {
        state.specialtiesLoading = true;
      })
      .addCase(fetchSpecialties.fulfilled, (state, action) => {
        state.specialtiesLoading = false;
        state.allSpecialties = action.payload;
      })
      .addCase(fetchSpecialties.rejected, (state) => {
        state.specialtiesLoading = false;
      })
      // Own Profile
      .addCase(fetchOwnProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchOwnProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.ownProfile = action.payload;
      })
      .addCase(fetchOwnProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })
      .addCase(updateOwnProfile.fulfilled, (state, action) => {
        state.ownProfile = action.payload;
      })
      // Profile Picture Upload
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        if (state.ownProfile && state.ownProfile.user) {
          state.ownProfile.user.profile_picture = action.payload.profile_picture;
        }
      })
      // Profile Picture Delete
      .addCase(deleteProfilePicture.fulfilled, (state) => {
        if (state.ownProfile && state.ownProfile.user) {
          state.ownProfile.user.profile_picture = null;
        }
      });
  },
});

export const {
  setSelectedProvider,
  setSearchLocation,
  filterProvidersBySpecialty,
  setFilterAcceptingNew,
  setFilterVideoVisit,
  setFilterMinRating,
  searchProviders,
  sortProviders,
  resetProviderFilters,
  clearProviderError,
} = providerSlice.actions;

export default providerSlice.reducer;