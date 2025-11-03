-- Drop existing photos table if it exists
DROP TABLE IF EXISTS photos CASCADE;

-- Create photos table for storing room images
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX idx_photos_room_id ON photos(room_id);
CREATE INDEX idx_photos_primary ON photos(room_id, is_primary);

-- Add comment
COMMENT ON TABLE photos IS 'Stores room photos/images';
COMMENT ON COLUMN photos.room_id IS 'Reference to the room';
COMMENT ON COLUMN photos.photo_url IS 'URL or base64 data of the photo';
COMMENT ON COLUMN photos.is_primary IS 'Whether this is the primary/main photo for the room';
