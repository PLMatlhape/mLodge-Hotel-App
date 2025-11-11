-- Performance Optimization for Hottest Rooms Query
-- Add indexes to speed up the most booked rooms query

-- Index for room status lookup
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status) WHERE deleted_at IS NULL;

-- Index for accommodation active status
CREATE INDEX IF NOT EXISTS idx_accommodations_active ON accommodations(is_active) WHERE is_active = true;

-- Composite index for booking items and room lookups
CREATE INDEX IF NOT EXISTS idx_booking_items_room_booking ON booking_items(room_id, booking_id);

-- Index for booking status filtering (confirmed/completed bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_status_confirmed ON bookings(status) WHERE status IN ('confirmed', 'completed');

-- Index for room photos ordered retrieval
CREATE INDEX IF NOT EXISTS idx_room_photos_room_order ON room_photos(room_id, is_primary DESC, sort_order ASC);

-- Composite index for rooms by accommodation
CREATE INDEX IF NOT EXISTS idx_rooms_accommodation_status ON rooms(accommodation_id, status) WHERE deleted_at IS NULL;

-- Add is_primary column to room_photos if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='room_photos' AND column_name='is_primary') THEN
        ALTER TABLE room_photos ADD COLUMN is_primary BOOLEAN DEFAULT false;
        
        -- Set the first photo of each room as primary
        WITH first_photos AS (
            SELECT DISTINCT ON (room_id) id, room_id
            FROM room_photos
            ORDER BY room_id, sort_order ASC, id ASC
        )
        UPDATE room_photos
        SET is_primary = true
        WHERE id IN (SELECT id FROM first_photos);
    END IF;
END $$;

-- Update analytics enhancement indexes if not already present
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_check_dates ON bookings(check_in_date, check_out_date);

-- Vacuum and analyze for better query planning
VACUUM ANALYZE rooms;
VACUUM ANALYZE bookings;
VACUUM ANALYZE booking_items;
VACUUM ANALYZE room_photos;
VACUUM ANALYZE accommodations;

-- Add comment
COMMENT ON INDEX idx_rooms_status IS 'Optimize hottest rooms query - filter available rooms';
COMMENT ON INDEX idx_booking_items_room_booking IS 'Optimize hottest rooms query - join booking items';
COMMENT ON INDEX idx_bookings_status_confirmed IS 'Optimize hottest rooms query - filter confirmed bookings';
