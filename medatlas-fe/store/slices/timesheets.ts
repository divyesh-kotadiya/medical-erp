import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

export interface TimeBreak {
  start: string;
  end?: string;
}

export interface TimeEntry {
  _id: string;
  staffId:
    | string
    | {
        firstName?: string;
        lastName?: string;
        email?: string;
      };
  clockIn: string;
  clockOut?: string;
  breaks: TimeBreak[];
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetStatus {
  isClockedIn: boolean;
  isOnBreak: boolean;
}

export interface DailySummary {
  hours: number;
}

export interface TimesheetsState {
  entries: TimeEntry[];
  status: TimesheetStatus;
  dailySummary: DailySummary;
  weeklyHours?: number;
  lastSubmittedTimesheetId?: string | null;
  submittedList?: Array<{
    _id: string;
    staff: { name: string; email: string };
    periodStart: string;
    periodEnd: string;
    hours: number;
    status: string;
  }>;
  submissionStatus?: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submissionMessage?: string;
  loading: boolean;
  error?: string;
}

const initialState: TimesheetsState = {
  entries: [],
  status: { isClockedIn: false, isOnBreak: false },
  dailySummary: { hours: 0 },
  weeklyHours: 0,
  lastSubmittedTimesheetId: null,
  submittedList: [],
  submissionStatus: 'REJECTED',
  submissionMessage: undefined,
  loading: false,
  error: undefined,
};

export const checkSubmissionStatus = createAsyncThunk(
  'timesheets/checkSubmissionStatus',
  async (
    { periodStart, periodEnd }: { periodStart: string; periodEnd: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/timesheets/status?periodStart=${periodStart}&periodEnd=${periodEnd}`,
      );
      return data;
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }
      return rejectWithValue('Network error');
    }
  },
);

export const clockIn = createAsyncThunk(
  'timesheets/clockIn',
  async ({ tenantId }: { tenantId: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/timesheets/clock-in', { tenantId });
      return data;
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }
      return rejectWithValue('Network error');
    }
  },
);

export const clockOut = createAsyncThunk('timesheets/clockOut', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/timesheets/clock-out');
    return data;
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'response' in e) {
      const error = e as { response?: { data?: unknown } };
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
    }
    return rejectWithValue('Network error');
  }
});

export const startBreak = createAsyncThunk(
  'timesheets/startBreak',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/timesheets/start-break');
      return data;
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }
      return rejectWithValue('Network error');
    }
  },
);

export const endBreak = createAsyncThunk('timesheets/endBreak', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/timesheets/end-break');
    return data;
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'response' in e) {
      const error = e as { response?: { data?: unknown } };
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
    }
    return rejectWithValue('Network error');
  }
});

export const fetchStatus = createAsyncThunk(
  'timesheets/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/timesheets/status');
      return data;
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }
      return rejectWithValue('Network error');
    }
  },
);

export const fetchDailySummary = createAsyncThunk(
  'timesheets/fetchDailySummary',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/timesheets/daily-summary');
      return data;
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }
      return rejectWithValue('Network error');
    }
  },
);

export const fetchEntries = createAsyncThunk(
  'timesheets/fetchEntries',
  async (args: FetchEntriesArgs | undefined, { rejectWithValue }) => {
    try {
      const params: Record<string, string> = {};

      if (args?.periodStart) params.periodStart = args.periodStart;
      if (args?.periodEnd) params.periodEnd = args.periodEnd;

      const { data } = await api.get('/timesheets/entries', { params });
      return data;
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }
      return rejectWithValue('Network error');
    }
  },
);
export const fetchAllEntries = createAsyncThunk(
  'timesheets/fetchAllEntries',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/timesheets/entries/all');
      return data;
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }
      return rejectWithValue('Network error');
    }
  },
);

export const fetchWeeklyTotal = createAsyncThunk(
  'timesheets/fetchWeeklyTotal',
  async (payload: { periodStart: string; periodEnd: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/timesheets/weekly-total', payload);
      return data as { hours: number };
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }
      return rejectWithValue('Network error');
    }
  },
);

export const submitWeek = createAsyncThunk(
  'timesheets/submitWeek',
  async (payload: { periodStart: string; periodEnd: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/timesheets/submit-week', payload);
      return data;
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }
      return rejectWithValue('Network error');
    }
  },
);

export const fetchSubmittedTimesheets = createAsyncThunk(
  'timesheets/fetchSubmitted',
  async (
    payload: { from?: string; to?: string; userId?: string; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      if (payload?.from) params.set('from', payload.from);
      if (payload?.to) params.set('to', payload.to);
      if (payload?.userId) params.set('userId', payload.userId);
      if (payload?.page) params.set('page', String(payload.page));
      if (payload?.limit) params.set('limit', String(payload.limit));
      const qs = params.toString();
      const { data } = await api.get(`/timesheets/submitted${qs ? `?${qs}` : ''}`);
      return data as {
        items: Array<{
          _id: string;
          staff: { name: string; email: string };
          periodStart: string;
          periodEnd: string;
          hours: number;
          status: string;
        }>;
        total: number;
        page: number;
        limit: number;
      };
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }
      return rejectWithValue('Network error');
    }
  },
);

export const approveTimesheet = createAsyncThunk(
  'timesheets/approve',
  async (payload: { timesheetId: string; approvedBy: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/timesheets/${payload.timesheetId}/approve`, {
        approvedBy: payload.approvedBy,
      });
      return data;
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }
      return rejectWithValue('Network error');
    }
  },
);

