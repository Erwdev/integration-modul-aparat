-- Active: 1747625104078@@127.0.0.1@3306
# Database Schema Documentation
**Project:** Integration Modul Aparat - Sistem Administrasi Kalurahan  
**Sprint:** 1 - Foundation Phase  
**Version:** 1.0  
**Last Updated:** 2025-10-27

---

## 📋 Overview

Database schema ini dirancang untuk mendukung:
- ✅ Modul Aparat sebagai **Source of Truth (SoT)** untuk data aparatur desa
- ✅ Integrasi dengan Modul Agenda (surat) dan Modul Ekspedisi
- ✅ Delta Synchronization menggunakan `updated_at` timestamp
- ✅ Conflict Resolution menggunakan `version` number (optimistic locking)
- ✅ Audit trail untuk tracking perubahan data

---

## 🗂️ Database Structure

### **Database:** `aparat`
**PostgreSQL Version:** 15+  
**Extensions:** `uuid-ossp`

---


## 📑 Table Definitions

### 1. **aparat_desa** (Master Data - Source of Truth)

**Purpose:** Menyimpan data aparatur desa yang akan digunakan oleh modul lain (Agenda, Ekspedisi)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id_aparat` | UUID | PRIMARY KEY | Unique identifier (UUID v4) |
| `nomor_urut` | INTEGER | UNIQUE, NOT NULL | Nomor urut untuk penomoran manual |
| `nama` | VARCHAR(255) | NOT NULL | Nama lengkap aparat |
| `nip` | VARCHAR(50) | UNIQUE, NULLABLE | NIP/NIAP aparat |
| `nik` | VARCHAR(16) | UNIQUE, NOT NULL | NIK (16 digit) |
| `jenis_kelamin` | ENUM | NOT NULL | L (Laki-laki), P (Perempuan) |
| `tempat_lahir` | VARCHAR(100) | NOT NULL | Tempat lahir |
| `tanggal_lahir` | DATE | NOT NULL | Tanggal lahir |
| `agama` | VARCHAR(50) | NULLABLE | Agama |
| `pangkat_golongan` | VARCHAR(100) | NULLABLE | Pangkat/golongan PNS |
| `jabatan` | VARCHAR(100) | NOT NULL | Jabatan di desa |
| `pendidikan_terakhir` | VARCHAR(50) | NULLABLE | Jenjang pendidikan terakhir |
| `nomor_tanggal_keputusan_pengangkatan` | VARCHAR(255) | NULLABLE | SK Pengangkatan |
| `nomor_tanggal_keputusan_pemberhentian` | VARCHAR(255) | NULLABLE | SK Pemberhentian |
| `keterangan` | TEXT | NULLABLE | Catatan tambahan |
| `tanda_tangan_url` | VARCHAR(500) | NULLABLE | URL file tanda tangan digital |
| `status` | ENUM | DEFAULT 'AKTIF' | AKTIF, NONAKTIF, CUTI, PENSIUN |
| `version` | INTEGER | DEFAULT 1 | Version number untuk conflict resolution |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Timestamp pembuatan |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Timestamp update terakhir (auto-update) |

**Indexes:**
- `idx_aparat_jabatan` on `jabatan`
- `idx_aparat_status` on `status`
- `idx_aparat_updated_at` on `updated_at` (untuk delta sync)
- `idx_aparat_nik` on `nik`

**Business Rules:**
- ✅ NIK harus 16 digit angka
- ✅ Tanggal lahir harus di masa lalu
- ✅ `version` otomatis increment saat UPDATE
- ✅ `updated_at` otomatis update saat UPDATE (via trigger)

---

### 2. **users** (Authentication)

**Purpose:** Menyimpan data user untuk autentikasi sistem

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id_user` | SERIAL | PRIMARY KEY | Auto-increment ID |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Username untuk login |
| `password` | VARCHAR(255) | NOT NULL | **Bcrypt hashed password** (bukan plaintext!) |
| `role` | VARCHAR(20) | NOT NULL | ADMIN, OPERATOR, VIEWER |
| `nama_lengkap` | VARCHAR(255) | NOT NULL | Nama lengkap user |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Timestamp pembuatan |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Timestamp update terakhir |

**Security Notes:**
- 🔐 Password disimpan dalam bentuk **bcrypt hash** (~60 chars)
- 🔐 Bcrypt salt rounds: 10
- 🔐 JWT digunakan untuk session management (30 menit expire)

---

### 3. **keputusan** (SK Pengangkatan/Pemberhentian)

**Purpose:** Menyimpan detail keputusan (SK) terkait aparat

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id_keputusan` | SERIAL | PRIMARY KEY | Auto-increment ID |
| `id_aparat` | UUID | FK → aparat_desa | Relasi ke aparat |
| `jenis_keputusan` | ENUM | NOT NULL | PENGANGKATAN, PEMBERHENTIAN, MUTASI |
| `nomor_keputusan` | VARCHAR(100) | NOT NULL | Nomor SK |
| `tanggal_keputusan` | DATE | NOT NULL | Tanggal SK |
| `instansi_penerbit` | VARCHAR(255) | NOT NULL | Instansi yang menerbitkan SK |
| `keterangan` | TEXT | NULLABLE | Catatan tambahan |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Timestamp pembuatan |

**Indexes:**
- `idx_keputusan_aparat` on `id_aparat`
- `idx_keputusan_jenis` on `jenis_keputusan`

**Cascade Rules:**
- `ON DELETE CASCADE` - Jika aparat dihapus, keputusan ikut terhapus

---

### 4. **agama** (Reference Table)

**Purpose:** Tabel referensi untuk agama

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id_agama` | SERIAL | PRIMARY KEY | Auto-increment ID |
| `nama_agama` | VARCHAR(50) | UNIQUE, NOT NULL | Nama agama |

