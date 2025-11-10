import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Types
export interface PerformanceStat {
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
}

export interface PerformanceStats {
  totalBookings: PerformanceStat;
  revenue: PerformanceStat;
  avgOccupancy: PerformanceStat;
  avgStayDuration: PerformanceStat;
}

export interface RoomTypeData {
  name: string;
  value: number;
  color: string;
}

export interface BookingSourceData {
  source: string;
  bookings: number;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalGuests: number;
  occupancyRate: number;
  averageRating: number;
  activeRooms: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

export interface BookingTrend {
  date: string;
  bookings: number;
  revenue: number;
}

export interface RevenueTrend {
  month: string;
  revenue: number;
  bookings: number;
}

export interface RoomTypeStats {
  room_type: string;
  bookings: number;
  revenue: number;
  percentage: number;
}

export interface RecentBooking {
  id: number;
  reference: string;
  guest_name: string;
  room_name: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: string;
  created_at: string;
}

interface AnalyticsState {
  dashboardStats: DashboardStats | null;
  performanceStats: PerformanceStats | null;
  roomTypeData: RoomTypeData[];
  bookingSourceData: BookingSourceData[];
  bookingTrends: BookingTrend[];
  revenueTrends: RevenueTrend[];
  roomTypeStats: RoomTypeStats[];
  recentBookings: RecentBooking[];
  loading: boolean;
  error: string | null;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const initialState: AnalyticsState = {
  dashboardStats: null,
  performanceStats: null,
  roomTypeData: [],
  bookingSourceData: [],
  bookingTrends: [],
  revenueTrends: [],
  roomTypeStats: [],
  recentBookings: [],
  loading: false,
  error: null,
  dateRange: {
    startDate: '',
    endDate: '',
  },
};

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

// Async Thunks

// Fetch dashboard statistics
export const fetchDashboardStats = createAsyncThunk(
  'analytics/fetchDashboardStats',
  async (dateRange: { startDate?: string; endDate?: string } | undefined, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      let url = `${API_BASE_URL}/analytics/dashboard`;
      if (dateRange?.startDate || dateRange?.endDate) {
        const params = new URLSearchParams();
        if (dateRange.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange.endDate) params.append('endDate', dateRange.endDate);
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        // If empty database, return zeros
        if (response.status === 500 || response.status === 404) {
          return {
            totalBookings: 0,
            totalRevenue: 0,
            totalAccommodations: 0,
            totalUsers: 0,
            pendingBookings: 0,
            todayCheckIns: 0,
            activeReviews: 0,
            averageRating: 0
          };
        }
        return rejectWithValue('Failed to fetch dashboard statistics');
      }
      
      return response.json();
    } catch {
      // Return zeros for any error (empty database)
      return {
        totalBookings: 0,
        totalRevenue: 0,
        totalAccommodations: 0,
        totalUsers: 0,
        pendingBookings: 0,
        todayCheckIns: 0,
        activeReviews: 0,
        averageRating: 0
      };
    }
  }
);

// Fetch booking trends
export const fetchBookingTrends = createAsyncThunk(
  'analytics/fetchBookingTrends',
  async ({ period = 'week' }: { period?: 'week' | 'month' | 'year' } = {}) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/analytics/booking-trends?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        return []; // Return empty array for error
      }
      
      return response.json();
    } catch {
      return []; // Return empty array for empty database
    }
  }
);

// Fetch revenue trends
export const fetchRevenueTrends = createAsyncThunk(
  'analytics/fetchRevenueTrends',
  async ({ period = 'month' }: { period?: 'week' | 'month' | 'year' } = {}) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/analytics/revenue-trends?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        return []; // Return empty array for error
      }
      
      return response.json();
    } catch {
      return []; // Return empty array for empty database
    }
  }
);

