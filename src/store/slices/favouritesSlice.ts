import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface Favourite {
  favourite_id: number;
  favourited_at: string;
  id: number;
  name: string;
  description?: string;
  location: string;
  price_per_night: number;
  type: string;
  capacity: number;
  beds: number;
  baths: number;
  area: number;
  accommodation_name?: string;
  city?: string;
  photos: Array<{ url: string; sort_order?: number; is_primary?: boolean }>;
  avg_rating: number;
  review_count: number;
}

interface FavouritesState {
  favourites: Favourite[];
  loading: boolean;
  toggleLoading: boolean; // Specific loading state for toggle operations
  error: string | null;
}

const initialState: FavouritesState = {
  favourites: [],
  loading: false,
  toggleLoading: false,
  error: null,
};

// Async thunks
export const fetchFavourites = createAsyncThunk(
  'favourites/fetchFavourites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/favourites');
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(axiosError.response?.data?.error || 'Failed to fetch favourites');
    }
  }
);

export const toggleFavourite = createAsyncThunk(
  'favourites/toggleFavourite',
  async (roomId: number, { rejectWithValue }) => {
    try {
      const response = await api.post('/favourites/toggle', { room_id: roomId });
      return { roomId, ...response.data };
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(axiosError.response?.data?.error || 'Failed to toggle favourite');
    }
  }
);

export const removeFavourite = createAsyncThunk(
  'favourites/removeFavourite',
  async (roomId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/favourites/${roomId}`);
      return roomId;
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(axiosError.response?.data?.error || 'Failed to remove favourite');
    }
  }
);

export const checkFavourite = createAsyncThunk(
  'favourites/checkFavourite',
  async (accommodationId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/favourites/check/${accommodationId}`);
      return { accommodationId, isFavourite: response.data.is_favourite };
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(axiosError.response?.data?.error || 'Failed to check favourite status');
    }
  }
);

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch favourites
      .addCase(fetchFavourites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavourites.fulfilled, (state, action) => {
        state.loading = false;
        state.favourites = action.payload;
      })
      .addCase(fetchFavourites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle favourite
      .addCase(toggleFavourite.pending, (state) => {
        state.toggleLoading = true;
        state.error = null;
      })
      .addCase(toggleFavourite.fulfilled, (state, action) => {
        state.toggleLoading = false;
        // Update local state based on toggle result
        const { roomId, action: toggleAction } = action.payload;
        if (toggleAction === 'added') {
          // If added, we might need to refetch or update from server
          // For now, we'll refetch favourites
        } else if (toggleAction === 'removed') {
          state.favourites = state.favourites.filter(fav => fav.id !== roomId);
        }
      })
      .addCase(toggleFavourite.rejected, (state, action) => {
        state.toggleLoading = false;
        state.error = action.payload as string;
      })
      // Remove favourite
      .addCase(removeFavourite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFavourite.fulfilled, (state, action) => {
        state.loading = false;
        state.favourites = state.favourites.filter(fav => fav.id !== action.payload);
      })
      .addCase(removeFavourite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = favouritesSlice.actions;
export default favouritesSlice.reducer;
