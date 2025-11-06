-- ================================================================
-- mLodge Hotel - CORRECTED Seed Data Script
-- Matches ACTUAL database schema
-- ================================================================

-- Clear existing data (in correct order to respect foreign keys)
DELETE FROM booking_items;
DELETE FROM bookings;
DELETE FROM reviews;
DELETE FROM refunds;
DELETE FROM inquiries;
DELETE FROM promo_codes;
DELETE FROM email_templates;
DELETE FROM reports;
DELETE FROM admin_audit_logs;
DELETE FROM rooms;
DELETE FROM accommodations WHERE owner_id != 1;

-- ================================================================
-- USERS DATA
-- ================================================================
-- Create new test users with unique emails
INSERT INTO users (name, email, password, role, phone, is_active, created_at, updated_at) VALUES
('John Smith', 'john.smith@mlodge.com', '$2b$10$YourHashedPassword1', 'user', '+27821234567', true, NOW() - INTERVAL '6 months', NOW()),
('Sarah Johnson', 'sarah.johnson@mlodge.com', '$2b$10$YourHashedPassword2', 'user', '+27832345678', true, NOW() - INTERVAL '5 months', NOW()),
('Michael Brown', 'michael.brown@mlodge.com', '$2b$10$YourHashedPassword3', 'user', '+27843456789', true, NOW() - INTERVAL '4 months', NOW()),
('Emily Davis', 'emily.davis@mlodge.com', '$2b$10$YourHashedPassword4', 'user', '+27854567890', true, NOW() - INTERVAL '3 months', NOW()),
('David Wilson', 'david.wilson@mlodge.com', '$2b$10$YourHashedPassword5', 'user', '+27865678901', true, NOW() - INTERVAL '2 months', NOW())
ON CONFLICT (email) DO NOTHING;

-- ================================================================
-- ACCOMMODATIONS DATA
-- ================================================================
INSERT INTO accommodations (owner_id, name, description, address, city, country, postal_code, latitude, longitude, star_rating, base_currency, is_active, created_at, updated_at) 
VALUES
(1, 'Cape Town Waterfront Hotel', 
 'Luxury beachfront hotel with stunning ocean views and world-class amenities', 
 '123 Beach Road, Sea Point', 'Cape Town', 'South Africa', '8005', 
 -33.924870, 18.391180, 5, 'ZAR', true, NOW() - INTERVAL '6 months', NOW()),

(1, 'Johannesburg City Center Hotel',
 'Modern business hotel in the heart of Sandton with conference facilities',
 '456 Sandton Drive', 'Johannesburg', 'South Africa', '2196',
 -26.107880, 28.056220, 4, 'ZAR', true, NOW() - INTERVAL '5 months', NOW()),

(1, 'Durban Beachfront Resort',
 'Coastal paradise with direct beach access and family-friendly facilities',
 '789 Marine Parade', 'Durban', 'South Africa', '4001',
 -29.857220, 31.028330, 5, 'ZAR', true, NOW() - INTERVAL '4 months', NOW());

-- ================================================================
-- ROOMS DATA
-- ================================================================
DO $$
DECLARE
    cape_town_id INTEGER;
    joburg_id INTEGER;
    durban_id INTEGER;
