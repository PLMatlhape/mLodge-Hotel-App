const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mLodge-Hotel',
  user: 'postgres',
  password: 'mosa123',
});

(async () => {
  try {
    console.log('✅ Testing INSERT INTO favourites after fix...\n');
    const userId = 39;
    const roomId = 2;
    
    const result = await pool.query(
      'INSERT INTO favourites (user_id, room_id) VALUES ($1, $2) RETURNING *',
      [userId, roomId]
    );
    console.log('✅ INSERT successful:');
    console.table(result.rows);
    
    // Now test DELETE
    console.log('\n✅ Testing DELETE FROM favourites...\n');
    const deleteResult = await pool.query(
      'DELETE FROM favourites WHERE user_id = $1 AND room_id = $2 RETURNING *',
      [userId, roomId]
    );
    console.log('✅ DELETE successful:');
    console.table(deleteResult.rows);
    
    console.log('\n✅ Both INSERT and DELETE work correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();
