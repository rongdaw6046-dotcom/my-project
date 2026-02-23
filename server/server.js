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
  allowedMeetingIds: row.allowed_meeting_ids || [],
  profileImage: row.profile_image || null
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
    if (req.body.profileImage !== undefined) { query += `, profile_image=$${idx}`; params.push(req.body.profileImage); idx++; }

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

    // Check for inline query param
    const disposition = req.query.inline === 'true' ? 'inline' : 'attachment';
    res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(doc.name)}"`);

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
    const { userId, title, message, type, sendLine } = req.body;

    // 1. Save to Database
    const { rows: newNotif } = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId || null, title, message, type || 'SYSTEM']
    );

    // 2. Optional: Send to LINE
    if (sendLine) {
      console.log(`📢 Attempting to send LINE notification for: ${title}`);
      const flexContents = {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [{ type: "text", text: "การแจ้งเตือนจากระบบ 🔔", weight: "bold", color: "#ffffff", size: "sm" }],
          backgroundColor: "#EA580C"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: title, weight: "bold", size: "xl", wrap: true },
            { type: "text", text: message, margin: "md", wrap: true, color: "#666666", size: "sm" }
          ]
        }
      };

      if (userId) {
        // Individual notification
        console.log(`👤 Sending to individual user: ${userId}`);
        const { rows: userRows } = await pool.query('SELECT line_user_id, name FROM users WHERE id = $1', [userId]);
        if (userRows[0]?.line_user_id) {
          console.log(`✅ Found LINE ID for ${userRows[0].name}: ${userRows[0].line_user_id}`);
          await sendLineFlexMessage(userRows[0].line_user_id, `แจ้งเตือน: ${title}`, flexContents)
            .then(() => console.log('🚀 Message sent successfully'))
            .catch(err => console.error('❌ LINE Send Error:', err.message));
        } else {
          console.warn(`⚠️ User ${userId} (${userRows[0]?.name || 'Unknown'}) does not have a line_user_id`);
        }
      } else {
        // Broadcast
        console.log('🌍 Sending broadcast to all users with LINE ID');
        const { rows: allUsers } = await pool.query('SELECT line_user_id, name FROM users WHERE line_user_id IS NOT NULL');
        console.log(`👥 Found ${allUsers.length} users with LINE ID`);
        for (const u of allUsers) {
          console.log(`➡️ Sending to ${u.name}`);
          await sendLineFlexMessage(u.line_user_id, `แจ้งเตือน: ${title}`, flexContents)
            .catch(err => console.error(`❌ LINE Send Error for ${u.name}:`, err.message));
        }
      }
    }

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

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── LINE Helper ─────────────────────────────────────────────────────────────
const sendLineFlexMessage = async (lineUserId, altText, flexContents) => {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{ type: 'flex', altText, contents: flexContents }]
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to send LINE message');
  return data;
};

