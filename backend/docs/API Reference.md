# API Reference Documentation

**Project:** Integration Modul Aparat - Sistem Administrasi Kalurahan
**Sprint:** 1 - Authentication (JWT Stub)
**Version:** 1.0
**Last Updated:** 2025-11-01

---

## 📋 Overview

Dokumen ini menjelaskan endpoint API yang dikembangkan dalam **Sprint Authentication Dasar (JWT Stub)**.
Tujuannya adalah untuk menyediakan mekanisme autentikasi berbasis **JSON Web Token (JWT)** yang aman dan mudah diintegrasikan dengan modul lain (Aparat, Agenda, Ekspedisi).

---

## ⚙️ Base URL

```
http://localhost:3000
```

> Semua endpoint berada di bawah prefix `/auth`.

---

## 🔐 Authentication Flow

Autentikasi dasar menggunakan **JWT Access Token** dan **Refresh Token**.

| Token Type    | Expiration | Secret Key           | Description                                           |
| ------------- | ---------- | -------------------- | ----------------------------------------------------- |
| Access Token  | 15 menit   | `JWT_SECRET`         | Token utama untuk mengakses endpoint API              |
| Refresh Token | 7 hari     | `JWT_REFRESH_SECRET` | Token untuk memperbarui access token yang kedaluwarsa |

### Diagram Alur

```
+-----------+            +------------------+             +-----------------+
|   Client  |  login()   |   /auth/login    |  returns    | access & refresh|
|  (User)   | ---------->| AuthController   |------------>|  JWT tokens     |
+-----------+            +------------------+             +-----------------+
       ^                                                           |
       |                                                           |
       | refreshToken()                                            |
       |-----------------------------------------------------------|
                 /auth/refresh   →   generate new tokens
```

---

## 📂 Endpoints

### 1. **POST /auth/login**

Autentikasi user dan menghasilkan **accessToken** serta **refreshToken**.

#### 🔸 Request

**URL**

```
POST /auth/login
```

**Headers**

| Key          | Value            |
| ------------ | ---------------- |
| Content-Type | application/json |

**Body**

```json
{
  "username": "test",
  "password": "1234"
}
```

#### 🔹 Response

**Status 200 - OK**

```json
{
  "accessToken": "<JWT_ACCESS_TOKEN>",
  "refreshToken": "<JWT_REFRESH_TOKEN>"
}
```

**Status 401 - Unauthorized**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

#### 🔸 Notes

* Token dienkripsi menggunakan `HS256`.
* Login saat ini masih **stub** (belum terhubung ke tabel `users`).
* Token hanya disimulasikan berdasarkan `username` yang dikirim.

---

### 2. **POST /auth/refresh**

Menggunakan refresh token yang valid untuk menghasilkan **access token baru**.

#### 🔸 Request

**URL**

```
POST /auth/refresh
```

**Headers**

| Key          | Value            |
| ------------ | ---------------- |
| Content-Type | application/json |

**Body**

```json
{
  "refreshToken": "<JWT_REFRESH_TOKEN>"
}
```

#### 🔹 Response

**Status 200 - OK**

```json
{
  "accessToken": "<NEW_JWT_ACCESS_TOKEN>",
  "refreshToken": "<NEW_JWT_REFRESH_TOKEN>"
}
```

**Status 400 - Bad Request**

```json
{
  "statusCode": 400,
  "message": "Invalid refresh token"
}
```

#### 🔸 Notes

* Refresh token diverifikasi menggunakan `JWT_REFRESH_SECRET`.
* Jika token kedaluwarsa atau rusak → response `Invalid refresh token`.
* Token baru memiliki masa berlaku baru (reset TTL).

---

## 🧱 DTO Definitions

### `LoginDto`

| Field      | Type     | Required | Description                                                  |
| ---------- | -------- | -------- | ------------------------------------------------------------ |
| `username` | `string` | ✅        | Username user                                                |
| `password` | `string` | ✅        | Password user (plaintext, akan divalidasi oleh backend stub) |

### `RefreshTokenDto`

