
# Integration Modul Aparat — Sprint 1

Backend untuk modul **Aparat** menggunakan **NestJS + PostgreSQL** berjalan melalui **Docker Compose**.
Project ini dikerjakan oleh **Kelompok 9 — PRPL**.

---

## 🚀 Cara Menjalankan Project

### ✅ 1. Persiapan
Pastikan sudah terinstall:
- **Docker Desktop**
- **Git**

Opsional:
- **VSCode** untuk development
- Internet stabil untuk pull Docker images pertama kali

---

### ✅ 2. Clone Project
```bash
git clone https://github.com/<username>/<repo-name>.git
cd integration-modul-aparat
```

> Semua perintah harus dijalankan dari **root folder** project ini ✅
### ✅ 2.5. Setup Environment Variables (Opsional untuk Sprint 1)

Untuk development lokal dengan konfigurasi custom:
```bash
cp .env.example .env
# Edit .env sesuai kebutuhan
```
---

### ✅ 3. Jalankan Docker (Development Hot Reload)

```bash
docker compose up -d --build
```

Cek container berjalan:

```bash
docker ps
```

Pastikan service:

* `aparat-backend`
* `aparat-db`

**status: Up**

---

### ✅ 4. Cek Log Backend (Hot Reload aktif)

```bash
docker logs -f aparat-backend
```

Jika berhasil, muncul output seperti:

```
[Nest] ... LOG [NestApplication] Nest application successfully started
```

Cek API:
👉 [http://localhost:3000/](http://localhost:3000/)

---

## 🔄 Development Workflow (Hot Reload)

Edit file `.ts` → otomatis reload ✅
Tidak perlu restart Docker setiap kode berubah.

Jika benar-benar perlu restart backend:

```bash
docker compose restart backend
```

---

## 📂 Struktur Project

```
integration-modul-aparat/
 ├── backend/api         # NestJS backend source
 ├── migrations          # SQL migrations (Sprint 1 DB)
 ├── docs                # ERD, ICD, RACI & laporan
 ├── .github/workflows   # GitHub Actions CI/CD
 ├── docker-compose.yml  # Dev environment config
 ├── CONTRIBUTING.md     # Pedoman kontribusi tim
 └── README.md           # Dokumentasi cara menjalankan
```

---

## 🌱 Branching Strategy

| Branch           | Keterangan                |
| ---------------- | ------------------------- |
| `main`           | Release stable            |
| `dev`            | Integrasi Sprint          |
| `feature/<task>` | Pengembangan tiap anggota |

Contoh:

```bash
git checkout -b feature/migration-aparat
```

Submit Pull Request → `dev`
Review: Integration Lead ✅

Detail lebih lengkap → `CONTRIBUTING.md`

---

## 🧩 Database & ERD

* PostgreSQL dijalankan sebagai container Docker
* Migration SQL ditempatkan di folder `/migrations`
* ERD, ICD, dan RACI di `/docs` (diisi bertahap Sprint 1)

---

## 👥 Kelompok 9 — PRPL

* Integration Lead: **<Nama Kamu>**
* Backend Database Engineer: **Anggota A**
* Documentation Lead: **Anggota B**
* Testing & QA: **Anggota C**
* Helper / Observer: **Anggota D**

---

> 🟢 Jika log backend muncul = environment siap digunakan ✅
> 🎯 Tahap berikutnya: pengembangan fitur per modul & integrasi database

---

## ✅ Checklist setelah kamu paste README

```bash
git add README.md
git commit -m "Add full README with instructions ✅"
git push origin dev
```

CI akan berjalan otomatis ✅
Tim langsung bisa `clone` → `compose up` → **jalan**

