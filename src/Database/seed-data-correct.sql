-- ================================================================
-- mLodge Hotel - Seed Data Script (Corrected Version)
-- This script populates the database with dummy data matching actual table structures
-- ================================================================

-- Clear existing data (in correct order to respect foreign keys)
DELETE FROM booking_items;
DELETE FROM bookings;
DELETE FROM reviews;
DELETE FROM rooms;
DELETE FROM accommodations WHERE owner_id = 1;

-- ================================================================
-- ACCOMMODATIONS DATA
-- Columns: owner_id, name, description, address, city, country, postal_code, 
--          latitude, longitude, star_rating, base_currency, is_active
-- ================================================================

INSERT INTO accommodations (owner_id, name, description, address, city, country, postal_code, latitude, longitude, star_rating, base_currency, is_active)
VALUES 
  (1, 'mLodge Cape Town Waterfront', 'Luxury hotel located at the beautiful Cape Town Waterfront with stunning ocean views and world-class amenities. Perfect for both business and leisure travelers.', 'Victoria & Alfred Waterfront, Dock Road', 'Cape Town', 'South Africa', '8001', -33.9025, 18.4241, 5, 'ZAR', true),
  (1, 'mLodge Johannesburg Sandton', 'Modern business hotel in the heart of Sandton financial district with state-of-the-art conference facilities and executive suites.', '123 Sandton Drive, Sandton City', 'Johannesburg', 'South Africa', '2196', -26.1076, 28.0567, 4, 'ZAR', true),
  (1, 'mLodge Durban Beachfront', 'Beachfront paradise hotel with direct access to golden beaches, ocean views, and world-class dining experiences.', '45 Marine Parade, South Beach', 'Durban', 'South Africa', '4001', -29.8587, 31.0218, 5, 'ZAR', true);

-- ================================================================
-- ROOMS DATA
-- Columns: accommodation_id, name, description, capacity, beds, price_per_night, refundable
-- ================================================================

-- Cape Town Waterfront Rooms
INSERT INTO rooms (accommodation_id, name, description, capacity, beds, price_per_night, refundable)
VALUES
  -- Using accommodation_id from the inserted accommodations (1, 2, 3)
  (1, 'Ocean View Deluxe Suite', 'Spacious suite with panoramic ocean views, king-size bed, and private balcony', 2, 1, 2500.00, true),
  (1, 'Harbor Premium Room', 'Modern room with harbor views, queen-size bed, and luxury amenities', 2, 1, 1800.00, true),
  (1, 'Family Ocean Suite', 'Large family suite with 2 bedrooms, ocean view, and living area', 4, 2, 3500.00, true),
  (1, 'Executive King Room', 'Business-friendly room with king bed and workspace', 2, 1, 2200.00, true),
  (1, 'Standard Double Room', 'Comfortable room with double bed and city views', 2, 1, 1500.00, true),

-- Johannesburg Sandton Rooms
  (2, 'Executive Business Suite', 'Large suite with separate workspace, king bed, and city views', 2, 1, 2000.00, true),
  (2, 'Premium King Room', 'Modern room with king bed and executive amenities', 2, 1, 1600.00, true),
  (2, 'Twin Business Room', 'Room with 2 single beds, perfect for colleagues', 2, 2, 1400.00, true),
  (2, 'Deluxe Suite', 'Spacious suite with living area and premium furnishings', 3, 1, 2800.00, true),
  (2, 'Standard Queen Room', 'Comfortable room with queen bed', 2, 1, 1200.00, true),

-- Durban Beachfront Rooms
  (3, 'Beachfront Luxury Suite', 'Premier suite with direct beach views, king bed, and jacuzzi', 2, 1, 3000.00, true),
  (3, 'Ocean View Balcony Room', 'Room with private balcony overlooking the ocean', 2, 1, 2200.00, true),
  (3, 'Family Beach Suite', 'Spacious 2-bedroom suite with beach access', 5, 2, 4000.00, true),
  (3, 'Premium Ocean Room', 'Elegant room with ocean views and king bed', 2, 1, 2500.00, true),
  (3, 'Standard Beach Room', 'Comfortable room with partial beach views', 2, 1, 1800.00, true);

-- ================================================================
-- BOOKINGS DATA
-- Columns: booking_reference, user_id, accommodation_id, status, total_price, 
--          currency, check_in_date, check_out_date, guest_count, notes
-- ================================================================

-- Past completed bookings (for analytics)
INSERT INTO bookings (booking_reference, user_id, accommodation_id, status, total_price, currency, check_in_date, check_out_date, guest_count, notes, created_at)
VALUES
  ('BK2024-001', 1, 1, 'completed', 7500.00, 'ZAR', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '57 days', 2, 'Anniversary celebration', NOW() - INTERVAL '65 days'),
  ('BK2024-002', 1, 2, 'completed', 4800.00, 'ZAR', CURRENT_DATE - INTERVAL '55 days', CURRENT_DATE - INTERVAL '52 days', 2, 'Business trip', NOW() - INTERVAL '58 days'),
  ('BK2024-003', 1, 3, 'completed', 9000.00, 'ZAR', CURRENT_DATE - INTERVAL '50 days', CURRENT_DATE - INTERVAL '47 days', 2, 'Honeymoon', NOW() - INTERVAL '52 days'),
  ('BK2024-004', 1, 1, 'completed', 5400.00, 'ZAR', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '42 days', 2, 'Weekend getaway', NOW() - INTERVAL '47 days'),
  ('BK2024-005', 1, 2, 'completed', 6400.00, 'ZAR', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '36 days', 2, 'Conference attendance', NOW() - INTERVAL '42 days'),
  ('BK2024-006', 1, 3, 'completed', 12000.00, 'ZAR', CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '32 days', 4, 'Family vacation', NOW() - INTERVAL '38 days'),
  ('BK2024-007', 1, 1, 'completed', 6600.00, 'ZAR', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '27 days', 2, 'Birthday celebration', NOW() - INTERVAL '32 days'),
  ('BK2024-008', 1, 2, 'completed', 4000.00, 'ZAR', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '23 days', 2, 'Business meeting', NOW() - INTERVAL '27 days'),

