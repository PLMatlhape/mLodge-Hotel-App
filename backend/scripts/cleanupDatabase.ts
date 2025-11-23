import db from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Database Cleanup Script
 * Removes unused tables to optimize database performance and reduce complexity
 */
async function cleanupUnusedTables() {
  try {
    console.log('🧹 Starting database cleanup - removing unused tables...\n');
    
    console.log('⚠️  WARNING: This will permanently delete the following tables:');
    console.log('   - query_logs');
    console.log('   - login_audit_logs');
    console.log('   - change_audit_logs');
    console.log('   - payment_transactions');
    console.log('   - oauth_providers');
    console.log('   - currency_rates');
    console.log('   - room_inventory');
    console.log('   - policies');
    console.log('   - accommodation_amenities');
    console.log('\n⏳ Proceeding in 3 seconds...\n');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const sqlPath = path.join(__dirname, '../Database/cleanup-unused-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await db.query(sql);
    
    console.log('✅ Database cleanup completed successfully!');
    console.log('📉 Removed 9 unused tables');
    console.log('💾 Database has been vacuumed to reclaim space');
    console.log('\n📋 Active tables remaining:');
    console.log('   ✓ users, accommodations, rooms');
    console.log('   ✓ bookings, booking_items, payments');
    console.log('   ✓ reviews, refunds, promo_codes');
    console.log('   ✓ inquiries, email_templates, reports');
    console.log('   ✓ admin_audit_logs, favourites, notifications');
    console.log('   ✓ room_photos, user_tokens, amenities');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    console.error('\n💡 Tip: Make sure you have a database backup before running cleanup scripts!');
    process.exit(1);
  }
}

cleanupUnusedTables();
