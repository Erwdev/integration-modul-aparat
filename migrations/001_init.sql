-- ============================================
-- Migration: 001_init.sql (IMPROVED VERSION)
-- Description: Initial schema untuk Modul Aparat (sesuai ERD)
-- Sprint: 1 - Foundation Phase
-- Author: Kelompok 9 - ELL Besi Sinaga
-- ============================================

-- BEST PRACTICE: Wrap dalam transaction untuk atomicity
-- jangan lupa lakukan rollback dengan konsiderasi jika belum ada data di dalamnya kalau ada salah bikin skema lakukan dengan hati-hati jika sudah ada data dan lakukan backup dan juga rollback clean entitas
BEGIN;

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS (dengan IF NOT EXISTS pattern)
-- ============================================

DO $$ BEGIN
    CREATE TYPE jenis_kelamin_enum AS ENUM ('L', 'P');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE status_aparat_enum AS ENUM ('AKTIF', 'NONAKTIF', 'CUTI', 'PENSIUN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE jenis_keputusan_enum AS ENUM ('PENGANGKATAN', 'PEMBERHENTIAN', 'MUTASI');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- TABLE: agama (Referensi)
-- ============================================

CREATE TABLE IF NOT EXISTS agama (
    id_agama SERIAL PRIMARY KEY,
    nama_agama VARCHAR(50) NOT NULL UNIQUE
);

-- Idempotent insert
INSERT INTO agama (nama_agama) 
VALUES ('Islam'), ('Kristen'), ('Katolik'), ('Hindu'), ('Buddha'), ('Konghucu')
ON CONFLICT (nama_agama) DO NOTHING;

-- ============================================
-- TABLE: pangkat_golongan (Referensi)
-- ============================================

CREATE TABLE IF NOT EXISTS pangkat_golongan (
    id_pangkat SERIAL PRIMARY KEY,
    nama_pangkat VARCHAR(100) NOT NULL,
    golongan VARCHAR(10) NOT NULL,
    UNIQUE(nama_pangkat, golongan)  -- Add UNIQUE constraint
);

INSERT INTO pangkat_golongan (nama_pangkat, golongan) VALUES
    ('Juru Muda', 'I/a'),
    ('Juru Muda Tingkat I', 'I/b'),
    ('Juru', 'I/c'),
    ('Juru Tingkat I', 'I/d'),
    ('Pengatur Muda', 'II/a'),
    ('Pengatur Muda Tingkat I', 'II/b'),
    ('Pengatur', 'II/c'),
    ('Pengatur Tingkat I', 'II/d'),
    ('Penata Muda', 'III/a'),
    ('Penata Muda Tingkat I', 'III/b'),
    ('Penata', 'III/c'),
    ('Penata Tingkat I', 'III/d'),
    ('Pembina', 'IV/a'),
    ('Pembina Tingkat I', 'IV/b'),
    ('Pembina Utama Muda', 'IV/c'),
    ('Pembina Utama Madya', 'IV/d'),
    ('Pembina Utama', 'IV/e')
ON CONFLICT (nama_pangkat, golongan) DO NOTHING;

-- ============================================
-- TABLE: jabatan (Referensi)
-- ============================================

CREATE TABLE IF NOT EXISTS jabatan (
    id_jabatan SERIAL PRIMARY KEY,
    nama_jabatan VARCHAR(100) NOT NULL UNIQUE,
    tingkat_jabatan VARCHAR(50)
);

INSERT INTO jabatan (nama_jabatan, tingkat_jabatan) VALUES
    ('Lurah', 'Pimpinan'),
    ('Sekretaris Desa', 'Pimpinan'),
    ('Kepala Urusan Tata Usaha dan Umum', 'Pelaksana'),
    ('Kepala Urusan Keuangan', 'Pelaksana'),
    ('Kepala Urusan Perencanaan', 'Pelaksana'),
    ('Kepala Dusun', 'Pelaksana'),
    ('Staf', 'Pelaksana')
ON CONFLICT (nama_jabatan) DO NOTHING;

-- ============================================
-- TABLE: pendidikan (Referensi)
-- ============================================

CREATE TABLE IF NOT EXISTS pendidikan (
    id_pendidikan SERIAL PRIMARY KEY,
    jenjang_pendidikan VARCHAR(50) NOT NULL UNIQUE,
    keterangan TEXT
);

INSERT INTO pendidikan (jenjang_pendidikan, keterangan) VALUES
    ('SD', 'Sekolah Dasar'),
    ('SMP', 'Sekolah Menengah Pertama'),
    ('SMA', 'Sekolah Menengah Atas'),
    ('D3', 'Diploma 3'),
    ('S1', 'Sarjana'),
    ('S2', 'Magister'),
    ('S3', 'Doktor')
ON CONFLICT (jenjang_pendidikan) DO NOTHING;

-- ============================================
-- TABLE: users (Autentikasi)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'OPERATOR',
    nama_lengkap VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_role CHECK (role IN ('ADMIN', 'OPERATOR', 'VIEWER'))
);

-- ============================================
-- TABLE: aparat_desa (Master Data - Source of Truth)
-- ============================================

