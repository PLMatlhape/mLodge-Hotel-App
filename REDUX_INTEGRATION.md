# Redux Integration Guide - Connecting to Backend API

## Overview
This guide shows how to update your existing Redux slices to use the real backend API instead of mock data.

## Step 1: Update Auth Slice

### File: `src/store/authSlice.ts`

Replace the mock login/register logic with API calls:

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI, type User } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: { email: string; name: string; password: string; phone?: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(data);
      const { token, user } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getMe();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
    // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
    // Fetch current user
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

## Step 2: Update Rooms Slice

### File: `src/store/roomsSlice.ts`

Replace mock data with API calls:

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { accommodationsAPI, type Accommodation } from '../services/api';

interface RoomsState {
  accommodations: Accommodation[];
  selectedAccommodation: Accommodation | null;
  loading: boolean;
  error: string | null;
  filters: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    guests?: number;
    checkIn?: string;
    checkOut?: string;
    search?: string;
  };
}

const initialState: RoomsState = {
  accommodations: [],
  selectedAccommodation: null,
  loading: false,
  error: null,
  filters: {},
};

// Async thunks
export const fetchAccommodations = createAsyncThunk(
  'rooms/fetchAccommodations',
  async (filters?: RoomsState['filters'], { rejectWithValue }) => {
    try {
      const response = await accommodationsAPI.getAll(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch accommodations');
    }
  }
);

export const fetchAccommodationById = createAsyncThunk(
  'rooms/fetchAccommodationById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await accommodationsAPI.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch accommodation');
    }
  }
);

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all accommodations
      .addCase(fetchAccommodations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccommodations.fulfilled, (state, action) => {
        state.loading = false;
        state.accommodations = action.payload;
      })
      .addCase(fetchAccommodations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single accommodation
      .addCase(fetchAccommodationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccommodationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAccommodation = action.payload;
      })
      .addCase(fetchAccommodationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters } = roomsSlice.actions;
export default roomsSlice.reducer;
```

## Step 3: Update Bookings Slice

### File: `src/store/bookingsSlice.ts`

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingsAPI, type Booking, type CreateBookingData } from '../services/api';

interface BookingsState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.getMyBookings();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch bookings');
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (data: CreateBookingData, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.updateStatus(id, 'cancelled');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel booking');
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch bookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cancel booking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      });
  },
});

export default bookingsSlice.reducer;
```

## Step 4: Add Favourites Slice

### File: `src/store/favouritesSlice.ts` (NEW)

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favouritesAPI, type Accommodation } from '../services/api';

interface FavouritesState {
  favourites: Accommodation[];
  loading: boolean;
  error: string | null;
}

const initialState: FavouritesState = {
  favourites: [],
  loading: false,
  error: null,
};

export const fetchFavourites = createAsyncThunk(
  'favourites/fetchFavourites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await favouritesAPI.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch favourites');
    }
  }
);

export const toggleFavourite = createAsyncThunk(
  'favourites/toggleFavourite',
  async (accommodationId: number, { rejectWithValue }) => {
    try {
      const response = await favouritesAPI.toggle(accommodationId);
      return { accommodationId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to toggle favourite');
    }
  }
);

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      .addCase(toggleFavourite.fulfilled, (state, action) => {
        if (action.payload.action === 'removed') {
          state.favourites = state.favourites.filter(
            f => f.id !== action.payload.accommodationId
          );
        }
      });
  },
});

export default favouritesSlice.reducer;
```

## Step 5: Update Store Configuration

### File: `src/store/store.ts`

Add the favourites slice:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import roomsReducer from './roomsSlice';
import bookingsReducer from './bookingsSlice';
import favouritesReducer from './favouritesSlice'; // ADD THIS

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rooms: roomsReducer,
    bookings: bookingsReducer,
    favourites: favouritesReducer, // ADD THIS
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Step 6: Update Components

### Login Component Example

```typescript
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { AppDispatch } from '../store/store';

const LoginComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      // Redirect to dashboard or home
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // ... rest of component
};
```

### Home Component Example

```typescript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccommodations } from '../store/roomsSlice';
import { RootState, AppDispatch } from '../store/store';

const HomeComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accommodations, loading, error } = useSelector((state: RootState) => state.rooms);

  useEffect(() => {
    dispatch(fetchAccommodations());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {accommodations.map(accommodation => (
        <div key={accommodation.id}>
          {accommodation.name}
        </div>
      ))}
    </div>
  );
};
```

### Booking Component Example

```typescript
import { useDispatch } from 'react-redux';
import { createBooking } from '../store/bookingsSlice';
import { AppDispatch } from '../store/store';

const BookingComponent = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleCreateBooking = async (bookingData: CreateBookingData) => {
    try {
      const result = await dispatch(createBooking(bookingData)).unwrap();
      console.log('Booking created:', result);
      // Show success message and redirect
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  // ... rest of component
};
```

## Step 7: Handle Favourites in Components

```typescript
import { useDispatch } from 'react-redux';
import { toggleFavourite } from '../store/favouritesSlice';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const AccommodationCard = ({ accommodation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleToggleFavourite = async () => {
    try {
      await dispatch(toggleFavourite(accommodation.id)).unwrap();
    } catch (error) {
      console.error('Failed to toggle favourite:', error);
    }
  };

  return (
    <div>
      <h3>{accommodation.name}</h3>
      <button onClick={handleToggleFavourite}>
        {accommodation.is_favorite ? <FaHeart /> : <FaRegHeart />}
      </button>
    </div>
  );
};
```

## Testing the Integration

1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd src/backend
   npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

2. **Test login:**
   - Navigate to `/login`
   - Use admin credentials: Admin@mlodgehotel.co.za / Admin@mlodgehotel
   - Check browser console for API calls

3. **Test accommodations:**
   - Navigate to home page
   - Should see 3 sample accommodations from database
   - Check Network tab for API requests

4. **Test bookings:**
   - Login first
   - Try to create a booking
   - Check if it appears in My Bookings

## Common Issues & Solutions

### Issue: CORS Error
**Solution:** Make sure backend `.env` has `CORS_ORIGIN=http://localhost:5173`

### Issue: 401 Unauthorized
**Solution:** Check if token is being sent in Authorization header. Clear localStorage and login again.

### Issue: Network Error
**Solution:** Verify backend is running on port 5001 and `VITE_API_URL` is correct in frontend `.env`

### Issue: Token Expired
**Solution:** Login again. Token expires after 7 days (configurable in backend `.env`)

## Next Steps

1. ✅ Remove all mock data from Redux slices
2. ✅ Update all components to use API
3. ✅ Add error handling and loading states
4. ✅ Implement toast notifications for user feedback
5. ✅ Add image upload functionality
6. ✅ Test all user flows (register, login, book, review)
7. ✅ Test admin flows (manage accommodations, view analytics)