-- Current confirmed bookings
  ('BK2024-009', 1, 1, 'confirmed', 5000.00, 'ZAR', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '7 days', 2, 'Romantic weekend', NOW() - INTERVAL '10 days'),
  ('BK2024-010', 1, 2, 'confirmed', 4800.00, 'ZAR', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '13 days', 2, 'Business trip', NOW() - INTERVAL '8 days'),
  ('BK2024-011', 1, 3, 'confirmed', 8000.00, 'ZAR', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '19 days', 4, 'Family holiday', NOW() - INTERVAL '5 days'),

-- Pending bookings
  ('BK2024-012', 1, 1, 'pending', 4500.00, 'ZAR', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '22 days', 2, 'Quick visit', NOW() - INTERVAL '2 days'),
  ('BK2024-013', 1, 2, 'pending', 3200.00, 'ZAR', CURRENT_DATE + INTERVAL '25 days', CURRENT_DATE + INTERVAL '27 days', 2, 'Business meeting', NOW() - INTERVAL '1 day'),

-- Cancelled bookings
  ('BK2024-014', 1, 1, 'cancelled', 5000.00, 'ZAR', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '13 days', 2, 'Cancelled due to emergency', NOW() - INTERVAL '20 days');

-- ================================================================
-- BOOKING ITEMS DATA (links bookings to specific rooms)
-- Columns: booking_id, room_id, check_in_date, check_out_date, price_per_night, nights
-- ================================================================

INSERT INTO booking_items (booking_id, room_id, check_in_date, check_out_date, price_per_night, nights)
VALUES
  (1, 1, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '57 days', 2500.00, 3),
  (2, 6, CURRENT_DATE - INTERVAL '55 days', CURRENT_DATE - INTERVAL '52 days', 1600.00, 3),
  (3, 11, CURRENT_DATE - INTERVAL '50 days', CURRENT_DATE - INTERVAL '47 days', 3000.00, 3),
  (4, 2, CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '42 days', 1800.00, 3),
  (5, 7, CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '36 days', 1600.00, 4),
  (6, 13, CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '32 days', 4000.00, 3),
  (7, 4, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '27 days', 2200.00, 3),
  (8, 10, CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '23 days', 2000.00, 2),
  (9, 1, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '7 days', 2500.00, 2),
  (10, 6, CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '13 days', 1600.00, 3),
  (11, 12, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '19 days', 2000.00, 4),
  (12, 2, CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '22 days', 2250.00, 2),
  (13, 8, CURRENT_DATE + INTERVAL '25 days', CURRENT_DATE + INTERVAL '27 days', 1600.00, 2),
  (14, 3, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '13 days', 2500.00, 2);

-- ================================================================
-- REVIEWS DATA
-- Columns: user_id, accommodation_id, booking_id, rating, comment, status
-- ================================================================

INSERT INTO reviews (user_id, accommodation_id, booking_id, rating, comment, status, created_at)
VALUES
  (1, 1, 1, 5, 'Absolutely amazing stay! The ocean views were breathtaking and staff was incredibly helpful.', 'approved', NOW() - INTERVAL '55 days'),
  (1, 2, 2, 4, 'Great location for business. Rooms are modern and clean. Would recommend.', 'approved', NOW() - INTERVAL '50 days'),
  (1, 3, 3, 5, 'Perfect honeymoon destination! Beautiful beach, excellent service, unforgettable experience.', 'approved', NOW() - INTERVAL '45 days'),
  (1, 1, 4, 4, 'Lovely weekend getaway. Room was spacious and comfortable. Minor issue with WiFi.', 'approved', NOW() - INTERVAL '40 days'),
  (1, 2, 5, 5, 'Best business hotel in Sandton. Conference facilities are top-notch.', 'approved', NOW() - INTERVAL '35 days'),
  (1, 3, 6, 5, 'Our family had an incredible time. Kids loved the beach access. Highly recommend!', 'approved', NOW() - INTERVAL '30 days'),
  (1, 1, 7, 5, 'Birthday trip was perfect. Staff surprised us with cake and decorations!', 'approved', NOW() - INTERVAL '25 days'),
  (1, 2, 8, 4, 'Good for short business trips. Quick check-in and out. Professional service.', 'approved', NOW() - INTERVAL '20 days');

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Show counts
SELECT 'Accommodations' as table_name, COUNT(*) as count FROM accommodations
UNION ALL
SELECT 'Rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'Booking Items', COUNT(*) FROM booking_items
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews;

-- Show accommodation details
SELECT id, name, city, star_rating FROM accommodations ORDER BY id;

-- Show booking statistics
SELECT 
  status, 
  COUNT(*) as count, 
  SUM(total_price) as total_revenue 
FROM bookings 
GROUP BY status 
ORDER BY count DESC;

COMMIT;
