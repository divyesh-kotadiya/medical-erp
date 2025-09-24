import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  } | null;
  loading: boolean;
  error?: string;
  userIdForOtp?: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  user: null,
  error: undefined,
  userIdForOtp: undefined,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', payload);
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data || 'Network error');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: { userId: string; otp: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/verify', payload);
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data || 'Network error');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: { name?: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data || 'Network error');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data || 'Network error');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (payload: { userId: string; otp: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/reset-password', payload);
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data || 'Network error');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data || 'Network error');
    }
  }
);

export const refreshTokens = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/refresh');
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data || 'Network error');
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/resend-otp', { userId });
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data || 'Network error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem('token');
      state.isAuthenticated = false;
      state.user = null;
      state.error = undefined;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = undefined; })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ message: string; userId: string }>) => {
        state.loading = false;
        state.userIdForOtp = action.payload.userId;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || 'Login failed';
      });

    builder
      .addCase(verifyOtp.pending, (state) => { state.loading = true; state.error = undefined; })
      .addCase(verifyOtp.fulfilled, (state, action: PayloadAction<{ data: { id: string; name: string; email: string }; accessToken: string }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.accessToken);  
        state.user = action.payload.data;
        state.userIdForOtp = undefined;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || 'OTP verification failed';
      });

    builder
      .addCase(register.pending, (state) => { state.loading = true; state.error = undefined; })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ message: string; userId: string }>) => {
        state.loading = false;
        state.userIdForOtp = action.payload.userId;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || 'Registration failed';
      });

    builder
      .addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = undefined; })
      .addCase(forgotPassword.fulfilled, (state, action: PayloadAction<{ message: string; userId: string }>) => {
        state.loading = false;
        state.userIdForOtp = action.payload.userId;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || 'Forgot password failed';
      });

    builder
      .addCase(resetPassword.pending, (state) => { state.loading = true; state.error = undefined; })
      .addCase(resetPassword.fulfilled, (state) => { state.loading = false; state.userIdForOtp = undefined; })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || 'Reset password failed';
      });

    builder
      .addCase(fetchMe.pending, (state) => { state.loading = true; state.error = undefined; })
      .addCase(fetchMe.fulfilled, (state, action: PayloadAction<{ data: { id: string; name: string; email: string }; token: string }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || 'Fetch user failed';
        state.isAuthenticated = false;
        state.user = null;
      });

    builder
      .addCase(refreshTokens.pending, (state) => { state.loading = true; state.error = undefined; })
      .addCase(refreshTokens.fulfilled, (state) => {
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(refreshTokens.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
      });

    builder
      .addCase(resendOtp.pending, (state) => { state.loading = true; state.error = undefined; })
      .addCase(resendOtp.fulfilled, (state) => { state.loading = false; })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || 'Resend OTP failed';
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
