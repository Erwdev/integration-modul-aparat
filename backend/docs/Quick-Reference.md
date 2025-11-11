# API Quick Reference

Quick cheat sheet for all endpoints.

## Authentication
```bash
# Register
POST /auth/register

# Login
POST /auth/login

# Refresh
POST /auth/refresh

# Profile
GET /auth/profile

# Logout
POST /auth/logout
```

## Aparat
```bash
# CRUD
POST   /api/v1/aparat              # Create
GET    /api/v1/aparat              # List
GET    /api/v1/aparat/:id          # Read
PUT    /api/v1/aparat/:id          # Update
DELETE /api/v1/aparat/:id          # Delete

# Special
PATCH /api/v1/aparat/:id/status    # Update status
POST  /api/v1/aparat/upload-signature
```

## Ekspedisi
```bash
POST   /api/v1/ekspedisi           # Create
GET    /api/v1/ekspedisi           # List
GET    /api/v1/ekspedisi/:id       # Read
PUT    /api/v1/ekspedisi/:id       # Update
PATCH  /api/v1/ekspedisi/:id/status
DELETE /api/v1/ekspedisi/:id       # Delete
```

## Surat
```bash
POST   /api/v1/surat               # Create
GET    /api/v1/surat               # List
GET    /api/v1/surat/:id           # Read
PUT    /api/v1/surat/:id           # Update
PATCH  /api/v1/surat/:id/status
DELETE /api/v1/surat/:id           # Delete
```

## Events
```bash
GET  /api/v1/events                # List all
GET  /api/v1/events/:id            # Get one
POST /api/v1/events/retry/:id      # Retry
GET  /api/v1/events/failed         # Failed only
GET  /api/v1/events/dlq            # Dead letter queue
```

## Users
```bash
POST   /api/v1/users               # Create
GET    /api/v1/users               # List
GET    /api/v1/users/:id           # Read
PUT    /api/v1/users/:id           # Update
DELETE /api/v1/users/:id           # Delete
```

## Health
```bash
GET /health                        # Health check
GET /                              # API info
```

## Common Query Parameters

### Pagination
```
?page=1&limit=10
```

### Filtering
```
?status=AKTIF
?jenis_surat=SK
?search=john
```

### Sorting
```
?sortBy=nama&sortOrder=ASC
```

### Date Range
```
?startDate=2025-01-01&endDate=2025-01-31
```

## HTTP Status Codes

- 200: OK
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Validation Error
- 500: Server Error