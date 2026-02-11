import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { API_ENDPOINTS } from '../../config/api';

interface AuthState {
  userId: number | null;
  email: string | null;
  token: string | null;
  username: string | null;
  userType: string | null;
  firstName: string | null;
  lastName: string | null;

  isAuthenticated: boolean;
  otpVerified: boolean;

  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]> | null;

  message: string | null;
  otpExpiresInMinutes: number | null;
  nextStep: string | null;
}

// ==================== LOCAL STORAGE HELPERS ====================

const AUTH_STORAGE_KEY = 'radth_auth';

const loadAuthFromStorage = (): Partial<AuthState> => {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      return JSON.parse(storedAuth);
    }
  } catch (error) {
    console.error('Failed to load auth from storage:', error);
  }
  return {};
};

const saveAuthToStorage = (authData: {
  token: string;
  userId: number;
  username: string;
  email: string;
  userType: string;
  firstName?: string;
  lastName?: string;
}) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      token: authData.token,
      userId: authData.userId,
      username: authData.username,
      email: authData.email,
      userType: authData.userType,
      firstName: authData.firstName,
      lastName: authData.lastName,
      isAuthenticated: true,
      otpVerified: true,
    }));
  } catch (error) {
    console.error('Failed to save auth to storage:', error);
  }
};

const clearAuthFromStorage = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth from storage:', error);
  }
};

// ==================== INITIAL STATE ====================

const cleanInitialState: AuthState = {
  userId: null,
  email: null,
  token: null,
  username: null,
  userType: null,
  firstName: null,
  lastName: null,

  isAuthenticated: false,
  otpVerified: false,

  loading: false,
  error: null,
  fieldErrors: null,

  message: null,
  otpExpiresInMinutes: null,
  nextStep: null,
};

const initialState: AuthState = {
  ...cleanInitialState,
  ...loadAuthFromStorage(),
};

// ==================== INTERFACES ====================

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  user_type: string;
  phone: string;
}

interface RegisterSuccessResponse {
  message: string;
  user_id: number;
  email: string;
  otp_expires_in_minutes: number;
  next_step: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
  purpose: string;
}

interface VerifyOTPSuccessResponse {
  message: string;
  token: string;
  user_id: number;
  username: string;
  email: string;
  user_type: string;
  is_email_verified: boolean;
}

export interface ResendOTPPayload {
  email: string;
  purpose: string;
}

interface ResendOTPSuccessResponse {
  message: string;
  email: string;
  otp_expires_in_minutes: number;
}

export interface LoginPayload {
  username?: string;
  email?: string;
  password: string;
}

interface LoginSuccessResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
  user_type: string;
  first_name: string;
  last_name: string;
  is_email_verified: boolean;
  message: string;
}

export interface LoginWithOTPPayload {
  email: string;
}

interface LoginWithOTPSuccessResponse {
  message: string;
  email: string;
  otp_expires_in_minutes: number;
  next_step: string;
}

export interface RequestPasswordResetPayload {
  email: string;
}

interface RequestPasswordResetSuccessResponse {
  message: string;
  next_step?: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

interface ResetPasswordSuccessResponse {
  message: string;
}

interface ErrorResponse {
  error?: string;
  email?: string;
  user_id?: number;
  action?: string;
  [key: string]: any;
}

const API_URL = `${API_ENDPOINTS.users}/auth`;

// Helper function to extract error messages from Django responses
const extractErrorMessage = (errorData: ErrorResponse): { error: string; fieldErrors?: Record<string, string[]> } => {
  // Direct error message
  if (errorData.error) {
    return { error: errorData.error };
  }

  // Field-level validation errors (from serializer)
  const fieldErrors: Record<string, string[]> = {};
  let hasFieldErrors = false;

  for (const [key, value] of Object.entries(errorData)) {
    if (Array.isArray(value)) {
      fieldErrors[key] = value;
      hasFieldErrors = true;
    }
  }

  if (hasFieldErrors) {
    const firstError = Object.entries(fieldErrors)[0];
    const errorMessage = `${firstError[0]}: ${firstError[1][0]}`;
    return { error: errorMessage, fieldErrors };
  }

  // Fallback
  return { error: 'An error occurred. Please try again.' };
};

// ==================== ASYNC THUNKS ====================

// 📝 REGISTER
export const registerUser = createAsyncThunk<RegisterSuccessResponse, RegisterPayload, { rejectValue: { error: string; fieldErrors?: Record<string, string[]> } }>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post<RegisterSuccessResponse>(
        `${API_URL}/register/`,
        data
      );
      return res.data;
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response?.data) {
        return rejectWithValue(extractErrorMessage(axiosError.response.data));
      }
      return rejectWithValue({
        error: axiosError.message || 'Registration failed. Please try again.',
      });
    }
  }
);

