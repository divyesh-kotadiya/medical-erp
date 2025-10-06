import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

export interface Invite {
  status: string;
  token: string;
  email: string;
  role: string;
  organizationName?: string;
  createdAt: string;
}

interface InviteState {
  invites: Invite[];
  myInvites: Invite[];
  loading: boolean;
  creating: boolean;
  error?: string;
  total?: number;
  totalPages?: number;
}

const initialState: InviteState = {
  invites: [],
  myInvites: [],
  loading: false,
  creating: false,
  error: undefined,
  total: 0,
  totalPages: 0,
};

export const inviteMember = createAsyncThunk(
  'invite/inviteMember',
  async ({ email, role }: { email: string; role?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/invites', { email, role });
      return data;
    } catch (e: any) {
      if (e.response?.data) return rejectWithValue(e.response.data);
      return rejectWithValue('Network error');
    }
  },
);

export const fetchInvites = createAsyncThunk(
  'invite/fetchInvites',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/invites/tenant/list', { page, limit });
      return data;
    } catch (e: any) {
      if (e.response?.data) return rejectWithValue(e.response.data);
      return rejectWithValue('Network error');
    }
  },
);

export const fetchMyInvites = createAsyncThunk(
  'invite/fetchMyInvites',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/invites/me', { page, limit });

      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data || 'Network error');
    }
  },
);

export const acceptInvite = createAsyncThunk(
  'invite/acceptInvite',
  async (token: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/invites/accept', { token });
      return data;
    } catch (e: any) {
      if (e.response?.data) return rejectWithValue(e.response.data);
      return rejectWithValue('Network error');
    }
  },
);

export const rejectInvite = createAsyncThunk(
  'invite/rejectInvite',
  async (token: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/invites/reject', { token });
      return data;
    } catch (e: any) {
      if (e.response?.data) return rejectWithValue(e.response.data);
      return rejectWithValue('Network error');
    }
  },
);

const inviteSlice = createSlice({
  name: 'invite',
  initialState,
  reducers: {
    clearInvites: (state) => {
      state.invites = [];
      state.myInvites = [];
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(inviteMember.pending, (state) => {
      state.loading = true;
      state.creating = true;
      state.error = undefined;
    });
    builder.addCase(inviteMember.fulfilled, (state, action) => {
      state.loading = false;
      state.creating = false;
      state.invites.unshift(action.payload);
    });
    builder.addCase(inviteMember.rejected, (state, action) => {
      state.loading = false;
      state.creating = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchInvites.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    });
    builder.addCase(fetchInvites.fulfilled, (state, action) => {
      state.loading = false;
      state.invites = action.payload.data;
      state.total = action.payload?.total;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(fetchInvites.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchMyInvites.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    });
    builder.addCase(fetchMyInvites.fulfilled, (state, action) => {
      state.loading = false;
      state.myInvites = action.payload.data;
    });
    builder.addCase(fetchMyInvites.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(acceptInvite.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    });
    builder.addCase(acceptInvite.fulfilled, (state, action) => {
      state.loading = false;
      const token = action.meta.arg;
      state.invites = state.invites.filter((inv) => inv.token !== token);
      state.myInvites = state.myInvites.filter((inv) => inv.token !== token);
    });
    builder.addCase(acceptInvite.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(rejectInvite.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    });
    builder.addCase(rejectInvite.fulfilled, (state, action) => {
      state.loading = false;
      const token = action.meta.arg;
      state.invites = state.invites.filter((inv) => inv.token !== token);
      state.myInvites = state.myInvites.filter((inv) => inv.token !== token);
    });
    builder.addCase(rejectInvite.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearInvites } = inviteSlice.actions;
export default inviteSlice.reducer;
