-- Drop hanya enum jika perlu
DO $$ BEGIN
  DROP TYPE IF EXISTS TOPIC_ENUM;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Buat enum baru sesuai kebutuhan
DO $$ BEGIN
    CREATE TYPE TOPIC_ENUM AS ENUM(
      'surat.statusChanged',
      'aparat.updated',
      'aparat.statusChanged',
      'aparat.created',
      'aparat.deleted',
      'ekspedisi.created'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Tambahkan kolom baru ke tabel events
ALTER TABLE events ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_retries INTEGER NOT NULL DEFAULT 3;

-- ...existing code...
ALTER TABLE events ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP;

ALTER TABLE events ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP;

-- ...existing code...
ALTER TABLE events ADD COLUMN IF NOT EXISTS last_error TEXT;
-- ...existing code...


-- ...existing code...
ALTER TABLE events ADD COLUMN IF NOT EXISTS error_history TEXT;
-- ...existing code...


-- ...existing code...
ALTER TABLE events ADD COLUMN IF NOT EXISTS moved_to_dlq_at TIMESTAMP;
-- ...existing code...

-- ...existing code...
ALTER TABLE events ADD COLUMN IF NOT EXISTS dlq_reason TEXT;

-- ...existing code...
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_dlq BOOLEAN NOT NULL DEFAULT FALSE;
-- ...existing code...
-- ...existing code...
-- ...existing code...