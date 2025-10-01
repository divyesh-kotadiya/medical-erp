import { DocumentCategory } from '@/constants/documentTypes';
import { api } from '@/lib/api/client';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Document {
  _id: string;
  tenantId: string;
  createdBy: string;
  filename: string;
  url: string;
  fileType: string;
  size: number;
  metadata?: Record<string, any>;
  category: DocumentCategory;
  createdAt: string;
  updatedAt: string;
}

interface DocumentsState {
  items: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  loading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async ({ tenantId, page = 1, limit = 10, category }: { tenantId: string; page?: number; limit?: number; category?: string }) => {
    const params: any = { tenantId, page, limit };
    if (category) params.category = category;
    const { data } = await api.get('/documents', { params });
    return data;
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async (
    formData: FormData,
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(`/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to upload document');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/documents/${id}`);
      return { id, message: res.data.message };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete document');
    }
  }
);

export const downloadDocument = createAsyncThunk(
  'documents/download',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/documents/download/${id}`, {
        responseType: 'blob',
      });

      const blob = res.data;

      let filename = 'document';
      const contentDisposition = res.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }

      const contentType = res.headers['content-type'];
      if (contentType) {
        const mimeMap: Record<string, string> = {
          'image/png': 'png',
          'image/jpeg': 'jpg',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
          'application/msword': 'doc',
          'application/pdf': 'pdf',
        };
        const extension = mimeMap[contentType];
        if (extension && !filename.includes('.')) {
          filename = `${filename}.${extension}`;
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { id, success: true };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to download document');
    }
  }
);


const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDocuments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDocuments.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.items = action.payload.data;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(fetchDocuments.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(uploadDocument.pending, (state) => {
      state.loading = true;
      state.error = null
    })
    builder.addCase(uploadDocument.fulfilled, (state, action: PayloadAction<Document>) => {
      state.items.unshift(action.payload);
      state.loading = false;
      state.error = null
    });
    builder.addCase(uploadDocument.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || null;
    })

    builder.addCase(deleteDocument.fulfilled, (state, action: PayloadAction<{ id: string }>) => {
      state.items = state.items.filter((doc) => doc._id !== action.payload.id);
    });
  },
});

export default documentsSlice.reducer;
