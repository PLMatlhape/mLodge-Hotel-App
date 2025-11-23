-- Analytics Enhancement SQL
-- Add tracking columns and indexes for better analytics performance

-- Add source tracking to bookings table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='source') THEN
        ALTER TABLE bookings ADD COLUMN source VARCHAR(50) DEFAULT 'Website';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='booking_reference') THEN
        ALTER TABLE bookings ADD COLUMN booking_reference VARCHAR(100) UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='payment_status') THEN
        ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
    END IF;
END $$;

-- Add room_type to rooms if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='rooms' AND column_name='room_type') THEN
        ALTER TABLE rooms ADD COLUMN room_type VARCHAR(100) DEFAULT 'Standard';
    END IF;
END $$;

-- Create analytics_snapshots table for historical data
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id SERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    total_accommodations INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    occupancy_rate DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date)
);

-- Create daily_stats table for granular tracking
CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
    new_bookings INTEGER DEFAULT 0,
    cancelled_bookings INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    check_ins INTEGER DEFAULT 0,
    check_outs INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stat_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_source ON bookings(source);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Function to update daily stats (run daily via cron)
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_stats (
        stat_date,
        new_bookings,
        cancelled_bookings,
        revenue,
        new_users,
        check_ins,
        check_outs
    )
    SELECT
        CURRENT_DATE,
        (SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM bookings WHERE DATE(updated_at) = CURRENT_DATE AND status = 'cancelled'),
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings 
         WHERE DATE(created_at) = CURRENT_DATE AND status IN ('confirmed', 'completed')),
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM bookings WHERE check_in_date = CURRENT_DATE),
        (SELECT COUNT(*) FROM bookings WHERE check_out_date = CURRENT_DATE)
    ON CONFLICT (stat_date) 
    DO UPDATE SET
        new_bookings = EXCLUDED.new_bookings,
        cancelled_bookings = EXCLUDED.cancelled_bookings,
        revenue = EXCLUDED.revenue,
        new_users = EXCLUDED.new_users,
        check_ins = EXCLUDED.check_ins,
        check_outs = EXCLUDED.check_outs;
END;
$$ LANGUAGE plpgsql;

-- Function to create analytics snapshot
CREATE OR REPLACE FUNCTION create_analytics_snapshot()
RETURNS VOID AS $$
BEGIN
    INSERT INTO analytics_snapshots (
        snapshot_date,
        total_bookings,
        total_revenue,
        total_users,
        total_accommodations,
        average_rating,
        occupancy_rate
    )
    SELECT
        CURRENT_DATE,
        (SELECT COUNT(*) FROM bookings),
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status IN ('confirmed', 'completed')),
        (SELECT COUNT(*) FROM users WHERE is_active = true),
        (SELECT COUNT(*) FROM accommodations WHERE is_active = true),
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE status = 'approved'),
        (SELECT 
            CASE 
                WHEN (SELECT SUM(quantity) FROM rooms WHERE is_active = true) > 0 
                THEN (
                    SELECT COUNT(DISTINCT DATE(d.date)) * 100.0 / 
                           (30 * (SELECT SUM(quantity) FROM rooms WHERE is_active = true))
                    FROM bookings b
                    CROSS JOIN LATERAL generate_series(
                        GREATEST(b.check_in_date, CURRENT_DATE - INTERVAL '30 days'),
                        LEAST(b.check_out_date - INTERVAL '1 day', CURRENT_DATE),
                        '1 day'::interval
                    ) AS d(date)
                    WHERE b.status IN ('confirmed', 'completed')
                )
                ELSE 0
            END
        )
    ON CONFLICT (snapshot_date)
    DO UPDATE SET
        total_bookings = EXCLUDED.total_bookings,
        total_revenue = EXCLUDED.total_revenue,
        total_users = EXCLUDED.total_users,
        total_accommodations = EXCLUDED.total_accommodations,
        average_rating = EXCLUDED.average_rating,
        occupancy_rate = EXCLUDED.occupancy_rate;
END;
$$ LANGUAGE plpgsql;

-- Update booking_reference for existing bookings if null
UPDATE bookings 
SET booking_reference = 'BK' || LPAD(id::TEXT, 6, '0')
WHERE booking_reference IS NULL;

-- Update source for existing bookings if null
UPDATE bookings 
SET source = 'Website'
WHERE source IS NULL;

-- Update room_type for existing rooms if null  
UPDATE rooms
SET room_type = CASE
    WHEN name ILIKE '%suite%' THEN 'Suite'
    WHEN name ILIKE '%deluxe%' THEN 'Deluxe'
    WHEN name ILIKE '%premium%' THEN 'Premium'
    WHEN name ILIKE '%standard%' THEN 'Standard'
    ELSE 'Standard'
END
WHERE room_type IS NULL;

-- Create initial snapshot
SELECT create_analytics_snapshot();

-- Create view for quick analytics queries
CREATE OR REPLACE VIEW v_booking_analytics AS
SELECT 
    DATE_TRUNC('month', b.created_at) as month,
    DATE_TRUNC('week', b.created_at) as week,
    DATE(b.created_at) as day,
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE b.status = 'confirmed') as confirmed_bookings,
    COUNT(*) FILTER (WHERE b.status = 'cancelled') as cancelled_bookings,
    COUNT(*) FILTER (WHERE b.status = 'completed') as completed_bookings,
    COALESCE(SUM(b.total_price), 0) as total_revenue,
    COALESCE(SUM(b.total_price) FILTER (WHERE b.status IN ('confirmed', 'completed')), 0) as confirmed_revenue,
    COALESCE(AVG(b.total_price), 0) as avg_booking_value,
    COALESCE(AVG(EXTRACT(DAY FROM (b.check_out_date - b.check_in_date))), 0) as avg_stay_duration,
    COUNT(DISTINCT b.user_id) as unique_guests,
    COUNT(DISTINCT b.accommodation_id) as accommodations_booked
FROM bookings b
WHERE b.created_at >= CURRENT_DATE - INTERVAL '2 years'
GROUP BY DATE_TRUNC('month', b.created_at), DATE_TRUNC('week', b.created_at), DATE(b.created_at);

-- Create view for revenue analytics
CREATE OR REPLACE VIEW v_revenue_analytics AS
SELECT 
    DATE_TRUNC('month', p.created_at) as month,
    p.payment_method,
    p.status,
    COUNT(*) as transaction_count,
    COALESCE(SUM(p.amount), 0) / 100.0 as total_amount,
    COALESCE(AVG(p.amount), 0) / 100.0 as avg_transaction
FROM payments p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '2 years'
GROUP BY DATE_TRUNC('month', p.created_at), p.payment_method, p.status;

COMMENT ON TABLE analytics_snapshots IS 'Daily snapshots of key metrics for historical tracking';
COMMENT ON TABLE daily_stats IS 'Granular daily statistics for detailed analytics';
COMMENT ON VIEW v_booking_analytics IS 'Aggregated booking statistics by time period';
COMMENT ON VIEW v_revenue_analytics IS 'Revenue analytics by payment method and status';