// 🔐 VERIFY OTP
export const verifyOTP = createAsyncThunk<VerifyOTPSuccessResponse, VerifyOTPPayload, { rejectValue: { error: string; fieldErrors?: Record<string, string[]> } }>(
  'auth/verifyOTP',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post<VerifyOTPSuccessResponse>(
        `${API_URL}/verify-otp/`,
        data
      );
      return res.data;
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response?.data) {
        return rejectWithValue(extractErrorMessage(axiosError.response.data));
      }
      return rejectWithValue({
        error: axiosError.message || 'OTP verification failed. Please try again.',
      });
    }
  }
);

// 🔄 RESEND OTP
export const resendOTP = createAsyncThunk<ResendOTPSuccessResponse, ResendOTPPayload, { rejectValue: { error: string; fieldErrors?: Record<string, string[]> } }>(
  'auth/resendOTP',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post<ResendOTPSuccessResponse>(
        `${API_URL}/resend-otp/`,
        data
      );
      return res.data;
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response?.data) {
        return rejectWithValue(extractErrorMessage(axiosError.response.data));
      }
      return rejectWithValue({
        error: axiosError.message || 'Failed to resend OTP. Please try again.',
      });
    }
  }
);

// 🔑 LOGIN (Traditional)
export const loginUser = createAsyncThunk<LoginSuccessResponse, LoginPayload, { rejectValue: { error: string; email?: string; userId?: number; action?: string } }>(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post<LoginSuccessResponse>(
        `${API_URL}/login/`,
        data
      );
      return res.data;
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        return rejectWithValue({
          error: errorData.error || 'Login failed.',
          email: errorData.email,
          userId: errorData.user_id,
          action: errorData.action,
        });
      }
      return rejectWithValue({
        error: axiosError.message || 'Login failed. Please try again.',
      });
    }
  }
);

// 📧 LOGIN WITH OTP (Request OTP)
export const loginWithOTP = createAsyncThunk<LoginWithOTPSuccessResponse, LoginWithOTPPayload, { rejectValue: { error: string; fieldErrors?: Record<string, string[]> } }>(
  'auth/loginWithOTP',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post<LoginWithOTPSuccessResponse>(
        `${API_URL}/login-with-otp/`,
        data
      );
      return res.data;
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response?.data) {
        return rejectWithValue(extractErrorMessage(axiosError.response.data));
      }
      return rejectWithValue({
        error: axiosError.message || 'Failed to send OTP. Please try again.',
      });
    }
  }
);

// 🔒 REQUEST PASSWORD RESET
export const requestPasswordReset = createAsyncThunk<RequestPasswordResetSuccessResponse, RequestPasswordResetPayload, { rejectValue: { error: string } }>(
  'auth/requestPasswordReset',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post<RequestPasswordResetSuccessResponse>(
        `${API_URL}/request-password-reset/`,
        data
      );
      return res.data;
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        return rejectWithValue({
          error: errorData.error || 'Failed to request password reset.',
        });
      }
      return rejectWithValue({
        error: axiosError.message || 'Failed to request password reset. Please try again.',
      });
    }
  }
);

// 🔓 RESET PASSWORD
export const resetPassword = createAsyncThunk<ResetPasswordSuccessResponse, ResetPasswordPayload, { rejectValue: { error: string; fieldErrors?: Record<string, string[]> } }>(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post<ResetPasswordSuccessResponse>(
        `${API_URL}/reset-password/`,
        data
      );
      return res.data;
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response?.data) {
        return rejectWithValue(extractErrorMessage(axiosError.response.data));
      }
      return rejectWithValue({
        error: axiosError.message || 'Password reset failed. Please try again.',
      });
    }
  }
);

