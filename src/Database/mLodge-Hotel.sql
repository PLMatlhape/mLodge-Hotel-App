



 

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
 




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




 

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255), 
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
 

CREATE TABLE IF NOT EXISTS oauth_providers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, 
    provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);
 



 

CREATE TABLE IF NOT EXISTS accommodations (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
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
 

CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    accommodation_id INTEGER NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
 

CREATE TABLE IF NOT EXISTS amenities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50), 
    description TEXT
);
 

CREATE TABLE IF NOT EXISTS accommodation_amenities (
    accommodation_id INTEGER NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    amenity_id INTEGER NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (accommodation_id, amenity_id)
);
 

CREATE TABLE IF NOT EXISTS policies (
    id SERIAL PRIMARY KEY,
    accommodation_id INTEGER NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    policy_type VARCHAR(50) NOT NULL, 
    title VARCHAR(150),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
 



 

CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    accommodation_id INTEGER NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, 
    description TEXT,
    capacity INT NOT NULL DEFAULT 2, 
    beds INT DEFAULT 1,
    price_per_night NUMERIC(10,2) NOT NULL,
    refundable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
 

CREATE TABLE IF NOT EXISTS room_inventory (
    id BIGSERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available_units INT NOT NULL CHECK (available_units >= 0),
    UNIQUE (room_id, date)
);
 



 

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accommodation_id INTEGER NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    total_price NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ZAR',
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guest_count INT NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (check_out_date > check_in_date)
);
 

CREATE TABLE IF NOT EXISTS booking_items (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    price_per_night NUMERIC(10,2) NOT NULL, 
    nights INT NOT NULL CHECK (nights > 0),
    quantity INT NOT NULL CHECK (quantity > 0), 
    created_at TIMESTAMPTZ DEFAULT NOW()
);
 

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ZAR',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_provider VARCHAR(50), 
    provider_reference VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
 



 

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accommodation_id INTEGER NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(150),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, accommodation_id)
);
 

CREATE TABLE IF NOT EXISTS favourites (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accommodation_id INTEGER NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, accommodation_id)
);
 

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, 
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
 



 

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'amount')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS refunds (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    refund_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    admin_notes TEXT,
    transaction_id VARCHAR(100),
    requested_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_date TIMESTAMP,
    processed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to INTEGER REFERENCES users(id),
    responded_by INTEGER REFERENCES users(id),
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('bookings', 'revenue', 'occupancy', 'guests', 'custom')),
    period VARCHAR(50) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
    date_from DATE,
    date_to DATE,
    format VARCHAR(20) NOT NULL CHECK (format IN ('pdf', 'csv', 'excel')),
    filters JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    error_message TEXT,
    generated_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 



 
