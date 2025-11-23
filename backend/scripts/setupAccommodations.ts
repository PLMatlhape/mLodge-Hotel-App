import db from '../config/database';

async function setupAccommodations() {
  try {
    console.log('🏨 Setting up 4 mLodge Hotel locations...\n');

    // Check if accommodations already exist
    const existingCheck = await db.query(
      'SELECT COUNT(*) as count FROM accommodations WHERE name LIKE $1',
      ['%mLodge Hotel%']
    );

    if (parseInt(existingCheck.rows[0].count) >= 4) {
      console.log('ℹ️  Accommodations already exist. Fetching details...\n');
      const existing = await db.query(
        `SELECT id, name, city, address FROM accommodations 
         WHERE name LIKE $1 
         ORDER BY city`,
        ['%mLodge Hotel%']
      );
      console.table(existing.rows);
      return;
    }

    // Create the 4 hotel locations
    const hotels = [
      {
        name: 'mLodge Hotel Cape Town',
        city: 'Cape Town',
        address: 'V&A Waterfront, Cape Town',
        country: 'South Africa',
        postal_code: '8001',
        latitude: -33.9065,
        longitude: 18.4216,
        description: 'Experience luxury at our Cape Town waterfront location with stunning views of Table Mountain and the Atlantic Ocean.',
        star_rating: 5
      },
      {
        name: 'mLodge Hotel Durban',
        city: 'Durban',
        address: 'Golden Mile Beachfront, Durban',
        country: 'South Africa',
        postal_code: '4001',
        latitude: -29.8587,
        longitude: 31.0218,
        description: 'Enjoy beachfront paradise at our Durban hotel on the famous Golden Mile with warm Indian Ocean waters.',
        star_rating: 5
      },
      {
        name: 'mLodge Hotel Johannesburg',
        city: 'Johannesburg',
        address: 'Sandton City, Johannesburg',
        country: 'South Africa',
        postal_code: '2196',
        latitude: -26.1076,
        longitude: 28.0567,
        description: 'Located in the heart of Sandton, our Johannesburg hotel offers world-class amenities and business facilities.',
        star_rating: 5
      },
      {
        name: 'mLodge Hotel Pretoria',
        city: 'Pretoria',
        address: 'Brooklyn, Pretoria',
        country: 'South Africa',
        postal_code: '0181',
        latitude: -25.7479,
        longitude: 28.2293,
        description: 'Discover tranquility in the Jacaranda City at our elegant Pretoria hotel in the prestigious Brooklyn area.',
        star_rating: 5
      }
    ];

    console.log('Creating accommodations...\n');

    const createdHotels = [];
    for (const hotel of hotels) {
      const result = await db.query(
        `INSERT INTO accommodations 
         (name, description, address, city, country, postal_code, latitude, longitude, star_rating, base_currency, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, name, city, address`,
        [
          hotel.name,
          hotel.description,
          hotel.address,
          hotel.city,
          hotel.country,
          hotel.postal_code,
          hotel.latitude,
          hotel.longitude,
          hotel.star_rating,
          'ZAR',
          true
        ]
      );
      createdHotels.push(result.rows[0]);
      console.log(`✅ Created: ${result.rows[0].name}`);
    }

    console.log('\n📊 Summary of created accommodations:\n');
    console.table(createdHotels);

    console.log('\n✨ Next steps:');
    console.log('1. Update existing rooms to link to these accommodations');
    console.log('2. The Inventory page will now show the hotel location (city) for each room');
    console.log('3. Rooms table already has accommodation_id field linking to accommodations');

  } catch (error) {
    console.error('❌ Error setting up accommodations:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

setupAccommodations();
