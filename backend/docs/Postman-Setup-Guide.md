# 🚀 Postman Collection Setup Guide

## 📥 Import Collection

### Method 1: Import dari File
1. Buka Postman
2. Click **Import** button (top left)
3. Pilih file: `backend/docs/Postman-Collection.json`
4. Click **Import**

### Method 2: Import dari URL (jika ada)
1. Copy raw URL dari GitHub
2. Postman → Import → Link
3. Paste URL dan Import

---

## 🔧 Setup Environment Variables

Collection ini menggunakan **Collection Variables** (otomatis), tidak perlu setup environment manual!

### Variables yang Digunakan:
```
baseUrl: http://localhost:3000  (default)
accessToken: (auto-saved after login)
refreshToken: (auto-saved after login)
```

### Cara Ubah Base URL (Optional):
1. Klik collection name → **Variables** tab
2. Edit `baseUrl` jika backend running di port lain
3. Save changes

---

## 🔐 Authentication Flow

### 1️⃣ **First Time Setup - Register**

**Endpoint:** `POST /auth/register`

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!",
  "nama_lengkap": "Test User"
}
```

✅ **Auto-Action:** Tokens tersimpan otomatis ke collection variables

---

### 2️⃣ **Login (Existing User)**

**Endpoint:** `POST /auth/login`

```json
{
  "username": "testuser",
  "password": "Test123!"
}
```

✅ **Auto-Action:** Tokens tersimpan otomatis

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

---

### 3️⃣ **Test Authentication**

**Endpoint:** `GET /auth/profile`

✅ **No manual setup needed** - Authorization header auto-filled dengan `{{accessToken}}`

---

### 4️⃣ **Refresh Token (Ketika Access Token Expired)**

**Endpoint:** `POST /auth/refresh`

Request body auto-filled:
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

✅ **Auto-Action:** New tokens tersimpan otomatis

---

### 5️⃣ **Logout**

**Endpoint:** `POST /auth/logout`

✅ **Auto-Action:** Tokens di-clear dari collection variables

---

## 🔒 Protected Endpoints

Semua endpoint (kecuali Authentication & Health Check) **otomatis menggunakan access token**.

### Cara Kerja:
1. Collection-level auth sudah di-set ke `Bearer Token`
2. Token auto-filled dari `{{accessToken}}`
3. Setiap request otomatis include header:
   ```
   Authorization: Bearer {{accessToken}}
   ```

### Jika Token Expired (401 Error):
1. Run **Refresh Token** request
2. Atau **Login** ulang
3. Retry failed request

---

## 📋 Testing Flow

### Recommended Testing Order:

#### 1. Authentication
```
1. Register → Auto-save tokens
2. Get Profile → Verify token works
3. Change Password (optional)
4. Logout → Clear tokens
5. Login → Get new tokens
```

#### 2. Aparat Management
```
1. Create Aparat
2. Get All Aparat (with pagination)
3. Get Aparat by ID
4. Update Aparat
5. Update Status
6. Upload Signature
7. Delete Aparat
```

#### 3. Ekspedisi Management
```
1. Create Ekspedisi
2. Get All Ekspedisi
3. Update Ekspedisi
4. Update Status
5. Delete Ekspedisi
```

#### 4. Surat Management
```
1. Create Surat
2. Get All Surat
3. Update Surat
4. Update Status
5. Delete Surat
```

#### 5. Events & Monitoring
```
1. Get All Events
2. Get Failed Events
3. Get DLQ Events
4. Retry Failed Event
```

---

## 💡 Tips & Tricks

### 1. **View Collection Variables**
- Click collection name
- Click **Variables** tab
- See current token values

### 2. **Debug Token Issues**
- Open Console (View → Show Postman Console)
- Run request
- Check Authorization header value

### 3. **Test Multiple Users**
- Duplicate requests
- Use different credentials
- Token auto-updates per request

### 4. **Environment Switching**
```javascript
// Current: Collection Variables (recommended)
{{baseUrl}}
{{accessToken}}
{{refreshToken}}

// Alternative: Create Environment
// Collections can override environment variables
```

### 5. **Pre-request Scripts (Advanced)**
```javascript
// Check if token exists before request
if (!pm.collectionVariables.get('accessToken')) {
    console.error('❌ No access token! Please login first.');
}
```

### 6. **Test Scripts (Already Included)**
```javascript
// Auto-save tokens after login
if (pm.response.code === 200) {
    const data = pm.response.json();
    pm.collectionVariables.set('accessToken', data.access_token);
}
```

---

## 🚨 Troubleshooting

### Problem: "401 Unauthorized"
**Solution:**
1. Check if `accessToken` exists (Collection Variables tab)
2. Run **Login** or **Refresh Token**
3. Verify token not expired

### Problem: "Token automatically used but still 401"
**Solution:**
1. Check if request has custom auth override
2. Remove any `Authorization` header overrides
3. Use collection-level auth

### Problem: "Refresh token not working"
**Solution:**
1. Check `refreshToken` value in collection variables
2. Verify refresh token not expired (7 days)
3. Login again to get new tokens

### Problem: "Variables not saving"
**Solution:**
1. Make sure using **Collection Variables** (not environment)
2. Check Test Scripts tab in request
3. Run request and check Console for errors

---

## 📖 API Documentation

### Full API Reference
See: `backend/docs/API Reference.md`

### Quick Reference
See: `backend/docs/Quick-Reference.md`

### Detailed Documentation
See: `backend/docs/API Documentation.md`

---

## 🎯 Quick Start Checklist

- [ ] Import Postman Collection
- [ ] Verify `baseUrl` variable (http://localhost:3000)
- [ ] Run **Register** or **Login**
- [ ] Check tokens saved (Collection Variables tab)
- [ ] Run **Get Profile** to verify auth works
- [ ] Test CRUD operations on any module
- [ ] Try **Refresh Token** when access token expires
- [ ] Run **Logout** when done

---

## 📞 Support

**Issues?**
- Check backend logs: `docker-compose logs -f aparat-backend`
- Check database: `docker exec -it aparat-db psql -U postgres -d aparat`
- Check network: `docker-compose ps`

**Backend Not Running?**
```bash
cd backend
docker-compose up -d
docker-compose logs -f aparat-backend
```

---

## 🔄 Auto-Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| **Token Auto-Save** | ✅ Enabled | Tokens saved after Login/Register/Refresh |
| **Token Auto-Use** | ✅ Enabled | All protected endpoints use `{{accessToken}}` |
| **Token Auto-Clear** | ✅ Enabled | Tokens cleared after Logout |
| **Test Scripts** | ✅ Included | Validation & logging in Console |
| **Documentation** | ✅ Embedded | Each request has description |

---

**Happy Testing! 🚀**
