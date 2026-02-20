import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';


const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatUser = (row) => ({
  id: row.id.toString(),
  username: row.username,
  password: row.password,
  name: row.name,
  surname: row.surname,
  position: row.position,
  role: row.role,
  lineUserId: row.line_user_id || null,
  allowedMeetingIds: row.allowed_meeting_ids || []
});

const formatMeeting = (row) => ({
  id: row.id.toString(),
  title: row.title,
  edition: row.edition || '',
  date: row.date || '',
  time: row.time || '',
  location: row.location || '',
  status: row.status || 'UPCOMING',
  budget: row.budget ? parseFloat(row.budget) : 0,
  minutesFiles: row["minutesFiles"] || [],
  minutesSummary: row.minutes_summary || ''
});

const formatAgenda = (row) => ({
  id: row.id.toString(),
  meetingId: row.meeting_id.toString(),
  title: row.title || '',
  description: row.description || '',
  order: row.order || 0,
  isImportant: !!row.is_important,
  files: row.files || []
});

const formatAttendee = (row) => ({
  id: row.id.toString(),
  meetingId: row.meeting_id.toString(),
  userId: row.user_id ? row.user_id.toString() : undefined,
  name: row.name,
  position: row.position || '',
  status: row.status || 'PENDING'
});

// ─── DB Connection Check ──────────────────────────────────────────────────────
pool.connect()
  .then(client => { console.log('✅ Connected to PostgreSQL (Supabase)'); client.release(); })
  .catch(err => { console.error('❌ PostgreSQL connection failed:', err.message); });

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (rows.length > 0) res.json(formatUser(rows[0]));
    else res.status(401).json({ message: 'Invalid credentials' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, name, surname, position, role } = req.body;
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.length > 0) return res.status(400).json({ message: 'Username already exists' });

    const { rows: result } = await pool.query(
      'INSERT INTO users (username, password, name, surname, position, role, allowed_meeting_ids) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [username, password, name, surname, position, role || 'USER', JSON.stringify([])]
    );
    res.json(formatUser(result[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Users ────────────────────────────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows.map(formatUser));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, password, name, surname, position, role } = req.body;
    const { rows: newUser } = await pool.query(
      'INSERT INTO users (username, password, name, surname, position, role, allowed_meeting_ids) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [username, password, name, surname, position, role, JSON.stringify([])]
    );
    res.json(formatUser(newUser[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { username, name, surname, position, role, password, lineUserId } = req.body;
    let query = 'UPDATE users SET username=$1, name=$2, surname=$3, position=$4, role=$5';
    let params = [username, name, surname, position, role];
    let idx = 6;

    if (password) { query += `, password=$${idx}`; params.push(password); idx++; }
    if (lineUserId !== undefined) { query += `, line_user_id=$${idx}`; params.push(lineUserId); idx++; }

    query += ` WHERE id=$${idx} RETURNING *`;
    params.push(req.params.id);

    const { rows: updated } = await pool.query(query, params);
    res.json(formatUser(updated[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/users/:id/permissions', async (req, res) => {
  try {
    const allowedMeetingIds = JSON.stringify(req.body.allowedMeetingIds);
    const { rows: updated } = await pool.query(
      'UPDATE users SET allowed_meeting_ids = $1 WHERE id = $2 RETURNING *',
      [allowedMeetingIds, req.params.id]
    );
    res.json(formatUser(updated[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Meetings ─────────────────────────────────────────────────────────────────
app.get('/api/meetings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM meetings ORDER BY created_at DESC');
    res.json(rows.map(formatMeeting));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/meetings', async (req, res) => {
  try {
    const { title, edition, date, time, location, status, budget, minutesFiles, minutesSummary } = req.body;
    const { rows: newMeeting } = await pool.query(
      'INSERT INTO meetings (title, edition, date, time, location, status, budget, "minutesFiles", minutes_summary) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [title, edition, date, time, location, status, budget, JSON.stringify(minutesFiles || []), minutesSummary || '']
    );
    res.json(formatMeeting(newMeeting[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/meetings/:id', async (req, res) => {
  try {
    const { title, edition, date, time, location, status, budget, minutesFiles, minutesSummary } = req.body;
    const { rows: updated } = await pool.query(
      'UPDATE meetings SET title=$1, edition=$2, date=$3, time=$4, location=$5, status=$6, budget=$7, "minutesFiles"=$8, minutes_summary=$9 WHERE id=$10 RETURNING *',
      [title, edition, date, time, location, status, budget, JSON.stringify(minutesFiles || []), minutesSummary || '', req.params.id]
    );
    res.json(formatMeeting(updated[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/meetings/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM meetings WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Agendas ──────────────────────────────────────────────────────────────────
app.get('/api/agendas', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM agendas ORDER BY "order" ASC');
    res.json(rows.map(formatAgenda));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/agendas', async (req, res) => {
  try {
    const { meetingId, title, description, order, files, isImportant } = req.body;
    const { rows: newAgenda } = await pool.query(
      'INSERT INTO agendas (meeting_id, title, description, "order", files, is_important) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [meetingId, title, description, order, JSON.stringify(files || []), isImportant ? true : false]
    );
    res.json(formatAgenda(newAgenda[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/agendas/:id', async (req, res) => {
  try {
    const { title, description, order, files, isImportant } = req.body;
    const { rows: updated } = await pool.query(
      'UPDATE agendas SET title=$1, description=$2, "order"=$3, files=$4, is_important=$5 WHERE id=$6 RETURNING *',
      [title, description, order, JSON.stringify(files || []), isImportant ? true : false, req.params.id]
    );
    res.json(formatAgenda(updated[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/agendas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM agendas WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Attendees ────────────────────────────────────────────────────────────────
app.get('/api/attendees', async (req, res) => {
  try {
    const meetingId = req.query.meetingId;
    const query = meetingId
      ? 'SELECT * FROM attendees WHERE meeting_id = $1'
      : 'SELECT * FROM attendees';
    const params = meetingId ? [meetingId] : [];
    const { rows } = await pool.query(query, params);
    res.json(rows.map(formatAttendee));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/attendees', async (req, res) => {
  try {
    const { meetingId, userId, name, position, status } = req.body;
    const { rows: newAttendee } = await pool.query(
      'INSERT INTO attendees (meeting_id, user_id, name, position, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [meetingId, userId || null, name, position, status || 'PENDING']
    );
    res.json(formatAttendee(newAttendee[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/attendees/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM attendees WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/attendees/:id/status', async (req, res) => {
  try {
    const { rows: updated } = await pool.query(
      'UPDATE attendees SET status = $1 WHERE id = $2 RETURNING *',
      [req.body.status, req.params.id]
    );
    res.json(formatAttendee(updated[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Documents ────────────────────────────────────────────────────────────────
// ─── Documents ────────────────────────────────────────────────────────────────
app.get('/api/documents', async (req, res) => {
  try {
    const meetingId = req.query.meetingId;
    // EXCLUDE file_data to prevent large payloads
    const query = meetingId
      ? 'SELECT id, meeting_id, name, url, mime_type, created_at FROM documents WHERE meeting_id = $1 ORDER BY created_at DESC'
      : 'SELECT id, meeting_id, name, url, mime_type, created_at FROM documents ORDER BY created_at DESC';
    const params = meetingId ? [meetingId] : [];
    const { rows } = await pool.query(query, params);

    res.json(rows.map(row => ({
      id: row.id,
      meetingId: row.meeting_id,
      name: row.name,
      url: row.url, // Might be null for uploaded files
      mimeType: row.mime_type,
      createdAt: row.created_at
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/documents/:id/download', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT name, file_data, mime_type FROM documents WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Document not found' });

    const doc = rows[0];
    if (!doc.file_data) {
      return res.status(404).json({ error: 'No file content found for this document' });
    }

    // Convert Base64 back to buffer
    const fileBuffer = Buffer.from(doc.file_data, 'base64');

    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.name)}"`);
    res.send(fileBuffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const { meetingId, name, url, fileData, mimeType } = req.body;

    // If fileData is provided, we store it. url can be ignored or used as fallback.
    const { rows: newDoc } = await pool.query(
      'INSERT INTO documents (meeting_id, name, url, file_data, mime_type) VALUES ($1, $2, $3, $4, $5) RETURNING id, meeting_id, name, url, mime_type, created_at',
      [meetingId, name, url || '', fileData || null, mimeType || null]
    );

    const row = newDoc[0];
    res.json({
      id: row.id,
      meetingId: row.meeting_id,
      name: row.name,
      url: row.url,
      mimeType: row.mime_type,
      createdAt: row.created_at
    });
  } catch (e) {
    // PostgreSQL might return error if payload is too large, handle it
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM documents WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Notifications ────────────────────────────────────────────────────────────
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    // Get broadcast notifications (user_id IS NULL) OR specific user notifications
    const query = `
      SELECT * FROM notifications 
      WHERE user_id IS NULL ${userId ? 'OR user_id = $1' : ''}
      ORDER BY created_at DESC
    `;
    const params = userId ? [userId] : [];
    const { rows } = await pool.query(query, params);
    res.json(rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      message: row.message,
      type: row.type,
      isRead: row.is_read,
      createdAt: row.created_at
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    const { rows: newNotif } = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId || null, title, message, type || 'SYSTEM']
    );
    const row = newNotif[0];
    res.json({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      message: row.message,
      type: row.type,
      isRead: row.is_read,
      createdAt: row.created_at
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── LIFF Registration ────────────────────────────────────────────────────────


// ─── Seed ─────────────────────────────────────────────────────────────────────
app.get('/api/seed', async (req, res) => {
  try {
    const { rows: users } = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (users.length === 0) {
      await pool.query(
        'INSERT INTO users (username, password, name, surname, position, role, allowed_meeting_ids) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        ['admin', 'password', 'Admin', 'System', 'Administrator', 'ADMIN', JSON.stringify([])]
      );
      res.send('✅ Admin created: username=admin, password=password');
    } else {
      res.send('ℹ️ Admin already exists');
    }
  } catch (e) { res.status(500).send('❌ Error: ' + e.message); }
});

// Serve frontend (Vite build)
// Serve frontend (Vite build)
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all เฉพาะ non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});