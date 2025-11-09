# API Reference Documentation - Complete

**Project:** Integration Modul Aparat - Sistem Administrasi Kalurahan  
**Version:** 1.0.0  
**Last Updated:** 2025-11-10  
**Base URL:** `http://localhost:3000`

---

## 📋 Table of Contents

1. [Authentication Module](#1-authentication-module)
2. [Aparat Module](#2-aparat-module)
3. [Ekspedisi Module](#3-ekspedisi-module)
4. [Surat Module](#4-surat-module)
5. [Events Module](#5-events-module)
6. [Users Module](#6-users-module)
7. [Health & Utilities](#7-health--utilities)
8. [Error Responses](#8-error-responses)
9. [Postman Collection](#9-postman-collection)

---

## 🔐 Authentication

All endpoints (except `/auth/login`, `/auth/refresh`, `/health`) require JWT authentication.

**Headers Required:**
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

**Token Expiration:**
- Access Token: 30 minutes
- Refresh Token: 7 days

---

## 1. 🔐 Authentication Module

Base path: `/auth`

### 1.1 POST /auth/login

Authenticate user and generate tokens.

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "username": "test",
  "password": "1234"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"1234"}'
```

---

### 1.2 POST /auth/refresh

Refresh access token using refresh token.

**Request:**
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

---

### 1.3 GET /auth/profile

Get current user profile.

**Request:**
```http
GET /auth/profile
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "username": "test",
  "sub": "user-id-123"
}
```

**cURL Example:**
```bash
curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 2. 👥 Aparat Module

Base path: `/api/v1/aparat`

### 2.1 POST /api/v1/aparat

Create new aparat (perangkat desa).

**Request:**
```http
POST /api/v1/aparat
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "nip": "196801011990031001",
  "nik": "3201011234567890",
  "nama": "John Doe",
  "jabatan": "Kepala Desa",
  "pangkat_golongan": "Pembina (IV/a)",
  "nomor_urut": 1,
  "tanda_tangan_url": "http://example.com/signature.png"
}
```

**Response (201 Created):**
```json
{
  "id_aparat": "123e4567-e89b-12d3-a456-426614174000",
  "nip": "196801011990031001",
  "nik": "3201011234567890",
  "nama": "John Doe",
  "jabatan": "Kepala Desa",
  "pangkat_golongan": "Pembina (IV/a)",
  "nomor_urut": 1,
  "status": "AKTIF",
  "tanda_tangan_url": "http://example.com/signature.png",
  "created_at": "2025-01-15T10:00:00.000Z",
  "updated_at": "2025-01-15T10:00:00.000Z",
  "version": 1
}
```

**Validation Rules:**
- `nip`: Must be 18 characters, unique
- `nik`: Must be 16 characters, unique
- `nama`: Required, max 255 characters
- `jabatan`: Required
- `nomor_urut`: Must be positive integer

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/aparat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nip": "196801011990031001",
    "nik": "3201011234567890",
    "nama": "John Doe",
    "jabatan": "Kepala Desa",
    "pangkat_golongan": "Pembina (IV/a)",
    "nomor_urut": 1
  }'
```

---

### 2.2 GET /api/v1/aparat

Get list of aparat with filters and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page |
| `status` | string | - | Filter by status (AKTIF/NONAKTIF/CUTI/PENSIUN) |
| `search` | string | - | Search by nama, nip, or nik |
| `jabatan` | string | - | Filter by jabatan |
| `sortBy` | string | nomor_urut | Sort field |
| `sortOrder` | string | ASC | Sort order (ASC/DESC) |

**Request:**
```http
GET /api/v1/aparat?page=1&limit=10&status=AKTIF&search=john
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id_aparat": "123e4567-e89b-12d3-a456-426614174000",
      "nip": "196801011990031001",
      "nik": "3201011234567890",
      "nama": "John Doe",
      "jabatan": "Kepala Desa",
      "pangkat_golongan": "Pembina (IV/a)",
      "nomor_urut": 1,
      "status": "AKTIF",
      "created_at": "2025-01-15T10:00:00.000Z",
      "updated_at": "2025-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

**cURL Example:**
```bash
curl "http://localhost:3000/api/v1/aparat?page=1&limit=10&status=AKTIF" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2.3 GET /api/v1/aparat/:id

Get aparat by ID.

**Request:**
```http
GET /api/v1/aparat/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "id_aparat": "123e4567-e89b-12d3-a456-426614174000",
  "nip": "196801011990031001",
  "nik": "3201011234567890",
  "nama": "John Doe",
  "jabatan": "Kepala Desa",
  "pangkat_golongan": "Pembina (IV/a)",
  "nomor_urut": 1,
  "status": "AKTIF",
  "tanda_tangan_url": "http://example.com/signature.png",
  "created_at": "2025-01-15T10:00:00.000Z",
  "updated_at": "2025-01-15T10:00:00.000Z",
  "version": 1
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Aparat not found"
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/v1/aparat/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2.4 PUT /api/v1/aparat/:id

Update aparat.

**Request:**
```http
PUT /api/v1/aparat/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "nama": "John Doe Updated",
  "jabatan": "Sekretaris Desa"
}
```

**Response (200 OK):**
```json
{
  "id_aparat": "123e4567-e89b-12d3-a456-426614174000",
  "nip": "196801011990031001",
  "nik": "3201011234567890",
  "nama": "John Doe Updated",
  "jabatan": "Sekretaris Desa",
  "pangkat_golongan": "Pembina (IV/a)",
  "nomor_urut": 1,
  "status": "AKTIF",
  "created_at": "2025-01-15T10:00:00.000Z",
  "updated_at": "2025-01-15T11:00:00.000Z",
  "version": 2
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/v1/aparat/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nama":"John Doe Updated","jabatan":"Sekretaris Desa"}'
```

---

### 2.5 PATCH /api/v1/aparat/:id/status

Update aparat status only.

**Request:**
```http
PATCH /api/v1/aparat/123e4567-e89b-12d3-a456-426614174000/status
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "status": "NONAKTIF"
}
```

**Valid Status Values:**
- `AKTIF`
- `NONAKTIF`
- `CUTI`
- `PENSIUN`

**Response (200 OK):**
```json
{
  "id_aparat": "123e4567-e89b-12d3-a456-426614174000",
  "nama": "John Doe",
  "status": "NONAKTIF",
  "updated_at": "2025-01-15T11:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/aparat/123e4567-e89b-12d3-a456-426614174000/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"NONAKTIF"}'
```

---

### 2.6 DELETE /api/v1/aparat/:id

Delete aparat (soft delete).

**Request:**
```http
DELETE /api/v1/aparat/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (204 No Content)**

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/aparat/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2.7 POST /api/v1/aparat/upload-signature

Upload signature image for aparat.

**Request:**
```http
POST /api/v1/aparat/upload-signature
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: multipart/form-data

file: <binary_data>
```

**Constraints:**
- Max file size: 2MB
- Allowed formats: `.png`, `.jpg`, `.jpeg`

**Response (200 OK):**
```json
{
  "tanda_tangan_url": "http://localhost:3000/uploads/signatures/uuid-filename.png"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/aparat/upload-signature \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@signature.png"
```

---

## 3. 📮 Ekspedisi Module

Base path: `/api/v1/ekspedisi`

### 3.1 POST /api/v1/ekspedisi

Create new ekspedisi (surat masuk/keluar).

**Request:**
```http
POST /api/v1/ekspedisi
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "nomor_surat": "001/KEL/2025",
  "jenis_ekspedisi": "MASUK",
  "pengirim": "Desa ABC",
  "penerima": "Desa XYZ",
  "perihal": "Undangan Rapat",
  "tanggal_surat": "2025-01-15",
  "tanggal_diterima": "2025-01-16",
  "keterangan": "Segera ditindaklanjuti"
}
```

**Response (201 Created):**
```json
{
  "id_ekspedisi": "uuid",
  "nomor_surat": "001/KEL/2025",
  "jenis_ekspedisi": "MASUK",
  "pengirim": "Desa ABC",
  "penerima": "Desa XYZ",
  "perihal": "Undangan Rapat",
  "tanggal_surat": "2025-01-15T00:00:00.000Z",
  "tanggal_diterima": "2025-01-16T00:00:00.000Z",
  "status": "DITERIMA",
  "keterangan": "Segera ditindaklanjuti",
  "created_at": "2025-01-16T10:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/ekspedisi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomor_surat": "001/KEL/2025",
    "jenis_ekspedisi": "MASUK",
    "pengirim": "Desa ABC",
    "penerima": "Desa XYZ",
    "perihal": "Undangan Rapat",
    "tanggal_surat": "2025-01-15",
    "tanggal_diterima": "2025-01-16"
  }'
```

---

### 3.2 GET /api/v1/ekspedisi

Get list of ekspedisi with filters.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 10) |
| `jenis_ekspedisi` | string | MASUK/KELUAR |
| `status` | string | DITERIMA/DIPROSES/SELESAI |
| `search` | string | Search by nomor_surat, pengirim, penerima |
| `startDate` | string | Filter from date (YYYY-MM-DD) |
| `endDate` | string | Filter to date (YYYY-MM-DD) |

**Request:**
```http
GET /api/v1/ekspedisi?jenis_ekspedisi=MASUK&page=1&limit=10
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 3.3 GET /api/v1/ekspedisi/:id

Get ekspedisi by ID.

**Request:**
```http
GET /api/v1/ekspedisi/uuid
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "id_ekspedisi": "uuid",
  "nomor_surat": "001/KEL/2025",
  "jenis_ekspedisi": "MASUK",
  ...
}
```

---

### 3.4 PUT /api/v1/ekspedisi/:id

Update ekspedisi.

**Request:**
```http
PUT /api/v1/ekspedisi/uuid
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "perihal": "Undangan Rapat (Updated)",
  "keterangan": "Sudah diproses"
}
```

**Response (200 OK):**
```json
{
  "id_ekspedisi": "uuid",
  "perihal": "Undangan Rapat (Updated)",
  ...
}
```

---

### 3.5 PATCH /api/v1/ekspedisi/:id/status

Update ekspedisi status.

**Request:**
```http
PATCH /api/v1/ekspedisi/uuid/status
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "status": "SELESAI"
}
```

**Valid Status:**
- `DITERIMA`
- `DIPROSES`
- `SELESAI`
- `DITOLAK`

**Response (200 OK):**
```json
{
  "id_ekspedisi": "uuid",
  "status": "SELESAI",
  "updated_at": "2025-01-16T12:00:00.000Z"
}
```

---

### 3.6 DELETE /api/v1/ekspedisi/:id

Delete ekspedisi.

**Request:**
```http
DELETE /api/v1/ekspedisi/uuid
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (204 No Content)**

---

## 4. 📄 Surat Module

Base path: `/api/v1/surat`

### 4.1 POST /api/v1/surat

Create new surat.

**Request:**
```http
POST /api/v1/surat
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "nomor_surat": "001/SK/2025",
  "jenis_surat": "SK",
  "perihal": "Keputusan Kepala Desa",
  "tanggal_surat": "2025-01-15",
  "id_aparat": "uuid-penandatangan",
  "isi_surat": "Isi keputusan...",
  "lampiran": ["file1.pdf", "file2.pdf"]
}
```

**Jenis Surat:**
- `SK` - Surat Keputusan
- `SE` - Surat Edaran
- `ST` - Surat Tugas
- `SPT` - Surat Perintah Tugas
- `UMUM` - Surat Umum

**Response (201 Created):**
```json
{
  "id_surat": "uuid",
  "nomor_surat": "001/SK/2025",
  "jenis_surat": "SK",
  "perihal": "Keputusan Kepala Desa",
  "tanggal_surat": "2025-01-15T00:00:00.000Z",
  "status": "DRAFT",
  "created_at": "2025-01-15T10:00:00.000Z"
}
```

---

### 4.2 GET /api/v1/surat

Get list of surat with filters.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `jenis_surat` | string | SK/SE/ST/SPT/UMUM |
| `status` | string | DRAFT/REVIEW/APPROVED/PUBLISHED |
| `search` | string | Search by nomor_surat, perihal |
| `startDate` | string | Filter from date |
| `endDate` | string | Filter to date |

**Request:**
```http
GET /api/v1/surat?jenis_surat=SK&status=APPROVED
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

---

### 4.3 GET /api/v1/surat/:id

Get surat by ID.

**Request:**
```http
GET /api/v1/surat/uuid
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "id_surat": "uuid",
  "nomor_surat": "001/SK/2025",
  "jenis_surat": "SK",
  "perihal": "Keputusan Kepala Desa",
  "tanggal_surat": "2025-01-15T00:00:00.000Z",
  "status": "APPROVED",
  "isi_surat": "Isi keputusan...",
  "penandatangan": {
    "id_aparat": "uuid",
    "nama": "John Doe",
    "jabatan": "Kepala Desa"
  },
  "created_at": "2025-01-15T10:00:00.000Z"
}
```

---

### 4.4 PUT /api/v1/surat/:id

Update surat.

**Request:**
```http
PUT /api/v1/surat/uuid
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "perihal": "Keputusan Kepala Desa (Revisi)",
  "isi_surat": "Isi yang sudah direvisi..."
}
```

**Response (200 OK):**
```json
{
  "id_surat": "uuid",
  "perihal": "Keputusan Kepala Desa (Revisi)",
  ...
}
```

---

### 4.5 PATCH /api/v1/surat/:id/status

Update surat status.

**Request:**
```http
PATCH /api/v1/surat/uuid/status
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "status": "APPROVED"
}
```

**Valid Status Flow:**
```
DRAFT → REVIEW → APPROVED → PUBLISHED
        ↓
      REJECTED
```

**Response (200 OK):**
```json
{
  "id_surat": "uuid",
  "status": "APPROVED",
  "approved_at": "2025-01-15T12:00:00.000Z"
}
```

---

### 4.6 DELETE /api/v1/surat/:id

Delete surat.

**Request:**
```http
DELETE /api/v1/surat/uuid
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (204 No Content)**

---

## 5. 📡 Events Module

Base path: `/api/v1/events`

### 5.1 GET /api/v1/events

Get list of events (audit log).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `topic` | string | Filter by event topic |
| `status` | string | PENDING/SUCCESS/FAILED |
| `startDate` | string | Filter from date |
| `endDate` | string | Filter to date |

**Request:**
```http
GET /api/v1/events?status=FAILED&page=1
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id_event": "uuid",
      "topic": "aparat.created",
      "payload": {...},
      "status": "FAILED",
      "retry_count": 3,
      "error_message": "Connection timeout",
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 5.2 GET /api/v1/events/:id

Get event by ID.

**Request:**
```http
GET /api/v1/events/uuid
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "id_event": "uuid",
  "topic": "aparat.created",
  "payload": {
    "id": "uuid",
    "nama": "John Doe",
    ...
  },
  "status": "SUCCESS",
  "retry_count": 0,
  "created_at": "2025-01-15T10:00:00.000Z",
  "processed_at": "2025-01-15T10:00:05.000Z"
}
```

---

### 5.3 POST /api/v1/events/retry/:id

Retry failed event.

**Request:**
```http
POST /api/v1/events/retry/uuid
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "message": "Event retry initiated",
  "id_event": "uuid",
  "retry_count": 4
}
```

---

### 5.4 GET /api/v1/events/failed

Get all failed events.

**Request:**
```http
GET /api/v1/events/failed?page=1&limit=10
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [...],
  "meta": {...}
}
```

---

### 5.5 GET /api/v1/events/dlq

Get events in Dead Letter Queue (max retries exceeded).

**Request:**
```http
GET /api/v1/events/dlq
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id_event": "uuid",
      "topic": "aparat.updated",
      "retry_count": 5,
      "max_retries": 5,
      "in_dlq": true,
      "error_message": "Max retries exceeded",
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## 6. 👤 Users Module

Base path: `/api/v1/users`

### 6.1 POST /api/v1/users

Create new user.

**Request:**
```http
POST /api/v1/users
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "ADMIN",
  "id_aparat": "uuid-optional"
}
```

**Response (201 Created):**
```json
{
  "id_user": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "ADMIN",
  "created_at": "2025-01-15T10:00:00.000Z"
}
```

---

### 6.2 GET /api/v1/users

Get list of users.

**Request:**
```http
GET /api/v1/users?page=1&limit=10&role=ADMIN
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [...],
  "meta": {...}
}
```

---

### 6.3 GET /api/v1/users/:id

Get user by ID.

**Request:**
```http
GET /api/v1/users/uuid
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200 OK):**
```json
{
  "id_user": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "ADMIN",
  "aparat": {
    "nama": "John Doe",
    "jabatan": "Kepala Desa"
  }
}
```

---

### 6.4 PUT /api/v1/users/:id

Update user.

**Request:**
```http
PUT /api/v1/users/uuid
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "role": "USER"
}
```

**Response (200 OK):**
```json
{
  "id_user": "uuid",
  "username": "johndoe",
  "email": "newemail@example.com",
  "role": "USER"
}
```

---

### 6.5 DELETE /api/v1/users/:id

Delete user.

**Request:**
```http
DELETE /api/v1/users/uuid
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (204 No Content)**

---

## 7. 🏥 Health & Utilities

### 7.1 GET /health

Health check endpoint.

**Request:**
```http
GET /health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "memory": {
    "heapUsed": 45.2,
    "heapTotal": 100
  }
}
```

---

### 7.2 GET /

API information.

**Request:**
```http
GET /
```

**Response (200 OK):**
```json
{
  "name": "Integration Modul Aparat API",
  "version": "1.0.0",
  "description": "API for Aparat, Ekspedisi, and Surat modules",
  "documentation": "/api-docs"
}
```

---

## 8. ⚠️ Error Responses

### Common HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no content returned |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate) |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Server error |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "nip",
      "message": "NIP must be 18 characters"
    }
  ],
  "timestamp": "2025-01-15T10:00:00.000Z",
  "path": "/api/v1/aparat"
}
```

---

## 9. 📦 Postman Collection

See separate file: `Postman Collection.json`

Or download from:
```
http://localhost:3000/api-docs-json
```

---

## 📚 Additional Resources

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs-json`
- **GitHub Repository**: [Link]
- **Issue Tracker**: [Link]

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-11-10  
**Maintained by:** Development Team