**Seed Data:**
- Islam, Kristen, Katolik, Hindu, Buddha, Konghucu

---

### 5. **pangkat_golongan** (Reference Table)

**Purpose:** Tabel referensi untuk pangkat/golongan PNS

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id_pangkat` | SERIAL | PRIMARY KEY | Auto-increment ID |
| `nama_pangkat` | VARCHAR(100) | NOT NULL | Nama pangkat (e.g., "Penata Muda") |
| `golongan` | VARCHAR(10) | NOT NULL | Kode golongan (e.g., "III/a") |

**Seed Data:**
- Juru Muda (I/a) sampai Pembina Utama (IV/e)

---

### 6. **jabatan** (Reference Table)

**Purpose:** Tabel referensi untuk jabatan di desa

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id_jabatan` | SERIAL | PRIMARY KEY | Auto-increment ID |
| `nama_jabatan` | VARCHAR(100) | UNIQUE, NOT NULL | Nama jabatan |
| `tingkat_jabatan` | VARCHAR(50) | NULLABLE | Pimpinan/Pelaksana |

**Seed Data:**
- Lurah, Sekretaris Desa, Kepala Urusan, Kepala Dusun, Staf

---

### 7. **pendidikan** (Reference Table)

**Purpose:** Tabel referensi untuk jenjang pendidikan

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id_pendidikan` | SERIAL | PRIMARY KEY | Auto-increment ID |
| `jenjang_pendidikan` | VARCHAR(50) | UNIQUE, NOT NULL | Jenjang (SD, SMP, SMA, D3, S1, S2, S3) |
| `keterangan` | TEXT | NULLABLE | Deskripsi jenjang |

---

## 🔄 Integration Design

### **Delta Synchronization**

Modul lain dapat melakukan delta sync menggunakan:
```sql
-- Ambil data aparat yang berubah sejak timestamp terakhir
SELECT * FROM aparat_desa 
WHERE updated_at > '2025-01-27 10:00:00' 
  AND status = 'AKTIF'
ORDER BY updated_at ASC;
```

### **Conflict Resolution (Optimistic Locking)**
```sql
-- Update dengan version check
UPDATE aparat_desa 
SET nama = 'Nama Baru', 
    version = version + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE id_aparat = 'xxx-xxx-xxx' 
  AND version = 5;  -- Version yang diharapkan

-- Jika affected_rows = 0 → Conflict detected (versi sudah berubah)
```

---

## 🔧 Triggers & Functions

### **Auto-update `updated_at` & `version`**
```sql
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
```

**Applied to:** `aparat_desa`, `users`

---

## 🔐 Security Considerations

### **Password Hashing**
- ✅ Bcrypt dengan salt rounds = 10
- ✅ Password tidak pernah disimpan plaintext
- ✅ Hash length: ~60 characters

### **Data Privacy**
- ⚠️ NIK adalah data sensitif - hanya accessible dengan permission
- ⚠️ Tanda tangan digital disimpan sebagai URL (file storage external)

### **Access Control**
- 👤 **ADMIN**: Full CRUD + manage users
- 👤 **OPERATOR**: CRUD aparat data
- 👤 **VIEWER**: Read-only access

---

## 📊 Data Volume Estimates (Sprint 1)

| Table | Estimated Rows | Growth Rate |
|-------|----------------|-------------|
| `aparat_desa` | 10-50 | Low (jarang perubahan) |
| `users` | 3-10 | Very Low |
| `keputusan` | 20-100 | Low |
| `agama` | 6 | Static |
| `pangkat_golongan` | 17 | Static |
| `jabatan` | 7-15 | Static |
| `pendidikan` | 7 | Static |

---

## 🧪 Testing Queries

### **Query 1: Get Active Aparat by Jabatan**
```sql
SELECT * FROM aparat_desa 
WHERE jabatan = 'Lurah' 
  AND status = 'AKTIF'
ORDER BY nama;
```

### **Query 2: Get Aparat with Tanda Tangan**
```sql
SELECT id_aparat, nama, jabatan, tanda_tangan_url 
FROM aparat_desa 
WHERE tanda_tangan_url IS NOT NULL 
  AND status = 'AKTIF';
```

### **Query 3: Delta Sync**
```sql
SELECT * FROM aparat_desa 
WHERE updated_at > :last_sync_timestamp
ORDER BY updated_at ASC;
```

---

## 🔄 Migration History

| Version | Date | Description |
|---------|------|-------------|
| 001 | 2025-01-XX | Initial schema - Sprint 1 Foundation |

---

## 📚 References

- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/)
- [Bcrypt Hashing Best Practices](https://github.com/kelektiv/node.bcrypt.js)
- [UUID in PostgreSQL](https://www.postgresql.org/docs/current/uuid-ossp.html)
- Permendagri tentang Format Buku Aparat Desa

---

**Document End**