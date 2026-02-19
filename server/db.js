import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL (Supabase)');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err.message);
});

export default pool;
