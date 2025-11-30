-- ============================================
-- Rollback Script: 000_rollback_and_clean.sql
-- Description: Clean up existing schema sebelum re-run migration
-- PERHATIAN: Script ini akan MENGHAPUS SEMUA DATA!
-- ============================================

-- SAFETY CHECK: Uncomment baris ini untuk enable script
-- SET client_min_messages TO WARNING;

BEGIN;

-- ============================================
-- STEP 1: Drop Tables (dengan CASCADE)
-- ============================================

-- Drop dalam urutan terbalik (child tables dulu)
DROP TABLE IF EXISTS keputusan CASCADE;
DROP TABLE IF EXISTS aparat_desa CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS pendidikan CASCADE;
DROP TABLE IF EXISTS jabatan CASCADE;
DROP TABLE IF EXISTS pangkat_golongan CASCADE;
DROP TABLE IF EXISTS agama CASCADE;

-- ============================================
-- STEP 2: Drop Types (ENUMs)
-- ============================================

DROP TYPE IF EXISTS jenis_keputusan_enum CASCADE;
DROP TYPE IF EXISTS status_aparat_enum CASCADE;
DROP TYPE IF EXISTS jenis_kelamin_enum CASCADE;

-- ============================================
-- STEP 3: Drop Functions
-- ============================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- STEP 4: Verification
-- ============================================

-- Check if tables still exist
DO $enum$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('agama', 'pangkat_golongan', 'jabatan', 'pendidikan', 
                       'users', 'aparat_desa', 'keputusan');
    
    IF table_count > 0 THEN
        RAISE EXCEPTION 'Rollback gagal! Masih ada % tabel yang tersisa', table_count;
    ELSE
        RAISE NOTICE '✓ Rollback berhasil! Semua tabel telah dihapus';
    END IF;
END $enum$;

COMMIT;
