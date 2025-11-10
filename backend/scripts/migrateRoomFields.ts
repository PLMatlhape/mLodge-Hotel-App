import db from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function migrateRoomFields() {
  try {
    console.log('Starting room fields migration...');
    
    const sqlPath = path.join(__dirname, '../Database/add-room-fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await db.query(sql);
    
    console.log('✅ Room fields migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateRoomFields();
