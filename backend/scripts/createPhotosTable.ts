import db from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function createPhotosTable() {
  try {
    console.log('Creating photos table...');
    
    const sqlPath = path.join(__dirname, '../Database/create-photos-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await db.query(sql);
    
    console.log('✅ Photos table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

createPhotosTable();
