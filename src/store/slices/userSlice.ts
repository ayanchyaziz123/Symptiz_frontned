import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { API_ENDPOINTS } from '../../config/api';

// ==================== INTERFACES ====================

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  profile_picture: string | null;
  insurance_provider: string | null;
  insurance_id: string | null;
  insurance_document: string | null;
  insurance_document_name: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  email_reminders: boolean;
  sms_reminders: boolean;
  is_email_verified: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
  upcoming: number;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  insurance_provider?: string;
  insurance_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  email_reminders?: boolean;
  sms_reminders?: boolean;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface UserState {
  profile: UserProfile | null;
  stats: AppointmentStats | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  updateSuccess: boolean;
  passwordChangeSuccess: boolean;
  uploadingProfilePicture: boolean;
  uploadingInsuranceDocument: boolean;
}

const initialState: UserState = {
  profile: null,
  stats: null,
  loading: false,
  statsLoading: false,
  error: null,
  updateSuccess: false,
  passwordChangeSuccess: false,
  uploadingProfilePicture: false,
  uploadingInsuranceDocument: false,
};

// ==================== ASYNC THUNKS ====================

export const fetchUserProfile = createAsyncThunk<
  UserProfile,
  string,
  { rejectValue: string }
>('user/fetchProfile', async (token, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.users}/profile/`, {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ error?: string }>;
    return rejectWithValue(
      error.response?.data?.error || 'Failed to fetch profile'
    );
  }
});

export const updateUserProfile = createAsyncThunk<
  UserProfile,
  { token: string; data: UpdateProfileData },
  { rejectValue: string }
>('user/updateProfile', async ({ token, data }, { rejectWithValue }) => {
  try {
    const response = await axios.patch(`${API_ENDPOINTS.users}/profile/`, data, {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data.user;
  } catch (err) {
    const error = err as AxiosError<{ error?: string }>;
    return rejectWithValue(
      error.response?.data?.error || 'Failed to update profile'
    );
  }
});

export const changePassword = createAsyncThunk<
  { message: string },
  { token: string; data: ChangePasswordData },
  { rejectValue: string }
>('user/changePassword', async ({ token, data }, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${API_ENDPOINTS.users}/change-password/`,
      data,
      { headers: { Authorization: `Token ${token}` } }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ error?: string }>;
    return rejectWithValue(
      error.response?.data?.error || 'Failed to change password'
    );
  }
});

export const fetchAppointmentStats = createAsyncThunk<
  AppointmentStats,
  string,
  { rejectValue: string }
>('user/fetchStats', async (token, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${API_ENDPOINTS.appointments}/statistics/`,
      { headers: { Authorization: `Token ${token}` } }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ error?: string }>;
    return rejectWithValue(
      error.response?.data?.error || 'Failed to fetch statistics'
    );
  }
});

export const uploadProfilePicture = createAsyncThunk<
  { profile_picture: string },
  { token: string; file: File },
  { rejectValue: string }
>('user/uploadProfilePicture', async ({ token, file }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('profile_picture', file);
    const response = await axios.post(
      `${API_ENDPOINTS.users}/profile/picture/`,
      formData,
      {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ error?: string }>;
    return rejectWithValue(
      error.response?.data?.error || 'Failed to upload profile picture'
    );
  }
});

export const deleteProfilePicture = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>('user/deleteProfilePicture', async (token, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_ENDPOINTS.users}/profile/picture/`, {
      headers: { Authorization: `Token ${token}` },
    });
  } catch (err) {
    const error = err as AxiosError<{ error?: string }>;
    return rejectWithValue(
      error.response?.data?.error || 'Failed to delete profile picture'
    );
  }
});

export const uploadInsuranceDocument = createAsyncThunk<
  { document_url: string; document_name: string },
  { token: string; file: File },
  { rejectValue: string }
>('user/uploadInsuranceDocument', async ({ token, file }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('insurance_document', file);
    const response = await axios.post(
      `${API_ENDPOINTS.users}/insurance/document/`,
      formData,
      {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ error?: string }>;
    return rejectWithValue(
      error.response?.data?.error || 'Failed to upload insurance document'
    );
  }
});

export const deleteInsuranceDocument = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>('user/deleteInsuranceDocument', async (token, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_ENDPOINTS.users}/insurance/document/`, {
      headers: { Authorization: `Token ${token}` },
    });
  } catch (err) {
    const error = err as AxiosError<{ error?: string }>;
    return rejectWithValue(
      error.response?.data?.error || 'Failed to delete insurance document'
    );
  }
});

// ==================== SLICE ====================

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearPasswordChangeSuccess: (state) => {
      state.passwordChangeSuccess = false;
    },
    clearUserState: (state) => {
      state.profile = null;
      state.stats = null;
      state.error = null;
      state.updateSuccess = false;
      state.passwordChangeSuccess = false;
    },
    updateProfilePicture: (state, action: PayloadAction<string | null>) => {
      if (state.profile) {
        state.profile.profile_picture = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch profile';
      })

      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update profile';
        state.updateSuccess = false;
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordChangeSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordChangeSuccess = true;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to change password';
        state.passwordChangeSuccess = false;
      })

      // Fetch Stats
      .addCase(fetchAppointmentStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchAppointmentStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAppointmentStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload || 'Failed to fetch stats';
      })

      // Upload Profile Picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.uploadingProfilePicture = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.uploadingProfilePicture = false;
        if (state.profile) {
          state.profile.profile_picture = action.payload.profile_picture;
        }
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.uploadingProfilePicture = false;
        state.error = action.payload || 'Failed to upload profile picture';
      })

      // Delete Profile Picture
      .addCase(deleteProfilePicture.fulfilled, (state) => {
        if (state.profile) {
          state.profile.profile_picture = null;
        }
      })

      // Upload Insurance Document
      .addCase(uploadInsuranceDocument.pending, (state) => {
        state.uploadingInsuranceDocument = true;
        state.error = null;
      })
      .addCase(uploadInsuranceDocument.fulfilled, (state, action) => {
        state.uploadingInsuranceDocument = false;
        if (state.profile) {
          state.profile.insurance_document = action.payload.document_url;
          state.profile.insurance_document_name = action.payload.document_name;
        }
      })
      .addCase(uploadInsuranceDocument.rejected, (state, action) => {
        state.uploadingInsuranceDocument = false;
        state.error = action.payload || 'Failed to upload insurance document';
      })

      // Delete Insurance Document
      .addCase(deleteInsuranceDocument.fulfilled, (state) => {
        if (state.profile) {
          state.profile.insurance_document = null;
          state.profile.insurance_document_name = null;
        }
      });
  },
});

export const {
  clearError,
  clearUpdateSuccess,
  clearPasswordChangeSuccess,
  clearUserState,
  updateProfilePicture,
} = userSlice.actions;

export default userSlice.reducer;
