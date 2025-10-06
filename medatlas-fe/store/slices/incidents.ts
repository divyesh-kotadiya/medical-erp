import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
import { Attachment, IncidentStatus, IncidentType, WorkflowStep } from '@/constants/Incidents';

export interface Incident {
  _id: string;
  title: string;
  description?: string;
  status: IncidentStatus;
  currentStep: WorkflowStep;
  incidentType: IncidentType;
  createdAt: string;
  updatedAt: string;
  reportedBy?: string;
  assignedTo?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedSystems?: string[];
  resolution?: string;
  tenantId: string;
  attachments?: Attachment[];
}

export interface Filters {
  status?: string;
  incidentType?: string;
  step?: string;
  tenantId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IncidentsState {
  incidents: Incident[];
  loading: boolean;
  error?: string;
  filters: Filters;
  pagination: PaginationMeta;
  selectedIncident?: Incident | null;
}
export interface PaginatedIncidentsResponse {
  incidents: Incident[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
const initialState: IncidentsState = {
  incidents: [],
  loading: false,
  error: undefined,
  filters: {
    status: '',
    incidentType: '',
    step: '',
    tenantId: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  selectedIncident: null,
};

export interface PaginatedIncidentsResponse {
  incidents: Incident[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const fetchIncidents = createAsyncThunk<
  PaginatedIncidentsResponse,
  {
    status?: string;
    incidentType?: string;
    step?: string;
    tenantId: string;
    page?: number;
    limit?: number;
  }
>('incidents/fetchIncidents', async (filters, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.incidentType) queryParams.append('incidentType', filters.incidentType);
    if (filters.step) queryParams.append('currentStep', filters.step);
    if (filters.tenantId) queryParams.append('tenantId', filters.tenantId);
    if (filters.page) queryParams.append('page', String(filters.page));
    if (filters.limit) queryParams.append('limit', String(filters.limit));

    const { data } = await api.get(`/incidents?${queryParams.toString()}`);

    return data as PaginatedIncidentsResponse;
  } catch (e: any) {
    if (e.response && e.response.data) {
      return rejectWithValue(e.response.data);
    }
    return rejectWithValue('Network error');
  }
});

export const fetchIncidentById = createAsyncThunk(
  'incidents/fetchIncidentById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/incidents/${id}`);
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  },
);

export const createIncident = createAsyncThunk(
  'incidents/createIncident',
  async (incident: Incident, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/incidents', incident);
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  },
);

export const updateIncident = createAsyncThunk(
  'incidents/updateIncident',
  async ({ id, updates }: { id: string; updates: Partial<Incident> }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/incidents/${id}`, updates);
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  },
);

export const updateIncidentStep = createAsyncThunk(
  'incidents/updateIncidentStep',
  async (
    { id, step, completedBy }: { id: string; step: string; completedBy: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch(`/incidents/${id}/step`, { step, completedBy });
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  },
);

export const updateIncidentStatus = createAsyncThunk(
  'incidents/updateIncidentStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/incidents/${id}/status`, { status });
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  },
);

export const deleteIncident = createAsyncThunk(
  'incidents/deleteIncident',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/incidents/${id}`);
      return id;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  },
);

export const addAttachment = createAsyncThunk(
  'incidents/addAttachment',
  async ({ id, file }: { id: string; file: FormData }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/incidents/${id}/attachment/upload`, file, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  },
);

export const deleteAttachment = createAsyncThunk(
  'incidents/deleteAttachment',
  async (
    { incidentId, attachmentId }: { incidentId: string; attachmentId: string },
    { rejectWithValue },
  ) => {
    try {
      await api.delete(`/incidents/${incidentId}/attachment/${attachmentId}`);
      return { incidentId, attachmentId };
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  },
);

export const downloadAttachment = createAsyncThunk(
  'incidents/downloadAttachment',
  async (
    { incidentId, attachmentId }: { incidentId: string; attachmentId: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get(`/incidents/${incidentId}/attachment/${attachmentId}`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return rejectWithValue(e.response.data);
      }
      return rejectWithValue('Network error');
    }
  },
);

const incidentsSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<IncidentsState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = initialState.filters;
    },
    setSelectedIncident(state, action: PayloadAction<Incident | null>) {
      state.selectedIncident = action.payload;
    },
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch incidents
      .addCase(fetchIncidents.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(
        fetchIncidents.fulfilled,
        (
          state,
          action: PayloadAction<{
            incident: Incident[];
            page: number;
            limit: number;
            totalPages: number;
            total: number;
          }>,
        ) => {
          state.loading = false;
          state.incidents = action.payload.incident;
          state.pagination = {
            page: action.payload.page,
            limit: action.payload.limit,
            total: action.payload.total,
            totalPages: action.payload.totalPages,
          };
        },
      )
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error =
            (action.payload as string) || action.error.message || 'Failed to fetch incidents';
        }
      })

      // Fetch incident by ID
      .addCase(fetchIncidentById.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchIncidentById.fulfilled, (state, action: PayloadAction<Incident>) => {
        state.loading = false;
        state.selectedIncident = action.payload;
      })
      .addCase(fetchIncidentById.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error =
            (action.payload as string) || action.error.message || 'Failed to fetch incident';
        }
      })

      // Create incident
      .addCase(createIncident.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(createIncident.fulfilled, (state, action: PayloadAction<Incident>) => {
        state.loading = false;
        state.incidents.unshift(action.payload);
      })
      .addCase(createIncident.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error =
            (action.payload as string) || action.error.message || 'Failed to create incident';
        }
      })

      // Update incident
      .addCase(updateIncident.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(updateIncident.fulfilled, (state, action: PayloadAction<Incident>) => {
        state.loading = false;
        const index = state.incidents.findIndex((incident) => incident._id === action.payload._id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        if (state.selectedIncident?._id === action.payload._id) {
          state.selectedIncident = action.payload;
        }
      })
      .addCase(updateIncident.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error =
            (action.payload as string) || action.error.message || 'Failed to update incident';
        }
      })

      // Update incident step
      .addCase(updateIncidentStep.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(updateIncidentStep.fulfilled, (state, action: PayloadAction<Incident>) => {
        state.loading = false;
        const index = state.incidents.findIndex((incident) => incident._id === action.payload._id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        if (state.selectedIncident?._id === action.payload._id) {
          state.selectedIncident = action.payload;
        }
      })
      .addCase(updateIncidentStep.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error =
            (action.payload as string) || action.error.message || 'Failed to update incident step';
        }
      })

      // Update incident status
      .addCase(updateIncidentStatus.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(updateIncidentStatus.fulfilled, (state, action: PayloadAction<Incident>) => {
        state.loading = false;
        const index = state.incidents.findIndex((incident) => incident._id === action.payload._id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        if (state.selectedIncident?._id === action.payload._id) {
          state.selectedIncident = action.payload;
        }
      })
      .addCase(updateIncidentStatus.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error =
            (action.payload as string) ||
            action.error.message ||
            'Failed to update incident status';
        }
      })

      // Delete incident
      .addCase(deleteIncident.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(deleteIncident.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.incidents = state.incidents.filter((incident) => incident._id !== action.payload);
        if (state.selectedIncident?._id === action.payload) {
          state.selectedIncident = null;
        }
      })
      .addCase(deleteIncident.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error =
            (action.payload as string) || action.error.message || 'Failed to delete incident';
        }
      })

      // Add attachment
      .addCase(addAttachment.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(addAttachment.fulfilled, (state, action: PayloadAction<Incident>) => {
        state.loading = false;
        const index = state.incidents.findIndex((incident) => incident._id === action.payload._id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        if (state.selectedIncident?._id === action.payload._id) {
          state.selectedIncident = action.payload;
        }
      })
      .addCase(addAttachment.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error =
            (action.payload as string) || action.error.message || 'Failed to add attachment';
        }
      })

      // Delete attachment
      .addCase(deleteAttachment.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(
        deleteAttachment.fulfilled,
        (state, action: PayloadAction<{ incidentId: string; attachmentId: string }>) => {
          state.loading = false;
          const { incidentId, attachmentId } = action.payload;

          // Update incidents list
          const incidentIndex = state.incidents.findIndex(
            (incident) => incident._id === incidentId,
          );
          if (incidentIndex !== -1 && state.incidents[incidentIndex].attachments) {
            state.incidents[incidentIndex].attachments = state.incidents[
              incidentIndex
            ].attachments?.filter((attachment: Attachment) => attachment._id !== attachmentId);
          }

          if (state.selectedIncident?._id === incidentId && state.selectedIncident.attachments) {
            state.selectedIncident.attachments = state.selectedIncident.attachments.filter(
              (attachment: Attachment) => attachment._id !== attachmentId,
            );
          }
        },
      )
      .addCase(deleteAttachment.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error =
            (action.payload as string) || action.error.message || 'Failed to delete attachment';
        }
      });
  },
});

export const selectIncidentsState = (state: { incidents: IncidentsState }) => state.incidents;
export const selectIncidents = createSelector(selectIncidentsState, (s) => s.incidents);
export const selectIncidentsLoading = createSelector(selectIncidentsState, (s) => s.loading);
export const selectIncidentsError = createSelector(selectIncidentsState, (s) => s.error);
export const selectIncidentsFilters = createSelector(selectIncidentsState, (s) => s.filters);
export const selectIncidentsPagination = createSelector(selectIncidentsState, (s) => s.pagination);
export const selectSelectedIncident = createSelector(
  selectIncidentsState,
  (s) => s.selectedIncident,
);

// Actions
export const { setFilters, clearFilters, setSelectedIncident, clearError } = incidentsSlice.actions;

// Reducer
export default incidentsSlice.reducer;
