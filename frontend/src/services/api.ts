import axios, { AxiosError } from 'axios';

// API Base URL - Use environment variable with fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Log API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', error.response?.data || error.message);
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid - only redirect if we had a token
      const hadToken = localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login if the user was logged in before
      // Don't redirect for public endpoints accessed without login
      if (hadToken) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

export interface Accommodation {
  id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
  star_rating: number;
  base_currency: string;
  photos: { url: string; is_primary: boolean }[];
  avg_rating: number;
  review_count: number;
  is_favorite?: boolean;
  amenities?: Amenity[];
  rooms?: Room[];
}

export interface Room {
  id: number;
  accommodation_id: number;
  name: string;
  description?: string;
  location?: string;
  type?: string;
  capacity: number;
  beds: number;
  baths?: number;
  area?: number;
  price_per_night: number;
  refundable: boolean;
  quantity?: number;
  available_quantity?: number;
  photos?: { url: string; sort_order?: number; is_primary?: boolean }[];
  amenities?: string[];
  roomFeatures?: string[];
  room_features?: string[];
  status?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  accommodation_id: number;
  check_in_date: string;
  check_out_date: string;
  num_adults: number;
  num_children: number;
  total_price: number;
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

export interface CreateBookingData {
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
}

export interface Review {
  id: number;
  user_id: number;
  accommodation_id: number;
  rating: number;
  comment: string;
  user_name?: string;
  created_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string;
}

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials) => 
    api.post<{ token: string; user: User }>('/auth/login', credentials),
  
  register: (data: RegisterData) => 
    api.post<{ token: string; user: User }>('/auth/register', data),
  
  getMe: () => 
    api.get<User>('/auth/me'),
};

// Accommodations API
export const accommodationsAPI = {
  getAll: (params?: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    guests?: number;
    checkIn?: string;
    checkOut?: string;
    search?: string;
  }) => api.get<Accommodation[]>('/accommodations', { params }),
  
  getById: (id: number) => 
    api.get<Accommodation>(`/accommodations/${id}`),
  
  create: (data: Partial<Accommodation>) => 
    api.post<Accommodation>('/accommodations', data),
  
  update: (id: number, data: Partial<Accommodation>) => 
    api.put<Accommodation>(`/accommodations/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/accommodations/${id}`),
};

// Rooms API
export const roomsAPI = {
  getAll: () => 
    api.get<Room[]>('/rooms'),
  
  getHottest: () => 
    api.get<Room[]>('/rooms/hottest/top'),
  
  getByAccommodation: (accommodationId: number, params?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }) => api.get<Room[]>(`/rooms/accommodation/${accommodationId}`, { params }),  getById: (id: number) => 
    api.get<Room>(`/rooms/${id}`),
  
  create: (data: Partial<Room>) => 
    api.post<Room>('/rooms', data),
  
  update: (id: number, data: Partial<Room>) => 
    api.put<Room>(`/rooms/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/rooms/${id}`),
};

// Bookings API
export const bookingsAPI = {
  getMyBookings: () => 
    api.get<Booking[]>('/bookings/my-bookings'),
  
  getById: (id: number) => 
    api.get<Booking>(`/bookings/${id}`),
  
  create: (data: CreateBookingData) => 
    api.post<Booking>('/bookings', data),
  
  updateStatus: (id: number, status: Booking['status']) => 
    api.patch<Booking>(`/bookings/${id}/status`, { status }),
  
  getAll: () => 
    api.get<Booking[]>('/bookings'),
};

