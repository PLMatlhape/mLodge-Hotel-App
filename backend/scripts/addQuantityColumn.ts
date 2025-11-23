import db from '../config/database';

async function addQuantityColumn() {
  const client = await db.getClient();
  
  try {
    console.log('Starting migration: Adding quantity and status columns to rooms table...');
    
    await client.query('BEGIN');
    
    // Add quantity column if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'rooms' 
          AND column_name = 'quantity'
        ) THEN
          ALTER TABLE rooms ADD COLUMN quantity INTEGER DEFAULT 10;
          COMMENT ON COLUMN rooms.quantity IS 'Number of units available for this room type';
          RAISE NOTICE 'Added quantity column to rooms table';
        ELSE
          RAISE NOTICE 'quantity column already exists';
        END IF;
      END $$;
    `);
    
    // Add status column if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'rooms' 
          AND column_name = 'status'
        ) THEN
          ALTER TABLE rooms ADD COLUMN status VARCHAR(20) DEFAULT 'available';
          COMMENT ON COLUMN rooms.status IS 'Room status: available, unavailable, maintenance';
          RAISE NOTICE 'Added status column to rooms table';
        ELSE
          RAISE NOTICE 'status column already exists';
        END IF;
      END $$;
    `);
    
    // Update existing rooms to have default quantity if NULL
    const updateResult = await client.query(`
      UPDATE rooms 
      SET quantity = 10 
      WHERE quantity IS NULL;
    `);
    
    console.log(`Updated ${updateResult.rowCount} rooms with default quantity`);
    
    // Update existing rooms to have default status if NULL
    const statusUpdateResult = await client.query(`
      UPDATE rooms 
      SET status = 'available' 
      WHERE status IS NULL;
    `);
    
    console.log(`Updated ${statusUpdateResult.rowCount} rooms with default status`);
    
    await client.query('COMMIT');
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the changes
    const verifyResult = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'rooms' 
      AND column_name IN ('quantity', 'status')
      ORDER BY column_name;
    `);
    
    console.log('\nVerification - New columns:');
    console.table(verifyResult.rows);
    
    // Show sample rooms
    const roomsResult = await client.query(`
      SELECT id, name, type, quantity, status, price_per_night 
      FROM rooms 
      LIMIT 5;
    `);
    
    console.log('\nSample rooms after migration:');
    console.table(roomsResult.rows);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
addQuantityColumn()
  .then(() => {
    console.log('\n🎉 Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
