// Common types used across the backend

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
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
  is_active: boolean;
  owner_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Room {
  id: number;
  accommodation_id: number;
  name: string;
  description?: string;
  capacity: number;
  beds: number;
  price_per_night: number;
  refundable: boolean;
  quantity: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: number;
  user_id: number;
  accommodation_id: number;
  check_in_date: Date;
  check_out_date: Date;
  num_adults: number;
  num_children: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_requests?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Review {
  id: number;
  user_id: number;
  accommodation_id: number;
  rating: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string;
}

export interface Favourite {
  id: number;
  user_id: number;
  accommodation_id: number;
  created_at: Date;
}
