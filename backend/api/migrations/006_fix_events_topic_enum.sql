-- ============================================
-- Migration: 006_fix_events_topic_enum.sql (FIXED)
-- Description: Safety check for columns (Enum drop removed to prevent crash)
-- ============================================

-- 1. BAGIAN ENUM DIHAPUS / DI-COMMENT
-- Alasan: TOPIC_ENUM sudah dibuat di 003 dan sedang dipakai tabel 'events'.
-- Menghapusnya akan menyebabkan error "cannot drop type... because other objects depend on it".
-- Nilai enum di file ini juga identik dengan 003, jadi tidak perlu diubah.

/*
DO $$ BEGIN
  DROP TYPE IF EXISTS TOPIC_ENUM;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
...
*/

-- 2. Ensure columns exist (Safety Net)
-- Kolom-kolom ini seharusnya sudah dibuat oleh 004. 
-- Kita gunakan IF NOT EXISTS agar tidak error jika sudah ada.

ALTER TABLE events ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_retries INTEGER NOT NULL DEFAULT 3;
ALTER TABLE events ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS error_history JSONB; -- Disarankan JSONB agar konsisten dengan 004
ALTER TABLE events ADD COLUMN IF NOT EXISTS moved_to_dlq_at TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS dlq_reason TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_dlq BOOLEAN NOT NULL DEFAULT FALSE;