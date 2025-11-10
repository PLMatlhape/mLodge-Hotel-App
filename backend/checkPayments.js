const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mLodge-Hotel',
  user: 'postgres',
  password: 'Pule@123'
});

async function checkTable() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payments' 
      ORDER BY ordinal_position
    `);
    
    if (res.rows.length === 0) {
      console.log('Table does not exist yet');
    } else {
      console.log('Existing columns:', res.rows.map(r => r.column_name).join(', '));
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkTable();
