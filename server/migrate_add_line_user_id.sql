-- Migration: Add line_user_id column for LINE LIFF integration
-- Run this in phpMyAdmin or MySQL CLI if your database already exists

ALTER TABLE users ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(255) NULL AFTER role;
