import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Types
export interface PromoCode {
  id: number;
  code: string;
  type: 'Percentage' | 'Fixed Amount';
  discount_value: number;
  max_discount_amount?: number;
  min_booking_amount?: number;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  times_used: number;
  is_active: boolean;
  applicable_to?: 'all' | 'specific_accommodations' | 'specific_rooms';
  accommodation_ids?: number[];
  room_ids?: number[];
  description?: string;
  created_at: string;
  updated_at: string;
}

interface PromoCodesState {
  promoCodes: PromoCode[];
  currentPromoCode: PromoCode | null;
  validatedPromoCode: PromoCode | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
}

const initialState: PromoCodesState = {
  promoCodes: [],
  currentPromoCode: null,
  validatedPromoCode: null,
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

// Fetch all promo codes (admin)
export const fetchAllPromoCodes = createAsyncThunk(
  'promoCodes/fetchAll',
  async ({ page = 1, limit = 10, isActive }: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  } = {}) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/promo-codes?page=${page}&limit=${limit}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch promo codes');
    }
    
    return response.json();
  }
);

// Validate promo code
export const validatePromoCode = createAsyncThunk(
  'promoCodes/validate',
  async ({ code, bookingAmount, accommodationId, roomId }: {
    code: string;
    bookingAmount: number;
    accommodationId?: number;
    roomId?: number;
  }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/promo-codes/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ code, bookingAmount, accommodationId, roomId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid promo code');
    }
    
    return response.json();
  }
);

// Create promo code
export const createPromoCode = createAsyncThunk(
  'promoCodes/create',
  async (promoData: {
    code: string;
    type: 'Percentage' | 'Fixed Amount';
    discount_value: number;
    max_discount_amount?: number;
    min_booking_amount?: number;
    valid_from: string;
    valid_until: string;
    usage_limit?: number;
    applicable_to?: string;
    accommodation_ids?: number[];
    room_ids?: number[];
    description?: string;
  }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/promo-codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(promoData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create promo code');
    }
    
    return response.json();
  }
);

// Update promo code
export const updatePromoCode = createAsyncThunk(
  'promoCodes/update',
  async ({ id, promoData }: {
    id: number;
    promoData: Partial<PromoCode>;
  }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/promo-codes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(promoData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update promo code');
    }
    
    return response.json();
  }
);

// Toggle promo code status
export const togglePromoCodeStatus = createAsyncThunk(
  'promoCodes/toggleStatus',
  async (id: number) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/promo-codes/${id}/toggle`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle promo code status');
    }
    
    return response.json();
  }
);

// Delete promo code
export const deletePromoCode = createAsyncThunk(
  'promoCodes/delete',
  async (id: number) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/promo-codes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete promo code');
    }
    
    return id;
  }
);

// Slice
const promoCodesSlice = createSlice({
  name: 'promoCodes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPromoCode: (state, action: PayloadAction<PromoCode | null>) => {
      state.currentPromoCode = action.payload;
    },
    clearValidatedPromoCode: (state) => {
      state.validatedPromoCode = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all promo codes
    builder
      .addCase(fetchAllPromoCodes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPromoCodes.fulfilled, (state, action) => {
        state.loading = false;
        state.promoCodes = action.payload.promoCodes || action.payload;
        state.totalCount = action.payload.pagination?.total || action.payload.length;
        state.totalPages = action.payload.pagination?.pages || 1;
      })
      .addCase(fetchAllPromoCodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch promo codes';
      });

    // Validate promo code
    builder
      .addCase(validatePromoCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validatePromoCode.fulfilled, (state, action) => {
        state.loading = false;
        state.validatedPromoCode = action.payload;
      })
      .addCase(validatePromoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Invalid promo code';
        state.validatedPromoCode = null;
      });

    // Create promo code
    builder
      .addCase(createPromoCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPromoCode.fulfilled, (state, action) => {
        state.loading = false;
        state.promoCodes.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createPromoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create promo code';
      });

    // Update promo code
    builder
      .addCase(updatePromoCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePromoCode.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.promoCodes.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.promoCodes[index] = action.payload;
        }
      })
      .addCase(updatePromoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update promo code';
      });

    // Toggle promo code status
    builder
      .addCase(togglePromoCodeStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePromoCodeStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.promoCodes.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.promoCodes[index] = action.payload;
        }
      })
      .addCase(togglePromoCodeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to toggle promo code status';
      });

    // Delete promo code
    builder
      .addCase(deletePromoCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePromoCode.fulfilled, (state, action) => {
        state.loading = false;
        state.promoCodes = state.promoCodes.filter(p => p.id !== action.payload);
        state.totalCount -= 1;
      })
      .addCase(deletePromoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete promo code';
      });
  },
});

export const { clearError, setCurrentPromoCode, clearValidatedPromoCode } = promoCodesSlice.actions;
export default promoCodesSlice.reducer;
