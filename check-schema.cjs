const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mlodge_hotel',
  user: 'postgres',
  password: 'Mlodge@123',
});

(async () => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'favourites'
      ORDER BY ordinal_position;
    `);
    
    console.log('Favourites table schema:');
    console.table(result.rows);
    
    // Also check primary key
    const pkResult = await pool.query(`
      SELECT constraint_name, column_name
      FROM information_schema.key_column_usage
      WHERE table_name = 'favourites' AND constraint_name LIKE '%pkey%';
    `);
    
    console.log('\nPrimary Key:');
    console.table(pkResult.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
})();
