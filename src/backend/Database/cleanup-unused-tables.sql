-- Database Cleanup: Remove Unused Tables
-- This script drops tables that have no implementation in the codebase
-- IMPORTANT: Backup your database before running this script!

-- ANALYSIS OF DATABASE TABLES:
-- Tables WITH implementation (KEEP):
-- ✓ accommodations, accommodation_amenities, amenities
-- ✓ bookings, booking_items, rooms, room_photos
-- ✓ users, reviews, payments, admin_audit_logs
-- ✓ reports, email_templates, inquiries, favourites
-- ✓ promo_codes, refunds, notifications
--
-- Tables WITHOUT implementation (REMOVE):
-- ✗ change_audit_logs, currency_rates, login_audit_logs
-- ✗ oauth_providers, payment_transactions, policies
-- ✗ query_logs, room_inventory, user_tokens

BEGIN;

-- Log the cleanup operation
DO $$ 
BEGIN
    RAISE NOTICE 'Starting database cleanup at %', NOW();
    RAISE NOTICE 'Removing 9 unused tables without backend implementation';
END $$;

-- Drop unused audit/logging tables (not implemented in backend routes)
DROP TABLE IF EXISTS query_logs CASCADE;
RAISE NOTICE 'Dropped query_logs';

DROP TABLE IF EXISTS login_audit_logs CASCADE;
RAISE NOTICE 'Dropped login_audit_logs (using admin_audit_logs instead)';

DROP TABLE IF EXISTS change_audit_logs CASCADE;
RAISE NOTICE 'Dropped change_audit_logs';

-- Drop unused payment transaction logs (payment_transactions not used)
DROP TABLE IF EXISTS payment_transactions CASCADE;
RAISE NOTICE 'Dropped payment_transactions (using payments table)';

-- Drop unused OAuth providers table (OAuth not implemented)
DROP TABLE IF EXISTS oauth_providers CASCADE;
RAISE NOTICE 'Dropped oauth_providers';

-- Drop unused currency rates table (multi-currency not implemented)
DROP TABLE IF EXISTS currency_rates CASCADE;
RAISE NOTICE 'Dropped currency_rates';

-- Drop unused room inventory table (inventory tracking not implemented)
DROP TABLE IF EXISTS room_inventory CASCADE;
RAISE NOTICE 'Dropped room_inventory';

-- Drop unused policies table (policies not implemented)
DROP TABLE IF EXISTS policies CASCADE;
RAISE NOTICE 'Dropped policies';

-- Drop user_tokens table (JWT tokens used instead, not stored in DB)
DROP TABLE IF EXISTS user_tokens CASCADE;
RAISE NOTICE 'Dropped user_tokens (using JWT in auth service)';

-- Add is_primary flag to room_photos if not exists (for optimization)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='room_photos' AND column_name='is_primary') THEN
        ALTER TABLE room_photos ADD COLUMN is_primary BOOLEAN DEFAULT false;
        COMMENT ON COLUMN room_photos.is_primary IS 'Flag for primary/featured photo';
        
        -- Set first photo as primary for each room
        WITH first_photos AS (
            SELECT DISTINCT ON (room_id) id
            FROM room_photos
            ORDER BY room_id, sort_order ASC, id ASC
        )
        UPDATE room_photos 
        SET is_primary = true 
        WHERE id IN (SELECT id FROM first_photos);
        
        RAISE NOTICE 'Added is_primary column to room_photos';
    END IF;
END $$;

-- Add comments to remaining ACTIVE tables
COMMENT ON TABLE users IS 'User accounts - ACTIVE (auth.ts, users.ts)';
COMMENT ON TABLE accommodations IS 'Hotel locations - ACTIVE (accommodations.ts)';
COMMENT ON TABLE rooms IS 'Room types and inventory - ACTIVE (rooms.ts)';
COMMENT ON TABLE bookings IS 'Customer reservations - ACTIVE (bookings.ts)';
COMMENT ON TABLE booking_items IS 'Booking line items - ACTIVE (bookings.ts)';
COMMENT ON TABLE payments IS 'Payment transactions - ACTIVE (payments.ts)';
COMMENT ON TABLE reviews IS 'Customer reviews - ACTIVE (reviews.ts)';
COMMENT ON TABLE refunds IS 'Refund requests - ACTIVE (refunds.ts)';
COMMENT ON TABLE promo_codes IS 'Discount codes - ACTIVE (promoCodes.ts)';
COMMENT ON TABLE inquiries IS 'Customer inquiries - ACTIVE (inquiries.ts)';
COMMENT ON TABLE email_templates IS 'Email templates - ACTIVE (emailTemplates.ts)';
COMMENT ON TABLE reports IS 'Generated reports - ACTIVE (reports.ts)';
COMMENT ON TABLE admin_audit_logs IS 'Admin audit trail - ACTIVE (auditLogs.ts)';
COMMENT ON TABLE favourites IS 'User favourites - ACTIVE (favourites.ts)';
COMMENT ON TABLE notifications IS 'User notifications - ACTIVE (notifications.ts)';
COMMENT ON TABLE room_photos IS 'Room images - ACTIVE (rooms.ts)';
COMMENT ON TABLE amenities IS 'Amenity reference data - ACTIVE (amenities.ts)';
COMMENT ON TABLE accommodation_amenities IS 'Accommodation-amenity junction - ACTIVE (amenities.ts)';

-- Verify remaining tables
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    RAISE NOTICE 'Cleanup complete! Remaining tables: %', table_count;
    RAISE NOTICE 'Removed 9 unused tables to optimize database';
END $$;
COMMIT;

-- List remaining tables for verification
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) as size
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Post-cleanup recommendations:
-- 1. Run: VACUUM FULL; -- to reclaim disk space
-- 2. Run: ANALYZE; -- to update table statistics
-- 3. Monitor application for any issues
-- 4. Keep the backup safe for at least 30 days

-- Summary of removed tables:
-- 1. query_logs - Performance logging not implemented
-- 2. login_audit_logs - Login tracking not implemented (use admin_audit_logs instead)
-- 3. change_audit_logs - Change tracking not implemented
-- 4. payment_transactions - Detailed transaction logging not implemented
-- 5. oauth_providers - OAuth authentication not implemented
-- 6. currency_rates - Multi-currency support not implemented
-- 7. room_inventory - Daily inventory tracking not implemented (using room.quantity instead)
-- 8. policies - Hotel policies not implemented
-- 9. user_tokens - Using JWT tokens in auth service instead
