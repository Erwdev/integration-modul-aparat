
## 📋 Prerequisites

Pastikan sudah terinstall:
- **Node.js** v18+ dan npm/yarn
- **Git** (optional)
- **Backend API** sudah running di `http://localhost:3000`

---

## 🚀 Installation & Setup

### 1. Navigate to Frontend Directory

```bash
cd e:\PRPL\integration-modul-aparat\frontend
```

### 2. Install Dependencies

```bash
npm install
```

atau jika menggunakan yarn:

```bash
yarn install
```

### 3. Environment Configuration

Buat file `.env.local` di root folder frontend:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_PATH=/api/v1

# App Configuration
NEXT_PUBLIC_APP_NAME=Sistem Administrasi Kalurahan
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4. Run Development Server

```bash
npm run dev
```

atau:

```bash
yarn dev
```

Server akan berjalan di: **http://localhost:3001**

---

## 🔑 Login ke Aplikasi

1. Buka browser dan akses: `http://localhost:3001/auth/sign-in`
2. Gunakan kredensial default:
   - **Username:** `test`
   - **Password:** `1234`
3. Klik **Sign In**

---

## 📂 Fitur yang Tersedia

Setelah login, Anda dapat mengakses:

### 1. **Dashboard** (`/`)
- Overview sistem
- Statistik data

### 2. **Aparat** (`/aparat`)
- Daftar perangkat desa
- Tambah aparat baru
- Edit & hapus data aparat
- Filter berdasarkan status & jabatan

### 3. **Reports** (`/reports`)
- Laporan aparat
- Export data
- Filter & search

---

## 🛠️ Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code (if using prettier)
npm run format
```

---

## 🔍 Testing the Application

### Test API Connection

1. Pastikan backend sudah running di `http://localhost:3000`
2. Test health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T...",
  "database": "connected"
}
```

### Test Login Flow

1. Buka `http://localhost:3001/auth/sign-in`
2. Login dengan kredensial `test` / `1234`
3. Seharusnya redirect ke dashboard

---

## 📱 Struktur Halaman

```
http://localhost:3001/
├── auth/sign-in          → Login page
├── auth/sign-up          → Register page (jika ada)
├── /                     → Dashboard
├── aparat/               → Manajemen Aparat
└── reports/              → Laporan
```

---

## ⚙️ Troubleshooting

### Error: Cannot connect to API

**Problem:** Frontend tidak bisa connect ke backend

**Solution:**
1. Pastikan backend running di `http://localhost:3000`
2. Check `.env.local` file
3. Restart frontend server

```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

### Error: Port 3001 already in use

**Solution:** Gunakan port lain

```bash
# Windows
set PORT=3002 && npm run dev

# Linux/Mac
PORT=3002 npm run dev
```

### Error: Module not found

**Solution:** Reinstall dependencies

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 🎨 Tech Stack

- **Framework:** Next.js 14
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Icons:** Lucide React, Heroicons
- **HTTP Client:** Fetch API
- **State Management:** React Context API

---

## 📝 Next Steps

Setelah frontend berjalan:

1. **Test CRUD Operations:**
   - Tambah aparat baru
   - Edit data aparat
   - Hapus aparat
   - Filter & search

2. **Explore Other Features:**
   - Check reports page
   - Test pagination
   - Try different filters

3. **Customize:**
   - Ubah theme di `ThemeContext.tsx`
   - Modify components di `src/components/`
   - Add new features

---

## 🔗 Useful Links

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **API Docs:** http://localhost:3000/api-docs
- **Health Check:** http://localhost:3000/health

---

## 📞 Support

Jika ada masalah:
1. Check console logs (Browser DevTools - F12)
2. Check terminal output
3. Verify backend is running
4. Check `.env.local` configuration

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-11-10  
**Status:** ✅ Ready to Use