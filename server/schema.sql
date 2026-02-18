CREATE DATABASE IF NOT EXISTS meeting_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meeting_manager;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    surname VARCHAR(255),
    position VARCHAR(255),
    role ENUM('ADMIN', 'USER') DEFAULT 'USER',
    line_user_id VARCHAR(255) NULL,
    allowed_meeting_ids TEXT -- Storing JSON array for simplicity
);

-- 2. Meetings Table
CREATE TABLE IF NOT EXISTS meetings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    edition VARCHAR(50),
    date VARCHAR(20),
    time VARCHAR(20),
    location VARCHAR(255),
    status ENUM('UPCOMING', 'COMPLETED') DEFAULT 'UPCOMING',
    budget DECIMAL(10, 2),
    minutes_files LONGTEXT -- Storing JSON array of file objects
);

-- 3. Agendas Table
CREATE TABLE IF NOT EXISTS agendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    agenda_order INT,
    files LONGTEXT, -- Storing JSON array of file objects
    is_important BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

-- 4. Attendees Table
CREATE TABLE IF NOT EXISTS attendees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    user_id INT NULL, -- Can be NULL if external user
    name VARCHAR(255),
    position VARCHAR(255),
    status ENUM('PENDING', 'ACCEPTED', 'DECLINED') DEFAULT 'PENDING',
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);
