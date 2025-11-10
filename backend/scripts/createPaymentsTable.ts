/**
 * Create Payments Table
 * Run this script to set up the payments table for secure payment processing
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mLodge-Hotel',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function createPaymentsTable() {
  const client = await pool.connect();

  try {
    console.log('🔄 Checking existing payments table...');

    // Check if table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'payments'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log('⚠️  Payments table already exists. Dropping and recreating...');
      await client.query('DROP TABLE IF EXISTS payments CASCADE');
      console.log('✅ Old payments table dropped');
    }

    console.log('🔄 Creating new payments table...');

    // Create payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        amount INTEGER NOT NULL CHECK (amount > 0), -- Amount in cents
        currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
        payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('credit_card', 'payfast', 'bank_transfer')),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
        reference_number VARCHAR(100) UNIQUE NOT NULL,
        transaction_id VARCHAR(255),
        error_message TEXT,
        admin_notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
    `);

    console.log('✅ Payments table created');

    // Create indexes for better performance (check if table exists first)
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'payments'
      );
    `);

    if (tableCheck.rows[0].exists) {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
        CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
        CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
        CREATE INDEX IF NOT EXISTS idx_payments_reference_number ON payments(reference_number);
        CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
      `);

      console.log('✅ Indexes created');
    }

    // Add payment_status column to bookings table if it doesn't exist
    await client.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid' 
      CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded', 'partial'));
    `);

    console.log('✅ Added payment_status to bookings table');

    console.log('🎉 Payments table setup completed successfully!');
  } catch (error) {
    console.error('❌ Error creating payments table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
createPaymentsTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
