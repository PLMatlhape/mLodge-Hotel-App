import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

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
}

const initialState: RoomsState = {
  rooms: [],
  selectedRoom: null,
  favorites: [],
};

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
  },
});

export const { setRooms, selectRoom, toggleFavorite, addRoom, updateRoom, deleteRoom } = roomsSlice.actions;
export default roomsSlice.reducer;
