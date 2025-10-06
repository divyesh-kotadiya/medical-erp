import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

export interface Shift {
  _id: string;
  title: string;
  staffId?: string;
  start: string;
  end: string;
  notes?: string;
  cancelled?: boolean;
}

interface ShiftState {
  shifts: Shift[];
  loading: boolean;
  error: string | null;
}

const initialState: ShiftState = {
  shifts: [],
  loading: false,
  error: null,
};

export const createShift = createAsyncThunk(
  'shifts/create',
  async (data: Omit<Shift, '_id'>, { rejectWithValue }) => {
    try {
      const res = await api.post('/shifts', data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to create shift');
    }
  },
);

export const fetchShifts = createAsyncThunk('shifts/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.post('/shifts/by-tenant');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Failed to fetch shifts');
  }
});

export const fetchShiftById = createAsyncThunk(
  'shifts/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/shifts/${id}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch shift');
    }
  },
);

export const updateShift = createAsyncThunk(
  'shifts/update',
  async ({ id, data }: { id: string; data: Partial<Shift> }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/shifts/${id}`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to update shift');
    }
  },
);

export const deleteShift = createAsyncThunk(
  'shifts/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/shifts/${id}`);
      return { id, ...res.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to delete shift');
    }
  },
);

export const assignShift = createAsyncThunk(
  'shifts/assign',
  async ({ id, staffId }: { id: string; staffId: string }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/shifts/${id}/assign`, { staffId });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to assign staff');
    }
  },
);

const shiftSlice = createSlice({
  name: 'shifts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShifts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShifts.fulfilled, (state, action: PayloadAction<Shift[]>) => {
        state.loading = false;
        state.shifts = action.payload;
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchShiftById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShiftById.fulfilled, (state, action: PayloadAction<Shift>) => {
        state.loading = false;
        const foundIndex = state.shifts.findIndex((s) => s._id === action.payload._id);
        if (foundIndex >= 0) {
          state.shifts[foundIndex] = action.payload;
        } else {
          state.shifts.push(action.payload);
        }
      })
      .addCase(fetchShiftById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShift.fulfilled, (state, action: PayloadAction<Shift>) => {
        state.loading = false;
        state.shifts.push(action.payload);
      })
      .addCase(createShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShift.fulfilled, (state, action: PayloadAction<Shift>) => {
        state.loading = false;
        state.shifts = state.shifts.map((shift) =>
          shift._id === action.payload._id ? action.payload : shift,
        );
      })
      .addCase(updateShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.loading = false;
        state.shifts = state.shifts.filter((shift) => shift._id !== action.payload.id);
      })
      .addCase(deleteShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(assignShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignShift.fulfilled, (state, action: PayloadAction<Shift>) => {
        state.loading = false;
        state.shifts = state.shifts.map((shift) =>
          shift._id === action.payload._id ? action.payload : shift,
        );
      })
      .addCase(assignShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default shiftSlice.reducer;
