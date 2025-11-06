-- Add new fields to rooms table to support standalone rooms without accommodation dependency

-- Add location field (replaces accommodation_name)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS location VARCHAR(500);

-- Add baths field
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS baths INTEGER DEFAULT 2;

-- Add area field (in square meters)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS area INTEGER DEFAULT 120;

-- Add type field (Standard, Deluxe, Premium, Suite)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Standard';

-- Add amenities as JSON array
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb;

-- Add room features as JSON array
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_features JSONB DEFAULT '[]'::jsonb;

-- Make accommodation_id optional (allow NULL)
ALTER TABLE rooms ALTER COLUMN accommodation_id DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN rooms.location IS 'Full address/location of the room';
COMMENT ON COLUMN rooms.baths IS 'Number of bathrooms';
COMMENT ON COLUMN rooms.area IS 'Area in square meters';
COMMENT ON COLUMN rooms.type IS 'Room type: Standard, Deluxe, Premium, Suite';
COMMENT ON COLUMN rooms.amenities IS 'Array of amenity names (e.g., WiFi, Parking)';
COMMENT ON COLUMN rooms.room_features IS 'Array of room feature descriptions';
