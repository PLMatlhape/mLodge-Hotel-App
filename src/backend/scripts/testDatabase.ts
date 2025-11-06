import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  console.log('📋 Configuration:');
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  Port: ${process.env.DB_PORT}`);
  console.log(`  User: ${process.env.DB_USER}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log('');

  try {
    // Test connection
    console.log('1️⃣ Testing connection...');
    const client = await pool.connect();
    console.log('✅ Connection successful!');
    
    // Check database version
    console.log('\n2️⃣ Checking PostgreSQL version...');
    const versionResult = await client.query('SELECT version()');
    console.log(`✅ ${versionResult.rows[0].version}`);
    
    // Check if rooms table exists
    console.log('\n3️⃣ Checking if rooms table exists...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'rooms'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ rooms table exists');
      
      // Count rooms
      console.log('\n4️⃣ Counting rooms...');
      const countResult = await client.query('SELECT COUNT(*) FROM rooms');
      console.log(`✅ Found ${countResult.rows[0].count} rooms in database`);
      
      // Show sample rooms
      if (parseInt(countResult.rows[0].count) > 0) {
        console.log('\n5️⃣ Sample rooms:');
        const roomsResult = await client.query('SELECT id, name, type, price_per_night FROM rooms LIMIT 5');
        console.table(roomsResult.rows);
      }
    } else {
      console.log('❌ rooms table does NOT exist!');
      console.log('\n📝 You need to run the database initialization script:');
      console.log('   npm run init-db');
    }
    
    // Check if room_photos table exists
    console.log('\n6️⃣ Checking if room_photos table exists...');
    const photosTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'room_photos'
      );
    `);
    
    if (photosTableCheck.rows[0].exists) {
      console.log('✅ room_photos table exists');
      
      const photosCount = await client.query('SELECT COUNT(*) FROM room_photos');
      console.log(`✅ Found ${photosCount.rows[0].count} photos in database`);
    } else {
      console.log('❌ room_photos table does NOT exist!');
    }
    
    client.release();
    
    console.log('\n✅ All checks completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Database test failed:');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
      
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n💡 Suggestion: PostgreSQL is not running!');
        console.error('   - Start PostgreSQL service on your machine');
        console.error('   - Check if port 5432 is correct');
      } else if (error.message.includes('authentication failed')) {
        console.error('\n💡 Suggestion: Authentication failed!');
        console.error('   - Check DB_USER and DB_PASSWORD in .env file');
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.error('\n💡 Suggestion: Database does not exist!');
        console.error('   - Create the database using: createdb mLodge-Hotel');
        console.error('   - Or use pgAdmin to create it manually');
      }
    }
    process.exit(1);
  }
}

testDatabase();
