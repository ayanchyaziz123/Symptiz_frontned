import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

export interface Appointment {
  id: number;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  appointmentType: 'in_person' | 'video' | 'phone';
  reason: string;
  insurance: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  reminder: boolean;
  createdAt: string;
}

interface AppointmentState {
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  selectedAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
  bookingSuccess: boolean;
}

const initialState: AppointmentState = {
  appointments: [],
  upcomingAppointments: [],
  pastAppointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,
  bookingSuccess: false,
};

// const API_URL = 'http://127.0.0.1:8000/api/appointments';

// Async thunk for creating appointment
export const createAppointment = createAsyncThunk<
  Appointment,
  Omit<Appointment, 'id' | 'status' | 'createdAt'>,
  { rejectValue: string }
>(
  'appointment/create',
  async (appointmentData) => {
    // TODO: Replace with actual API call
    // When you implement the API call, add back try-catch:
    // try {
    //   const response = await axios.post(`${API_URL}/`, appointmentData);
    //   return response.data;
    // } catch (error) {
    //   const axiosError = error as AxiosError;
    //   return rejectWithValue(axiosError.message || 'Failed to book appointment');
    // }
    
    // Mock response
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };
    return newAppointment;
  }
);

// Async thunk for fetching appointments
export const fetchAppointments = createAsyncThunk<
  Appointment[],
  void,
  { rejectValue: string }
>(
  'appointment/fetchAll',
  async () => {
    // TODO: Replace with actual API call
    // When you implement the API call, add back try-catch:
    // try {
    //   const response = await axios.get(`${API_URL}/`);
    //   return response.data;
    // } catch (error) {
    //   const axiosError = error as AxiosError;
    //   return rejectWithValue(axiosError.message || 'Failed to fetch appointments');
    // }
    
    // Mock response
    return [];
  }
);

// Async thunk for cancelling appointment
export const cancelAppointment = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  'appointment/cancel',
  async (appointmentId) => {
    // TODO: Replace with actual API call
    // When you implement the API call, add back try-catch:
    // try {
    //   const response = await axios.patch(`${API_URL}/${appointmentId}/cancel/`);
    //   return response.data;
    // } catch (error) {
    //   const axiosError = error as AxiosError;
    //   return rejectWithValue(axiosError.message || 'Failed to cancel appointment');
    // }
    
    return appointmentId;
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

    updateAppointmentStatus: (state, action: PayloadAction<{ id: number; status: Appointment['status'] }>) => {
      const appointment = state.appointments.find(apt => apt.id === action.payload.id);
      if (appointment) {
        appointment.status = action.payload.status;
      }
      
      // Update filtered lists
      state.upcomingAppointments = state.appointments.filter(
        apt => apt.status === 'scheduled' || apt.status === 'pending'
      );
      state.pastAppointments = state.appointments.filter(
        apt => apt.status === 'completed' || apt.status === 'cancelled'
      );
    },

    addLocalAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.push(action.payload);
      state.upcomingAppointments = state.appointments.filter(
        apt => apt.status === 'scheduled' || apt.status === 'pending'
      );
    },
  },

  extraReducers: (builder) => {
    builder
      // Create Appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bookingSuccess = false;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.push(action.payload);
        state.upcomingAppointments = state.appointments.filter(
          (apt) => apt.status === 'scheduled' || apt.status === 'pending'
        );
        state.bookingSuccess = true;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to book appointment';
        state.bookingSuccess = false;
      })

      // Fetch Appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
        state.upcomingAppointments = action.payload.filter(
          (apt) => apt.status === 'scheduled' || apt.status === 'pending'
        );
        state.pastAppointments = action.payload.filter(
          (apt) => apt.status === 'completed' || apt.status === 'cancelled'
        );
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch appointments';
      })

      // Cancel Appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const appointment = state.appointments.find(apt => apt.id === action.payload);
        if (appointment) {
          appointment.status = 'cancelled';
        }
        
        state.upcomingAppointments = state.appointments.filter(
          (apt) => apt.status === 'scheduled' || apt.status === 'pending'
        );
        state.pastAppointments = state.appointments.filter(
          (apt) => apt.status === 'completed' || apt.status === 'cancelled'
        );
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
  updateAppointmentStatus,
  addLocalAppointment,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;