// Fetch performance statistics
export const fetchPerformanceStats = createAsyncThunk(
  'analytics/fetchPerformanceStats',
  async ({ period = 'year' }: { period?: 'week' | 'month' | 'quarter' | 'year' } = {}) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/analytics/performance-stats?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        return {
          totalBookings: { value: 0, change: 0, changeType: 'increase' as const },
          revenue: { value: 0, change: 0, changeType: 'increase' as const },
          avgOccupancy: { value: 0, change: 0, changeType: 'increase' as const },
          avgStayDuration: { value: 0, change: 0, changeType: 'increase' as const }
        };
      }
      
      return response.json();
    } catch {
      return {
        totalBookings: { value: 0, change: 0, changeType: 'increase' as const },
        revenue: { value: 0, change: 0, changeType: 'increase' as const },
        avgOccupancy: { value: 0, change: 0, changeType: 'increase' as const },
        avgStayDuration: { value: 0, change: 0, changeType: 'increase' as const }
      };
    }
  }
);

// Fetch room type distribution
export const fetchRoomTypeDistribution = createAsyncThunk(
  'analytics/fetchRoomTypeDistribution',
  async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/analytics/room-type-distribution`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        return [];
      }
      
      return response.json();
    } catch {
      return [];
    }
  }
);

// Fetch booking sources
export const fetchBookingSources = createAsyncThunk(
  'analytics/fetchBookingSources',
  async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/analytics/booking-sources`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        return [];
      }
      
      return response.json();
    } catch {
      return [];
    }
  }
);

// Fetch room type statistics
export const fetchRoomTypeStats = createAsyncThunk(
  'analytics/fetchRoomTypeStats',
  async (dateRange?: { startDate?: string; endDate?: string }) => {
    try {
      const token = getAuthToken();
      let url = `${API_BASE_URL}/analytics/room-types`;
      if (dateRange?.startDate || dateRange?.endDate) {
        const params = new URLSearchParams();
        if (dateRange.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange.endDate) params.append('endDate', dateRange.endDate);
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        return []; // Return empty array for error
      }
      
      return response.json();
    } catch {
      return []; // Return empty array for empty database
    }
  }
);

// Fetch recent bookings
export const fetchRecentBookings = createAsyncThunk(
  'analytics/fetchRecentBookings',
  async (limit: number = 5) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/analytics/recent-bookings?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        return []; // Return empty array for error
      }
      
      return response.json();
    } catch {
      return []; // Return empty array for empty database
    }
  }
);

// Slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch dashboard stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard statistics';
      });

    // Fetch booking trends
    builder
      .addCase(fetchBookingTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingTrends.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingTrends = action.payload;
      })
      .addCase(fetchBookingTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch booking trends';
      });

    // Fetch revenue trends
    builder
      .addCase(fetchRevenueTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueTrends.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueTrends = action.payload;
      })
      .addCase(fetchRevenueTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch revenue trends';
      });

    // Fetch room type stats
    builder
      .addCase(fetchRoomTypeStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomTypeStats.fulfilled, (state, action) => {
        state.loading = false;
        state.roomTypeStats = action.payload;
      })
      .addCase(fetchRoomTypeStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch room type statistics';
      });

    // Fetch recent bookings
    builder
      .addCase(fetchRecentBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.recentBookings = action.payload;
      })
      .addCase(fetchRecentBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch recent bookings';
      });

    // Fetch performance stats
    builder
      .addCase(fetchPerformanceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerformanceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceStats = action.payload;
      })
      .addCase(fetchPerformanceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch performance statistics';
      });

    // Fetch room type distribution
    builder
      .addCase(fetchRoomTypeDistribution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomTypeDistribution.fulfilled, (state, action) => {
        state.loading = false;
        state.roomTypeData = action.payload;
      })
      .addCase(fetchRoomTypeDistribution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch room type distribution';
      });

    // Fetch booking sources
    builder
      .addCase(fetchBookingSources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingSources.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingSourceData = action.payload;
      })
      .addCase(fetchBookingSources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch booking sources';
      });
  },
});

export const { clearError, setDateRange } = analyticsSlice.actions;
export default analyticsSlice.reducer;
