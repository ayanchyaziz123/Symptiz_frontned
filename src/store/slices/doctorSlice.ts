import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Doctor } from '../../types';

interface DoctorState {
  allDoctors: Doctor[];
  filteredDoctors: Doctor[];
  selectedDoctor: Doctor | null;
  searchLocation: string;
  filterSpecialty: string | null;
  loading: boolean;
  error: string | null;
}

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
  allDoctors: initialDoctors,
  filteredDoctors: initialDoctors,
  selectedDoctor: null,
  searchLocation: 'Chicago, IL',
  filterSpecialty: null,
  loading: false,
  error: null,
};

// Async thunk for fetching doctors (future API integration)
export const fetchDoctors = createAsyncThunk(
  'doctor/fetchDoctors',
  async (location: string, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // const response = await axios.get(`/api/doctors?location=${location}`);
      // return response.data;
      return initialDoctors;
    } catch (error) {
      return rejectWithValue('Failed to fetch doctors');
    }
  }
);

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
      
      if (!action.payload) {
        state.filteredDoctors = state.allDoctors;
      } else {
        state.filteredDoctors = state.allDoctors.filter(
          (doctor) =>
            doctor.specialty === action.payload ||
            doctor.specialty === 'Family Medicine'
        );
      }
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

    sortDoctors: (state, action: PayloadAction<'rating' | 'distance' | 'experience'>) => {
      const sortBy = action.payload;
      
      state.filteredDoctors = [...state.filteredDoctors].sort((a, b) => {
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        } else if (sortBy === 'distance') {
          const aDistance = parseFloat(a.distance);
          const bDistance = parseFloat(b.distance);
          return aDistance - bDistance;
        } else if (sortBy === 'experience') {
          const aExp = parseInt(a.experience);
          const bExp = parseInt(b.experience);
          return bExp - aExp;
        }
        return 0;
      });
    },

    resetDoctorFilters: (state) => {
      state.filteredDoctors = state.allDoctors;
      state.filterSpecialty = null;
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
      });
  },
});

export const {
  setSelectedDoctor,
  setSearchLocation,
  filterDoctorsBySpecialty,
  searchDoctors,
  sortDoctors,
  resetDoctorFilters,
  clearDoctorError,
} = doctorSlice.actions;

export default doctorSlice.reducer;