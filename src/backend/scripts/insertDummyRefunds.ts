const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function insertDummyRefunds() {
  const client = await pool.connect();

  try {
    console.log('🚀 Inserting dummy refunds data...\n');

    // First, create some dummy users if they don't exist
    console.log('👤 Creating dummy users...');
    const dummyUsers = [
      { email: 'john.doe@example.com', name: 'John Doe', phone: '+27 21 123 4567' },
      { email: 'jane.smith@example.com', name: 'Jane Smith', phone: '+27 11 234 5678' },
      { email: 'mike.johnson@example.com', name: 'Mike Johnson', phone: '+27 31 345 6789' },
      { email: 'sarah.wilson@example.com', name: 'Sarah Wilson', phone: '+27 21 456 7890' },
      { email: 'david.brown@example.com', name: 'David Brown', phone: '+27 11 567 8901' }
    ];

    const userIds: number[] = [];
    for (const user of dummyUsers) {
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
      if (existingUser.rows.length === 0) {
        const passwordHash = await bcrypt.hash('password123', 10);
        const result = await client.query(
          'INSERT INTO users (email, name, phone, password, role, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [user.email, user.name, user.phone, passwordHash, 'user', true]
        );
        userIds.push(result.rows[0].id);
        console.log(`✅ Created user: ${user.name} (ID: ${result.rows[0].id})`);
      } else {
        userIds.push(existingUser.rows[0].id);
        console.log(`ℹ️  User already exists: ${user.name} (ID: ${existingUser.rows[0].id})`);
      }
    }

    // Get accommodation IDs
    const accommodations = await client.query('SELECT id, name FROM accommodations ORDER BY id');
    console.log('\n🏨 Available accommodations:');
    accommodations.rows.forEach(acc => console.log(`  ${acc.id}: ${acc.name}`));

    // Get room IDs and prices
    const rooms = await client.query('SELECT id, name, accommodation_id, price_per_night FROM rooms ORDER BY id');
    console.log('\n🏠 Available rooms:');
    rooms.rows.forEach(room => console.log(`  ${room.id}: ${room.name} (${room.price_per_night} ZAR)`));

    // Create dummy bookings
    console.log('\n📅 Creating dummy bookings...');
    const bookingsData = [
      { user_id: userIds[0], accommodation_id: 1, room_id: 1, check_in: '2024-02-01', check_out: '2024-02-03', total_price: 9000.00, status: 'confirmed' },
      { user_id: userIds[1], accommodation_id: 2, room_id: 6, check_in: '2024-02-05', check_out: '2024-02-07', total_price: 6400.00, status: 'confirmed' },
      { user_id: userIds[2], accommodation_id: 3, room_id: 11, check_in: '2024-02-10', check_out: '2024-02-15', total_price: 32500.00, status: 'confirmed' },
      { user_id: userIds[3], accommodation_id: 1, room_id: 3, check_in: '2024-02-20', check_out: '2024-02-22', total_price: 4200.00, status: 'confirmed' },
      { user_id: userIds[4], accommodation_id: 2, room_id: 8, check_in: '2024-02-25', check_out: '2024-02-28', total_price: 26400.00, status: 'confirmed' }
    ];

    const bookingIds: number[] = [];
    for (let i = 0; i < bookingsData.length; i++) {
      const booking = bookingsData[i];
      const bookingRef = `BK${String(1000 + i + 1).slice(-4)}`;

      const result = await client.query(
        `INSERT INTO bookings (booking_reference, user_id, accommodation_id, status, total_price, currency, check_in_date, check_out_date, guest_count, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [bookingRef, booking.user_id, booking.accommodation_id, booking.status, booking.total_price, 'ZAR', booking.check_in, booking.check_out, 2, 'Website']
      );

      bookingIds.push(result.rows[0].id);
      console.log(`✅ Created booking: ${bookingRef} (ID: ${result.rows[0].id})`);

      // Add booking items
      await client.query(
        `INSERT INTO booking_items (booking_id, room_id, price_per_night, nights, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [result.rows[0].id, booking.room_id, rooms.rows.find(r => r.id === booking.room_id)?.price_per_night || 4500, 2, 1]
      );
    }

    // Create dummy refunds
    console.log('\n💰 Creating dummy refunds...');
    const refundsData = [
      {
        booking_id: bookingIds[0],
        reason: 'Family emergency - unable to travel',
        refund_amount: 9000.00,
        status: 'pending',
        admin_notes: null,
        transaction_id: null,
        requested_date: '2024-01-25 10:30:00',
        processed_date: null,
        processed_by: null
      },
      {
        booking_id: bookingIds[1],
        reason: 'Hotel overbooked - alternative accommodation provided',
        refund_amount: 6400.00,
        status: 'approved',
        admin_notes: 'Approved - guest will receive full refund via original payment method',
        transaction_id: null,
        requested_date: '2024-01-20 14:20:00',
        processed_date: '2024-01-22 09:15:00',
        processed_by: 1
      },
      {
        booking_id: bookingIds[2],
        reason: 'Change of plans - business trip canceled',
        refund_amount: 32500.00,
        status: 'rejected',
        admin_notes: 'Policy violation - cancellation made less than 24 hours before check-in',
        transaction_id: null,
        requested_date: '2024-01-18 16:45:00',
        processed_date: '2024-01-19 11:30:00',
        processed_by: 1
      },
      {
        booking_id: bookingIds[3],
        reason: 'Room maintenance issues - not as advertised',
        refund_amount: 4200.00,
        status: 'processed',
        admin_notes: 'Processed via bank transfer',
        transaction_id: 'TXN_20240124_001',
        requested_date: '2024-01-22 08:15:00',
        processed_date: '2024-01-24 13:20:00',
        processed_by: 1
      },
      {
        booking_id: bookingIds[4],
        reason: 'Flight delay caused late arrival',
        refund_amount: 26400.00,
        status: 'pending',
        admin_notes: null,
        transaction_id: null,
        requested_date: '2024-01-28 12:00:00',
        processed_date: null,
        processed_by: null
      },
      {
        booking_id: bookingIds[0],
        reason: 'Duplicate booking error on our system',
        refund_amount: 9000.00,
        status: 'approved',
        admin_notes: 'Approved - system error on our end, full refund issued',
        transaction_id: null,
        requested_date: '2024-01-30 09:30:00',
        processed_date: '2024-01-31 10:45:00',
        processed_by: 1
      },
      {
        booking_id: bookingIds[1],
        reason: 'Medical emergency - hospitalization required',
        refund_amount: 6400.00,
        status: 'processed',
        admin_notes: 'Emergency refund processed immediately via bank transfer',
        transaction_id: 'TXN_20240201_002',
        requested_date: '2024-02-01 15:10:00',
        processed_date: '2024-02-01 16:30:00',
        processed_by: 1
      },
      {
        booking_id: bookingIds[2],
        reason: 'Severe weather conditions prevented travel',
        refund_amount: 32500.00,
        status: 'pending',
        admin_notes: null,
        transaction_id: null,
        requested_date: '2024-02-05 11:20:00',
        processed_date: null,
        processed_by: null
      }
    ];

    for (const refund of refundsData) {
      await client.query(
        `INSERT INTO refunds (booking_id, reason, refund_amount, status, admin_notes, transaction_id, requested_date, processed_date, processed_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          refund.booking_id,
          refund.reason,
          refund.refund_amount,
          refund.status,
          refund.admin_notes,
          refund.transaction_id,
          refund.requested_date,
          refund.processed_date,
          refund.processed_by,
          refund.requested_date,
          refund.processed_date || refund.requested_date
        ]
      );
    }

    console.log(`✅ Created ${refundsData.length} dummy refunds`);

    // Verify the data
    console.log('\n🔍 Verifying inserted data...');
    const refundsResult = await client.query(`
      SELECT r.id, r.booking_id, b.booking_reference, u.name as guest_name, u.email as guest_email,
             r.refund_amount, r.reason, r.status, r.requested_date
      FROM refunds r
      JOIN bookings b ON r.booking_id = b.id
      JOIN users u ON b.user_id = u.id
      ORDER BY r.id
    `);

    console.log('\n📋 Inserted refunds:');
    refundsResult.rows.forEach(refund => {
      console.log(`  ID ${refund.id}: ${refund.guest_name} - R ${refund.refund_amount} (${refund.status})`);
    });

    console.log('\n✨ Dummy data insertion completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users created: ${userIds.length}`);
    console.log(`   Bookings created: ${bookingIds.length}`);
    console.log(`   Refunds created: ${refundsData.length}`);
    console.log('\n🚀 You can now view the refunds in your admin dashboard!');

  } catch (error) {
    console.error('❌ Error inserting dummy data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the insertion
insertDummyRefunds().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
