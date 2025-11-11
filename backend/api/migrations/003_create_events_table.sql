-- ============================================
-- Migration: 003_create_events_table.sql
-- Description: Create Events table
-- Sprint: 2 
-- Author: Kelompok 9 - ELL Besi Sinaga
-- ============================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
    CREATE TYPE TOPIC_ENUM AS ENUM('surat.statusChanged', 'aparat.updated', 'ekspedisi.created');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE STATUS_ENUM AS ENUM('pending', 'consumed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE PROCESSING_ENUM AS ENUM('failed', 'success');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- TABLE: events
-- ============================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic TOPIC_ENUM NOT NULL,
    payload JSONB,
    source_module VARCHAR(255) NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    status STATUS_ENUM NOT NULL DEFAULT 'pending',
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: events_acknowledgements
-- ============================================

CREATE TABLE IF NOT EXISTS events_acknowledgements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE, 
    consumer_module VARCHAR(255) NOT NULL,
    acknowledged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processing_status PROCESSING_ENUM NOT NULL,
    error_message TEXT,
    UNIQUE(event_id, consumer_module)
);

-- ============================================
-- INDEXES
-- ============================================

-- Index untuk performa (idempotent)
CREATE INDEX IF NOT EXISTS idx_events_topic ON events(topic);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_idempotency_key ON events(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_source_module ON events(source_module);

-- ✅ COMPOSITE INDEXES (multiple columns)
-- For queries like: SELECT * FROM events WHERE topic = 'surat.statusChanged' ORDER BY timestamp DESC
CREATE INDEX IF NOT EXISTS idx_events_topic_timestamp ON events(topic, timestamp DESC);

-- For queries like: SELECT * FROM events WHERE status = 'pending' ORDER BY timestamp ASC
CREATE INDEX IF NOT EXISTS idx_events_status_timestamp ON events(status, timestamp ASC);

-- For queries like: SELECT * FROM events WHERE topic = 'surat.statusChanged' AND status = 'pending'
CREATE INDEX IF NOT EXISTS idx_events_topic_status ON events(topic, status);

-- Indexes for acknowledgements table
CREATE INDEX IF NOT EXISTS idx_ack_event_id ON events_acknowledgements(event_id);
CREATE INDEX IF NOT EXISTS idx_ack_consumer_module ON events_acknowledgements(consumer_module);
CREATE INDEX IF NOT EXISTS idx_ack_processing_status ON events_acknowledgements(processing_status);

-- ✅ Composite index for finding unacknowledged events by specific consumer
CREATE INDEX IF NOT EXISTS idx_ack_event_consumer ON events_acknowledgements(event_id, consumer_module);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE events IS 'Event bus for inter-module communication';
COMMENT ON COLUMN events.idempotency_key IS 'Unique key to prevent duplicate event processing';
COMMENT ON COLUMN events.payload IS 'JSON payload containing event data';

COMMENT ON TABLE events_acknowledgements IS 'Tracks which modules have processed which events';
COMMENT ON COLUMN events_acknowledgements.processing_status IS 'Whether event processing succeeded or failed';

COMMIT;