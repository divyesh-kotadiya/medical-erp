import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

export interface Member {
  department: string;
  _id: string;
  email: string;
  name: string;
}
export interface AuthState {
  isAuthenticated: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    phone: string | undefined;
    avatar: string | undefined;
    isTenantAdmin: boolean;
  } | null;
  tenant?: {
    id: string;
    name: string;
  } | null;
  members: Member[];
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
  members: [],
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

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload: { currentPassword: string, newPassword: string }, { rejectWithValue }) => {
    try {
      const { currentPassword, newPassword } = payload;
      const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  }
)

export const fetchMembers = createAsyncThunk(
  'auth/fetchMembers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth');
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  }
);


export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    payload: {
      userId: string;
      fields: { name?: string; email?: string; phone?: string };
      avatarFile?: File | null;
    },
    { rejectWithValue }
  ) => {
    try {
      const form = new FormData();
      if (payload.fields.name) form.append('name', payload.fields.name);
      if (payload.fields.email) form.append('email', payload.fields.email);
      if (payload.fields.phone) form.append('phone', payload.fields.phone);
      if (payload.avatarFile) form.append('avatar', payload.avatarFile);

      const { data } = await api.put(
        `/auth/${payload.userId}/profile`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
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
      state.members = [];
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
            phone: action?.payload?.userData.phone,
            avatar: action?.payload?.userData.avatar,
            isTenantAdmin: action?.payload?.userData.isTenantAdmin,
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
          phone: action.payload.userData.phone,
          avatar: action.payload.userData.avatar,
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
          phone: action.payload.userData.phone,
          avatar: action.payload.userData.avatar,
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
      })
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchMembers.fulfilled, (state, action: PayloadAction<Member[]>) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === "object" && "message" in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error = (action.payload as string) || action.error.message || "Failed to fetch members";
        }
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = undefined;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;

        if (action.payload && typeof action.payload === "object" && "message" in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error = (action.payload as string) || action.error.message || "Reset password failed";
        }
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(
        updateProfile.fulfilled,
        (
          state,
          action: PayloadAction<{ message: string; user: { _id: string; name: string; email: string; phone?: string; avatar?: string } }>
        ) => {
          state.loading = false;
          if (state.user) {
            state.user.name = action.payload.user.name;
            state.user.email = action.payload.user.email;
            state.user.phone = action.payload.user.phone as string | undefined;
            state.user.avatar = action.payload.user.avatar as string | undefined;
          }
        }
      )
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error = (action.payload as string) || action.error.message || 'Update profile failed';
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
