import db from '../config/database';

async function testAccommodations() {
  try {
    console.log('🧪 Testing accommodations in database...\n');

    // Query all accommodations
    const result = await db.query(`
      SELECT id, name, city, address, is_active, created_at
      FROM accommodations
      ORDER BY city
    `);

    console.log(`Found ${result.rows.length} accommodations:\n`);
    console.table(result.rows);

    if (result.rows.length === 0) {
      console.log('\n⚠️  No accommodations found!');
      console.log('Run: npm run setup-accommodations');
    } else {
      console.log('\n✅ Accommodations are available in the database');
      console.log('\n📋 Frontend should receive this data when calling GET /api/accommodations');
    }

  } catch (error) {
    console.error('❌ Error testing accommodations:', error);
  } finally {
    process.exit(0);
  }
}

testAccommodations();
