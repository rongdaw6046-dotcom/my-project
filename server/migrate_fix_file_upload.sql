-- Migration: support large Base64 file uploads
-- Run this in phpMyAdmin if your database already exists

ALTER TABLE meetings MODIFY COLUMN minutes_files LONGTEXT;
ALTER TABLE agendas MODIFY COLUMN files LONGTEXT;
