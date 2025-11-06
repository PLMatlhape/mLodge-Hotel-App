-- =============================================
-- HOTEL BOOKING APP - DATABASE SCHEMA V2
-- Production-Ready PostgreSQL Schema
-- =============================================
 
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
 
-- =============================================
-- DROP EXISTING TABLES (BE CAREFUL - THIS DELETES DATA!)
-- Comment out this section if you want to preserve existing data
-- =============================================
/*
DROP TABLE IF EXISTS admin_audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS favourites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS booking_items CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS room_inventory CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS accommodation_amenities CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS accommodations CASCADE;
DROP TABLE IF EXISTS oauth_providers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
*/

-- =============================================
-- CORE TABLES
-- =============================================
 
-- Users Table (Authentication & Profile)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255), -- NULL for OAuth-only users
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
 
-- OAuth Providers (Google, Facebook, etc.)
CREATE TABLE IF NOT EXISTS oauth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'facebook'
    provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);
 
-- =============================================
-- ACCOMMODATION MANAGEMENT
-- =============================================
 
-- Accommodations (Hotels/Properties)
CREATE TABLE IF NOT EXISTS accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    star_rating SMALLINT CHECK (star_rating BETWEEN 1 AND 5),
    base_currency VARCHAR(10) DEFAULT 'ZAR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
 
-- Photos (Gallery Images)
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
 
-- Amenities Master List
CREATE TABLE IF NOT EXISTS amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50), -- Optional: for UI icons
    description TEXT
);
 
-- Accommodation-Amenities Junction (Many-to-Many)
CREATE TABLE IF NOT EXISTS accommodation_amenities (
    accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (accommodation_id, amenity_id)
);
 
-- Policies (Check-in/out, Cancellation, House Rules)
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    policy_type VARCHAR(50) NOT NULL, -- 'cancellation', 'checkin', 'checkout', 'house_rules'
    title VARCHAR(150),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
 
-- =============================================
-- ROOM MANAGEMENT
-- =============================================
 
-- Rooms (Room Types & Pricing)
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Deluxe King Suite"
    description TEXT,
    capacity INT NOT NULL DEFAULT 2, -- Max guests
    beds INT DEFAULT 1,
    price_per_night NUMERIC(10,2) NOT NULL,
    refundable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
 
-- Room Inventory (Date-based Availability)
CREATE TABLE IF NOT EXISTS room_inventory (
    id BIGSERIAL PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available_units INT NOT NULL CHECK (available_units >= 0),
    UNIQUE (room_id, date)
);
 
-- =============================================
-- BOOKING & PAYMENT
-- =============================================
 
-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    total_amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ZAR',
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    guest_count INT NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (checkout_date > checkin_date)
);
 
-- Booking Items (Room Details per Booking)
CREATE TABLE IF NOT EXISTS booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id),
    price_per_night NUMERIC(10,2) NOT NULL, -- Snapshot at booking time
    nights INT NOT NULL CHECK (nights > 0),
    quantity INT NOT NULL CHECK (quantity > 0), -- Number of rooms
    created_at TIMESTAMPTZ DEFAULT NOW()
);
 
-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ZAR',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_provider VARCHAR(50), -- 'stripe', 'paypal', etc.
    provider_reference VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
 
-- =============================================
-- USER INTERACTIONS
-- =============================================
 
-- Reviews & Ratings
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(150),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, accommodation_id)
);
 
-- Favourites
CREATE TABLE IF NOT EXISTS favourites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, accommodation_id)
);
 
-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'booking_confirmation', 'payment_success', 'promo'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
 
-- =============================================
-- ADMIN & AUDIT
-- =============================================
 
-- Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'created_accommodation', 'updated_booking'
    entity VARCHAR(100), -- 'accommodations', 'bookings'
    entity_id UUID,
    details JSONB, -- Flexible JSON for additional context
    created_at TIMESTAMPTZ DEFAULT NOW()
);
 
-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
 
CREATE INDEX IF NOT EXISTS idx_accommodations_city ON accommodations(city);
CREATE INDEX IF NOT EXISTS idx_accommodations_active ON accommodations(is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_accommodation ON rooms(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_room_inventory_lookup ON room_inventory(room_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_accommodation ON bookings(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(checkin_date, checkout_date);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_accommodation ON reviews(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
 
-- =============================================
-- SAMPLE DATA INSERTS (Optional for Testing)
-- =============================================
 
-- Insert sample amenities
INSERT INTO amenities (name, description) VALUES
    ('Free WiFi', 'High-speed wireless internet'),
    ('Swimming Pool', 'Outdoor swimming pool'),
    ('Gym', 'Fitness center with modern equipment'),
    ('Parking', 'Free on-site parking'),
    ('Restaurant', 'On-site dining facility'),
    ('Air Conditioning', 'Climate control in all rooms')
ON CONFLICT (name) DO NOTHING;
 
-- =============================================
-- TABLE COMMENTS
-- =============================================
 
COMMENT ON TABLE users IS 'User accounts for authentication and profiles';
COMMENT ON TABLE accommodations IS 'Hotel/property listings';
COMMENT ON TABLE rooms IS 'Room types and pricing';
COMMENT ON TABLE bookings IS 'Customer reservations';
COMMENT ON TABLE payments IS 'Payment transactions';
COMMENT ON TABLE reviews IS 'User reviews and ratings';

-- =============================================
-- VERIFY TABLES CREATED
-- =============================================

-- List all tables
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Display message
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables created: users, oauth_providers, accommodations, photos, amenities, accommodation_amenities, policies, rooms, room_inventory, bookings, booking_items, payments, reviews, favourites, notifications, admin_audit_logs';
    RAISE NOTICE '📝 Ready to create admin user!';
END $$;