CREATE INDEX IF NOT EXISTS idx_accommodations_city ON accommodations(city);
CREATE INDEX IF NOT EXISTS idx_accommodations_active ON accommodations(is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_accommodation ON rooms(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_room_inventory_lookup ON room_inventory(room_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_accommodation ON bookings(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_accommodation ON reviews(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);


CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON admin_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON admin_audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin_audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);

CREATE INDEX IF NOT EXISTS idx_refunds_booking_id ON refunds(booking_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_requested_date ON refunds(requested_date);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_priority ON inquiries(priority);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(guest_email);

CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_generated_by ON reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

INSERT INTO users (email, name, password, role, is_active) VALUES
    ('Admin@mlodgehotel.co.za', 'Admin User', '$2b$10$8ZQ733NypVBRbKAf3StfKeSPmy6U7qzOH7h1BDrHQhoSVIV18vFlS', 'admin', true)
ON CONFLICT (email) DO NOTHING;
 
INSERT INTO amenities (name, description) VALUES
    ('Free WiFi', 'High-speed wireless internet'),
    ('Swimming Pool', 'Outdoor swimming pool'),
    ('Gym', 'Fitness center with modern equipment'),
    ('Parking', 'Free on-site parking'),
    ('Restaurant', 'On-site dining facility'),
    ('Air Conditioning', 'Climate control in all rooms')
ON CONFLICT (name) DO NOTHING;

INSERT INTO accommodations (name, description, address, city, country, postal_code, star_rating, is_active) VALUES
    ('mLodge Hotel Cape Town', 'Luxury beachfront hotel with stunning ocean views', '123 Beach Road, Sea Point', 'Cape Town', 'South Africa', '8005', 5, true),
    ('mLodge Hotel Johannesburg', 'Modern business hotel in the heart of Sandton', '456 Sandton Drive', 'Johannesburg', 'South Africa', '2196', 4, true),
    ('mLodge Hotel Durban', 'Coastal resort with world-class amenities', '789 Marine Parade', 'Durban', 'South Africa', '4001', 5, true)
ON CONFLICT DO NOTHING;


INSERT INTO promo_codes (code, description, discount_type, discount_value, min_purchase_amount, usage_limit, valid_from, valid_until, is_active)
VALUES
    ('WELCOME10', 'Welcome discount for new users', 'percentage', 10.00, 100.00, 1000, '2024-01-01', '2024-12-31', true),
    ('SUMMER2024', 'Summer season discount', 'percentage', 20.00, 200.00, 500, '2024-06-01', '2024-08-31', true),
    ('SAVE50', 'Fixed $50 discount', 'amount', 50.00, 300.00, 200, '2024-01-01', '2024-12-31', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO inquiries (guest_name, guest_email, subject, message, status, priority)
VALUES
    ('John Smith', 'john.smith@email.com', 'Question about amenities', 'Do you have parking facilities available?', 'new', 'medium'),
    ('Sarah Johnson', 'sarah.j@email.com', 'Booking modification request', 'I need to change my check-in date', 'in_progress', 'high'),
    ('Mike Davis', 'mike.d@email.com', 'Payment issue', 'My payment failed but amount was deducted', 'resolved', 'urgent');


INSERT INTO email_templates (name, type, subject, body, variables, is_active)
VALUES
    (
        'Booking Confirmation',
        'booking',
        'Booking Confirmation - {{bookingReference}}',
        'Dear {{guestName}},

Your booking has been confirmed!

Booking Reference: {{bookingReference}}
Accommodation: {{accommodationName}}
Check-in: {{checkInDate}}
Check-out: {{checkOutDate}}
Total Amount: ${{totalAmount}}

Thank you for choosing mLodge Hotel!

Best regards,
mLodge Team',
        '["guestName", "bookingReference", "accommodationName", "checkInDate", "checkOutDate", "totalAmount"]',
        true
    ),
    (
        'Welcome Email',
        'welcome',
        'Welcome to mLodge Hotel - {{userName}}',
        'Dear {{userName}},

Welcome to mLodge Hotel! We''re excited to have you join our community.

Your account has been successfully created. You can now browse and book our luxurious accommodations.

Best regards,
mLodge Team',
        '["userName"]',
        true
    ),
    (
        'Booking Cancellation',
        'cancellation',
        'Booking Cancelled - {{bookingReference}}',
        'Dear {{guestName}},

Your booking {{bookingReference}} has been cancelled as requested.

Refund Amount: ${{refundAmount}}
Refund Status: {{refundStatus}}

If you have any questions, please contact our support team.

Best regards,
mLodge Team',
        '["guestName", "bookingReference", "refundAmount", "refundStatus"]',
        true
    ),
    (
        'Password Reset',
        'password_reset',
        'Password Reset Request',
        'Dear {{userName}},

We received a request to reset your password.

Reset Link: {{resetLink}}

This link will expire in 1 hour.

If you didn''t request this, please ignore this email.

Best regards,
mLodge Team',
        '["userName", "resetLink"]',
        true
    );

DO $$
BEGIN
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reviews' AND column_name='status') THEN
        ALTER TABLE reviews ADD COLUMN status VARCHAR(20) DEFAULT 'pending' 
            CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;

    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reviews' AND column_name='reviewed_by') THEN
        ALTER TABLE reviews ADD COLUMN reviewed_by INTEGER REFERENCES users(id);
    END IF;

    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reviews' AND column_name='reviewed_at') THEN
        ALTER TABLE reviews ADD COLUMN reviewed_at TIMESTAMP;
    END IF;

    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reviews' AND column_name='rejection_reason') THEN
        ALTER TABLE reviews ADD COLUMN rejection_reason TEXT;
    END IF;

    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reviews' AND column_name='is_flagged') THEN
        ALTER TABLE reviews ADD COLUMN is_flagged BOOLEAN DEFAULT false;
    END IF;

    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reviews' AND column_name='flag_reason') THEN
        ALTER TABLE reviews ADD COLUMN flag_reason TEXT;
    END IF;

    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reviews' AND column_name='flagged_by') THEN
        ALTER TABLE reviews ADD COLUMN flagged_by INTEGER REFERENCES users(id);
    END IF;

    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reviews' AND column_name='flagged_at') THEN
        ALTER TABLE reviews ADD COLUMN flagged_at TIMESTAMP;
    END IF;
END $$;


CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_flagged ON reviews(is_flagged);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
 
 
COMMENT ON TABLE users IS 'User accounts for authentication and profiles';
COMMENT ON TABLE accommodations IS 'Hotel/property listings';
COMMENT ON TABLE rooms IS 'Room types and pricing';
COMMENT ON TABLE bookings IS 'Customer reservations';
COMMENT ON TABLE payments IS 'Payment transactions';
COMMENT ON TABLE reviews IS 'User reviews and ratings with moderation';
COMMENT ON TABLE promo_codes IS 'Discount codes for bookings';
COMMENT ON TABLE refunds IS 'Refund requests and processing';
COMMENT ON TABLE inquiries IS 'Customer support inquiries';
COMMENT ON TABLE email_templates IS 'Email templates for automated communications';
COMMENT ON TABLE reports IS 'Generated reports metadata';
COMMENT ON TABLE admin_audit_logs IS 'Admin action tracking for security';


SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;


SELECT 'promo_codes' as table_name, COUNT(*) as record_count FROM promo_codes
UNION ALL
SELECT 'refunds', COUNT(*) FROM refunds
UNION ALL
SELECT 'inquiries', COUNT(*) FROM inquiries
UNION ALL
SELECT 'email_templates', COUNT(*) FROM email_templates
UNION ALL
SELECT 'reports', COUNT(*) FROM reports
UNION ALL
SELECT 'admin_audit_logs', COUNT(*) FROM admin_audit_logs;


SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
    AND column_name IN ('status', 'reviewed_by', 'reviewed_at', 'is_flagged')
ORDER BY column_name;


DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Core Tables: users, oauth_providers, accommodations, photos, amenities, accommodation_amenities, policies, rooms, room_inventory, bookings, booking_items, payments, reviews, favourites, notifications';
    RAISE NOTICE '🔧 Admin Tables: promo_codes, refunds, inquiries, email_templates, reports, admin_audit_logs';
    RAISE NOTICE '✨ Reviews table updated with moderation columns';
    RAISE NOTICE '🎉 Backend integration ready for testing!';
END $$;
