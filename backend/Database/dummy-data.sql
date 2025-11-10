-- Dummy Data for mLodge Hotel App
-- This file contains sample data for testing all API endpoints

-- Insert Users (including admin)
INSERT INTO users (email, name, phone, password, role, is_active) VALUES
('admin@mlodge.com', 'Admin User', '+27123456789', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true), -- password: password
('john.doe@example.com', 'John Doe', '+27123456790', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', true),
('jane.smith@example.com', 'Jane Smith', '+27123456791', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', true),
('mike.johnson@example.com', 'Mike Johnson', '+27123456792', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', true),
('sarah.wilson@example.com', 'Sarah Wilson', '+27123456793', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', true),
('staff@mlodge.com', 'Hotel Staff', '+27123456794', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true);

-- Insert Amenities
INSERT INTO amenities (name, icon, description) VALUES
('WiFi', 'wifi', 'High-speed wireless internet'),
('Parking', 'car', 'Free parking available'),
('Pool', 'pool', 'Swimming pool access'),
('Gym', 'dumbbell', 'Fitness center'),
('Restaurant', 'utensils', 'On-site dining'),
('Room Service', 'concierge-bell', '24/7 room service'),
('Air Conditioning', 'snowflake', 'Climate control'),
('TV', 'tv', 'Cable television'),
('Mini Bar', 'glass-martini', 'In-room refreshments'),
('Safe', 'lock', 'In-room safe');

-- Insert Accommodations
INSERT INTO accommodations (owner_id, name, description, address, city, country, postal_code, latitude, longitude, star_rating, base_currency, is_active) VALUES
(1, 'Cape Town Luxury Hotel', 'A premium hotel overlooking Table Mountain with world-class amenities.', '1 Table Mountain Rd', 'Cape Town', 'South Africa', '8001', -33.9249, 18.4241, 5, 'ZAR', true),
(1, 'Johannesburg Business Hotel', 'Modern business hotel in the heart of Sandton.', '123 Sandton Dr', 'Johannesburg', 'South Africa', '2196', -26.1076, 28.0567, 4, 'ZAR', true),
(1, 'Durban Beach Resort', 'Beachfront resort with stunning ocean views.', '456 Beach Rd', 'Durban', 'South Africa', '4001', -29.8587, 31.0218, 4, 'ZAR', true),
(1, 'Pretoria Boutique Hotel', 'Charming boutique hotel in the capital city.', '789 Church St', 'Pretoria', 'South Africa', '0001', -25.7479, 28.2293, 3, 'ZAR', true);

-- Insert Accommodation Amenities
INSERT INTO accommodation_amenities (accommodation_id, amenity_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(2, 1), (2, 2), (2, 4), (2, 5), (2, 7), (2, 8), (2, 10),
(3, 1), (3, 2), (3, 3), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9),
(4, 1), (4, 7), (4, 8), (4, 10);

-- Insert Rooms
INSERT INTO rooms (accommodation_id, name, description, capacity, beds, price_per_night, refundable, location, baths, area, type, amenities, room_features, quantity, status) VALUES
(1, 'Deluxe Mountain View', 'Spacious room with panoramic Table Mountain views', 2, 1, 2500.00, true, 'Floor 5', 1, 35, 'Deluxe', '["WiFi", "Air Conditioning", "TV", "Mini Bar", "Safe"]', '["Mountain View", "Balcony", "Work Desk"]', 10, 'available'),
(1, 'Executive Suite', 'Luxury suite with separate living area', 4, 2, 4500.00, true, 'Floor 8', 2, 65, 'Suite', '["WiFi", "Air Conditioning", "TV", "Mini Bar", "Safe"]', '["Mountain View", "Balcony", "Living Room", "Kitchenette"]', 5, 'available'),
(1, 'Standard Room', 'Comfortable standard room', 2, 1, 1800.00, true, 'Floor 3', 1, 25, 'Standard', '["WiFi", "Air Conditioning", "TV"]', '["City View"]', 15, 'available'),
(2, 'Business Suite', 'Perfect for business travelers', 2, 1, 2200.00, true, 'Floor 6', 1, 30, 'Deluxe', '["WiFi", "Air Conditioning", "TV", "Safe"]', '["Work Desk", "Ergonomic Chair", "Coffee Machine"]', 8, 'available'),
(2, 'Standard Business', 'Standard room for business stays', 2, 1, 1600.00, true, 'Floor 4', 1, 22, 'Standard', '["WiFi", "Air Conditioning", "TV"]', '["Work Desk"]', 12, 'available'),
(3, 'Ocean View Deluxe', 'Room with stunning ocean views', 2, 1, 2800.00, true, 'Floor 7', 1, 32, 'Deluxe', '["WiFi", "Air Conditioning", "TV", "Mini Bar", "Safe"]', '["Ocean View", "Balcony", "Beach Access"]', 6, 'available'),
(3, 'Beachfront Suite', 'Luxury suite right on the beach', 4, 2, 5200.00, true, 'Ground Floor', 2, 70, 'Suite', '["WiFi", "Air Conditioning", "TV", "Mini Bar", "Safe"]', '["Ocean View", "Private Terrace", "Beach Access", "Jacuzzi"]', 3, 'available'),
(4, 'Boutique Room', 'Charming room in historic building', 2, 1, 1400.00, true, 'Floor 2', 1, 20, 'Standard', '["WiFi", "Air Conditioning", "TV"]', '["Historic Charm", "Antique Furniture"]', 10, 'available');

-- Insert Room Photos
INSERT INTO room_photos (room_id, url, caption, sort_order) VALUES
(1, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 'Mountain view from balcony', 1),
(1, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 'Luxurious bedroom', 2),
(2, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 'Executive suite living area', 1),
(2, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 'Suite bedroom', 2),
(3, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 'Standard room interior', 1),
(4, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'Business suite workspace', 1),
(5, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', 'Business room', 1),
(6, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 'Ocean view room', 1),
(7, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', 'Beachfront suite', 1),
(8, 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800', 'Boutique room', 1);

-- Insert Room Inventory (for next 30 days)
INSERT INTO room_inventory (room_id, date, available_units)
SELECT r.id, d::date, CASE WHEN random() < 0.1 THEN 0 ELSE r.quantity END
FROM rooms r
CROSS JOIN generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', INTERVAL '1 day') d;

-- Insert Bookings
INSERT INTO bookings (booking_reference, user_id, accommodation_id, status, total_price, currency, check_in_date, check_out_date, guest_count, notes, source) VALUES
('BK2024001', 2, 1, 'confirmed', 5000.00, 'ZAR', '2024-02-15', '2024-02-17', 2, 'Late check-in requested', 'Website'),
('BK2024002', 3, 2, 'pending', 3200.00, 'ZAR', '2024-02-20', '2024-02-22', 1, 'Business trip', 'Website'),
('BK2024003', 4, 3, 'confirmed', 5600.00, 'ZAR', '2024-02-18', '2024-02-20', 2, 'Anniversary celebration', 'Mobile App'),
('BK2024004', 5, 1, 'cancelled', 2500.00, 'ZAR', '2024-02-25', '2024-02-26', 1, 'Travel plans changed', 'Phone'),
('BK2024005', 2, 4, 'confirmed', 2800.00, 'ZAR', '2024-02-22', '2024-02-24', 2, 'Weekend getaway', 'Website');

-- Insert Booking Items
INSERT INTO booking_items (booking_id, room_id, price_per_night, nights, quantity) VALUES
(1, 1, 2500.00, 2, 1),
(2, 4, 2200.00, 2, 1),
(3, 6, 2800.00, 2, 1),
(4, 1, 2500.00, 1, 1),
(5, 8, 1400.00, 2, 1);

-- Insert Payments
INSERT INTO payments (booking_id, user_id, amount, currency, status, payment_provider, provider_reference) VALUES
(1, 2, 5000.00, 'ZAR', 'completed', 'Stripe', 'pi_1234567890'),
(2, 3, 3200.00, 'ZAR', 'pending', 'PayPal', 'PAY123456'),
(3, 4, 5600.00, 'ZAR', 'completed', 'Stripe', 'pi_0987654321'),
(4, 5, 2500.00, 'ZAR', 'refunded', 'Stripe', 'pi_1122334455'),
(5, 2, 2800.00, 'ZAR', 'completed', 'PayPal', 'PAY789012');

-- Insert Reviews
INSERT INTO reviews (user_id, accommodation_id, rating, title, comment, status, reviewed_by, reviewed_at) VALUES
(2, 1, 5, 'Amazing experience!', 'The view from the room was breathtaking. Staff was very helpful and the amenities were top-notch.', 'approved', 1, CURRENT_TIMESTAMP),
(3, 2, 4, 'Great business hotel', 'Perfect location for business meetings. Clean rooms and good WiFi.', 'approved', 1, CURRENT_TIMESTAMP),
(4, 3, 5, 'Perfect beach getaway', 'The ocean view rooms are stunning. Beach access was convenient.', 'approved', 1, CURRENT_TIMESTAMP),
(5, 4, 3, 'Charming but basic', 'Nice historic building but rooms could use some updating.', 'approved', 1, CURRENT_TIMESTAMP),
(2, 3, 4, 'Relaxing stay', 'Great pool and beach access. Would recommend for a vacation.', 'pending', NULL, NULL);

-- Insert Favourites
INSERT INTO favourites (user_id, accommodation_id) VALUES
(2, 1), (2, 3), (3, 2), (4, 3), (5, 1), (5, 4);

-- Insert Inquiries
INSERT INTO inquiries (guest_name, guest_email, subject, message, status, priority, assigned_to, responded_by, responded_at, response) VALUES
('Alice Johnson', 'alice@example.com', 'Room availability inquiry', 'I would like to know if you have availability for 4 people in March.', 'responded', 'medium', 1, 1, CURRENT_TIMESTAMP, 'Yes, we have several suites available in March. Please check our website for booking.'),
('Bob Smith', 'bob@example.com', 'Special requests', 'I need a room with wheelchair accessibility for my elderly mother.', 'new', 'high', NULL, NULL, NULL, NULL),
('Carol Davis', 'carol@example.com', 'Group booking', 'Planning a corporate retreat for 20 people. Can you provide a quote?', 'responded', 'high', 1, 1, CURRENT_TIMESTAMP, 'We can accommodate groups up to 20. Please contact our events team for a custom quote.');

-- Insert Refunds
INSERT INTO refunds (booking_id, reason, refund_amount, status, admin_notes, transaction_id, processed_by, processed_date) VALUES
(4, 'Customer requested cancellation', 2500.00, 'approved', 'Full refund processed as per policy', 'REF123456', 1, CURRENT_TIMESTAMP);

-- Insert Promo Codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_purchase_amount, usage_limit, usage_count, valid_from, valid_until, is_active) VALUES
('WELCOME10', '10% off for new customers', 'percentage', 10.00, 1000.00, 100, 5, CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', true),
('SUMMER20', '20% off summer bookings', 'percentage', 20.00, 2000.00, 50, 12, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months', true),
('FLAT500', 'R500 off bookings over R3000', 'fixed', 500.00, 3000.00, 25, 8, CURRENT_DATE, CURRENT_DATE + INTERVAL '2 months', true);

-- Insert Email Templates
INSERT INTO email_templates (name, type, subject, body, variables, is_active) VALUES
('Booking Confirmation', 'booking', 'Your booking is confirmed - {{booking_reference}}', 'Dear {{guest_name}},

Your booking has been confirmed!

Booking Details:
- Reference: {{booking_reference}}
- Check-in: {{check_in_date}}
- Check-out: {{check_out_date}}
- Total: {{total_price}} {{currency}}

Thank you for choosing mLodge!

Best regards,
mLodge Team', '["booking_reference", "guest_name", "check_in_date", "check_out_date", "total_price", "currency"]', true),
('Payment Receipt', 'payment', 'Payment receipt for booking {{booking_reference}}', 'Dear {{guest_name}},

Your payment has been processed successfully.

Amount: {{amount}} {{currency}}
Booking Reference: {{booking_reference}}

Thank you for your business!

Best regards,
mLodge Team', '["guest_name", "amount", "currency", "booking_reference"]', true);

-- Insert Policies
INSERT INTO policies (accommodation_id, policy_type, title, content) VALUES
(1, 'check_in', 'Check-in Policy', 'Check-in time is 14:00. Early check-in may be available upon request.'),
(1, 'check_out', 'Check-out Policy', 'Check-out time is 11:00. Late check-out may incur additional charges.'),
(1, 'cancellation', 'Cancellation Policy', 'Free cancellation up to 24 hours before check-in. Late cancellations may incur charges.'),
(2, 'check_in', 'Check-in Policy', 'Check-in time is 15:00. Business center available 24/7.'),
(2, 'parking', 'Parking Policy', 'Free valet parking available for all guests.'),
(3, 'beach', 'Beach Access', 'Direct beach access available. Life guards on duty during peak hours.'),
(4, 'pets', 'Pet Policy', 'Pets are welcome with prior arrangement. Additional cleaning fee may apply.');

-- Insert Currency Rates
INSERT INTO currency_rates (base_currency, target_currency, rate, effective_date) VALUES
('ZAR', 'USD', 0.055, CURRENT_DATE),
('ZAR', 'EUR', 0.050, CURRENT_DATE),
('ZAR', 'GBP', 0.043, CURRENT_DATE),
('USD', 'ZAR', 18.20, CURRENT_DATE),
('EUR', 'ZAR', 20.00, CURRENT_DATE),
('GBP', 'ZAR', 23.50, CURRENT_DATE);

-- Insert Notifications
INSERT INTO notifications (user_id, type, message, is_read) VALUES
(2, 'booking_confirmed', 'Your booking BK2024001 has been confirmed', true),
(3, 'payment_pending', 'Payment for booking BK2024002 is pending', false),
(4, 'booking_reminder', 'Reminder: Check-in tomorrow for booking BK2024003', false),
(5, 'refund_processed', 'Refund of R2500.00 processed for booking BK2024004', true);

-- Insert Admin Audit Logs
INSERT INTO admin_audit_logs (user_id, user_email, user_name, action, module, details, ip_address, user_agent) VALUES
(1, 'admin@mlodge.com', 'Admin User', 'CREATE', 'accommodations', '{"accommodation_id": 1, "name": "Cape Town Luxury Hotel"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'admin@mlodge.com', 'Admin User', 'APPROVE', 'reviews', '{"review_id": 1, "rating": 5}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'admin@mlodge.com', 'Admin User', 'PROCESS', 'refunds', '{"refund_id": 1, "amount": 2500}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

-- Insert Reports
INSERT INTO reports (name, type, period, date_from, date_to, format, status, generated_by, file_path, file_name, file_size) VALUES
('Monthly Revenue Report', 'financial', 'monthly', '2024-01-01', '2024-01-31', 'pdf', 'completed', 1, '/reports/monthly_revenue_2024_01.pdf', 'monthly_revenue_2024_01.pdf', 245760),
('Occupancy Report', 'operational', 'weekly', '2024-02-01', '2024-02-07', 'excel', 'completed', 1, '/reports/occupancy_2024_w05.xlsx', 'occupancy_2024_w05.xlsx', 184320),
('Customer Satisfaction', 'analytics', 'quarterly', '2024-01-01', '2024-03-31', 'pdf', 'pending', 1, NULL, NULL, NULL);

-- Insert User Tokens (for password reset, etc.)
INSERT INTO user_tokens (user_id, token, token_type, expires_at) VALUES
(2, 'reset_token_123456', 'password_reset', CURRENT_TIMESTAMP + INTERVAL '1 hour'),
(3, 'email_verify_789012', 'email_verification', CURRENT_TIMESTAMP + INTERVAL '24 hours');

-- Insert Login Audit Logs
INSERT INTO login_audit_logs (user_id, ip_address, user_agent, success) VALUES
(1, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', true),
(2, '10.0.0.50', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', true),
(3, '172.16.0.25', 'Mozilla/5.0 (Android 11; Mobile) AppleWebKit/537.36', false);

-- Insert Change Audit Logs
INSERT INTO change_audit_logs (table_name, record_id, user_id, action, changes) VALUES
('bookings', 1, 1, 'UPDATE', '{"status": {"old": "pending", "new": "confirmed"}}'),
('users', 2, 2, 'UPDATE', '{"phone": {"old": "+27123456790", "new": "+27123456791"}}'),
('rooms', 1, 1, 'UPDATE', '{"price_per_night": {"old": 2400.00, "new": 2500.00}}');

-- Insert OAuth Providers (sample social logins)
INSERT INTO oauth_providers (user_id, provider, provider_user_id) VALUES
(2, 'google', 'google_user_12345'),
(3, 'facebook', 'facebook_user_67890');

-- Insert Payment Transactions
INSERT INTO payment_transactions (payment_id, provider_event) VALUES
(1, '{"event_type": "payment.succeeded", "amount": 500000, "currency": "zar"}'),
(3, '{"event_type": "payment.succeeded", "amount": 560000, "currency": "zar"}');

-- Insert Query Logs (sample performance monitoring)
INSERT INTO query_logs (query, duration_ms) VALUES
('SELECT * FROM bookings WHERE user_id = $1', 45.67),
('SELECT * FROM accommodations WHERE city = $1', 23.45),
('SELECT COUNT(*) FROM reviews WHERE accommodation_id = $1', 12.34);
