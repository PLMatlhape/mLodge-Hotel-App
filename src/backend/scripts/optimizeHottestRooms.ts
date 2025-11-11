import db from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Database Optimization Script
 * Adds indexes for better query performance on hottest rooms
 */
async function optimizeHottestRoomsQuery() {
  try {
    console.log('🔧 Starting database optimization for hottest rooms query...\n');
    
    const sqlPath = path.join(__dirname, '../Database/optimize-hottest-rooms.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await db.query(sql);
    
    console.log('✅ Database optimization completed successfully!');
    console.log('📊 Added indexes for:');
    console.log('   - Room status filtering');
    console.log('   - Accommodation active status');
    console.log('   - Booking items room/booking joins');
    console.log('   - Booking status filtering');
    console.log('   - Room photos ordering');
    console.log('   - Composite indexes for better query performance');
    console.log('\n💡 The hottest rooms query should now run significantly faster!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  }
}

optimizeHottestRoomsQuery();