CREATE TABLE IF NOT EXISTS aparat_desa (
    id_aparat UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nomor_urut INTEGER UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    nip VARCHAR(50) UNIQUE,
    nik VARCHAR(16) UNIQUE NOT NULL,
    jenis_kelamin jenis_kelamin_enum NOT NULL,
    tempat_lahir VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    agama VARCHAR(50),
    pangkat_golongan VARCHAR(100),
    jabatan VARCHAR(100) NOT NULL,
    pendidikan_terakhir VARCHAR(50),
    nomor_tanggal_keputusan_pengangkatan VARCHAR(255),
    nomor_tanggal_keputusan_pemberhentian VARCHAR(255),
    keterangan TEXT,
    tanda_tangan_url VARCHAR(500),
    status status_aparat_enum DEFAULT 'AKTIF',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_nama_not_empty CHECK (LENGTH(TRIM(nama)) > 0),
    CONSTRAINT chk_nik_valid CHECK (LENGTH(nik) = 16 AND nik ~ '^[0-9]+$'),
    CONSTRAINT chk_tanggal_lahir_valid CHECK (tanggal_lahir < CURRENT_DATE)
);

-- Index untuk performa (idempotent)
CREATE INDEX IF NOT EXISTS idx_aparat_jabatan ON aparat_desa(jabatan);
CREATE INDEX IF NOT EXISTS idx_aparat_status ON aparat_desa(status);
CREATE INDEX IF NOT EXISTS idx_aparat_updated_at ON aparat_desa(updated_at);
CREATE INDEX IF NOT EXISTS idx_aparat_nik ON aparat_desa(nik);
CREATE INDEX IF NOT EXISTS idx_aparat_nama ON aparat_desa(nama); -- Additional useful index

-- ============================================
-- TABLE: keputusan (SK Pengangkatan/Pemberhentian)
-- ============================================

CREATE TABLE IF NOT EXISTS keputusan (
    id_keputusan SERIAL PRIMARY KEY,
    id_aparat UUID NOT NULL REFERENCES aparat_desa(id_aparat) ON DELETE CASCADE,
    jenis_keputusan jenis_keputusan_enum NOT NULL,
    nomor_keputusan VARCHAR(100) NOT NULL,
    tanggal_keputusan DATE NOT NULL,
    instansi_penerbit VARCHAR(255) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_nomor_keputusan CHECK (LENGTH(TRIM(nomor_keputusan)) > 0),
    CONSTRAINT uq_keputusan_nomor UNIQUE(nomor_keputusan) -- Prevent duplicate SK numbers
);

CREATE INDEX IF NOT EXISTS idx_keputusan_aparat ON keputusan(id_aparat);
CREATE INDEX IF NOT EXISTS idx_keputusan_jenis ON keputusan(jenis_keputusan);
CREATE INDEX IF NOT EXISTS idx_keputusan_tanggal ON keputusan(tanggal_keputusan); -- For date filtering

-- ============================================
-- TRIGGER: Auto-update updated_at & version
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    IF TG_OP = 'UPDATE' THEN
        NEW.version = OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create (idempotent)
DROP TRIGGER IF EXISTS update_aparat_updated_at ON aparat_desa;
CREATE TRIGGER update_aparat_updated_at
    BEFORE UPDATE ON aparat_desa
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_updated_at ON users;
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: Admin Default
-- ============================================

-- Password: admin123 (IMPORTANT: Change this hash to real bcrypt in production!)
INSERT INTO users (username, password, role, nama_lengkap) VALUES
    ('admin', '$2b$10$rN8KjxBZxKjVxKjVxKjVxO7YqW.Z8KqZ8KqZ8KqZ8KqZ8KqZ8Kq', 'ADMIN', 'Administrator')
ON CONFLICT (username) DO NOTHING;

-- Data aparat contoh (idempotent)
INSERT INTO aparat_desa (
    nomor_urut, nama, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, 
    agama, jabatan, pendidikan_terakhir, status
) VALUES
    (1, 'Lurah Kalurahan', '3301010101010001', 'L', 'Yogyakarta', '1980-01-01', 
     'Islam', 'Lurah', 'S1', 'AKTIF'),
    (2, 'Sekretaris Desa', '3301010101010002', 'L', 'Yogyakarta', '1985-05-15', 
     'Islam', 'Sekretaris Desa', 'S1', 'AKTIF')
ON CONFLICT (nik) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE aparat_desa IS 'Master data aparatur desa - Source of Truth untuk integrasi modul';
COMMENT ON COLUMN aparat_desa.version IS 'Version number untuk optimistic locking & conflict resolution';
COMMENT ON COLUMN aparat_desa.updated_at IS 'Timestamp untuk delta sync dengan modul lain';
COMMENT ON COLUMN aparat_desa.tanda_tangan_url IS 'URL tanda tangan digital untuk surat';

-- ============================================
-- VERIFICATION QUERIES (Optional - comment out in production)
-- ============================================

-- Uncomment to verify migration success:
-- SELECT 'agama' as table_name, COUNT(*) as row_count FROM agama
-- UNION ALL
-- SELECT 'pangkat_golongan', COUNT(*) FROM pangkat_golongan
-- UNION ALL
-- SELECT 'jabatan', COUNT(*) FROM jabatan
-- UNION ALL
-- SELECT 'pendidikan', COUNT(*) FROM pendidikan
-- UNION ALL
-- SELECT 'users', COUNT(*) FROM users
-- UNION ALL
-- SELECT 'aparat_desa', COUNT(*) FROM aparat_desa;

-- ============================================
-- COMMIT TRANSACTION
-- ============================================

COMMIT;

-- ============================================
-- END OF MIGRATION
-- ============================================