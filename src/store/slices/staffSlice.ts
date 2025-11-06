import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Types
export interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'Manager' | 'Receptionist' | 'Housekeeping' | 'Maintenance' | 'Security' | 'Other';
  department?: string;
  hire_date: string;
  status: 'active' | 'inactive' | 'on_leave';
  salary?: number;
  emergency_contact?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

interface StaffState {
  staff: StaffMember[];
  currentStaff: StaffMember | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
}

const initialState: StaffState = {
  staff: [],
  currentStaff: null,
  loading: false,
  error: null,
  totalCount: 0,
  totalPages: 0,
};

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

// Async Thunks

// Fetch all staff members
export const fetchAllStaff = createAsyncThunk(
  'staff/fetchAll',
  async ({ page = 1, limit = 10, role, status }: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
  } = {}) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/staff?page=${page}&limit=${limit}`;
    if (role) url += `&role=${role}`;
    if (status) url += `&status=${status}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch staff');
    }
    
    return response.json();
  }
);

// Fetch single staff member
export const fetchStaffById = createAsyncThunk(
  'staff/fetchById',
  async (id: number) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch staff member');
    }
    
    return response.json();
  }
);

// Create staff member
export const createStaff = createAsyncThunk(
  'staff/create',
  async (staffData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    department?: string;
    hire_date: string;
    salary?: number;
    emergency_contact?: string;
    address?: string;
  }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(staffData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create staff member');
    }
    
    return response.json();
  }
);

// Update staff member
export const updateStaff = createAsyncThunk(
  'staff/update',
  async ({ id, staffData }: {
    id: number;
    staffData: Partial<StaffMember>;
  }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(staffData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update staff member');
    }
    
    return response.json();
  }
);

// Update staff status
export const updateStaffStatus = createAsyncThunk(
  'staff/updateStatus',
  async ({ id, status }: { id: number; status: 'active' | 'inactive' | 'on_leave' }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/staff/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update staff status');
    }
    
    return response.json();
  }
);

// Delete staff member
export const deleteStaff = createAsyncThunk(
  'staff/delete',
  async (id: number) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete staff member');
    }
    
    return id;
  }
);

// Slice
const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentStaff: (state, action: PayloadAction<StaffMember | null>) => {
      state.currentStaff = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all staff
    builder
      .addCase(fetchAllStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload.staff || action.payload;
        state.totalCount = action.payload.pagination?.total || action.payload.length;
        state.totalPages = action.payload.pagination?.pages || 1;
      })
      .addCase(fetchAllStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch staff';
      });

    // Fetch staff by ID
    builder
      .addCase(fetchStaffById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStaff = action.payload;
      })
      .addCase(fetchStaffById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch staff member';
      });

    // Create staff
    builder
      .addCase(createStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create staff member';
      });

    // Update staff
    builder
      .addCase(updateStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.staff.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.staff[index] = action.payload;
        }
        if (state.currentStaff?.id === action.payload.id) {
          state.currentStaff = action.payload;
        }
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update staff member';
      });

    // Update staff status
    builder
      .addCase(updateStaffStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStaffStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.staff.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.staff[index] = action.payload;
        }
      })
      .addCase(updateStaffStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update staff status';
      });

    // Delete staff
    builder
      .addCase(deleteStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = state.staff.filter(s => s.id !== action.payload);
        state.totalCount -= 1;
      })
      .addCase(deleteStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete staff member';
      });
  },
});

export const { clearError, setCurrentStaff } = staffSlice.actions;
export default staffSlice.reducer;