// ─── Scheduled Reminders ─────────────────────────────────────────────────────
const checkAndSendReminders = async () => {
  try {
    console.log('⏰ Checking for meeting reminders...');
    // Tomorrow in YYYY-MM-DD (Thai time)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];

    const { rows: meetings } = await pool.query(
      "SELECT * FROM meetings WHERE date = $1 AND status = 'UPCOMING' AND reminder_sent = false",
      [dateString]
    );

    for (const meeting of meetings) {
      console.log(`📌 Sending reminders for: ${meeting.title}`);
      const { rows: participants } = await pool.query(`
        SELECT u.line_user_id, u.name, u.surname 
        FROM attendees a
        JOIN users u ON a.user_id = u.id
        WHERE a.meeting_id = $1 AND u.line_user_id IS NOT NULL
      `, [meeting.id]);

      for (const p of participants) {
        try {
          const flexContents = {
            type: "bubble",
            header: {
              type: "box",
              layout: "vertical",
              contents: [{ type: "text", text: "แจ้งเตือนการประชุมพรุ่งนี้ 🔔", weight: "bold", color: "#ffffff", size: "sm" }],
              backgroundColor: "#22C55E"
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                { type: "text", text: meeting.title, weight: "bold", size: "xl", wrap: true },
                {
                  type: "box",
                  layout: "vertical",
                  margin: "lg",
                  spacing: "sm",
                  contents: [
                    {
                      type: "box",
                      layout: "baseline",
                      spacing: "sm",
                      contents: [
                        { type: "text", text: "📅 วันที่", color: "#999999", size: "xs", flex: 1 },
                        { type: "text", text: meeting.date, wrap: true, color: "#666666", size: "xs", flex: 4 }
                      ]
                    },
                    {
                      type: "box",
                      layout: "baseline",
                      spacing: "sm",
                      contents: [
                        { type: "text", text: "⏰ เวลา", color: "#999999", size: "xs", flex: 1 },
                        { type: "text", text: meeting.time, wrap: true, color: "#666666", size: "xs", flex: 4 }
                      ]
                    },
                    {
                      type: "box",
                      layout: "baseline",
                      spacing: "sm",
                      contents: [
                        { type: "text", text: "📍 สถานที่", color: "#999999", size: "xs", flex: 1 },
                        { type: "text", text: meeting.location, wrap: true, color: "#666666", size: "xs", flex: 4 }
                      ]
                    }
                  ]
                }
              ]
            }
          };

          await sendLineFlexMessage(p.line_user_id, `แจ้งเตือนการประชุมพรุ่งนี้: ${meeting.title}`, flexContents);
        } catch (err) {
          console.error(`❌ Send Error (${p.line_user_id}):`, err.message);
        }
      }

      // Mark as sent
      await pool.query('UPDATE meetings SET reminder_sent = true WHERE id = $1', [meeting.id]);
    }
  } catch (err) {
    console.error('❌ Reminder Check Error:', err);
  }
};

// Trigger check every hour, run at 8 AM Thai time
setInterval(() => {
  const now = new Date();
  const thaiHour = (now.getUTCHours() + 7) % 24;
  if (thaiHour === 8) {
    checkAndSendReminders();
  }
}, 3600000);

// Add manual trigger endpoint for admin testing
app.post('/api/admin/trigger-reminders', async (req, res) => {
  try {
    await checkAndSendReminders();
    res.json({ success: true, message: 'Reminder check triggered manually' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── LINE Notification (Flex Message Invitation) ─────────────────────────────
app.post('/api/line/send-invite', async (req, res) => {
  try {
    const { lineUserId, meeting, rsvpLink } = req.body;

    const flexMessage = {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "เชิญเข้าร่วมประชุม 📅",
            weight: "bold",
            color: "#ffffff",
            size: "sm"
          }
        ],
        backgroundColor: "#EA580C"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: meeting.title,
            weight: "bold",
            size: "xl",
            wrap: true
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "📅 วันที่",
                    color: "#999999",
                    size: "xs",
                    flex: 1
                  },
                  {
                    type: "text",
                    text: meeting.date,
                    wrap: true,
                    color: "#666666",
                    size: "xs",
                    flex: 4
                  }
                ]
              },
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "⏰ เวลา",
                    color: "#999999",
                    size: "xs",
                    flex: 1
                  },
                  {
                    type: "text",
                    text: meeting.time,
                    wrap: true,
                    color: "#666666",
                    size: "xs",
                    flex: 4
                  }
                ]
              },
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "📍 สถานที่",
                    color: "#999999",
                    size: "xs",
                    flex: 1
                  },
                  {
                    type: "text",
                    text: meeting.location,
                    wrap: true,
                    color: "#666666",
                    size: "xs",
                    flex: 4
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            action: {
              type: "uri",
              label: "กดเพื่อตอบรับการประชุม",
              uri: rsvpLink
            },
            color: "#EA580C"
          }
        ],
        flex: 0
      }
    };

    await sendLineFlexMessage(lineUserId, `ขอเชิญเข้าร่วมประชุม: ${meeting.title}`, flexMessage);
    res.json({ success: true });
  } catch (e) {
    console.error('LINE Send Error:', e);
    res.status(500).json({ error: e.message });
  }
});

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