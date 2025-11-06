import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Review {
  id: number;
  accommodation_id: number;
  user_id: number;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  accommodation_name?: string;
  user_name?: string;
  user_email?: string;
  created_at: string;
  updated_at: string;
}

interface ReviewsState {
  reviews: Review[];
  currentReview: Review | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
}

const initialState: ReviewsState = {
  reviews: [],
  currentReview: null,
  loading: false,
  error: null,
  totalCount: 0,
  totalPages: 0,
};

// API Base URL
const API_BASE_URL = 'http://localhost:5001/api';

// Helper to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

// Async Thunks

// Fetch all reviews (admin)
export const fetchAllReviews = createAsyncThunk(
  'reviews/fetchAll',
  async ({ page = 1, limit = 10, status }: { page?: number; limit?: number; status?: string } = {}) => {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/reviews?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    
    return response.json();
  }
);

// Fetch reviews for specific accommodation
export const fetchAccommodationReviews = createAsyncThunk(
  'reviews/fetchByAccommodation',
  async (accommodationId: number) => {
    const response = await fetch(`${API_BASE_URL}/reviews/accommodation/${accommodationId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch accommodation reviews');
    }
    
    return response.json();
  }
);

// Create a review
export const createReview = createAsyncThunk(
  'reviews/create',
  async (reviewData: {
    accommodation_id: number;
    rating: number;
    title: string;
    comment: string;
  }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create review');
    }
    
    return response.json();
  }
);

// Update review status (admin only)
export const updateReviewStatus = createAsyncThunk(
  'reviews/updateStatus',
  async ({ id, status }: { id: number; status: 'approved' | 'rejected' }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reviews/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update review status');
    }
    
    return response.json();
  }
);

// Update review
export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ id, reviewData }: {
    id: number;
    reviewData: {
      rating?: number;
      title?: string;
      comment?: string;
    };
  }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update review');
    }
    
    return response.json();
  }
);

// Delete review
export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id: number) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete review');
    }
    
    return id;
  }
);

// Slice
const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentReview: (state, action: PayloadAction<Review | null>) => {
      state.currentReview = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all reviews
    builder
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews || action.payload;
        state.totalCount = action.payload.pagination?.total || action.payload.length;
        state.totalPages = action.payload.pagination?.pages || 1;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reviews';
      });

    // Fetch accommodation reviews
    builder
      .addCase(fetchAccommodationReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccommodationReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchAccommodationReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch accommodation reviews';
      });

    // Create review
    builder
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create review';
      });

    // Update review status
    builder
      .addCase(updateReviewStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReviewStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reviews.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })
      .addCase(updateReviewStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update review status';
      });

    // Update review
    builder
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reviews.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update review';
      });

    // Delete review
    builder
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter(r => r.id !== action.payload);
        state.totalCount -= 1;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete review';
      });
  },
});

export const { clearError, setCurrentReview } = reviewsSlice.actions;
export default reviewsSlice.reducer;