export const rejectTimesheet = createAsyncThunk(
  'timesheets/reject',
  async (
    payload: { timesheetId: string; rejectedBy: string; reason?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch(`/timesheets/${payload.timesheetId}/reject`, {
        rejectedBy: payload.rejectedBy,
        reason: payload.reason,
      });
      return data;
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }
      return rejectWithValue('Network error');
    }
  },
);

export const deleteEntry = createAsyncThunk(
  'timesheets/deleteEntry',
  async (entryId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/timesheets/entries/${entryId}`);
      return { success: (data as { success?: boolean }).success ?? true, entryId };
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }
      return rejectWithValue('Network error');
    }
  },
);

export const downloadTimesheet = createAsyncThunk<
  Blob,
  { userId?: string; periodStart: string; periodEnd: string },
  { rejectValue: string }
>(
  'timesheets/downloadTimesheet',
  async ({ userId, periodStart, periodEnd }, { rejectWithValue }) => {
    try {
      const response = await api.get('/timesheets/export', {
        params: {
          userId,
          periodStart,
          periodEnd,
        },
        responseType: 'blob',
      });
      return response.data as Blob;
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const error = e as { response?: { data?: unknown } };
        if (error.response && error.response.data) {
          return rejectWithValue('Failed to download file.');
        }
      }
      return rejectWithValue('Network error');
    }
  },
);

const timesheetsSlice = createSlice({
  name: 'timesheets',
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined;
    },
    resetTimesheetState(state) {
      state.status = { isClockedIn: false, isOnBreak: false };
      state.entries = [];
      state.dailySummary = { hours: 0 };
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(clockIn.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(clockIn.fulfilled, (state, action: PayloadAction<TimeEntry>) => {
        state.loading = false;
        state.status.isClockedIn = true;
        state.entries.unshift(action.payload);
      })
      .addCase(clockIn.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = (action.payload as string) || action.error?.message || 'Clock in failed';
        }
      })
      .addCase(clockOut.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(clockOut.fulfilled, (state, action: PayloadAction<TimeEntry>) => {
        state.loading = false;
        state.status.isClockedIn = false;
        state.status.isOnBreak = false;
        const index = state.entries.findIndex((entry) => entry._id === action.payload._id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
      })
      .addCase(clockOut.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = (action.payload as string) || action.error?.message || 'Clock out failed';
        }
      })
      // Start Break
      .addCase(startBreak.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(startBreak.fulfilled, (state, action: PayloadAction<TimeEntry>) => {
        state.loading = false;
        state.status.isOnBreak = true;
        // Update the entry in the array
        const index = state.entries.findIndex((entry) => entry._id === action.payload._id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
      })
      .addCase(startBreak.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = (action.payload as string) || action.error?.message || 'Start break failed';
        }
      })
      .addCase(endBreak.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(endBreak.fulfilled, (state, action: PayloadAction<TimeEntry>) => {
        state.loading = false;
        state.status.isOnBreak = false;
        // Update the entry in the array
        const index = state.entries.findIndex((entry) => entry._id === action.payload._id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
      })
      .addCase(endBreak.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = (action.payload as string) || action.error?.message || 'End break failed';
        }
      })
      .addCase(fetchStatus.fulfilled, (state, action: PayloadAction<TimesheetStatus>) => {
        state.status = action.payload;
      })
      .addCase(fetchDailySummary.fulfilled, (state, action: PayloadAction<DailySummary>) => {
        state.dailySummary = action.payload;
      })
      .addCase(fetchEntries.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchEntries.fulfilled, (state, action: PayloadAction<TimeEntry[]>) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error =
            (action.payload as string) || action.error?.message || 'Fetch entries failed';
        }
      })
      .addCase(fetchAllEntries.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchAllEntries.fulfilled, (state, action: PayloadAction<TimeEntry[]>) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchAllEntries.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error =
            (action.payload as string) || action.error?.message || 'Fetch all entries failed';
        }
      })
      .addCase(fetchWeeklyTotal.fulfilled, (state, action: PayloadAction<{ hours: number }>) => {
        state.weeklyHours = action.payload.hours;
      })
      .addCase(submitWeek.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(submitWeek.fulfilled, (state, action) => {
        state.loading = false;
        state.submissionStatus = action.payload.status;
        state.submissionMessage = 'Timesheet submitted successfully!';
      })
      .addCase(submitWeek.rejected, (state, action) => {
        state.loading = false;
        state.submissionStatus = 'REJECTED';
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = (action.payload as string) || action.error?.message || 'Submit week failed';
        }
      })
      .addCase(fetchSubmittedTimesheets.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(
        fetchSubmittedTimesheets.fulfilled,
        (
          state,
          action: PayloadAction<{
            items: Array<{
              _id: string;
              staff: { name: string; email: string };
              periodStart: string;
              periodEnd: string;
              hours: number;
              status: string;
            }>;
          }>,
        ) => {
          state.loading = false;
          state.submittedList = action.payload.items;
        },
      )
      .addCase(fetchSubmittedTimesheets.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error =
            (action.payload as string) || action.error?.message || 'Fetch submitted failed';
        }
      })
      .addCase(approveTimesheet.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(approveTimesheet.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(approveTimesheet.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error =
            (action.payload as string) || action.error?.message || 'Approve timesheet failed';
        }
      })
      .addCase(rejectTimesheet.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(rejectTimesheet.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(rejectTimesheet.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error =
            (action.payload as string) || action.error?.message || 'Reject timesheet failed';
        }
      })
      .addCase(deleteEntry.pending, (state) => {
        state.error = undefined;
      })
      .addCase(
        deleteEntry.fulfilled,
        (state, action: PayloadAction<{ success: boolean; entryId: string }>) => {
          if (action.payload.success) {
            state.entries = state.entries.filter((e) => e._id !== action.payload.entryId);
          }
        },
      )
      .addCase(deleteEntry.rejected, (state, action) => {
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error =
            (action.payload as string) || action.error?.message || 'Delete entry failed';
        }
      })
      .addCase(checkSubmissionStatus.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(checkSubmissionStatus.fulfilled, (state, action) => {
        state.loading = false;
        const status = action.payload?.weekStatus;
        state.submissionStatus = status;
        if (status === 'approved') {
          state.submissionMessage = 'Timesheet approved!';
        } else if (status === 'rejected') {
          state.submissionMessage = 'Timesheet rejected. You can resubmit.';
        } else if (status === 'submitted') {
          state.submissionMessage = 'Timesheet submitted and pending approval.';
        } else {
          state.submissionMessage = undefined;
        }
      })
      .addCase(checkSubmissionStatus.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error =
            (action.payload as string) || action.error?.message || 'Check submission status failed';
        }
      });
  },
});

export const { clearError, resetTimesheetState } = timesheetsSlice.actions;
export default timesheetsSlice.reducer;
