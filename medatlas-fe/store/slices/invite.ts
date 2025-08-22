import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
export interface InviteState {
  loading: boolean;
  error?: string;
  message?: string;
  invites: Invite[];
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}
export interface Invite {
  _id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
  accepted: boolean;
}

const initialState: InviteState = {
  loading: false,
  error: undefined,
  message: undefined,
  invites: [],
  page: 1,
  limit: 10,
  totalPages: 0,
  total: 0,
};

export const inviteMember = createAsyncThunk(
  'invite/inviteMember',
  async (payload: { email: string; role?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/invites', payload);
      return data; // expecting { message: string }
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  }
);

export const fetchInvites = createAsyncThunk(
  'invite/fetchInvites',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/invites/list', { page, limit });
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  }
);

const inviteSlice = createSlice({
  name: 'invite',
  initialState,
  reducers: {
    resetInviteState(state) {
      state.loading = false;
      state.error = undefined;
      state.message = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(inviteMember.pending, (state) => {
        state.loading = true;
        state.error = undefined;
        state.message = undefined;
      })
      .addCase(inviteMember.fulfilled, (state, action: PayloadAction<{ message: string }>) => {
        state.loading = false;
        state.error = undefined;
        state.message = action.payload.message;
      })
      .addCase(inviteMember.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Invite member failed";
        state.message = undefined;
      }).addCase(fetchInvites.pending, (state) => {
        state.loading = true;
        state.message = undefined;
        state.error = undefined;
      })
      .addCase(fetchInvites.fulfilled, (state, action: PayloadAction<{
        data: Invite[];
        page: number;
        limit: number;
        totalPages: number;
        total: number;
      }>) => {
        state.loading = false;
        state.error = undefined;
        state.invites = action.payload.data;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
        state.total = action.payload.total;
      })
      .addCase(fetchInvites.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch invites";
      });
  },
});

export const { resetInviteState } = inviteSlice.actions;
export const selectInvite = (state: { invite: InviteState }) => state.invite;

export default inviteSlice.reducer;
