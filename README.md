# Integration Modul Aparat

Sistem Informasi Manajemen Aparat yang terintegrasi untuk Sistem Administrasi Desa. Aplikasi ini dibangun dengan arsitektur modern menggunakan Next.js dan NestJS.

## 🛠️ Tech Stack
### Frontend
- **Framework:** [Next.js 14](https://nextjs.org/ "null") (Pages Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/ "null")
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/ "null") (Radix UI), Lucide Icons
- **State Management & Fetching:** React Hooks
### Backend
- **Framework:** [NestJS](https://nestjs.com/ "null")
- **Database ORM:** [TypeORM](https://typeorm.io/ "null")
- **Database:** PostgreSQL 16
- **Documentation:** Swagger UI
### Infrastructure
- **Containerization:** Docker & Docker Compose

## 📋 Prasyarat (Prerequisites)

Sebelum memulai, pastikan sistem Anda telah terinstal software berikut:

1. **Git** (Version Control System)
2. **Node.js v18** atau lebih tinggi
3. **Docker & Docker Compose**
4. **PostgreSQL Client** (Opsional, untuk akses database CLI)

Verifikasi instalasi dengan menjalankan perintah berikut di terminal:
```
git --version
node --version
docker --version
docker compose version
```

## ⚙️ Setup Development Lokal

### 1. Clone Repository
```
git clone [https://github.com/Erwdev/integration-modul-aparat.git](https://github.com/Erwdev/integration-modul-aparat.git)
cd integration-modul-aparat
```

### 2. Install Dependencies
Install dependencies untuk backend dan frontend secara terpisah.

**Backend:**
```
cd backend/api
npm install
```

**Frontend:**
```
cd frontend
npm install
```

### 3. Konfigurasi Environment Variables

Backend Environment:

Buat file .env di root folder project dengan konfigurasi berikut:
```
# APPLICATION
PORT=3000
HOST=localhost
NODE_ENV=development
BASE_URL=http://localhost:3000

# DATABASE (DOCKER)
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=aparat_db
DATABASE_URL=postgresql://postgres:postgres@db:5432/aparat_db

# JWT AUTHENTICATION
JWT_SECRET=... (lihat cara generate di bawah)
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=... (lihat cara generate di bawah)
JWT_REFRESH_EXPIRES_IN=7d

# SECURITY
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3001

# SWAGGER DOCUMENTATION
SWAGGER_ENABLED=true
SWAGGER_PATH=api-docs

# API KEYS & FILE UPLOAD
API_KEY=rahasia
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=2097152
ALLOWED_FILE_TYPES=.png,.jpg,.jpeg,.pdf
```

Generate JWT Secret:

Jalankan perintah ini di terminal untuk mendapatkan string acak yang aman, lalu copy hasilnya ke JWT_SECRET dan JWT_REFRESH_SECRET di file .env:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Frontend Environment:

Buat file .env.local di dalam folder frontend/ dengan isi:
```
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🚀 Cara Menjalankan Aplikasi

### Opsi 1: Menggunakan Docker Compose (Recommended)

Cara termudah untuk menjalankan semua service sekaligus.
```
# Build dan jalankan container di background
docker compose up -d
```

Cek status container untuk memastikan semua berjalan:
```
docker compose ps
```

### Opsi 2: Menjalankan Manual (Tanpa Docker Compose)

Gunakan cara ini jika Anda ingin menjalankan service satu per satu.

Terminal 1 - Database:

Jalankan container PostgreSQL:
```
docker run --name postgres-aparat \
-e POSTGRES_PASSWORD=postgres \
-e POSTGRES_DB=aparat_db \
-p 5432:5432 -d postgres:16
```

**Terminal 2 - Backend:**
```
cd backend/api
npm run start:dev
```

**Terminal 3 - Frontend:**
```
cd frontend
npm run dev
```

## 🌐 Akses Aplikasi

Setelah aplikasi berjalan, akses melalui browser:

- **Frontend:** [http://localhost:3001](https://www.google.com/search?q=http://localhost:3001 "null")
- **Backend API:** [http://localhost:3000/api](https://www.google.com/search?q=http://localhost:3000/api "null")
- **Swagger Docs:** [http://localhost:3000/api-docs](https://www.google.com/search?q=http://localhost:3000/api-docs "null")    

## 🔐 Login Credentials

Gunakan akun default berikut untuk login administrator:

- **Username:** `admin`
- **Email:** `admin@aparat.local`
- **Password:** (Lihat seed data di `backend/api/migrations/001_init.sql`)

Reset Password (Jika Lupa):

Anda dapat mereset password admin langsung melalui database:

1. Generate hash password baru:
    ```
    node -e "console.log(require('bcrypt').hashSync('passwordBaru123', 10))"
    ```
    
2. Update database:
    ```
    UPDATE users
    SET password = '<paste-hash-disini>'
    WHERE username = 'admin';
    ```

## 🛠️ Useful Commands

**Database Management:**
```
# Menjalankan migrasi manual
npm run migration:run

# Mengisi data awal (Seeding)
npm run seed
```

**Code Quality:**
```
# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

## ❓ Troubleshooting

**1. Frontend Tidak Bisa Akses API (CORS Error)**

- Verifikasi `NEXT_PUBLIC_API_URL` di `frontend/.env.local`.
- Cek `CORS_ORIGIN` di backend `.env` apakah sudah sesuai dengan URL frontend.
- Test API backend dengan curl: `curl http://localhost:3000/api/health`.

**2. Database Connection Error**

- Cek status container: `docker compose ps`.
- Cek logs database: `docker compose logs db`.
- Restart container db: `docker compose restart db`.

**3. Port Conflict (Port 3000 already in use)**

- Kill process di port 3000 atau ubah `PORT` di file `.env` (misal jadi 3002).

Support & Contact:
Jika mengalami masalah, cek logs dengan docker compose logs atau hubungi tim pengembang.