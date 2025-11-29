-- Add retry mechanism fields
ALTER TABLE events
ADD COLUMN retry_count INTEGER DEFAULT 0,
ADD COLUMN max_retries INTEGER DEFAULT 5,
ADD COLUMN next_retry_at TIMESTAMP NULL,
ADD COLUMN last_retry_at TIMESTAMP NULL,
ADD COLUMN last_error TEXT NULL,
ADD COLUMN error_history JSONB NULL;

-- Add Dead Letter Queue fields
ALTER TABLE events
ADD COLUMN moved_to_dlq_at TIMESTAMP NULL,
ADD COLUMN dlq_reason TEXT NULL,
ADD COLUMN is_dlq BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX idx_events_next_retry ON events(next_retry_at) WHERE next_retry_at IS NOT NULL;
CREATE INDEX idx_events_is_dlq ON events(is_dlq) WHERE is_dlq = TRUE;
CREATE INDEX idx_events_retry_count ON events(retry_count);

-- Add comments
COMMENT ON COLUMN events.retry_count IS 'Current retry attempt (0 = first try)';
COMMENT ON COLUMN events.max_retries IS 'Maximum retry attempts before DLQ';
COMMENT ON COLUMN events.next_retry_at IS 'When to retry next (exponential backoff)';
COMMENT ON COLUMN events.last_retry_at IS 'Last retry timestamp';
COMMENT ON COLUMN events.last_error IS 'Last error message for debugging';
COMMENT ON COLUMN events.error_history IS 'Array of all errors with timestamps';
COMMENT ON COLUMN events.moved_to_dlq_at IS 'When event was moved to DLQ';
COMMENT ON COLUMN events.dlq_reason IS 'Why event was moved to DLQ';
COMMENT ON COLUMN events.is_dlq IS 'Flag to identify DLQ events';