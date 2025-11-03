import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { accommodationsAPI, roomsAPI } from '../../services/api';

interface Room {
  id: number;
  accommodation_id?: number;
  name: string;
  location?: string;
  description?: string;
  capacity: number;
  beds: number;
  baths?: number;
  area?: number;
  type?: string;
  price_per_night: number;
  refundable: boolean;
  quantity?: number;
  status?: string;
  photos?: Array<{ url: string; sort_order?: number; is_primary?: boolean }>;
  accommodation_name?: string;
  accommodation_city?: string;
  amenities?: string[];
  roomFeatures?: string[];
  room_features?: string[];
  is_active?: boolean;
}

interface Accommodation {
  id: number;
  name: string;
  city: string;
  description?: string;
  star_rating?: number;
}

interface RoomsState {
  rooms: Room[];
  accommodations: Accommodation[];
  selectedRoom: Room | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoomsState = {
  rooms: [],
  accommodations: [],
  selectedRoom: null,
  loading: false,
  error: null,
};

// Fetch all rooms (for inventory management)
export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async () => {
    const response = await roomsAPI.getAll();
    return response.data;
  }
);

// Fetch list of accommodations for dropdown
export const fetchAccommodationsList = createAsyncThunk(
  'rooms/fetchAccommodationsList',
  async () => {
    const response = await accommodationsAPI.getAll({});
    return response.data;
  }
);

// Fetch accommodations with rooms for client display (backwards compatibility)
export const fetchAccommodations = createAsyncThunk(
  'rooms/fetchAccommodations',
  async (params?: { city?: string; search?: string }) => {
    const response = await accommodationsAPI.getAll(params || {});
    return response;
  }
);

// Async thunk to create a new room
export const createRoom = createAsyncThunk(
  'rooms/createRoom',
  async (roomData: Partial<Room>) => {
    const response = await roomsAPI.create(roomData);
    return response.data;
  }
);

// Async thunk to update a room
export const updateRoomAsync = createAsyncThunk(
  'rooms/updateRoom',
  async ({ id, data }: { id: number; data: Partial<Room> }) => {
    const response = await roomsAPI.update(id, data);
    return response.data;
  }
);

// Async thunk to delete a room
export const deleteRoomAsync = createAsyncThunk(
  'rooms/deleteRoom',
  async (id: number) => {
    await roomsAPI.delete(id);
    return id;
  }
);

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
    },
    selectRoom: (state, action: PayloadAction<Room | null>) => {
      state.selectedRoom = action.payload;
    },
    addRoom: (state, action: PayloadAction<Room>) => {
      state.rooms.push(action.payload);
    },
    updateRoom: (state, action: PayloadAction<Room>) => {
      const index = state.rooms.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.rooms[index] = action.payload;
      }
    },
    deleteRoom: (state, action: PayloadAction<number>) => {
      state.rooms = state.rooms.filter(r => r.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all rooms
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch rooms';
      })
      // Fetch accommodations list
      .addCase(fetchAccommodationsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccommodationsList.fulfilled, (state, action) => {
        state.loading = false;
        state.accommodations = action.payload;
      })
      .addCase(fetchAccommodationsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch accommodations';
      })
      // Fetch accommodations (client-side with rooms)
      .addCase(fetchAccommodations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccommodations.fulfilled, (state, action) => {
        state.loading = false;
        // For client display, store accommodations data
        if (action.payload.data) {
          state.accommodations = action.payload.data;
        }
      })
      .addCase(fetchAccommodations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch accommodations';
      })
      // Create room
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new room to the state (transform if needed)
        if (action.payload) {
          state.rooms.push(action.payload as Room);
        }
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create room';
      })
      // Update room
      .addCase(updateRoomAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoomAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.rooms.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.rooms[index] = action.payload as Room;
        }
      })
      .addCase(updateRoomAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update room';
      })
      // Delete room
      .addCase(deleteRoomAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoomAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = state.rooms.filter(r => r.id !== action.payload);
      })
      .addCase(deleteRoomAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete room';
      });
  },
});

export const { setRooms, selectRoom, addRoom, updateRoom, deleteRoom, setLoading, setError } = roomsSlice.actions;
export default roomsSlice.reducer;
