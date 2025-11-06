const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database initialization...\n');

    // Read and execute SQL schema
    const schemaPath = path.join(__dirname, '../../Database/mLodge-Hotel.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Executing database schema...');
    await client.query(schema);
    console.log('✅ Database schema created successfully\n');

    // Create default admin user
    console.log('👤 Creating default admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'Admin@mlodgehotel.co.za';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@mlodgehotel';
    
    // Check if admin exists
    const adminCheck = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (adminCheck.rows.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await client.query(
        `INSERT INTO users (email, name, password_hash, role, is_active) 
         VALUES ($1, $2, $3, $4, $5)`,
        [adminEmail, 'Administrator', passwordHash, 'admin', true]
      );
      console.log(`✅ Admin user created: ${adminEmail}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Insert sample accommodations
    console.log('\n🏨 Creating sample accommodations...');
    
    const sampleAccommodations = [
      {
        name: 'mLodge Hotel Cape Town',
        description: 'Luxury hotel in the heart of Cape Town with stunning views',
        address: '123 Victoria Street',
        city: 'Cape Town',
        country: 'South Africa',
        star_rating: 5
      },
      {
        name: 'mLodge Hotel Johannesburg',
        description: 'Modern business hotel in Sandton financial district',
        address: '456 Sandton Drive',
        city: 'Johannesburg',
        country: 'South Africa',
        star_rating: 4
      },
      {
        name: 'mLodge Hotel Durban',
        description: 'Beachfront hotel with ocean views and spa facilities',
        address: '789 Marine Parade',
        city: 'Durban',
        country: 'South Africa',
        star_rating: 5
      }
    ];

    for (const acc of sampleAccommodations) {
      const accCheck = await client.query(
        'SELECT id FROM accommodations WHERE name = $1',
        [acc.name]
      );

      if (accCheck.rows.length === 0) {
        const result = await client.query(
          `INSERT INTO accommodations (name, description, address, city, country, star_rating, is_active) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           RETURNING id`,
          [acc.name, acc.description, acc.address, acc.city, acc.country, acc.star_rating, true]
        );
        
        const accommodationId = result.rows[0].id;

        // Add rooms for this accommodation
        const rooms = [
          { name: 'Luxury Penthouse', description: 'Premium penthouse suite', capacity: 4, beds: 3, price: 8800 },
          { name: 'Deluxe Ocean View', description: 'Room with ocean view', capacity: 2, beds: 1, price: 4500 },
          { name: 'Executive Business Room', description: 'Perfect for business travelers', capacity: 2, beds: 1, price: 3200 },
          { name: 'Family Suite', description: 'Spacious suite for families', capacity: 6, beds: 3, price: 6500 },
          { name: 'Standard Comfort Room', description: 'Comfortable standard room', capacity: 2, beds: 1, price: 2100 }
        ];

        for (const room of rooms) {
          await client.query(
            `INSERT INTO rooms (accommodation_id, name, description, capacity, beds, price_per_night, refundable) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [accommodationId, room.name, room.description, room.capacity, room.beds, room.price, true]
          );
        }

        console.log(`✅ Created: ${acc.name} with ${rooms.length} rooms`);
      }
    }

    console.log('\n✨ Database initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Admin Email: ${adminEmail}`);
    console.log(`   Admin Password: ${adminPassword}`);
    console.log(`   Sample Accommodations: ${sampleAccommodations.length}`);
    console.log('\n🚀 You can now start the server with: npm run dev\n');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization
initializeDatabase().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
