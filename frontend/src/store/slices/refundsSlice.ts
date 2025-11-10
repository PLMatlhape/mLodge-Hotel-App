import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Refund {
  id: number;
  booking_id: number;
  payment_id?: number;
  booking_reference: string;
  guest_name: string;
  guest_email: string;
  accommodation_name: string;
  booking_amount: number;
  refund_amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_date: string;
  processed_date?: string;
  admin_notes?: string;
  transaction_id?: string;
  processed_by?: number;
  created_at: string;
  updated_at: string;
}

interface RefundsState {
  refunds: Refund[];
  currentRefund: Refund | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
}

const initialState: RefundsState = {
  refunds: [],
  currentRefund: null,
  loading: false,
  error: null,
  totalCount: 0,
  totalPages: 0,
};

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('token');

// Async Thunks

// Fetch all refunds (admin)
export const fetchAllRefunds = createAsyncThunk(
  'refunds/fetchAll',
  async ({ page = 1, limit = 10, status }: { page?: number; limit?: number; status?: string } = {}) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/admin/refunds?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch refunds');
    return response.json();
  }
);

// Create refund request
export const createRefund = createAsyncThunk(
  'refunds/create',
  async (refundData: {
    booking_id: number;
    amount: number;
    reason: string;
    refund_method?: string;
  }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(refundData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create refund request');
    }
    return response.json();
  }
);

// Approve refund (admin)
export const approveRefund = createAsyncThunk(
  'refunds/approve',
  async ({ id, adminNotes }: { id: number; adminNotes?: string }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/refunds/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ admin_notes: adminNotes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve refund');
    }
    return response.json();
  }
);

// Reject refund (admin)
export const rejectRefund = createAsyncThunk(
  'refunds/reject',
  async ({ id, rejectionReason }: { id: number; rejectionReason: string }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/refunds/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ admin_notes: rejectionReason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject refund');
    }
    return response.json();
  }
);

// Process refund (admin)
export const processRefund = createAsyncThunk(
  'refunds/process',
  async ({ id, transactionId }: { id: number; transactionId?: string }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/refunds/${id}/process`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ transaction_id: transactionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process refund');
    }
    return response.json();
  }
);

// Slice
const refundsSlice = createSlice({
  name: 'refunds',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRefund: (state, action: PayloadAction<Refund | null>) => {
      state.currentRefund = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all refunds
    builder
      .addCase(fetchAllRefunds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRefunds.fulfilled, (state, action) => {
        state.loading = false;
        state.refunds = action.payload.refunds || action.payload;
        state.totalCount = action.payload.pagination?.total || action.payload.length;
        state.totalPages = action.payload.pagination?.pages || 1;
      })
      .addCase(fetchAllRefunds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch refunds';
      });

    // Create refund
    builder
      .addCase(createRefund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRefund.fulfilled, (state, action) => {
        state.loading = false;
        state.refunds.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create refund request';
      });

    // Approve refund
    builder
      .addCase(approveRefund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveRefund.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.refunds.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.refunds[index] = action.payload;
        }
      })
      .addCase(approveRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to approve refund';
      });

    // Reject refund
    builder
      .addCase(rejectRefund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectRefund.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.refunds.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.refunds[index] = action.payload;
        }
      })
      .addCase(rejectRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reject refund';
      });

    // Process refund
    builder
      .addCase(processRefund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.refunds.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.refunds[index] = action.payload;
        }
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to process refund';
      });
  },
});

export const { clearError, setCurrentRefund } = refundsSlice.actions;
export default refundsSlice.reducer;
