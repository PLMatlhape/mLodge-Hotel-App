/**
 * Database Migration Script
 * Adds source tracking and other analytics columns
 */

import pool from '../config/database';

async function migrateDatabase() {
  const client = await pool.getClient();
  
  try {
    console.log('🔄 Starting database migration for analytics...\n');

    // Start transaction
    await client.query('BEGIN');

    // 1. Add source column to bookings if it doesn't exist
    console.log('📝 Adding source column to bookings table...');
    await client.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='bookings' AND column_name='source'
          ) THEN
              ALTER TABLE bookings ADD COLUMN source VARCHAR(50) DEFAULT 'Website';
              RAISE NOTICE 'Added source column to bookings';
          ELSE
              RAISE NOTICE 'Source column already exists in bookings';
          END IF;
      END $$;
    `);

    // 2. Add booking_reference if it doesn't exist
    console.log('📝 Adding booking_reference column to bookings table...');
    await client.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='bookings' AND column_name='booking_reference'
          ) THEN
              ALTER TABLE bookings ADD COLUMN booking_reference VARCHAR(100) UNIQUE;
              RAISE NOTICE 'Added booking_reference column to bookings';
          ELSE
              RAISE NOTICE 'Booking_reference column already exists in bookings';
          END IF;
      END $$;
    `);

    // 3. Add room_type to rooms if it doesn't exist
    console.log('📝 Adding room_type column to rooms table...');
    await client.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='rooms' AND column_name='room_type'
          ) THEN
              ALTER TABLE rooms ADD COLUMN room_type VARCHAR(100) DEFAULT 'Standard';
              RAISE NOTICE 'Added room_type column to rooms';
          ELSE
              RAISE NOTICE 'Room_type column already exists in rooms';
          END IF;
      END $$;
    `);

    // 4. Create indexes for better query performance
    console.log('📝 Creating performance indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
      CREATE INDEX IF NOT EXISTS idx_bookings_source ON bookings(source);
      CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
    `);
    console.log('✅ Indexes created successfully');

    // 5. Update existing data - set booking references
    console.log('📝 Updating existing bookings with references...');
    await client.query(`
      UPDATE bookings 
      SET booking_reference = 'BK' || LPAD(id::TEXT, 6, '0')
      WHERE booking_reference IS NULL;
    `);

    // 6. Update existing data - set default source
    console.log('📝 Setting default source for existing bookings...');
    await client.query(`
      UPDATE bookings 
      SET source = 'Website'
      WHERE source IS NULL;
    `);

    // 7. Update room types based on names
    console.log('📝 Inferring room types from room names...');
    await client.query(`
      UPDATE rooms
      SET room_type = CASE
          WHEN name ILIKE '%suite%' OR name ILIKE '%presidential%' THEN 'Suite'
          WHEN name ILIKE '%deluxe%' OR name ILIKE '%luxury%' THEN 'Deluxe'
          WHEN name ILIKE '%premium%' OR name ILIKE '%superior%' THEN 'Premium'
          WHEN name ILIKE '%executive%' THEN 'Executive'
          WHEN name ILIKE '%family%' THEN 'Family'
          WHEN name ILIKE '%single%' THEN 'Single'
          WHEN name ILIKE '%double%' THEN 'Double'
          WHEN name ILIKE '%twin%' THEN 'Twin'
          ELSE 'Standard'
      END
      WHERE room_type IS NULL OR room_type = 'Standard';
    `);

    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n✅ Database migration completed successfully!');
    console.log('📊 Analytics columns and indexes are now ready.');
    console.log('🎯 You can now track booking sources and room type analytics.\n');

    // Display summary
    const bookingsCount = await client.query('SELECT COUNT(*) FROM bookings');
    const roomsCount = await client.query('SELECT COUNT(*) FROM rooms');
    const roomTypes = await client.query('SELECT room_type, COUNT(*) as count FROM rooms GROUP BY room_type ORDER BY count DESC');
    
    console.log('📈 Database Summary:');
    console.log(`   Total Bookings: ${bookingsCount.rows[0].count}`);
    console.log(`   Total Rooms: ${roomsCount.rows[0].count}`);
    console.log('   Room Types:');
    roomTypes.rows.forEach((row: any) => {
      console.log(`     - ${row.room_type}: ${row.count} rooms`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('✨ Migration script finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error during migration:', error);
      process.exit(1);
    });
}

export default migrateDatabase;
