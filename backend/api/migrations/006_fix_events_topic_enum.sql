-- Drop hanya tabel events dan enum TOPIC_ENUM
DROP TABLE IF EXISTS events CASCADE;
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
      'aparat.statusChanged', -- contoh value baru
      'aparat.created',
      'aparat.deleted',
      'ekspedisi.created'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Buat ulang tabel events
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

-- ...lanjutkan index dan comment untuk tabel events seperti sebelumnya...