// Reviews API
export const reviewsAPI = {
  getByAccommodation: (accommodationId: number, params?: { page?: number; limit?: number }) => 
    api.get<{ reviews: Review[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/reviews/accommodation/${accommodationId}`, { params }),
  
  getMyReviews: () => 
    api.get<Review[]>('/reviews/my-reviews'),
  
  create: (data: { accommodation_id: number; rating: number; comment: string }) => 
    api.post<Review>('/reviews', data),
  
  update: (id: number, data: { rating?: number; comment?: string }) => 
    api.put<Review>(`/reviews/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/reviews/${id}`),
  
  getSummary: (accommodationId: number) => 
    api.get(`/reviews/accommodation/${accommodationId}/summary`),
};

// Favourites API
export const favouritesAPI = {
  getAll: () => 
    api.get<Accommodation[]>('/favourites'),
  
  add: (accommodationId: number) => 
    api.post('/favourites', { accommodation_id: accommodationId }),
  
  remove: (accommodationId: number) => 
    api.delete(`/favourites/${accommodationId}`),
  
  toggle: (accommodationId: number) => 
    api.post<{ action: 'added' | 'removed'; is_favourite: boolean }>('/favourites/toggle', { accommodation_id: accommodationId }),
  
  check: (accommodationId: number) => 
    api.get<{ is_favourite: boolean }>(`/favourites/check/${accommodationId}`),
};

// Amenities API
export const amenitiesAPI = {
  getAll: () => 
    api.get<Amenity[]>('/amenities'),
  
  getByAccommodation: (accommodationId: number) => 
    api.get<Amenity[]>(`/amenities/accommodation/${accommodationId}`),
  
  create: (data: { name: string; icon?: string }) => 
    api.post<Amenity>('/amenities', data),
  
  update: (id: number, data: { name?: string; icon?: string }) => 
    api.put<Amenity>(`/amenities/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/amenities/${id}`),
  
  assignToAccommodation: (accommodationId: number, amenityIds: number[]) => 
    api.post(`/amenities/accommodation/${accommodationId}`, { amenity_ids: amenityIds }),
};

// Inquiries API
export const inquiriesAPI = {
  create: (data: {
    guest_name: string;
    guest_email: string;
    subject: string;
    message: string;
    priority?: string;
    category?: string;
  }) => api.post('/inquiries', data),
};

// Users API
export const usersAPI = {
  getProfile: () =>
    api.get<User>('/users/profile'),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put<User>('/users/profile', data),

  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/users/change-password', data),

  getAll: () =>
    api.get<User[]>('/users'),

  getById: (id: number) =>
    api.get<User>(`/users/${id}`),

  update: (id: number, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data),

  delete: (id: number) =>
    api.delete(`/users/${id}`),

  getStats: (id: number) =>
    api.get(`/users/${id}/stats`),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => 
    api.get('/admin/dashboard/stats'),
  
  getRecentBookings: (limit?: number) => 
    api.get('/admin/bookings/recent', { params: { limit } }),
  
  getRevenueAnalytics: (period?: 'day' | 'week' | 'month' | 'year') => 
    api.get('/admin/analytics/revenue', { params: { period } }),
  
  getPopularAccommodations: (limit?: number) => 
    api.get('/admin/analytics/popular-accommodations', { params: { limit } }),
  
  getAuditLogs: (page?: number, limit?: number) => 
    api.get('/admin/audit-logs', { params: { page, limit } }),
  
  logAction: (data: { action: string; entity_type: string; entity_id: number; changes: Record<string, unknown> }) => 
    api.post('/admin/audit-logs', data),
  
  getOccupancyRate: (startDate?: string, endDate?: string) => 
    api.get('/admin/analytics/occupancy', { params: { start_date: startDate, end_date: endDate } }),
  
  getUserGrowth: () => 
    api.get('/admin/analytics/user-growth'),
  
  getHealth: () => 
    api.get('/admin/health'),
};

// Refunds API
export const refundsAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) => 
    api.get('/refunds', { params }),
  
  getById: (id: number) => 
    api.get(`/refunds/${id}`),
  
  create: (data: { booking_id: number; reason: string; refund_amount?: number }) => 
    api.post('/refunds', data),
  
  approve: (id: number, adminNotes?: string) => 
    api.patch(`/refunds/${id}/approve`, { admin_notes: adminNotes }),
  
  reject: (id: number, adminNotes: string) => 
    api.patch(`/refunds/${id}/reject`, { admin_notes: adminNotes }),
  
  process: (id: number, transactionId?: string) => 
    api.patch(`/refunds/${id}/process`, { transaction_id: transactionId }),
};

export default api;
