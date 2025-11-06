-- Add source column to bookings table to track where bookings came from
-- Run this migration if the column doesn't exist

-- Check if column exists and add it if not
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='bookings' AND column_name='source'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN source VARCHAR(50) DEFAULT 'Website';
        
        -- Add comment to document the column
        COMMENT ON COLUMN bookings.source IS 'Source of the booking: Website, Mobile App, Phone, Walk-in, etc.';
    END IF;
END $$;

-- Update existing bookings to have a default source
UPDATE bookings 
SET source = 'Website' 
WHERE source IS NULL;
