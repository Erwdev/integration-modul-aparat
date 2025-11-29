
ALTER TABLE aparat_desa DROP COLUMN IF EXISTS nomor_urut;
DROP TRIGGER IF EXISTS before_insert_nomor_urut ON aparat_desa;
DROP FUNCTION IF EXISTS assign_nomor_urut();