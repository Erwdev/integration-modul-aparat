# feature/perbaikan-auth-dan-migrasi

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (Pages Router), Tailwind CSS, Lucide Icons, Shadcn UI (Radix).
- **Backend:** NestJS, TypeORM.
- **Database:** PostgreSQL 16.
- **Infrastructure:** Docker Compose.
- **Communication:** REST API + Event Bus (Audit Log).

## ⚠️ Panduan Setup untuk Developer Baru (Teammates)

Karena terjadi perubahan besar pada struktur tabel database dan logika autentikasi, teman tim **WAJIB** mengikuti langkah ini agar tidak error:

### 1. Clone & Pull

```
git pull origin feature/perbaikan-auth-dan-migrasi
```
### 2. Setup Environment (.env)

Pastikan file `.env` memiliki konfigurasi berikut (terutama `JWT_SECRET` dan `CORS_ORIGIN`).

Cara Generate Token Rahasia:
Jalankan perintah ini di terminal untuk mendapatkan string acak:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
_(Copy hasilnya ke `JWT_SECRET` dan `JWT_REFRESH_SECRET` di .env)_

**Contoh `.env`:**

```
PORT=3000
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=aparat_db
CORS_ORIGIN=http://localhost:3001
JWT_SECRET=paste_hasil_generate_disini
JWT_REFRESH_SECRET=paste_hasil_generate_lainnya_disini
API_KEY=rahasia
```

### 3. 🚨 RESET DATABASE (Wajib!)

Langkah ini menghapus database lama yang skemanya konflik dengan kode baru.

```
# Matikan container & Hapus Volume
docker compose down -v

# Build ulang container
docker compose up -d --build
```

### 4. 🔑 Restore Password Admin

Setelah reset DB, password `admin` kembali ke default dan tidak bisa digunakan login. Anda harus membuat hash baru.

A. Generate Hash Password Baru:

Jalankan perintah ini untuk membuat hash aman dari "admin123":

```
docker compose exec backend node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('admin123', 10))"
```
	
_(Copy output string yang berawalan `$2b$10$...`)_

B. Update Database:

Masukkan hash tersebut ke database:

```
# Masuk ke database
docker compose exec db psql -U postgres -d aparat_db
```

```
-- Ganti HASH_BARU dengan string yang Anda copy tadi
UPDATE users SET password = 'HASH_BARU' WHERE username = 'admin';

-- selesai
\q
```

**Login Default:**

- **User:** `admin`
- **Pass:** `admin123` (atau password lain sesuai yang Anda hash)

## 📝 Catatan Teknis & Debugging

### 1. Isu "Internal Server Error" (500) di Audit Log

- **Penyebab:** Database lama menyimpan status `pending` (kecil), kode baru minta `PENDING` (besar).
- **Solusi:** Sudah diperbaiki di file migrasi `003`. Reset DB (`docker compose down -v`) menyelesaikan ini.

### 2. Isu "Bad Request" (400) di Edit Aparat

- **Penyebab:** Frontend mengirim field sampah (`created_at`, `version`) yang ditolak Backend.
- **Solusi:** Sudah diperbaiki di `EditAparatModal.tsx` dengan teknik _whitelisting payload_.

### 3. Tampilan Form Transparan / Rusak

- **Penyebab:** Konfigurasi Tailwind tidak membaca folder `src`.
- **Solusi:** Sudah diperbaiki di `tailwind.config.js`. Jika terjadi lagi, restart container frontend.

## 🚀 Sekian Terima Kasih