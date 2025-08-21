import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

export interface InviteState {
  loading: boolean;
  error?: string;
  message?: string;
}

const initialState: InviteState = {
  loading: false,
  error: undefined,
  message: undefined,
};

export const inviteMember = createAsyncThunk(
  'invite/inviteMember',
  async (payload: { email: string; role?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/invites', payload);
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
        state.loading = false;
      });
  },
});

export const { resetInviteState } = inviteSlice.actions;
export const selectInvite = (state: { invite: InviteState }) => state.invite;

export default inviteSlice.reducer;
