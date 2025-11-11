BEGIN;

-- ============================================
-- ENUMS untuk Surat
-- ============================================

DO $$ BEGIN
    CREATE TYPE jenis_surat_enum AS ENUM ('MASUK', 'KELUAR');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE status_surat_enum AS ENUM ('DRAFT', 'TERKIRIM', 'DITERIMA', 'SELESAI');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- TABLE: surat (Modul Agenda)
-- ============================================

CREATE TABLE IF NOT EXISTS surat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nomor_surat VARCHAR(50) UNIQUE NOT NULL,
    jenis jenis_surat_enum NOT NULL,
    perihal VARCHAR(500) NOT NULL,
    tanggal_surat DATE NOT NULL,
    
    -- Pengirim/Penerima
    pengirim VARCHAR(255),
    penerima VARCHAR(255),
    
    -- Aparat (penandatangan)
    id_aparat_penandatangan UUID,
    
    -- Status tracking
    status status_surat_enum DEFAULT 'DRAFT',
    
    -- Content
    isi_ringkas TEXT,
    lampiran_url VARCHAR(500),
    
    -- Versioning & Audit
    version INTEGER DEFAULT 1,
    etag VARCHAR(100),
    
    -- Soft delete
    deleted_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT chk_nomor_surat_format CHECK (nomor_surat ~ '^[0-9]{3}/[0-9]{4}/[0-9]{2}/[0-9]{2}$'),
    CONSTRAINT chk_perihal_not_empty CHECK (LENGTH(TRIM(perihal)) > 0),
    CONSTRAINT chk_tanggal_valid CHECK (tanggal_surat <= CURRENT_DATE)
);

-- ============================================
-- INDEXES untuk Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_surat_jenis ON surat(jenis);
CREATE INDEX IF NOT EXISTS idx_surat_status ON surat(status);
CREATE INDEX IF NOT EXISTS idx_surat_tanggal ON surat(tanggal_surat);
CREATE INDEX IF NOT EXISTS idx_surat_nomor ON surat(nomor_surat);
CREATE INDEX IF NOT EXISTS idx_surat_deleted ON surat(deleted_at);
CREATE INDEX IF NOT EXISTS idx_surat_created_at ON surat(created_at);
CREATE INDEX IF NOT EXISTS idx_surat_aparat ON surat(id_aparat_penandatangan);

-- Index untuk filtering
CREATE INDEX IF NOT EXISTS idx_surat_jenis_status ON surat(jenis, status) WHERE deleted_at IS NULL;

-- ============================================
-- TRIGGER: Auto-update updated_at & version
-- ============================================

CREATE OR REPLACE FUNCTION update_surat_metadata()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    IF TG_OP = 'UPDATE' AND OLD.version IS NOT NULL THEN
        NEW.version = OLD.version + 1;
    END IF;
    
    -- Generate ETag
    NEW.etag = MD5(
        NEW.id::text || 
        NEW.updated_at::text || 
        NEW.version::text
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_surat_metadata_trigger ON surat;
CREATE TRIGGER update_surat_metadata_trigger
    BEFORE UPDATE ON surat
    FOR EACH ROW
    EXECUTE FUNCTION update_surat_metadata();

-- ============================================
-- TRIGGER: Generate ETag on INSERT
-- ============================================

CREATE OR REPLACE FUNCTION generate_surat_etag()
RETURNS TRIGGER AS $$
BEGIN
    NEW.etag = MD5(
        NEW.id::text || 
        NEW.created_at::text || 
        NEW.version::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_surat_etag_trigger ON surat;
CREATE TRIGGER generate_surat_etag_trigger
    BEFORE INSERT ON surat
    FOR EACH ROW
    EXECUTE FUNCTION generate_surat_etag();

-- ============================================
-- FUNCTION: Generate Nomor Surat
-- ============================================

CREATE OR REPLACE FUNCTION generate_nomor_surat()
RETURNS VARCHAR AS $$
DECLARE
    seq_num INTEGER;
    current_year VARCHAR(4);
    current_month VARCHAR(2);
    current_day VARCHAR(2);
    nomor VARCHAR(50);
BEGIN
    -- Get current date parts
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    current_month := TO_CHAR(CURRENT_DATE, 'MM');
    current_day := TO_CHAR(CURRENT_DATE, 'DD');
    
    -- Get sequence number for today
    SELECT COUNT(*) + 1 INTO seq_num
    FROM surat
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Format: XXX/YYYY/MM/DD (e.g., 001/2025/01/27)
    nomor := LPAD(seq_num::TEXT, 3, '0') || '/' || 
             current_year || '/' || 
             current_month || '/' || 
             current_day;
    
    RETURN nomor;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE surat IS 'Master data surat untuk Modul Agenda';
COMMENT ON COLUMN surat.nomor_surat IS 'Format: XXX/YYYY/MM/DD (auto-generated)';
COMMENT ON COLUMN surat.version IS 'Version untuk optimistic locking & conflict detection';
COMMENT ON COLUMN surat.etag IS 'ETag untuk conditional request (If-Match)';
COMMENT ON COLUMN surat.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN surat.status IS 'State: DRAFT → TERKIRIM → DITERIMA → SELESAI';

-- ============================================
-- SEED DATA untuk Testing
-- ============================================

INSERT INTO surat (
    nomor_surat, jenis, perihal, tanggal_surat, 
    pengirim, penerima, status
) VALUES
    ('001/2025/01/27', 'MASUK', 'Undangan Rapat Koordinasi', '2025-01-27', 
     'Dinas Kesehatan', 'Lurah Kalurahan', 'DRAFT'),
    ('002/2025/01/27', 'KELUAR', 'Surat Keterangan Domisili', '2025-01-27', 
     'Lurah Kalurahan', 'Warga', 'TERKIRIM')
ON CONFLICT (nomor_surat) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'surat';
    
    IF table_count > 0 THEN
        RAISE NOTICE '✓ Table surat created successfully';
        RAISE NOTICE '✓ Sample data: % rows', (SELECT COUNT(*) FROM surat);
    ELSE
        RAISE EXCEPTION 'Migration failed! Table surat not found';
    END IF;
END $$;

COMMIT;