| Field          | Type     | Required | Description       |
| -------------- | -------- | -------- | ----------------- |
| `refreshToken` | `string` | ✅        | Token JWT refresh |

### `AuthResponseDto`

| Field          | Type     | Description                       |
| -------------- | -------- | --------------------------------- |
| `accessToken`  | `string` | JWT token untuk akses endpoint    |
| `refreshToken` | `string` | JWT token untuk perpanjangan sesi |

---

## 🧩 Module Structure

| File                 | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `auth.controller.ts` | Mendefinisikan endpoint `/auth/login` dan `/auth/refresh` |
| `auth.service.ts`    | Mengelola proses pembuatan dan verifikasi JWT             |
| `auth.module.ts`     | Modul utama NestJS untuk Autentikasi                      |
| `dto/`               | Folder DTO (Data Transfer Object)                         |
| `interfaces/`        | Menyimpan definisi payload JWT                            |

### Interface: `JwtPayload`

```typescript
export interface JwtPayload {
  username: string;
  sub: string; // user ID
}
```

---

## 🧰 Environment Variables

| Key                  | Example Value        | Description                |
| -------------------- | -------------------- | -------------------------- |
| `JWT_SECRET`         | `supersecret`        | Secret untuk access token  |
| `JWT_REFRESH_SECRET` | `superrefreshsecret` | Secret untuk refresh token |

> Semua nilai ini didefinisikan di file `.env` atau `.env.example`.

---

## 🧪 Example Usage

### 🔹 PowerShell

```powershell
# Login
Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -Body '{"username":"test","password":"1234"}' `
  -ContentType "application/json"

# Refresh Token
Invoke-RestMethod -Uri "http://localhost:3000/auth/refresh" `
  -Method POST `
  -Body '{"refreshToken":"<JWT_REFRESH_TOKEN>"}' `
  -ContentType "application/json"
```

### 🔹 cURL

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "1234"}'

# Refresh Token
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<JWT_REFRESH_TOKEN>"}'
```

---

## 📦 Postman Collection (Import JSON)

Kamu dapat menyimpan JSON di bawah ini sebagai file `Auth_API_Collection.json` dan impor langsung ke Postman.

```json
{
  "info": {
    "name": "Auth API (JWT Stub)",
    "_postman_id": "1e7f9b12-abcdef12-3456-7890fedcba12",
    "description": "Sprint 1 Authentication Stub for Integration Modul Aparat",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"test\",\n  \"password\": \"1234\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["auth", "login"]
        }
      },
      "response": []
    },
    {
      "name": "Refresh Token",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"refreshToken\": \"<JWT_REFRESH_TOKEN>\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/auth/refresh",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["auth", "refresh"]
        }
      },
      "response": []
    }
  ]
}
```

---

## 🚧 Known Limitations (Sprint 1 Stub)

| Area             | Description                                           |
| ---------------- | ----------------------------------------------------- |
| Authentication   | Belum menggunakan tabel `users` dari database         |
| Authorization    | Belum ada role-based access control                   |
| Token Blacklist  | Belum diterapkan (logout tidak menghapus token aktif) |
| Password Hashing | Belum diverifikasi dengan bcrypt (dummy credentials)  |

---

## 🧭 Next Sprint Targets

| Sprint   | Feature             | Description                                     |
| -------- | ------------------- | ----------------------------------------------- |
| Sprint 2 | Full Authentication | Integrasi dengan tabel `users`, validasi bcrypt |
| Sprint 2 | Authorization       | Role-based access untuk endpoint lain           |
| Sprint 3 | User Management     | CRUD untuk pengguna sistem                      |
| Sprint 3 | Secure Logout       | Implementasi token blacklist / rotation         |

---

## 📚 References

* [NestJS - JWT Authentication](https://docs.nestjs.com/security/authentication)
* [JSON Web Token (RFC 7519)](https://datatracker.ietf.org/doc/html/rfc7519)
* [bcrypt Best Practices](https://github.com/kelektiv/node.bcrypt.js)
* [PostgreSQL - users table schema](./schema.md)

---

**Document End**