// 🚪 LOGOUT
export const logoutUser = createAsyncThunk<{ message: string }, void, { rejectValue: { error: string } }>(
  'auth/logout',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;

      const res = await axios.post(
        `${API_URL}/logout/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      return res.data;
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        return rejectWithValue({
          error: errorData.error || 'Logout failed.',
        });
      }
      return rejectWithValue({
        error: axiosError.message || 'Logout failed. Please try again.',
      });
    }
  }
);

// ==================== SLICE ====================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      clearAuthFromStorage();
      Object.assign(state, cleanInitialState);
    },

    clearError: (state) => {
      state.error = null;
      state.fieldErrors = null;
    },

    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.userId = action.payload.user_id;
        state.email = action.payload.email;
        state.otpExpiresInMinutes = action.payload.otp_expires_in_minutes;
        state.nextStep = action.payload.next_step;
        state.error = null;
        state.fieldErrors = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload.error;
          state.fieldErrors = action.payload.fieldErrors || null;
        } else {
          state.error = action.error.message || 'An unexpected error occurred';
        }
        state.message = null;
      })

      // VERIFY OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = null;
        state.message = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.token = action.payload.token;
        state.userId = action.payload.user_id;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.userType = action.payload.user_type;
        state.isAuthenticated = true;
        state.otpVerified = true;
        state.error = null;
        state.fieldErrors = null;

        // Save to localStorage
        saveAuthToStorage({
          token: action.payload.token,
          userId: action.payload.user_id,
          username: action.payload.username,
          email: action.payload.email,
          userType: action.payload.user_type,
        });
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload.error;
          state.fieldErrors = action.payload.fieldErrors || null;
        } else {
          state.error = action.error.message || 'OTP verification failed';
        }
        state.message = null;
      })

      // RESEND OTP
      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.email = action.payload.email;
        state.otpExpiresInMinutes = action.payload.otp_expires_in_minutes;
        state.error = null;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload.error;
        } else {
          state.error = action.error.message || 'Failed to resend OTP';
        }
        state.message = null;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.token = action.payload.token;
        state.userId = action.payload.user_id;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.userType = action.payload.user_type;
        state.firstName = action.payload.first_name;
        state.lastName = action.payload.last_name;
        state.isAuthenticated = true;
        state.otpVerified = action.payload.is_email_verified;
        state.error = null;

        // Save to localStorage
        saveAuthToStorage({
          token: action.payload.token,
          userId: action.payload.user_id,
          username: action.payload.username,
          email: action.payload.email,
          userType: action.payload.user_type,
          firstName: action.payload.first_name,
          lastName: action.payload.last_name,
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload.error;
          // Store email/userId for potential OTP verification flow
          if (action.payload.email) {
            state.email = action.payload.email;
          }
          if (action.payload.userId) {
            state.userId = action.payload.userId;
          }
        } else {
          state.error = action.error.message || 'Login failed';
        }
        state.message = null;
      })

      // LOGIN WITH OTP
      .addCase(loginWithOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginWithOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.email = action.payload.email;
        state.otpExpiresInMinutes = action.payload.otp_expires_in_minutes;
        state.nextStep = action.payload.next_step;
        state.error = null;
      })
      .addCase(loginWithOTP.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload.error;
        } else {
          state.error = action.error.message || 'Failed to send OTP';
        }
        state.message = null;
      })

      // REQUEST PASSWORD RESET
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.nextStep = action.payload.next_step || null;
        state.error = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload.error;
        } else {
          state.error = action.error.message || 'Failed to request password reset';
        }
        state.message = null;
      })

      // RESET PASSWORD
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.error = null;
        state.fieldErrors = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload.error;
          state.fieldErrors = action.payload.fieldErrors || null;
        } else {
          state.error = action.error.message || 'Password reset failed';
        }
        state.message = null;
      })

      // LOGOUT
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        clearAuthFromStorage();
        Object.assign(state, cleanInitialState);
        state.message = action.payload.message;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        // Even if logout fails on server, clear local state
        clearAuthFromStorage();
        Object.assign(state, cleanInitialState);
      });
  },
});

export const { logout, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;