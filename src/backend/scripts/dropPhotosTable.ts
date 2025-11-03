import db from '../config/database';

/**
 * Migration: Drop the old 'photos' table
 * 
 * Reason: Duplicate table - we now use 'room_photos' table which has more features
 * (caption, sort_order) and is actively used throughout the codebase.
 * 
 * The old 'photos' table is unused and can be safely removed.
 */
async function dropPhotosTable() {
  const client = await db.getClient();
  
  try {
    console.log('Starting migration: Removing old photos table...');
    
    await client.query('BEGIN');
    
    // Check if the old photos table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'photos'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('Found old photos table, checking for data...');
      
      // Check if there's any data in the old table
      const dataCheck = await client.query('SELECT COUNT(*) FROM photos');
      const rowCount = parseInt(dataCheck.rows[0].count);
      
      if (rowCount > 0) {
        console.log(`⚠️  WARNING: Found ${rowCount} rows in old photos table`);
        console.log('⚠️  This data will be lost. The system now uses room_photos table.');
        console.log('⚠️  If you need this data, migrate it manually before running this script.');
        
        // Uncomment the line below if you're sure you want to proceed
        // await client.query('DROP TABLE IF EXISTS photos CASCADE');
        
        console.log('❌ Migration aborted. Please review the data first.');
        await client.query('ROLLBACK');
        return;
      }
      
      // Safe to drop - no data exists
      console.log('No data found in old photos table, safe to drop...');
      await client.query('DROP TABLE IF EXISTS photos CASCADE');
      console.log('✅ Dropped old photos table successfully');
      
    } else {
      console.log('ℹ️  Old photos table does not exist - nothing to do');
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ Migration completed successfully!');
    
    // Verify the change
    const verifyResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%photo%'
      ORDER BY table_name;
    `);
    
    console.log('\nPhoto-related tables in database:');
    console.table(verifyResult.rows);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
dropPhotosTable()
  .then(() => {
    console.log('\n🎉 Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
