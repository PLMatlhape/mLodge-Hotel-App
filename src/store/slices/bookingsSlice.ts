import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { bookingsAPI } from '../../services/api';

interface Booking {
  id: number;
  user_id: number;
  accommodation_id: number;
  check_in_date: string;
  check_out_date: string;
  num_adults: number;
  num_children: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_requests?: string;
  accommodation_name?: string;
  accommodation_city?: string;
  rooms?: { room_id: number; room_name: string; quantity: number; price_per_night: number }[];
  created_at: string;
}

interface BookingsState {
  bookings: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMyBookings',
  async () => {
    const response = await bookingsAPI.getMyBookings();
    // Backend returns { bookings: [...], pagination: {...} }
    return response.data.bookings || [];
  }
);

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData: {
    accommodation_id: number;
    check_in_date: string;
    check_out_date: string;
    rooms: { room_id: number; quantity: number }[];
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    num_adults: number;
    num_children?: number;
    special_requests?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.create(bookingData);
      return response.data;
    } catch (error: any) {
      console.error('Booking creation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Return the actual error from the backend
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const updateBookingStatusAsync = createAsyncThunk(
  'bookings/updateStatus',
  async ({ id, status }: { id: number; status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' }) => {
    const response = await bookingsAPI.updateStatus(id, status);
    return response.data;
  }
);

export const fetchAllBookings = createAsyncThunk(
  'bookings/fetchAllBookings',
  async () => {
    const response = await bookingsAPI.getAll();
    console.log('fetchAllBookings API response:', response.data);
    // Backend returns { bookings: [...], pagination: {...} }
    const data: any = response.data;
    return data.bookings || data;
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.push(action.payload);
      state.currentBooking = action.payload;
    },
    setCurrentBooking: (state, action: PayloadAction<Booking | null>) => {
      state.currentBooking = action.payload;
    },
    updateBookingStatus: (state, action: PayloadAction<{ id: number; status: Booking['status'] }>) => {
      const booking = state.bookings.find(b => b.id === action.payload.id);
      if (booking) {
        booking.status = action.payload.status;
      }
    },
    cancelBooking: (state, action: PayloadAction<number>) => {
      const booking = state.bookings.find(b => b.id === action.payload);
      if (booking) {
        booking.status = 'cancelled';
      }
    },
    clearBookings: (state) => {
      state.bookings = [];
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch my bookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload as unknown as Booking[];
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bookings';
      })
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        const newBooking = action.payload as unknown as Booking;
        state.bookings.push(newBooking);
        state.currentBooking = newBooking;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create booking';
      })
      // Update booking status
      .addCase(updateBookingStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingStatusAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBooking = action.payload as unknown as Booking;
        const index = state.bookings.findIndex(b => b.id === updatedBooking.id);
        if (index !== -1) {
          state.bookings[index] = updatedBooking;
        }
      })
      .addCase(updateBookingStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update booking status';
      })
      // Fetch all bookings (admin)
      .addCase(fetchAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload as unknown as Booking[];
      })
      .addCase(fetchAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch all bookings';
      });
  },
});

export const { addBooking, setCurrentBooking, updateBookingStatus, cancelBooking, clearBookings } = bookingsSlice.actions;
export default bookingsSlice.reducer;
