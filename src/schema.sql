-- ====================================================================
-- Community Event OS - Relational Database Schema (SQL DDL)
-- Target RDBMS: PostgreSQL 14+ / MySQL 8.0+
-- ====================================================================

-- 1. USERS TABLE
-- Handles user identities and role-based authorization (Organizer, Volunteer, Attendee)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('organizer', 'volunteer', 'attendee')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);


-- 2. EVENTS TABLE
-- Holds core event details managed by organizers
CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL DEFAULT 500,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
    organizer_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);


-- 3. REGISTRATIONS & TICKETS TABLE
-- Stores ticket purchases, uniquely generated QR codes, and check-in statuses
CREATE TABLE registrations (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    ticket_type VARCHAR(30) NOT NULL CHECK (ticket_type IN ('VIP', 'General', 'Student', 'Speaker', 'Press')),
    qr_code VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'cancelled')),
    checked_in BOOLEAN NOT NULL DEFAULT FALSE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_registrations_qr_code ON registrations(qr_code);
CREATE INDEX idx_registrations_event_user ON registrations(event_id, user_id);
CREATE INDEX idx_registrations_checked_in ON registrations(checked_in);


-- 4. SESSIONS & SCHEDULE TABLE
-- Speaker schedule, track management, room allocation, and time slots
CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    speaker_name VARCHAR(120) NOT NULL,
    speaker_bio TEXT,
    speaker_avatar TEXT,
    track VARCHAR(100) NOT NULL, -- e.g., 'Main Stage', 'Workshop Room A', 'Networking Lounge'
    location_room VARCHAR(100) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_capacity INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sessions_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_event_time ON sessions(event_id, start_time);
CREATE INDEX idx_sessions_track ON sessions(track);


-- 5. VOLUNTEER ASSIGNMENTS TABLE
-- Roster management, shift times, and duty venue locations
CREATE TABLE volunteers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    event_id VARCHAR(36) NOT NULL,
    role_title VARCHAR(100) NOT NULL, -- e.g., 'Door Check-in', 'VIP Lounge', 'Usher', 'Info Desk'
    venue_location VARCHAR(100) NOT NULL,
    shift_start TIMESTAMP WITH TIME ZONE NOT NULL,
    shift_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (status IN ('on_duty', 'off_duty', 'assigned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_volunteers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_volunteers_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX idx_volunteers_event ON volunteers(event_id);
CREATE INDEX idx_volunteers_user ON volunteers(user_id);
CREATE INDEX idx_volunteers_status ON volunteers(status);


-- 6. GLOBAL ANNOUNCEMENTS TABLE
-- Live broadcasting notifications sent by event organizers to attendees
CREATE TABLE announcements (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'urgent')),
    author_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_announcements_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_announcements_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_announcements_event ON announcements(event_id, created_at DESC);


-- 7. POST-EVENT FEEDBACK TABLE
-- Attendee ratings, category breakdowns, and NPS metrics
CREATE TABLE feedback (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'Overall',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_feedback_event ON feedback(event_id);


-- 8. CERTIFICATES TABLE
-- Automated certificate generation for verified check-in attendees
CREATE TABLE certificates (
    id VARCHAR(36) PRIMARY KEY,
    registration_id VARCHAR(36) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    event_id VARCHAR(36) NOT NULL,
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    download_url TEXT,
    CONSTRAINT fk_certs_registration FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    CONSTRAINT fk_certs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_certs_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX idx_certificates_user ON certificates(user_id);
