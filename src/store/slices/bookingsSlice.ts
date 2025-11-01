import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

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
}

const initialState: BookingsState = {
  bookings: [],
  currentBooking: null,
};

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
});

export const { addBooking, setCurrentBooking, updateBookingStatus, cancelBooking, clearBookings } = bookingsSlice.actions;
export default bookingsSlice.reducer;
