-- ============================================
-- Migration: 004_add_retry_and_dlq_fields.sql (FIXED)
-- Description: Add Retry & DLQ fields (Removed duplicates existing in 003)
-- ============================================

-- 1. Add ONLY missing columns for retry mechanism
-- Note: retry_count & max_retries already exist in 003_create_events_table.sql
ALTER TABLE events
ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS last_error TEXT NULL,
ADD COLUMN IF NOT EXISTS error_history JSONB NULL;

-- 2. Update default value for max_retries (003 sets it to 3, here we want 5)
ALTER TABLE events ALTER COLUMN max_retries SET DEFAULT 5;

-- 3. Add Dead Letter Queue fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS moved_to_dlq_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS dlq_reason TEXT NULL,
ADD COLUMN IF NOT EXISTS is_dlq BOOLEAN DEFAULT FALSE;

-- 4. Create indexes (Use IF NOT EXISTS to prevent errors on re-run)
CREATE INDEX IF NOT EXISTS idx_events_next_retry ON events(next_retry_at) WHERE next_retry_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_is_dlq ON events(is_dlq) WHERE is_dlq = TRUE;
CREATE INDEX IF NOT EXISTS idx_events_retry_count ON events(retry_count);

-- 5. Add comments
COMMENT ON COLUMN events.retry_count IS 'Current retry attempt (0 = first try)';
COMMENT ON COLUMN events.max_retries IS 'Maximum retry attempts before DLQ';
COMMENT ON COLUMN events.next_retry_at IS 'When to retry next (exponential backoff)';
COMMENT ON COLUMN events.last_retry_at IS 'Last retry timestamp';
COMMENT ON COLUMN events.last_error IS 'Last error message for debugging';
COMMENT ON COLUMN events.error_history IS 'Array of all errors with timestamps';
COMMENT ON COLUMN events.moved_to_dlq_at IS 'When event was moved to DLQ';
COMMENT ON COLUMN events.dlq_reason IS 'Why event was moved to DLQ';
COMMENT ON COLUMN events.is_dlq IS 'Flag to identify DLQ events';