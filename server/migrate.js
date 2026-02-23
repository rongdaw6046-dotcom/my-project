import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('🔄 Starting migration...');

    // 1. Create Documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Checked/Created table: documents');

    // 2. Create Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for broadcast
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'SYSTEM', -- 'SYSTEM', 'MEETING', 'ALERT'
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Checked/Created table: notifications');

    // 3. Alter Meetings table to add minutes_summary
    // Check if column exists first to avoid error
    const { rows: columns } = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='meetings' AND column_name='minutes_summary';
    `);

    if (columns.length === 0) {
      await client.query(`
        ALTER TABLE meetings ADD COLUMN minutes_summary TEXT;
      `);
      console.log('✅ Added column: minutes_summary to meetings');
    } else {
      console.log('ℹ️ Column minutes_summary already exists in meetings');
    }

    // 4. Alter Documents table to add file_data and mime_type
    const { rows: docColumns } = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='documents' AND column_name='file_data';
    `);

    if (docColumns.length === 0) {
      await client.query(`
        ALTER TABLE documents ADD COLUMN file_data TEXT;
        ALTER TABLE documents ADD COLUMN mime_type TEXT;
      `);
      console.log('✅ Added columns: file_data, mime_type to documents');
    } else {
      console.log('ℹ️ Columns file_data, mime_type already exist in documents');
    }

    // 5. Alter Meetings table to add reminder_sent
    const { rows: reminderColumns } = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='meetings' AND column_name='reminder_sent';
    `);

    if (reminderColumns.length === 0) {
      await client.query(`
        ALTER TABLE meetings ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
      `);
      console.log('✅ Added column: reminder_sent to meetings');
    } else {
      console.log('ℹ️ Column reminder_sent already exists in meetings');
    }

    // 6. Alter Users table to add profile_image
    const { rows: userColumns } = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='profile_image';
    `);

    if (userColumns.length === 0) {
      await client.query(`
        ALTER TABLE users ADD COLUMN profile_image TEXT;
      `);
      console.log('✅ Added column: profile_image to users');
    } else {
      console.log('ℹ️ Column profile_image already exists in users');
    }

    console.log('🎉 Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
};

migrate();
