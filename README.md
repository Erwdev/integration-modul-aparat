📄 README.md (Updated for Branch: feature/perbaikan-auth-dan-migrasi)
Berikut adalah panduan lengkap yang sudah menyertakan cara generate token dan hash password.

Markdown

# Integration Modul Aparat (Branch: feature/perbaikan-auth-dan-migrasi)

Panduan setup untuk branch pengembangan fitur **Auth**, **Aparat CRUD**, dan **Audit Log**.

> ⚠️ **PERHATIAN:** Branch ini mengubah struktur Database secara total.
> **WAJIB RESET DATABASE** saat pertama kali setup agar tidak terjadi Error 500.

---

## 🚀 Langkah 1: Setup Environment Variable

File `.env` menyimpan konfigurasi database dan kunci rahasia (Secret Keys).

1. **Copy File Example:**
   ```powershell
   cp .env.example .env
Isi Token Rahasia (Wajib): Buka file .env yang baru dibuat. Pastikan konfigurasi DB sudah benar, lalu isi bagian JWT dan API Key.

Anda bisa menghasilkan kunci acak menggunakan terminal (Node.js):

PowerShell

# Generate string acak untuk JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Copy output-nya dan masukkan ke JWT_SECRET di file .env. Ulangi untuk JWT_REFRESH_SECRET dan API_KEY.

Contoh konfigurasi .env minimal yang benar:

Ini, TOML

PORT=3000
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=aparat_db

# Wajib diisi string acak panjang
JWT_SECRET=a7b8c9...
JWT_REFRESH_SECRET=d4e5f6...
API_KEY=12345...

# Wajib sesuai port frontend
CORS_ORIGIN=http://localhost:3001
🚀 Langkah 2: Reset Database & Jalankan Docker
Karena struktur tabel berubah, kita harus menghapus data lama dan membangun ulang container.

Hapus Container & Volume Database (Wipe Data):

PowerShell

docker compose down -v
(Flag -v sangat penting untuk menghapus skema database lama yang konflik)

Build & Jalankan Container:

PowerShell

docker compose up -d --build
Tunggu Backend Ready: Pantau log backend hingga muncul pesan "Application is running".

PowerShell

docker logs -f aparat-backend
🚀 Langkah 3: Setup Akun Admin
Setelah reset database, password admin kembali ke default. Anda perlu membuat hash password baru agar bisa login.

1. Generate Hash Password (misal: "admin123"): Jalankan perintah ini di terminal terpisah untuk mendapatkan kode hash yang valid dari sistem:

PowerShell

docker compose exec backend node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('admin123', 10))"
Output: $2b$10$XyZ123abc... (Simpan kode ini!)

2. Update Database: Masukkan hash tersebut ke database user.

PowerShell

# Masuk ke database
docker compose exec db psql -U postgres -d aparat_db
SQL

-- Ganti 'HASH_DARI_LANGKAH_1' dengan kode yang Anda dapatkan tadi
UPDATE users SET password = 'HASH_DARI_LANGKAH_1' WHERE username = 'admin';

-- Keluar
\q
🌐 Akses Aplikasi
Sekarang sistem sudah siap digunakan sepenuhnya.

Frontend: http://localhost:3001

Login:

Username: admin

Password: admin123 (atau sesuai yang Anda generate)

Fitur yang Bisa Dites:
Manajemen Aparat: Tambah, Edit (ada validasi NIK), Hapus, dan Upload Tanda Tangan.

Audit Log: Menu /events akan merekam semua aktivitas Anda.

Logout: Tombol keluar ada di sidebar bawah.

🔧 Troubleshooting
Error "Internal Server Error" di Audit Log: Artinya Enum database masih versi lama (huruf kecil). Ulangi Langkah 2 (docker compose down -v) dengan benar.

Gagal Login (401 Unauthorized): Hash password salah. Ulangi Langkah 3 untuk generate hash baru dan update ke DB.

Tampilan Rusak / Input Hilang: Browser menyimpan cache file JS lama. Lakukan Hard Refresh (Ctrl + F5).