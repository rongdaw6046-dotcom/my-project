-- ============================================================
-- KKU Meeting Manager - Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT,
    surname TEXT,
    position TEXT,
    role TEXT DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
    line_user_id TEXT,
    allowed_meeting_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Meetings Table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    edition TEXT,
    date TEXT,
    time TEXT,
    location TEXT,
    status TEXT DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'COMPLETED')),
    budget NUMERIC(10, 2),
    "minutesFiles" JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Agendas Table
CREATE TABLE IF NOT EXISTS agendas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    "order" INT,
    is_important BOOLEAN DEFAULT FALSE,
    files JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attendees Table
CREATE TABLE IF NOT EXISTS attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT,
    position TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) - Disable for simplicity
-- (Enable and configure if you need user-based access control)
-- ============================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE agendas DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendees DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Seed: Create default admin user
-- ============================================================
INSERT INTO users (username, password, name, surname, position, role, allowed_meeting_ids)
VALUES ('admin', 'password', 'Admin', 'System', 'Administrator', 'ADMIN', '[]'::jsonb)
ON CONFLICT (username) DO NOTHING;
