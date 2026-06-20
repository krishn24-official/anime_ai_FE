import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../services/apiClient';

interface UserInfo {
  id: string;
  email: string;
  username: string;
  display_name?: string;
}

interface AuthState {
  currentUser: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  forgotPasswordEmail: string | null; // Keep track of email during OTP reset flow
  forgotPasswordOtp: string | null;   // Keep track of OTP during reset flow
}

const getStoredUser = (): UserInfo | null => {
  try {
    const userStr = localStorage.getItem('anime_ai_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  currentUser: getStoredUser(),
  accessToken: localStorage.getItem('anime_ai_token'),
  refreshToken: localStorage.getItem('anime_ai_refresh_token'),
  loading: false,
  error: null,
  forgotPasswordEmail: null,
  forgotPasswordOtp: null,
};

interface AuthResponse {
  user: UserInfo;
  access_token: string;
  refresh_token: string;
}

// Async Thunks
export const registerUserThunk = createAsyncThunk(
  'auth/register',
  async (payload: { email: string; username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', payload);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const loginUserThunk = createAsyncThunk(
  'auth/login',
  async (payload: { identifier: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', payload);
      return response;
    } catch (err: any) {
      // Map general login error to specific requirement "user not found" if appropriate, 
      // or display the exact server message.
      const errorMsg = err.message || 'Invalid credentials';
      if (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('not found')) {
        return rejectWithValue('User not found');
      }
      return rejectWithValue(errorMsg);
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken || localStorage.getItem('anime_ai_refresh_token');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      }
      apiClient.clearTokens();
      localStorage.removeItem('anime_ai_user');
      return null;
    } catch (err: any) {
      apiClient.clearTokens();
      localStorage.removeItem('anime_ai_user');
      return null;
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', payload);
      return { email: payload.email, message: response.message };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/verify-otp', payload);
      return { otp: payload.otp, message: response.message };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Invalid OTP code');
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/reset-password', payload);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Password reset failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetResetFlow: (state) => {
      state.forgotPasswordEmail = null;
      state.forgotPasswordOtp = null;
    },
    setForgotPasswordEmail: (state, action) => {
      state.forgotPasswordEmail = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Login
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        
        apiClient.setToken(action.payload.access_token);
        apiClient.setRefreshToken(action.payload.refresh_token);
        localStorage.setItem('anime_ai_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.currentUser = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
      })

      // Forgot Password
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.forgotPasswordEmail = action.payload.email;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Verify OTP
      .addCase(verifyOtpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.forgotPasswordOtp = action.payload.otp;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reset Password
      .addCase(resetPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        state.loading = false;
        state.forgotPasswordEmail = null;
        state.forgotPasswordOtp = null;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetResetFlow, setForgotPasswordEmail } = authSlice.actions;
export default authSlice.reducer;
