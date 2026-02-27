-- ============================================================
-- Voting / Resolution System Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Vote Sessions Table
CREATE TABLE IF NOT EXISTS vote_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  agenda_id UUID NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'OPEN', 'CLOSED')),
  opens_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Votes Table (one vote per user per session)
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES vote_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  choice TEXT NOT NULL CHECK (choice IN ('APPROVE', 'REJECT', 'ABSTAIN')),
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Disable RLS for simplicity (consistent with other tables)
ALTER TABLE vote_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
