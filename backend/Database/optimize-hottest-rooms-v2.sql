-- Optimization script for hottest rooms query performance
-- This script adds indexes and optimizations to make the hottest rooms query faster

-- Add composite index for bookings join
CREATE INDEX IF NOT EXISTS idx_booking_items_room_booking 
ON booking_items(room_id, booking_id);

-- Add index for booking status filtering
CREATE INDEX IF NOT EXISTS idx_bookings_status_filter 
ON bookings(status) WHERE status IN ('confirmed', 'completed');

-- Add index for accommodations active status
CREATE INDEX IF NOT EXISTS idx_accommodations_active 
ON accommodations(is_active) WHERE is_active = true;

-- Add composite index for rooms filtering
CREATE INDEX IF NOT EXISTS idx_rooms_status_deleted 
ON rooms(status, deleted_at, accommodation_id) 
WHERE status = 'available' AND deleted_at IS NULL;

-- Add index for room photos primary sorting
CREATE INDEX IF NOT EXISTS idx_room_photos_sorting 
ON room_photos(room_id, is_primary DESC, sort_order ASC);

-- Create a materialized view for faster hottest rooms queries
-- This view can be refreshed periodically (e.g., every hour or daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_room_booking_counts AS
SELECT 
    r.id as room_id,
    r.accommodation_id,
    COUNT(bi.id) as booking_count,
    MAX(b.created_at) as last_booking_date
FROM rooms r
LEFT JOIN booking_items bi ON bi.room_id = r.id
LEFT JOIN bookings b ON b.id = bi.booking_id AND b.status IN ('confirmed', 'completed')
WHERE r.status = 'available' AND r.deleted_at IS NULL
GROUP BY r.id, r.accommodation_id;

-- Create indexes on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_room_booking_room_id 
ON mv_room_booking_counts(room_id);

CREATE INDEX IF NOT EXISTS idx_mv_room_booking_counts 
ON mv_room_booking_counts(booking_count DESC, last_booking_date DESC);

CREATE INDEX IF NOT EXISTS idx_mv_room_booking_accommodation 
ON mv_room_booking_counts(accommodation_id);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_room_booking_counts()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_room_booking_counts;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get hottest rooms using the materialized view
-- This will be much faster than the original query
CREATE OR REPLACE FUNCTION get_hottest_rooms_optimized()
RETURNS TABLE (
    id INTEGER,
    accommodation_id INTEGER,
    name VARCHAR,
    description TEXT,
    capacity INTEGER,
    beds INTEGER,
    price_per_night DECIMAL,
    refundable BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    location VARCHAR,
    baths INTEGER,
    area INTEGER,
    type VARCHAR,
    amenities TEXT,
    room_features TEXT,
    quantity INTEGER,
    status VARCHAR,
    accommodation_name VARCHAR,
    accommodation_city VARCHAR,
    booking_count BIGINT,
    photos JSON
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_rooms AS (
        SELECT r.*,
               a.name as accommodation_name,
               a.city as accommodation_city,
               COALESCE(mbc.booking_count, 0) as booking_count,
               COALESCE(json_agg(
                 DISTINCT jsonb_build_object('url', p.url, 'sort_order', p.sort_order, 'is_primary', p.is_primary)
                 ORDER BY p.is_primary DESC, p.sort_order ASC
               ) FILTER (WHERE p.id IS NOT NULL), '[]') as photos,
               ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY COALESCE(mbc.booking_count, 0) DESC, r.id DESC) as rn
        FROM rooms r
        INNER JOIN accommodations a ON a.id = r.accommodation_id AND a.is_active = true
        LEFT JOIN room_photos p ON p.room_id = r.id
        LEFT JOIN mv_room_booking_counts mbc ON mbc.room_id = r.id
        WHERE r.status = 'available' AND r.deleted_at IS NULL
        GROUP BY r.id, a.id, a.name, a.city, mbc.booking_count
    ),
    hottest_with_bookings AS (
        SELECT *
        FROM ranked_rooms
        WHERE rn = 1 AND booking_count > 0
        ORDER BY booking_count DESC, id DESC
        LIMIT 3
    ),
    hottest_count AS (
        SELECT COUNT(*) as cnt FROM hottest_with_bookings
    )
    SELECT 
        rr.id, rr.accommodation_id, rr.name, rr.description, rr.capacity, 
        rr.beds, rr.price_per_night, rr.refundable, rr.created_at, rr.updated_at, 
        rr.deleted_at, rr.location, rr.baths, rr.area, rr.type, rr.amenities, 
        rr.room_features, rr.quantity, rr.status, rr.accommodation_name, 
        rr.accommodation_city, rr.booking_count, rr.photos
    FROM (
        SELECT * FROM hottest_with_bookings
        UNION ALL
        SELECT *
        FROM (
            SELECT *
            FROM ranked_rooms
            WHERE rn = 1 
              AND id NOT IN (SELECT id FROM hottest_with_bookings)
              AND accommodation_id NOT IN (SELECT accommodation_id FROM hottest_with_bookings)
            ORDER BY price_per_night DESC, id DESC
            LIMIT (3 - (SELECT cnt FROM hottest_count))
        ) fill_rooms
        WHERE (SELECT cnt FROM hottest_count) < 3
    ) rr
    LIMIT 3;
END;
$$ LANGUAGE plpgsql;

-- Initial refresh of materialized view
SELECT refresh_room_booking_counts();

-- Comments for documentation
COMMENT ON MATERIALIZED VIEW mv_room_booking_counts IS 
'Cached booking counts per room for faster hottest rooms queries. Refresh periodically using refresh_room_booking_counts()';

COMMENT ON FUNCTION get_hottest_rooms_optimized() IS 
'Optimized function to get top 3 hottest rooms from different accommodations. Uses materialized view for performance.';

COMMENT ON FUNCTION refresh_room_booking_counts() IS 
'Refreshes the room booking counts materialized view. Run this periodically (hourly/daily) via cron or scheduler.';

-- Optional: Create a cron job to refresh the view every hour (requires pg_cron extension)
-- SELECT cron.schedule('refresh-room-bookings', '0 * * * *', 'SELECT refresh_room_booking_counts();');