BEGIN
    SELECT id INTO cape_town_id FROM accommodations WHERE name = 'Cape Town Waterfront Hotel';
    SELECT id INTO joburg_id FROM accommodations WHERE name = 'Johannesburg City Center Hotel';
    SELECT id INTO durban_id FROM accommodations WHERE name = 'Durban Beachfront Resort';

    INSERT INTO rooms (accommodation_id, name, description, capacity, beds, price_per_night, refundable, created_at, updated_at) VALUES
    (cape_town_id, 'Ocean View Deluxe Suite', 'Spacious suite with panoramic ocean views', 2, 1, 2500.00, true, NOW() - INTERVAL '6 months', NOW()),
    (cape_town_id, 'Mountain View Family Room', 'Perfect for families with Table Mountain views', 4, 2, 3200.00, true, NOW() - INTERVAL '6 months', NOW()),
    (cape_town_id, 'Standard Double Room', 'Comfortable room with city views', 2, 1, 1500.00, true, NOW() - INTERVAL '6 months', NOW()),
    (cape_town_id, 'Luxury Presidential Suite', 'Ultimate luxury with private terrace', 4, 2, 8500.00, false, NOW() - INTERVAL '6 months', NOW()),
    (cape_town_id, 'Twin Standard Room', 'Ideal for friends with two single beds', 2, 2, 1600.00, true, NOW() - INTERVAL '6 months', NOW());

    INSERT INTO rooms (accommodation_id, name, description, capacity, beds, price_per_night, refundable, created_at, updated_at) VALUES
    (joburg_id, 'Executive Business Suite', 'Perfect for business travelers', 2, 1, 2200.00, true, NOW() - INTERVAL '5 months', NOW()),
    (joburg_id, 'Deluxe King Room', 'Spacious room with city skyline views', 2, 1, 2000.00, true, NOW() - INTERVAL '5 months', NOW()),
    (joburg_id, 'Standard Twin Room', 'Comfortable twin room', 2, 2, 1700.00, true, NOW() - INTERVAL '5 months', NOW()),
    (joburg_id, 'Superior Family Suite', 'Spacious family accommodation', 4, 2, 3500.00, true, NOW() - INTERVAL '5 months', NOW());

    INSERT INTO rooms (accommodation_id, name, description, capacity, beds, price_per_night, refundable, created_at, updated_at) VALUES
    (durban_id, 'Beachfront Luxury Suite', 'Wake up to ocean waves', 2, 1, 3000.00, true, NOW() - INTERVAL '4 months', NOW()),
    (durban_id, 'Ocean View Family Room', 'Perfect beach vacation room', 5, 2, 3800.00, true, NOW() - INTERVAL '4 months', NOW()),
    (durban_id, 'Standard Sea View Room', 'Comfortable room with sea views', 2, 1, 1800.00, true, NOW() - INTERVAL '4 months', NOW()),
    (durban_id, 'Honeymoon Suite', 'Romantic suite for honeymooners', 2, 1, 4500.00, false, NOW() - INTERVAL '4 months', NOW()),
    (durban_id, 'Poolside Garden Room', 'Ground floor with pool access', 2, 1, 1900.00, true, NOW() - INTERVAL '4 months', NOW());
END $$;

-- ================================================================
-- BOOKINGS DATA
-- ================================================================
DO $$
DECLARE
    cape_town_id INTEGER;
    joburg_id INTEGER;
    durban_id INTEGER;
    user2_id INTEGER; user3_id INTEGER; user4_id INTEGER; user5_id INTEGER;
