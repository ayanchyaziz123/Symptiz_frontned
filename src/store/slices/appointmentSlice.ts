import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Appointment {
  id: number;
  doctor_info: {
    id: number;
    full_name: string;
    specialties: string[];
    years_experience: number;
    average_rating: string;
    total_reviews: number;
    accepting_new_patients: boolean;
    video_visit_available: boolean;
    primary_clinic: any;
  };
  clinic_info: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
  };
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: 'in_person' | 'video' | 'phone';
  reason: string;
  insurance_type: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  status_display: string;
  is_upcoming: boolean;
  created_at: string;
}

interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
  upcoming: number;
}

interface AppointmentState {
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  statistics: AppointmentStats | null;
  selectedAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
  bookingSuccess: boolean;
}

const initialState: AppointmentState = {
  appointments: [],
  upcomingAppointments: [],
  pastAppointments: [],
  statistics: null,
  selectedAppointment: null,
  loading: false,
  error: null,
  bookingSuccess: false,
};

const API_URL = 'http://127.0.0.1:8000/api/appointments';

// Async thunk for fetching all appointments
export const fetchAppointments = createAsyncThunk<
  Appointment[],
  string, // token
  { rejectValue: string }
>(
  'appointment/fetchAll',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/appointments/`, {
        headers: { Authorization: `Token ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch appointments:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch appointments');
    }
  }
);

// Async thunk for fetching upcoming appointments
export const fetchUpcomingAppointments = createAsyncThunk<
  Appointment[],
  string, // token
  { rejectValue: string }
>(
  'appointment/fetchUpcoming',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/appointments/upcoming/`, {
        headers: { Authorization: `Token ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch upcoming appointments:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch upcoming appointments');
    }
  }
);

// Async thunk for fetching past appointments
export const fetchPastAppointments = createAsyncThunk<
  Appointment[],
  string, // token
  { rejectValue: string }
>(
  'appointment/fetchPast',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/appointments/past/`, {
        headers: { Authorization: `Token ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch past appointments:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch past appointments');
    }
  }
);

// Async thunk for fetching appointment statistics
export const fetchAppointmentStatistics = createAsyncThunk<
  AppointmentStats,
  string, // token
  { rejectValue: string }
>(
  'appointment/fetchStatistics',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/appointments/statistics/`, {
        headers: { Authorization: `Token ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch appointment statistics:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch statistics');
    }
  }
);

// Async thunk for cancelling appointment
export const cancelAppointment = createAsyncThunk<
  Appointment,
  { id: number; token: string; reason?: string },
  { rejectValue: string }
>(
  'appointment/cancel',
  async ({ id, token, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/appointments/${id}/cancel/`,
        { reason },
        { headers: { Authorization: `Token ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to cancel appointment:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel appointment');
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setSelectedAppointment: (state, action: PayloadAction<Appointment | null>) => {
      state.selectedAppointment = action.payload;
    },

    clearAppointmentError: (state) => {
      state.error = null;
    },

    clearBookingSuccess: (state) => {
      state.bookingSuccess = false;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch All Appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch appointments';
      })

      // Fetch Upcoming Appointments
      .addCase(fetchUpcomingAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingAppointments = action.payload;
      })
      .addCase(fetchUpcomingAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch upcoming appointments';
      })

      // Fetch Past Appointments
      .addCase(fetchPastAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPastAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.pastAppointments = action.payload;
      })
      .addCase(fetchPastAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch past appointments';
      })

      // Fetch Statistics
      .addCase(fetchAppointmentStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchAppointmentStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch statistics';
      })

      // Cancel Appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        // Update the appointment in the list
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        // Remove from upcoming appointments
        state.upcomingAppointments = state.upcomingAppointments.filter(
          apt => apt.id !== action.payload.id
        );
        // Add to past appointments
        state.pastAppointments.unshift(action.payload);
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to cancel appointment';
      });
  },
});

export const {
  setSelectedAppointment,
  clearAppointmentError,
  clearBookingSuccess,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;