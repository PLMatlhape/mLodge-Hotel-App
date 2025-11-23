-- Migration: Change favourites to be per room
-- 1. Add room_id column
ALTER TABLE public.favourites ADD COLUMN room_id integer;

-- 2. Populate room_id for existing favourites (if possible)
-- This step requires business logic: if you want to assign a default room per accommodation, do it here.
-- Example: set room_id to the first available room for each accommodation
UPDATE public.favourites f SET room_id = (
  SELECT r.id FROM rooms r WHERE r.accommodation_id = f.accommodation_id LIMIT 1
);

-- 3. Drop old PK and set new PK
ALTER TABLE public.favourites DROP CONSTRAINT favourites_pkey;
ALTER TABLE public.favourites ADD CONSTRAINT favourites_pkey PRIMARY KEY (user_id, room_id);

-- 4. (Optional) Remove accommodation_id if not needed
-- ALTER TABLE public.favourites DROP COLUMN accommodation_id;

-- 5. Add FK constraint for room_id
ALTER TABLE public.favourites ADD CONSTRAINT favourites_room_id_fkey FOREIGN KEY (room_id) REFERENCES rooms(id);

-- 6. Add FK for user_id if not present
-- ALTER TABLE public.favourites ADD CONSTRAINT favourites_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

-- 7. (Optional) Add index for user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON favourites(user_id);

-- 8. (Optional) Add index for room_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_favourites_room_id ON favourites(room_id);
