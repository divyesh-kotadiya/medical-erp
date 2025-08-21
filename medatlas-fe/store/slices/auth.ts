import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

export interface AuthState {
  isAuthenticated: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    isTenantAdmin: boolean;
  } | null;
  tenant?: {
    id: string;
    name: string;
  } | null;
  loading: boolean;
  error?: string;
}

export interface CreateTenantPayload {
  organization: string;
  email: string;
  password: string;
  name: string;
}

interface RegisterWithInvitePayload {
  token: string;
  name: string;
  password: string;
}

interface loginPayload {
  email: string;
  password: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  user: null,
  tenant: null,
  error: undefined,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: loginPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', payload);
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  }
);

export const createTenant = createAsyncThunk(
  'auth/createTenantAndLogin',
  async (payload: CreateTenantPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/tenants', payload);
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  }
);

export const registerWithInvite = createAsyncThunk(
  'auth/registerWithInvite',
  async (payload: RegisterWithInvitePayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register-with-invite', payload);
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
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
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  }
);


export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    payload: { token: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const { token, newPassword } = payload;
      const { data } = await api.put(`/auth/forgot-password/${token}`, { newPassword });
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) return rejectWithValue(e.response.data);
      return rejectWithValue('Network error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = undefined;
      state.isAuthenticated = false;
      state.user = null;
      state.tenant = null;
      state.error = undefined;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<{ tenant: any; userData: any }>) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.token = action.payload.userData.token;
          localStorage.setItem("token", action.payload.userData.token);
          state.user = {
            id: action?.payload?.userData.id,
            email: action?.payload?.userData.email,
            name: action?.payload?.userData.user,
            role: action?.payload?.userData.role,
            isTenantAdmin: action.payload.userData.isTenantAdmin,
          };

          state.tenant = {
            id: action.payload.tenant._id,
            name: action.payload.tenant.name,
          };
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;

        if (action.payload && typeof action.payload === "object" && "message" in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error = (action.payload as string) || action.error.message || "Login failed";
        }
      })
      .addCase(createTenant.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(createTenant.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.userData.token;
        localStorage.setItem("token", action.payload.userData.token);

        state.user = {
          id: action.payload.userData.id,
          email: action.payload.userData.email,
          name: action.payload.userData.user,
          role: action.payload.userData.role,
          isTenantAdmin: action.payload.userData.isTenantAdmin,
        };

        state.tenant = {
          id: action.payload.tenant._id,
          name: action.payload.tenant.name,
        };
      })
      .addCase(createTenant.rejected, (state, action) => {
        state.loading = false;

        if (action.payload && typeof action.payload === "object" && "message" in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error = (action.payload as string) || action.error.message || "Tenant creation failed";
        }
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = undefined;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;

        if (action.payload && typeof action.payload === "object" && "message" in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error = (action.payload as string) || action.error.message || "Forgot password failed";
        }
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = undefined;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;

        if (action.payload && typeof action.payload === "object" && "message" in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error = (action.payload as string) || action.error.message || "Reset password failed";
        }
      })
      .addCase(registerWithInvite.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(registerWithInvite.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.userData.token;
        localStorage.setItem("token", action.payload.userData.token);
        state.user = {
          id: action.payload.userData.id,
          email: action.payload.userData.email,
          name: action.payload.userData.user,
          role: action.payload.userData.role,
          isTenantAdmin: action.payload.userData.isTenantAdmin,
        };

        state.tenant = {
          id: action.payload.tenant._id,
          name: action.payload.tenant.name,
        };
      })
      .addCase(registerWithInvite.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;

        if (action.payload && typeof action.payload === "object" && "message" in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error = (action.payload as string) || action.error.message || "Registration with invite failed";
        }
      });
  },
});

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = createSelector(
  selectAuth,
  (auth) => auth.isAuthenticated
);

export const { logout } = authSlice.actions;
export default authSlice.reducer;
