import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { bookingsAPI } from '../../services/api';

interface Booking {
  id: string;
  roomId: number;
  roomName: string;
  roomImage: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
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
    return response.data;
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
  }) => {
    const response = await bookingsAPI.create(bookingData);
    return response.data;
  }
);

export const updateBookingStatusAsync = createAsyncThunk(
  'bookings/updateStatus',
  async ({ id, status }: { id: number; status: 'pending' | 'confirmed' | 'cancelled' }) => {
    const response = await bookingsAPI.updateStatus(id, status);
    return response.data;
  }
);

export const fetchAllBookings = createAsyncThunk(
  'bookings/fetchAllBookings',
  async () => {
    const response = await bookingsAPI.getAll();
    return response.data;
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
    updateBookingStatus: (state, action: PayloadAction<{ id: string; status: Booking['status'] }>) => {
      const booking = state.bookings.find(b => b.id === action.payload.id);
      if (booking) {
        booking.status = action.payload.status;
      }
    },
    cancelBooking: (state, action: PayloadAction<string>) => {
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
