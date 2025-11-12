-- ============================================
-- Migration: 005_fix_update_trigger.sql
-- Description: Fix update_updated_at_column trigger untuk table users (no version column)
-- Date: 2025-11-12
-- Issue: Trigger mencoba update kolom 'version' yang tidak ada di users table
-- ============================================

BEGIN;

-- Drop existing trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- SOLUTION 1: Conditional version update (check if column exists)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Always update timestamp
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    -- Only update version if column exists in the table
    IF TG_OP = 'UPDATE' THEN
        BEGIN
            -- Try to update version column
            EXECUTE format('SELECT ($1).%I', 'version') USING NEW;
            NEW.version = OLD.version + 1;
        EXCEPTION
            WHEN undefined_column THEN
                -- Column doesn't exist, skip version update
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SOLUTION 2: Separate functions (RECOMMENDED)
-- ============================================

-- Function WITH version update (for aparat_desa)
CREATE OR REPLACE FUNCTION update_updated_at_with_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    IF TG_OP = 'UPDATE' THEN
        NEW.version = OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function WITHOUT version update (for users)
CREATE OR REPLACE FUNCTION update_updated_at_only()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Re-create triggers with correct functions
-- ============================================

-- Trigger for aparat_desa (has version column)
DROP TRIGGER IF EXISTS update_aparat_updated_at ON aparat_desa;
CREATE TRIGGER update_aparat_updated_at
    BEFORE UPDATE ON aparat_desa
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_with_version();

-- Trigger for users (NO version column)
DROP TRIGGER IF EXISTS update_user_updated_at ON users;
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_only();

-- ============================================
-- Verify triggers
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Trigger function updated successfully';
    RAISE NOTICE '📋 aparat_desa uses: update_updated_at_with_version()';
    RAISE NOTICE '📋 users uses: update_updated_at_only()';
END $$;

COMMIT;

-- ============================================
-- ROLLBACK (if needed)
-- ============================================
-- To rollback this migration:
-- BEGIN;
-- DROP FUNCTION IF EXISTS update_updated_at_with_version() CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_only() CASCADE;
-- -- Then re-run 001_init.sql trigger section
-- COMMIT;
