import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Inquiry {
  id: number;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  subject: string;
  message: string;
  category: 'booking' | 'accommodation' | 'billing' | 'general' | 'complaint' | 'feedback';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: number;
  assigned_staff_name?: string;
  response?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

interface InquiriesState {
  inquiries: Inquiry[];
  currentInquiry: Inquiry | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
}

const initialState: InquiriesState = {
  inquiries: [],
  currentInquiry: null,
  loading: false,
  error: null,
  totalCount: 0,
  totalPages: 0,
};

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const getAuthToken = () => localStorage.getItem('token');

// Async Thunks
export const fetchAllInquiries = createAsyncThunk(
  'inquiries/fetchAll',
  async ({ page = 1, limit = 10, status, priority }: {
    page?: number; limit?: number; status?: string; priority?: string;
  } = {}) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/inquiries?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch inquiries');
    return response.json();
  }
);

export const createInquiry = createAsyncThunk(
  'inquiries/create',
  async (inquiryData: {
    guest_name: string;
    guest_email: string;
    guest_phone?: string;
    subject: string;
    message: string;
    category: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData),
    });
    if (!response.ok) throw new Error('Failed to create inquiry');
    return response.json();
  }
);

export const updateInquiryStatus = createAsyncThunk(
  'inquiries/updateStatus',
  async ({ id, status }: { id: number; status: string }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/inquiries/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update inquiry status');
    return response.json();
  }
);

export const respondToInquiry = createAsyncThunk(
  'inquiries/respond',
  async ({ id, response }: { id: number; response: string }) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/inquiries/${id}/respond`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ response }),
    });
    if (!res.ok) throw new Error('Failed to respond to inquiry');
    return res.json();
  }
);

export const assignInquiry = createAsyncThunk(
  'inquiries/assign',
  async ({ id, staffId }: { id: number; staffId: number }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/inquiries/${id}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ staffId }),
    });
    if (!response.ok) throw new Error('Failed to assign inquiry');
    return response.json();
  }
);

// Slice
const inquiriesSlice = createSlice({
  name: 'inquiries',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setCurrentInquiry: (state, action: PayloadAction<Inquiry | null>) => {
      state.currentInquiry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllInquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllInquiries.fulfilled, (state, action) => {
        state.loading = false;
        state.inquiries = action.payload.inquiries || action.payload;
        state.totalCount = action.payload.pagination?.total || action.payload.length;
        state.totalPages = action.payload.pagination?.pages || 1;
      })
      .addCase(fetchAllInquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch inquiries';
      })
      .addCase(createInquiry.fulfilled, (state, action) => {
        state.inquiries.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(updateInquiryStatus.fulfilled, (state, action) => {
        const index = state.inquiries.findIndex(i => i.id === action.payload.id);
        if (index !== -1) state.inquiries[index] = action.payload;
      })
      .addCase(respondToInquiry.fulfilled, (state, action) => {
        const index = state.inquiries.findIndex(i => i.id === action.payload.id);
        if (index !== -1) state.inquiries[index] = action.payload;
      })
      .addCase(assignInquiry.fulfilled, (state, action) => {
        const index = state.inquiries.findIndex(i => i.id === action.payload.id);
        if (index !== -1) state.inquiries[index] = action.payload;
      });
  },
});

export const { clearError, setCurrentInquiry } = inquiriesSlice.actions;
export default inquiriesSlice.reducer;
