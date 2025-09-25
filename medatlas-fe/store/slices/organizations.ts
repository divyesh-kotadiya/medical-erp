import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
import { UserRole } from '@/constants/UserRole/role';

export interface Organization {
  id: string;
  name: string;
  description?: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'laboratory' | 'other';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact?: {
    phone: string;
    email: string;
    website?: string;
  };
  settings?: {
    timezone: string;
    currency: string;
    dateFormat: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  role?: UserRole;
  accessToken: string;
}

interface TenantMember {
  _id: string;
  tenantId: string;
  disabled: boolean;
  User: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  loading: boolean;
  creating: boolean;
  switching: boolean;
  loaded: boolean;
  error?: string;
  memberList: TenantMember[]
}

const initialState: OrganizationState = {
  organizations: [],
  currentOrganization: null,
  loading: false,
  creating: false,
  switching: false,
  loaded: false,
  error: undefined,
  memberList: [],
};

interface FetchTenantMembersResponse {
  members: TenantMember[];
}

export const fetchOrganizations = createAsyncThunk<
  { organizations: Organization[] },
  void,
  { rejectValue: string }
>('organizations/fetchOrganizations', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/tenants/my');

    const organizations: Organization[] = data.map((item: any) => ({
      id: item.tenant._id,
      name: item.tenant.name,
      description: item.tenant.description,
      type: item.tenant.type,
      address: item.tenant.address,
      contact: item.tenant.contact,
      settings: item.tenant.settings,
      isActive: true,
      createdAt: item.tenant.createdAt,
      updatedAt: item.tenant.updatedAt,
      role: item.role?.role,
      isTenantAdmin: item.isTenantAdmin,
      accessToken: item.accessToken,
      memberCount: item.memberCount || 0,
    }));

    return { organizations };
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || 'Network error');
  }
});


export const createOrganization = createAsyncThunk<
  Organization,
  Partial<Organization>,
  { rejectValue: string }
>('organizations/createOrganization', async (orgData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/tenants/create', orgData);
    const org: Organization = {
      id: data._id,
      name: data.name,
      description: data.description,
      type: data.type,
      address: data.address,
      contact: data.contact,
      settings: data.settings,
      isActive: true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      memberCount: 0,
    };
    return org;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to create organization');
  }
});

export const fetchTenantMembers = createAsyncThunk<
  FetchTenantMembersResponse,
  string,
  { rejectValue: string }
>(
  'tenants/fetchMembers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/tenants/users');
      return {
        members: response.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch members');
    }
  }
);

const organizationsSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    setCurrentOrganizationById: (state, action: PayloadAction<string>) => {
      const org = state.organizations.find((o) => o.id === action.payload) || null;
      state.currentOrganization = org;
      localStorage.setItem('token', org?.accessToken);
    },
    clearOrganizations: (state) => {
      state.organizations = [];
      state.currentOrganization = null;
      state.loaded = false;
      state.error = undefined;
      state.memberList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = undefined;
        state.loaded = false;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.organizations = action.payload.organizations;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = action.payload || action.error.message || 'Failed to fetch organizations';
      })

      .addCase(createOrganization.pending, (state) => {
        state.creating = true;
        state.error = undefined;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.creating = false;
        state.organizations.push(action.payload);
        state.currentOrganization = action.payload;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || action.error.message || 'Failed to create organization';
      })

      .addCase(fetchTenantMembers.pending, (state) => {
        state.loading = true;
        state.error = undefined;
        state.loaded = false;
      })
      .addCase(fetchTenantMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;

        if (JSON.stringify(state.memberList) !== JSON.stringify(action.payload.members)) {
          state.memberList = action.payload.members;
        }
      })
      .addCase(fetchTenantMembers.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true
        state.error = action.payload || action.error.message || 'Failed to fetch tenant members';
      });
  },
});

export const { setCurrentOrganizationById, clearOrganizations } = organizationsSlice.actions;
export default organizationsSlice.reducer;
