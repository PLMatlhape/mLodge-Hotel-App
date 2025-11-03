-- =====================================================
-- INVENTORY SYSTEM REDESIGN - DATABASE MIGRATION
-- =====================================================
-- Date: November 3, 2025
-- Purpose: Implement unified admin-to-client inventory system
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ROOMS TABLE ENHANCEMENTS
-- =====================================================

-- Add new columns for inventory management
ALTER TABLE rooms 
  ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS current_booking_id INTEGER,
  ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Standard';

-- Add check constraint for status values
ALTER TABLE rooms 
  DROP CONSTRAINT IF EXISTS rooms_status_check;

ALTER TABLE rooms 
  ADD CONSTRAINT rooms_status_check 
  CHECK (status IN ('available', 'booked', 'maintenance', 'inactive'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_status 
  ON rooms(status);

CREATE INDEX IF NOT EXISTS idx_rooms_accommodation_status 
  ON rooms(accommodation_id, status);

CREATE INDEX IF NOT EXISTS idx_rooms_is_active_status 
  ON rooms(is_active, status);

-- Add comment
COMMENT ON COLUMN rooms.quantity IS 'Number of this room type available';
COMMENT ON COLUMN rooms.status IS 'Current status: available, booked, maintenance, inactive';
COMMENT ON COLUMN rooms.current_booking_id IS 'Reference to active booking (if booked)';
COMMENT ON COLUMN rooms.type IS 'Room type: Standard, Delux, Premium, Business';

-- =====================================================
-- 2. BOOKINGS TABLE ENHANCEMENTS
-- =====================================================

-- Add checkout tracking columns
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS checked_out BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS actual_check_in_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS actual_check_out_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS auto_checkout_date TIMESTAMP;

-- Add comments
COMMENT ON COLUMN bookings.checked_in IS 'Whether guest has checked in';
COMMENT ON COLUMN bookings.checked_out IS 'Whether guest has checked out';
COMMENT ON COLUMN bookings.actual_check_in_date IS 'Actual check-in timestamp';
COMMENT ON COLUMN bookings.actual_check_out_date IS 'Actual checkout timestamp';
COMMENT ON COLUMN bookings.auto_checkout_date IS 'Scheduled automatic checkout date';

-- =====================================================
-- 3. CREATE ROOM AVAILABILITY VIEW
-- =====================================================

CREATE OR REPLACE VIEW room_availability AS
SELECT 
    r.id,
    r.accommodation_id,
    r.name,
    r.description,
    r.type,
    r.capacity,
    r.beds,
    r.price_per_night,
    r.refundable,
    r.quantity as total_quantity,
    r.status,
    r.is_active,
    a.name as accommodation_name,
    a.city as accommodation_city,
    a.address as accommodation_address,
    -- Calculate booked quantity for current and future bookings
    COALESCE(
        (SELECT SUM(bi.quantity)
         FROM booking_items bi
         JOIN bookings b ON b.id = bi.booking_id
         WHERE bi.room_id = r.id
         AND b.status IN ('confirmed', 'pending')
         AND b.check_out_date >= CURRENT_DATE
         AND b.checked_out = false
        ), 0
    ) as booked_quantity,
    -- Calculate available quantity
    CASE 
        WHEN r.status IN ('maintenance', 'inactive') THEN 0
        WHEN r.status = 'available' THEN 
            r.quantity - COALESCE(
                (SELECT SUM(bi.quantity)
                 FROM booking_items bi
                 JOIN bookings b ON b.id = bi.booking_id
                 WHERE bi.room_id = r.id
                 AND b.status IN ('confirmed', 'pending')
                 AND b.check_out_date >= CURRENT_DATE
                 AND b.checked_out = false
                ), 0
            )
        ELSE 0
    END as available_quantity,
    -- Count active bookings
    COALESCE(
        (SELECT COUNT(DISTINCT b.id)
         FROM bookings b
         JOIN booking_items bi ON bi.booking_id = b.id
         WHERE bi.room_id = r.id
         AND b.status IN ('confirmed', 'pending')
         AND b.check_out_date >= CURRENT_DATE
         AND b.checked_out = false
        ), 0
    ) as active_bookings_count,
    r.created_at,
    r.updated_at
FROM rooms r
LEFT JOIN accommodations a ON a.id = r.accommodation_id
WHERE r.is_active = true;

COMMENT ON VIEW room_availability IS 'Real-time room availability with booking calculations';

-- =====================================================
-- 4. CREATE AUTO-CHECKOUT TRIGGER FUNCTION
-- =====================================================

-- Function to automatically handle checkout
CREATE OR REPLACE FUNCTION auto_checkout_check()
RETURNS TRIGGER AS $$
BEGIN
    -- If checkout date has passed and not checked out, mark as completed
    IF NEW.check_out_date < CURRENT_DATE AND NEW.checked_out = false THEN
        NEW.status = 'completed';
        NEW.checked_out = true;
        NEW.actual_check_out_date = NOW();
        
        -- Update room availability for all rooms in this booking
        UPDATE rooms r
        SET status = CASE 
            WHEN (
                SELECT COALESCE(SUM(bi.quantity), 0)
                FROM booking_items bi
                JOIN bookings b ON b.id = bi.booking_id
                WHERE bi.room_id = r.id
                AND b.status IN ('confirmed', 'pending')
                AND b.check_out_date >= CURRENT_DATE
                AND b.checked_out = false
                AND b.id != NEW.id  -- Exclude current booking
            ) >= r.quantity THEN 'booked'
            ELSE 'available'
        END,
        updated_at = NOW()
        WHERE r.id IN (
            SELECT bi.room_id 
            FROM booking_items bi 
            WHERE bi.booking_id = NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-checkout
DROP TRIGGER IF EXISTS bookings_auto_checkout ON bookings;

CREATE TRIGGER bookings_auto_checkout
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION auto_checkout_check();

COMMENT ON FUNCTION auto_checkout_check() IS 'Automatically checks out bookings and updates room availability';

-- =====================================================
-- 5. CREATE ROOM STATUS UPDATE FUNCTION
-- =====================================================

-- Function to update room status based on bookings
CREATE OR REPLACE FUNCTION update_room_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the room status based on bookings
    UPDATE rooms r
    SET status = CASE 
        WHEN r.status IN ('maintenance', 'inactive') THEN r.status
        WHEN (
            SELECT COALESCE(SUM(bi.quantity), 0)
            FROM booking_items bi
            JOIN bookings b ON b.id = bi.booking_id
            WHERE bi.room_id = r.id
            AND b.status IN ('confirmed', 'pending')
            AND b.check_out_date >= CURRENT_DATE
            AND b.checked_out = false
        ) >= r.quantity THEN 'booked'
        ELSE 'available'
    END,
    updated_at = NOW()
    WHERE r.id IN (
        SELECT room_id 
        FROM booking_items 
        WHERE booking_id = NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room status updates on booking changes
DROP TRIGGER IF EXISTS bookings_update_room_status ON bookings;

CREATE TRIGGER bookings_update_room_status
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_room_status();

COMMENT ON FUNCTION update_room_status() IS 'Updates room status when bookings are created or modified';

-- =====================================================
-- 6. CREATE BOOKING VALIDATION FUNCTION
-- =====================================================

-- Function to validate room availability before booking
CREATE OR REPLACE FUNCTION validate_room_availability()
RETURNS TRIGGER AS $$
DECLARE
    v_total_quantity INTEGER;
    v_booked_quantity INTEGER;
    v_room_name VARCHAR(100);
BEGIN
    -- Get room details
    SELECT r.quantity, r.name
    INTO v_total_quantity, v_room_name
    FROM rooms r
    WHERE r.id = NEW.room_id;
    
    -- Calculate already booked quantity for the date range
    SELECT COALESCE(SUM(bi.quantity), 0)
    INTO v_booked_quantity
    FROM booking_items bi
    JOIN bookings b ON b.id = bi.booking_id
    WHERE bi.room_id = NEW.room_id
    AND b.status IN ('confirmed', 'pending')
    AND b.id != (SELECT booking_id FROM booking_items WHERE id = NEW.id LIMIT 1)
    AND (
        (b.check_in_date <= (SELECT check_in_date FROM bookings WHERE id = NEW.booking_id) 
         AND b.check_out_date >= (SELECT check_in_date FROM bookings WHERE id = NEW.booking_id)) OR
        (b.check_in_date <= (SELECT check_out_date FROM bookings WHERE id = NEW.booking_id) 
         AND b.check_out_date >= (SELECT check_out_date FROM bookings WHERE id = NEW.booking_id)) OR
        (b.check_in_date >= (SELECT check_in_date FROM bookings WHERE id = NEW.booking_id) 
         AND b.check_out_date <= (SELECT check_out_date FROM bookings WHERE id = NEW.booking_id))
    );
    
    -- Check if enough rooms are available
    IF (v_booked_quantity + NEW.quantity) > v_total_quantity THEN
        RAISE EXCEPTION 'Insufficient rooms available. Room: %, Available: %, Requested: %', 
            v_room_name, 
            (v_total_quantity - v_booked_quantity), 
            NEW.quantity;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking validation
DROP TRIGGER IF EXISTS booking_items_validate_availability ON booking_items;

CREATE TRIGGER booking_items_validate_availability
    BEFORE INSERT ON booking_items
    FOR EACH ROW
    EXECUTE FUNCTION validate_room_availability();

COMMENT ON FUNCTION validate_room_availability() IS 'Validates room availability before creating booking items';

-- =====================================================
-- 7. UPDATE EXISTING DATA
-- =====================================================

-- Set default values for existing rooms
UPDATE rooms 
SET 
    quantity = COALESCE(quantity, 1),
    status = COALESCE(status, 'available'),
    type = COALESCE(type, 'Standard')
WHERE quantity IS NULL OR status IS NULL OR type IS NULL;

-- Set default values for existing bookings
UPDATE bookings
SET 
    checked_in = COALESCE(checked_in, false),
    checked_out = COALESCE(checked_out, CASE WHEN status = 'completed' THEN true ELSE false END)
WHERE checked_in IS NULL OR checked_out IS NULL;

-- Update room status based on current bookings
UPDATE rooms r
SET status = CASE 
    WHEN r.status IN ('maintenance', 'inactive') THEN r.status
    WHEN (
        SELECT COALESCE(SUM(bi.quantity), 0)
        FROM booking_items bi
        JOIN bookings b ON b.id = bi.booking_id
        WHERE bi.room_id = r.id
        AND b.status IN ('confirmed', 'pending')
        AND b.check_out_date >= CURRENT_DATE
        AND b.checked_out = false
    ) >= r.quantity THEN 'booked'
    ELSE 'available'
END;

-- =====================================================
-- 8. CREATE HELPER FUNCTIONS FOR API
-- =====================================================

-- Function to get available rooms for a date range
CREATE OR REPLACE FUNCTION get_available_rooms(
    p_check_in_date DATE,
    p_check_out_date DATE,
    p_accommodation_id INTEGER DEFAULT NULL,
    p_min_capacity INTEGER DEFAULT NULL
)
RETURNS TABLE (
    room_id INTEGER,
    room_name VARCHAR(100),
    accommodation_name VARCHAR(200),
    city VARCHAR(100),
    type VARCHAR(50),
    capacity INTEGER,
    beds INTEGER,
    price_per_night NUMERIC(10,2),
    total_quantity INTEGER,
    available_quantity INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        a.name,
        a.city,
        r.type,
        r.capacity,
        r.beds,
        r.price_per_night,
        r.quantity,
        (r.quantity - COALESCE(
            (SELECT SUM(bi.quantity)
             FROM booking_items bi
             JOIN bookings b ON b.id = bi.booking_id
             WHERE bi.room_id = r.id
             AND b.status IN ('confirmed', 'pending')
             AND b.checked_out = false
             AND (
                 (b.check_in_date <= p_check_in_date AND b.check_out_date >= p_check_in_date) OR
                 (b.check_in_date <= p_check_out_date AND b.check_out_date >= p_check_out_date) OR
                 (b.check_in_date >= p_check_in_date AND b.check_out_date <= p_check_out_date)
             )
            ), 0
        ))::INTEGER as available_qty
    FROM rooms r
    JOIN accommodations a ON a.id = r.accommodation_id
    WHERE r.is_active = true
    AND r.status IN ('available', 'booked')
    AND (p_accommodation_id IS NULL OR r.accommodation_id = p_accommodation_id)
    AND (p_min_capacity IS NULL OR r.capacity >= p_min_capacity)
    HAVING (r.quantity - COALESCE(
        (SELECT SUM(bi.quantity)
         FROM booking_items bi
         JOIN bookings b ON b.id = bi.booking_id
         WHERE bi.room_id = r.id
         AND b.status IN ('confirmed', 'pending')
         AND b.checked_out = false
         AND (
             (b.check_in_date <= p_check_in_date AND b.check_out_date >= p_check_in_date) OR
             (b.check_in_date <= p_check_out_date AND b.check_out_date >= p_check_out_date) OR
             (b.check_in_date >= p_check_in_date AND b.check_out_date <= p_check_out_date)
         )
        ), 0
    )) > 0
    ORDER BY available_qty DESC, r.price_per_night ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_available_rooms IS 'Returns available rooms for a specific date range';

-- =====================================================
-- 9. GRANT PERMISSIONS (if needed)
-- =====================================================

-- Grant access to the view
GRANT SELECT ON room_availability TO PUBLIC;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Verify rooms table structure
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM information_schema.columns 
    WHERE table_name = 'rooms' 
    AND column_name IN ('quantity', 'status', 'type');
    
    IF v_count = 3 THEN
        RAISE NOTICE 'SUCCESS: Rooms table updated successfully';
    ELSE
        RAISE EXCEPTION 'FAILED: Rooms table missing columns';
    END IF;
END $$;

-- Verify bookings table structure
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name IN ('checked_in', 'checked_out');
    
    IF v_count = 2 THEN
        RAISE NOTICE 'SUCCESS: Bookings table updated successfully';
    ELSE
        RAISE EXCEPTION 'FAILED: Bookings table missing columns';
    END IF;
END $$;

-- Verify view creation
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'room_availability') THEN
        RAISE NOTICE 'SUCCESS: room_availability view created';
    ELSE
        RAISE EXCEPTION 'FAILED: room_availability view not created';
    END IF;
END $$;

-- Verify triggers
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM information_schema.triggers 
    WHERE trigger_name IN ('bookings_auto_checkout', 'bookings_update_room_status');
    
    IF v_count = 2 THEN
        RAISE NOTICE 'SUCCESS: Triggers created successfully';
    ELSE
        RAISE WARNING 'WARNING: Some triggers may be missing';
    END IF;
END $$;

-- =====================================================
-- 11. SAMPLE DATA FOR TESTING (Optional)
-- =====================================================

-- Uncomment to insert sample data for testing
/*
-- Insert sample accommodation
INSERT INTO accommodations (name, description, address, city, country, star_rating)
VALUES ('Test Hotel', 'Test description', '123 Test St', 'Cape Town', 'South Africa', 4)
ON CONFLICT DO NOTHING;

-- Insert sample rooms
INSERT INTO rooms (accommodation_id, name, description, type, capacity, beds, quantity, price_per_night, status)
VALUES 
    (1, 'Standard Room', 'Comfortable standard room', 'Standard', 2, 1, 5, 800.00, 'available'),
    (1, 'Deluxe Suite', 'Luxury deluxe suite', 'Delux', 4, 2, 3, 1500.00, 'available'),
    (1, 'Premium Suite', 'Premium suite with view', 'Premium', 4, 2, 2, 2000.00, 'available')
ON CONFLICT DO NOTHING;
*/

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Display summary
SELECT 
    'Rooms Table' as table_name,
    COUNT(*) as total_rooms,
    SUM(quantity) as total_room_units,
    COUNT(*) FILTER (WHERE status = 'available') as available_rooms,
    COUNT(*) FILTER (WHERE status = 'booked') as booked_rooms
FROM rooms
UNION ALL
SELECT 
    'Bookings Table',
    COUNT(*),
    NULL,
    COUNT(*) FILTER (WHERE status = 'confirmed'),
    COUNT(*) FILTER (WHERE checked_out = true)
FROM bookings;

RAISE NOTICE '==========================================';
RAISE NOTICE 'INVENTORY SYSTEM MIGRATION COMPLETED';
RAISE NOTICE '==========================================';
RAISE NOTICE 'Next Steps:';
RAISE NOTICE '1. Test the migration with sample data';
RAISE NOTICE '2. Update backend API endpoints';
RAISE NOTICE '3. Update frontend components';
RAISE NOTICE '4. Run integration tests';
RAISE NOTICE '==========================================';
