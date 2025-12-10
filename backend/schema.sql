-- Create database if not exists
CREATE DATABASE IF NOT EXISTS debatehub;
USE debatehub;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    course_count INT DEFAULT 0,
    gradient VARCHAR(100)
);

-- Instructors table
CREATE TABLE IF NOT EXISTS instructors (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255)
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id VARCHAR(36),
    category_id VARCHAR(36),
    price FLOAT,
    original_price FLOAT,
    rating FLOAT,
    student_count INT DEFAULT 0,
    duration VARCHAR(50),
    image_url VARCHAR(255),
    badge VARCHAR(50),
    badge_color VARCHAR(50),
    updated_date VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(36) PRIMARY KEY,
    student_name VARCHAR(100),
    student_title VARCHAR(100),
    student_avatar VARCHAR(255),
    rating INT,
    comment TEXT
);

-- Debate Sessions table
CREATE TABLE IF NOT EXISTS debate_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    partner_id VARCHAR(36),
    topic VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Debate Transcripts table
CREATE TABLE IF NOT EXISTS debate_transcripts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(36),
    speaker VARCHAR(50),
    text TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES debate_sessions(id)
);

-- Debate Analysis table
CREATE TABLE IF NOT EXISTS debate_analysis (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36),
    user_id VARCHAR(36),
    scores JSON,
    feedback JSON,
    improvements JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES debate_sessions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    plan_type VARCHAR(50),
    status VARCHAR(50),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Debate Session Tracking table
CREATE TABLE IF NOT EXISTS debate_sessions_tracking (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    partner_id VARCHAR(36),
    topic VARCHAR(100),
    session_date VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
