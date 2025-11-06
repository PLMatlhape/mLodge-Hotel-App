import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { accommodationsAPI, roomsAPI } from '../../services/api';

interface Room {
  id: number;
  name: string;
  location: string;
  beds: number;
  baths: number;
  area: number;
  guests: string;
  price: number;
  rating: number;
  image: string;
  images?: string[];
  badge: string;
  favorite: boolean;
  available?: boolean;
  type?: string;
  amenities?: string[];
}

interface RoomsState {
  rooms: Room[];
  selectedRoom: Room | null;
  favorites: number[];
  loading: boolean;
  error: string | null;
}

const initialState: RoomsState = {
  rooms: [],
  selectedRoom: null,
  favorites: [],
  loading: false,
  error: null,
};

// Async thunk to fetch accommodations from backend
export const fetchAccommodations = createAsyncThunk(
  'rooms/fetchAccommodations',
  async (params?: { city?: string; search?: string; page?: number; limit?: number }) => {
    const response = await accommodationsAPI.getAll(params);
    return response.data;
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
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const roomId = action.payload;
      const index = state.favorites.indexOf(roomId);
      
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(roomId);
      }
      
      // Update room favorite status
      const room = state.rooms.find(r => r.id === roomId);
      if (room) {
        room.favorite = !room.favorite;
      }
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
      .addCase(fetchAccommodations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccommodations.fulfilled, (state, action) => {
        state.loading = false;
        // Transform backend data to match frontend Room interface
        if (action.payload.data) {
          state.rooms = action.payload.data.map((acc: any) => ({
            id: acc.id,
            name: acc.name,
            location: acc.city,
            beds: 1, // Default value
            baths: 1, // Default value
            area: 50, // Default value
            guests: "upto 2 guests", // Default value
            price: 2000, // Default value
            rating: parseFloat(acc.avg_rating) || 0,
            image: acc.photos?.[0] || '',
            images: acc.photos || [],
            badge: acc.star_rating >= 5 ? 'Premium' : acc.star_rating >= 4 ? 'Delux' : 'Standard',
            favorite: acc.is_favorite || false,
            available: acc.is_active,
          }));
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

export const { setRooms, selectRoom, toggleFavorite, addRoom, updateRoom, deleteRoom, setLoading, setError } = roomsSlice.actions;
export default roomsSlice.reducer;