BEGIN
    SELECT id INTO cape_town_id FROM accommodations WHERE name = 'Cape Town Waterfront Hotel';
    SELECT id INTO joburg_id FROM accommodations WHERE name = 'Johannesburg City Center Hotel';
    SELECT id INTO durban_id FROM accommodations WHERE name = 'Durban Beachfront Resort';
    
    -- Get actual user IDs (not hardcoded 2,3,4,5)
    SELECT id INTO user2_id FROM users WHERE role = 'user' ORDER BY id LIMIT 1 OFFSET 0;
    SELECT id INTO user3_id FROM users WHERE role = 'user' ORDER BY id LIMIT 1 OFFSET 1;
    SELECT id INTO user4_id FROM users WHERE role = 'user' ORDER BY id LIMIT 1 OFFSET 2;
    SELECT id INTO user5_id FROM users WHERE role = 'user' ORDER BY id LIMIT 1 OFFSET 3;

    INSERT INTO bookings (booking_reference, user_id, accommodation_id, status, total_price, currency, check_in_date, check_out_date, guest_count, notes, created_at, updated_at) VALUES
    ('BK001-2024', user2_id, cape_town_id, 'completed', 7500.00, 'ZAR', CURRENT_DATE - INTERVAL '5 months', CURRENT_DATE - INTERVAL '5 months' + INTERVAL '3 days', 2, 'Late check-in please', NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months' + INTERVAL '4 days'),
    ('BK002-2024', user3_id, joburg_id, 'completed', 4400.00, 'ZAR', CURRENT_DATE - INTERVAL '4 months', CURRENT_DATE - INTERVAL '4 months' + INTERVAL '2 days', 2, NULL, NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months' + INTERVAL '3 days'),
    ('BK003-2024', user4_id, durban_id, 'completed', 19000.00, 'ZAR', CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE - INTERVAL '3 months' + INTERVAL '5 days', 4, 'Crib needed', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months' + INTERVAL '6 days'),
    ('BK004-2024', user5_id, cape_town_id, 'completed', 10000.00, 'ZAR', CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE - INTERVAL '2 months' + INTERVAL '4 days', 2, NULL, NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months' + INTERVAL '5 days'),
    ('BK005-2024', user2_id, joburg_id, 'completed', 6600.00, 'ZAR', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '57 days', 2, 'Airport transfer needed', NOW() - INTERVAL '60 days', NOW() - INTERVAL '56 days'),
    ('BK006-2024', user3_id, durban_id, 'completed', 9000.00, 'ZAR', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '42 days', 2, NULL, NOW() - INTERVAL '45 days', NOW() - INTERVAL '41 days'),
    ('BK007-2024', user4_id, cape_town_id, 'completed', 5000.00, 'ZAR', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '28 days', 2, 'High floor preferred', NOW() - INTERVAL '30 days', NOW() - INTERVAL '27 days'),
    ('BK008-2024', user5_id, joburg_id, 'confirmed', 4400.00, 'ZAR', CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '5 days', 2, NULL, NOW() - INTERVAL '10 days', NOW()),
    ('BK009-2024', user2_id, durban_id, 'confirmed', 13500.00, 'ZAR', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '10 days', 2, 'Honeymoon - decorations', NOW() - INTERVAL '15 days', NOW()),
    ('BK010-2024', user3_id, cape_town_id, 'confirmed', 7500.00, 'ZAR', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '17 days', 2, NULL, NOW() - INTERVAL '5 days', NOW()),
    ('BK011-2024', user4_id, joburg_id, 'pending', 7000.00, 'ZAR', CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '23 days', 4, 'Adjacent rooms', NOW() - INTERVAL '3 days', NOW()),
    ('BK012-2024', user5_id, durban_id, 'pending', 19000.00, 'ZAR', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '35 days', 5, NULL, NOW() - INTERVAL '2 days', NOW()),
    ('BK013-2024', user2_id, cape_town_id, 'cancelled', 7500.00, 'ZAR', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '13 days', 2, NULL, NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days');
END $$;

-- ================================================================
-- BOOKING ITEMS DATA
-- ================================================================
DO $$
DECLARE
    room1_id INTEGER;
    room6_id INTEGER;
    room10_id INTEGER;
    room13_id INTEGER;
    booking1_id INTEGER; booking2_id INTEGER; booking3_id INTEGER; booking4_id INTEGER;
    booking5_id INTEGER; booking6_id INTEGER; booking7_id INTEGER; booking8_id INTEGER;
    booking9_id INTEGER; booking10_id INTEGER; booking11_id INTEGER; booking12_id INTEGER;
    booking13_id INTEGER;
BEGIN
    SELECT id INTO room1_id FROM rooms ORDER BY id LIMIT 1 OFFSET 0;
    SELECT id INTO room6_id FROM rooms ORDER BY id LIMIT 1 OFFSET 5;
    SELECT id INTO room10_id FROM rooms ORDER BY id LIMIT 1 OFFSET 9;
    SELECT id INTO room13_id FROM rooms ORDER BY id LIMIT 1 OFFSET 12;
    
    -- Get booking IDs
    SELECT id INTO booking1_id FROM bookings ORDER BY id LIMIT 1 OFFSET 0;
    SELECT id INTO booking2_id FROM bookings ORDER BY id LIMIT 1 OFFSET 1;
    SELECT id INTO booking3_id FROM bookings ORDER BY id LIMIT 1 OFFSET 2;
    SELECT id INTO booking4_id FROM bookings ORDER BY id LIMIT 1 OFFSET 3;
    SELECT id INTO booking5_id FROM bookings ORDER BY id LIMIT 1 OFFSET 4;
    SELECT id INTO booking6_id FROM bookings ORDER BY id LIMIT 1 OFFSET 5;
    SELECT id INTO booking7_id FROM bookings ORDER BY id LIMIT 1 OFFSET 6;
    SELECT id INTO booking8_id FROM bookings ORDER BY id LIMIT 1 OFFSET 7;
    SELECT id INTO booking9_id FROM bookings ORDER BY id LIMIT 1 OFFSET 8;
    SELECT id INTO booking10_id FROM bookings ORDER BY id LIMIT 1 OFFSET 9;
    SELECT id INTO booking11_id FROM bookings ORDER BY id LIMIT 1 OFFSET 10;
    SELECT id INTO booking12_id FROM bookings ORDER BY id LIMIT 1 OFFSET 11;
    SELECT id INTO booking13_id FROM bookings ORDER BY id LIMIT 1 OFFSET 12;

    INSERT INTO booking_items (booking_id, room_id, price_per_night, nights, quantity, created_at) VALUES
    (booking1_id, room1_id, 2500.00, 3, 1, NOW() - INTERVAL '5 months'),
    (booking2_id, room6_id, 2200.00, 2, 1, NOW() - INTERVAL '4 months'),
    (booking3_id, room10_id, 3800.00, 5, 1, NOW() - INTERVAL '3 months'),
    (booking4_id, room1_id, 2500.00, 4, 1, NOW() - INTERVAL '2 months'),
    (booking5_id, room6_id, 2200.00, 3, 1, NOW() - INTERVAL '60 days'),
    (booking6_id, room10_id, 3000.00, 3, 1, NOW() - INTERVAL '45 days'),
    (booking7_id, room1_id, 2500.00, 2, 1, NOW() - INTERVAL '30 days'),
    (booking8_id, room6_id, 2200.00, 2, 1, NOW() - INTERVAL '10 days'),
    (booking9_id, room13_id, 4500.00, 3, 1, NOW() - INTERVAL '15 days'),
    (booking10_id, room1_id, 2500.00, 3, 1, NOW() - INTERVAL '5 days'),
    (booking11_id, room6_id, 3500.00, 2, 1, NOW() - INTERVAL '3 days'),
    (booking12_id, room10_id, 3800.00, 5, 1, NOW() - INTERVAL '2 days'),
    (booking13_id, room1_id, 2500.00, 3, 1, NOW() - INTERVAL '20 days');
END $$;

-- ================================================================
-- REVIEWS DATA
-- ================================================================
DO $$
DECLARE
    cape_town_id INTEGER;
    joburg_id INTEGER;
    durban_id INTEGER;
    user2_id INTEGER; user3_id INTEGER; user4_id INTEGER; user5_id INTEGER;
BEGIN
    SELECT id INTO cape_town_id FROM accommodations WHERE name = 'Cape Town Waterfront Hotel';
    SELECT id INTO joburg_id FROM accommodations WHERE name = 'Johannesburg City Center Hotel';
    SELECT id INTO durban_id FROM accommodations WHERE name = 'Durban Beachfront Resort';
    
    -- Get actual user IDs
    SELECT id INTO user2_id FROM users WHERE role = 'user' ORDER BY id LIMIT 1 OFFSET 0;
    SELECT id INTO user3_id FROM users WHERE role = 'user' ORDER BY id LIMIT 1 OFFSET 1;
    SELECT id INTO user4_id FROM users WHERE role = 'user' ORDER BY id LIMIT 1 OFFSET 2;
    SELECT id INTO user5_id FROM users WHERE role = 'user' ORDER BY id LIMIT 1 OFFSET 3;

    INSERT INTO reviews (user_id, accommodation_id, rating, title, comment, status, reviewed_by, reviewed_at, created_at, updated_at) VALUES
    (user2_id, cape_town_id, 5, 'Amazing Ocean Views!', 'The ocean view suite was absolutely stunning. Will definitely be back!', 'approved', 1, NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months'),
    (user3_id, joburg_id, 4, 'Great for Business', 'Perfect location for business meetings. Only downside was breakfast.', 'approved', 1, NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months'),
    (user4_id, durban_id, 5, 'Perfect Family Holiday', 'Our family had an incredible time! Highly recommend!', 'approved', 1, NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months'),
    (user5_id, cape_town_id, 5, 'Luxury at its Finest', 'The presidential suite exceeded all expectations!', 'approved', NULL, NULL, NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
    (user2_id, joburg_id, 4, 'Good Business Hotel', 'Solid choice for business travelers.', 'approved', NULL, NULL, NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days'),
    (user3_id, durban_id, 5, 'Romantic Getaway', 'Perfect for couples! Sunset views were unforgettable.', 'approved', NULL, NULL, NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'),
    (user4_id, cape_town_id, 4, 'Great Stay', 'Very comfortable room, excellent service.', 'pending', NULL, NULL, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
    (user5_id, joburg_id, 3, 'Average Experience', 'Room was okay but expected more for the price.', 'pending', NULL, NULL, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');
END $$;

-- ================================================================
-- PROMO CODES DATA
-- ================================================================
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_purchase_amount, usage_limit, usage_count, valid_from, valid_until, is_active, created_at, updated_at) VALUES
('WELCOME2024', 'Welcome discount for new customers', 'percentage', 15.00, 1000.00, 100, 23, NOW() - INTERVAL '3 months', NOW() + INTERVAL '3 months', true, NOW() - INTERVAL '3 months', NOW()),
('SUMMER50', 'Summer special - R50 off', 'amount', 50.00, 500.00, 200, 87, NOW() - INTERVAL '2 months', NOW() + INTERVAL '1 month', true, NOW() - INTERVAL '2 months', NOW()),
('FAMILY20', '20% off family bookings', 'percentage', 20.00, 2000.00, 50, 12, NOW() - INTERVAL '1 month', NOW() + INTERVAL '2 months', true, NOW() - INTERVAL '1 month', NOW()),
('BUSINESS15', 'Business traveler discount', 'percentage', 15.00, 1500.00, NULL, 34, NOW() - INTERVAL '2 weeks', NOW() + INTERVAL '6 weeks', true, NOW() - INTERVAL '2 weeks', NOW()),
('EARLYBIRD', 'Book 30 days in advance', 'percentage', 25.00, 1000.00, 150, 5, NOW(), NOW() + INTERVAL '6 months', true, NOW(), NOW()),
('EXPIRED2023', 'Old promo code', 'percentage', 10.00, 500.00, 100, 45, NOW() - INTERVAL '6 months', NOW() - INTERVAL '1 month', false, NOW() - INTERVAL '6 months', NOW() - INTERVAL '1 month');

-- ================================================================
-- INQUIRIES DATA
-- ================================================================
INSERT INTO inquiries (guest_name, guest_email, subject, message, status, priority, assigned_to, response, responded_by, responded_at, created_at, updated_at) VALUES
('Alice Cooper', 'alice.c@email.com', 'Group Booking Inquiry', 'Hi, planning a corporate event for 50 people. Group rates?', 'resolved', 'high', 1, 'Yes, we have excellent facilities. Details sent to your email.', 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days'),
('Bob Martin', 'bob.m@email.com', 'Wedding Venue', 'Looking for beachfront wedding venue for 100 guests in December.', 'in_progress', 'high', 1, NULL, NULL, NULL, NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days'),
('Carol White', 'carol.w@email.com', 'Accessibility', 'Do rooms have wheelchair accessibility?', 'resolved', 'medium', 1, 'Yes, fully accessible ground floor rooms available.', 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '3 days'),
('Daniel Green', 'daniel.g@email.com', 'Pet-Friendly Rooms', 'Are pets allowed? I have a small dog.', 'new', 'low', NULL, NULL, NULL, NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('Eva Brown', 'eva.b@email.com', 'Complaint - Room Service', 'Room service was very slow during my last stay.', 'in_progress', 'high', 1, NULL, NULL, NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day');

-- ================================================================
-- REFUNDS DATA
-- ================================================================
DO $$
DECLARE
    booking_cancelled_id INTEGER;
    booking_completed1_id INTEGER;
    booking_completed2_id INTEGER;
BEGIN
    -- Get IDs of specific bookings
    SELECT id INTO booking_cancelled_id FROM bookings WHERE status = 'cancelled' LIMIT 1;
    SELECT id INTO booking_completed1_id FROM bookings WHERE status = 'completed' ORDER BY id LIMIT 1 OFFSET 0;
    SELECT id INTO booking_completed2_id FROM bookings WHERE status = 'completed' ORDER BY id LIMIT 1 OFFSET 1;
    
    INSERT INTO refunds (booking_id, reason, refund_amount, status, admin_notes, transaction_id, requested_date, processed_date, processed_by, created_at, updated_at) VALUES
    (booking_cancelled_id, 'Family emergency - unable to travel', 7500.00, 'completed', 'Full refund processed within 24 hours', 'REF-2024-001', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),
    (booking_completed2_id, 'AC not working properly during stay', 500.00, 'completed', 'Partial refund as compensation', 'REF-2024-002', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months' + INTERVAL '2 days', 1, NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months' + INTERVAL '2 days'),
    (booking_completed1_id, 'Requested refund but non-refundable', 0.00, 'rejected', 'Policy clearly states non-refundable', NULL, NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', 1, NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months');
END $$;

-- ================================================================
-- EMAIL TEMPLATES DATA
-- ================================================================
INSERT INTO email_templates (name, type, subject, body, variables, is_active, created_at, updated_at) VALUES
('booking_confirmation', 'booking', 'Booking Confirmation - {{booking_reference}}', 
'Dear {{customer_name}},

Your booking has been confirmed!

Booking Reference: {{booking_reference}}
Check-in: {{check_in_date}}
Check-out: {{check_out_date}}
Total: {{total_amount}}

Best regards,
mLodge Hotel Team', 
'["customer_name", "booking_reference", "check_in_date", "check_out_date", "total_amount"]'::jsonb, 
true, NOW() - INTERVAL '6 months', NOW()),

('payment_receipt', 'payment', 'Payment Receipt - {{transaction_id}}', 
'Dear {{customer_name}},

Payment of {{amount}} received.

Transaction ID: {{transaction_id}}

Thank you!', 
'["customer_name", "amount", "transaction_id"]'::jsonb, 
true, NOW() - INTERVAL '6 months', NOW());

-- ================================================================
-- REPORTS DATA
-- ================================================================
INSERT INTO reports (name, type, period, date_from, date_to, format, filters, status, file_path, file_name, file_size, generated_by, created_at, updated_at) VALUES
('Monthly Revenue - Oct 2024', 'revenue', 'monthly', '2024-10-01', '2024-10-31', 'pdf', '{}'::jsonb, 'completed', '/reports/', 'revenue_2024_10.pdf', 245678, 1, NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('Booking Analytics Q3', 'bookings', 'custom', '2024-07-01', '2024-09-30', 'pdf', '{}'::jsonb, 'completed', '/reports/', 'bookings_q3_2024.pdf', 198234, 1, NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('November Customer Report', 'guests', 'monthly', '2024-11-01', '2024-11-30', 'excel', '{}'::jsonb, 'pending', NULL, NULL, NULL, 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day');

-- ================================================================
-- ADMIN AUDIT LOGS DATA
-- ================================================================
INSERT INTO admin_audit_logs (user_id, user_email, user_name, action, module, details, ip_address, user_agent, created_at) VALUES
(1, 'Admin@mlodgehotel.co.za', 'Admin User', 'create', 'bookings', '{"booking_id": 1, "status": "confirmed"}'::jsonb, '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL '5 months'),
(1, 'Admin@mlodgehotel.co.za', 'Admin User', 'update', 'bookings', '{"booking_id": 13, "status": "cancelled"}'::jsonb, '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL '5 days'),
(1, 'Admin@mlodgehotel.co.za', 'Admin User', 'create', 'promo_codes', '{"code": "EARLYBIRD"}'::jsonb, '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL '1 day'),
(1, 'Admin@mlodgehotel.co.za', 'Admin User', 'approve', 'reviews', '{"review_id": 1, "rating": 5}'::jsonb, '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL '4 months'),
(1, 'Admin@mlodgehotel.co.za', 'Admin User', 'process', 'refunds', '{"refund_id": 1, "amount": 9000}'::jsonb, '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL '3 days');

-- ================================================================
-- SUMMARY
-- ================================================================
SELECT 'Data seeding completed successfully!' as message;

SELECT 
    'Summary' as info,
    (SELECT COUNT(*) FROM users WHERE role = 'user') as customers,
    (SELECT COUNT(*) FROM accommodations) as accommodations,
    (SELECT COUNT(*) FROM rooms) as rooms,
    (SELECT COUNT(*) FROM bookings) as bookings,
    (SELECT COUNT(*) FROM reviews) as reviews,
    (SELECT COUNT(*) FROM promo_codes) as promo_codes,
    (SELECT COUNT(*) FROM inquiries) as inquiries,
    (SELECT COUNT(*) FROM refunds) as refunds,
    (SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) FROM reviews WHERE status = 'approved') as avg_rating;
