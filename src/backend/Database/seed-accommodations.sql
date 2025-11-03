-- Seed data for accommodations (hotels/properties)
-- This should be run first before adding rooms

-- Insert default accommodation (mLodge Hotel Cape Town)
INSERT INTO public.accommodations (
    owner_id,
    name,
    description,
    address,
    city,
    country,
    postal_code,
    latitude,
    longitude,
    star_rating,
    base_currency,
    is_active
) VALUES (
    1, -- Admin user ID
    'mLodge Hotel Cape Town',
    'Luxury beachfront hotel in the heart of Cape Town with stunning ocean views, modern amenities, and world-class service.',
    '123 Beach Road, Sea Point',
    'Cape Town',
    'South Africa',
    '8005',
    -33.924869,
    18.424063,
    5,
    'ZAR',
    true
) ON CONFLICT DO NOTHING;

-- Insert second accommodation (mLodge Hotel Durban)
INSERT INTO public.accommodations (
    owner_id,
    name,
    description,
    address,
    city,
    country,
    postal_code,
    latitude,
    longitude,
    star_rating,
    base_currency,
    is_active
) VALUES (
    1,
    'mLodge Hotel Durban',
    'Contemporary hotel on Durban''s golden mile with beach access and premium facilities.',
    '45 Marine Parade, North Beach',
    'Durban',
    'South Africa',
    '4001',
    -29.857572,
    31.029200,
    4,
    'ZAR',
    true
) ON CONFLICT DO NOTHING;

-- Insert third accommodation (mLodge Hotel Johannesburg)
INSERT INTO public.accommodations (
    owner_id,
    name,
    description,
    address,
    city,
    country,
    postal_code,
    latitude,
    longitude,
    star_rating,
    base_currency,
    is_active
) VALUES (
    1,
    'mLodge Hotel Johannesburg',
    'Business hotel in Sandton with conference facilities and executive suites.',
    '78 Sandton Drive, Sandton',
    'Johannesburg',
    'South Africa',
    '2196',
    -26.107407,
    28.056229,
    5,
    'ZAR',
    true
) ON CONFLICT DO NOTHING;

-- Note: To use this file, run:
-- psql -U postgres -d mLodge-Hotel -f seed-accommodations.sql
