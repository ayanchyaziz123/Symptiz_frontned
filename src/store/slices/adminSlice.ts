import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://18.222.222.50:8000/api';

// Types
interface AdminStats {
  totalUsers: number;
  totalPatients: number;
  totalProviders: number;
  pendingApprovals: number;
  totalAppointments: number;
  activeAppointments: number;
  systemHealth: number;
}

interface PendingProvider {
  id: number;
  name: string;
  specialty: string;
  registeredDate: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Activity {
  id: number;
  type: string;
  message: string;
  time: string;
  icon: string;
  color: string;
}

interface AdminState {
  stats: AdminStats | null;
  pendingProviders: PendingProvider[];
  recentActivities: Activity[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  pendingProviders: [],
  recentActivities: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await axios.get(`${API_URL}/admin/stats/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin stats');
    }
  }
);

export const fetchPendingProviders = createAsyncThunk(
  'admin/fetchPendingProviders',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await axios.get(`${API_URL}/providers/providers/?is_verified=false`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      return response.data.results || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch pending providers');
    }
  }
);

export const approveProvider = createAsyncThunk(
  'admin/approveProvider',
  async (providerId: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await axios.post(
        `${API_URL}/admin/providers/${providerId}/approve/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      return { providerId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to approve provider');
    }
  }
);

export const rejectProvider = createAsyncThunk(
  'admin/rejectProvider',
  async (providerId: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await axios.post(
        `${API_URL}/admin/providers/${providerId}/reject/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      return { providerId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reject provider');
    }
  }
);

// Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch admin stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action: PayloadAction<AdminStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch pending providers
      .addCase(fetchPendingProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingProviders.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.pendingProviders = action.payload.map((provider: any) => ({
          id: provider.id || provider.user,
          name: `Dr. ${provider.first_name} ${provider.last_name}`,
          specialty: provider.specialties?.[0]?.name || 'N/A',
          registeredDate: new Date(provider.created_at || Date.now()).toLocaleDateString(),
          email: provider.email,
          firstName: provider.first_name,
          lastName: provider.last_name,
        }));
      })
      .addCase(fetchPendingProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Approve provider
      .addCase(approveProvider.fulfilled, (state, action) => {
        state.pendingProviders = state.pendingProviders.filter(
          (provider) => provider.id !== action.payload.providerId
        );
      })
      // Reject provider
      .addCase(rejectProvider.fulfilled, (state, action) => {
        state.pendingProviders = state.pendingProviders.filter(
          (provider) => provider.id !== action.payload.providerId
        );
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
