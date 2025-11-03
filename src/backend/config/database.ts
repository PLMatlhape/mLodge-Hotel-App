import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('📦 Database connected');
});

pool.on('error', (err: Error) => {
  console.error('❌ Unexpected database error:', err);
  // Don't exit, just log the error
});

// Test connection on startup (async, don't block)
setTimeout(() => {
  pool.query('SELECT NOW()', (err) => {
    if (err) {
      console.error('❌ Database initialization error:', err.message);
    } else {
      console.log('✅ Database connection verified at startup');
    }
  });
}, 100);

// Helper function to execute queries
export const query = async (text: string, params?: unknown[]): Promise<QueryResult> => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('📊 Executed query', { text, duration, rows: res.rowCount });
  return res;
};

// Get a client from the pool for transactions
export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export default { query, getClient };
