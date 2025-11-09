# Integration Modul Aparat — Sprint 1

Backend service for **Aparat** module using **NestJS** and **PostgreSQL**, running through **Docker Compose**.
Built by **Team 9 — PRPL -- Ell Besi Sinaga**.

![CI](https://github.com/Erwdev/integration-modul-aparat/actions/workflows/ci.yml/badge.svg)

## 📋 Requirements

- **Docker Desktop** (required)
- **Git** (required)
- **Node.js 18+** (optional, for local development)
- **PostgreSQL Client** (optional, for manual DB access)

---

## 🚀 Quick Start (Fresh Setup)

### 1. Clone Repository

```powershell
git clone https://github.com/Erwdev/integration-modul-aparat.git
cd integration-modul-aparat
```

### 2. Setup Environment Variables

Create `.env` file from example:

```powershell
# Windows PowerShell
Copy-Item .env.example .env

# Or manually create .env with these values:
```

**Required `.env` Configuration:**

```plaintext
# Application
PORT=3000
HOST=localhost
NODE_ENV=development
APP_NAME=Aparat Backend API - Sprint 1
APP_VERSION=1.0.0

# Database
DB_HOST=db
DB_PORT=5432
DB_SYNCHRONIZE=false
DB_LOGGING=true
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=aparat

# JWT (untuk Sprint berikutnya)
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=1d
```

### 3. Start Docker Services

```powershell
# Start PostgreSQL and Backend services
docker compose up -d

# Check logs to ensure services are running
docker logs -f aparat-backend
```

**Expected Output:**
```
[Nest] 1  - 10/31/2025, 5:00:00 PM     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 10/31/2025, 5:00:00 PM     LOG [InstanceLoader] AppModule dependencies initialized
Application is running on: http://localhost:3000
```

### 4. Run Database Migrations

After services are up, apply database schema:

```powershell
# Copy migration file to container and run it
docker cp migrations/001_init.sql aparat-db:/tmp/
docker exec -it aparat-db bash -c "psql -U postgres -d aparat -f /tmp/001_init.sql"
```

**Expected Output:**
```
BEGIN
CREATE EXTENSION
CREATE TYPE
CREATE TYPE
CREATE TABLE
...
INSERT 0 6
INSERT 0 4
COMMIT
```

### 5. Verify Setup

Test the API endpoints:

```powershell
# Health check
curl http://localhost:3000/health

# Root endpoint
curl http://localhost:3000
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "aparat-backend",
  "timestamp": "2025-10-31T10:00:00.000Z",
  "uptime": 123
}
```

---

## 🧪 Testing

### Run All Tests

```powershell
# Run tests inside Docker container
docker compose exec backend npm test

# Or run with coverage
docker compose exec backend npm run test:cov
```

### Run Specific Test Suite

```powershell
# Test specific file
docker compose exec backend npm test -- app.controller.spec.ts

# Watch mode
docker compose exec backend npm run test:watch
```

### Test Database Connection

```powershell
# Connect to PostgreSQL
docker compose exec db psql -U postgres -d aparat

# List tables
\dt

# Check aparat_desa table
SELECT * FROM aparat_desa;

# Exit
\q
```

---

## 🗄️ Database Management

### View Current Schema

```powershell
# Connect to database
docker compose exec db psql -U postgres -d aparat

# List all tables
\dt

# Describe table structure
\d aparat_desa

# View all data
SELECT * FROM aparat_desa;
```

### Reset Database (Clean Start)

```powershell
# Stop services
docker compose down -v

# Remove database volume
docker volume rm integration-modul-aparat_db_data

# Restart and re-run migration
docker compose up -d
docker cp migrations/001_init.sql aparat-db:/tmp/
docker exec -it aparat-db bash -c "psql -U postgres -d aparat -f /tmp/001_init.sql"
```

### Rollback Database

```powershell
# Run rollback script
docker cp migrations/000_rollback_and_clean.sql aparat-db:/tmp/
docker exec -it aparat-db bash -c "psql -U postgres -d aparat -f /tmp/000_rollback_and_clean.sql"

# Then re-run init migration
docker cp migrations/001_init.sql aparat-db:/tmp/
docker exec -it aparat-db bash -c "psql -U postgres -d aparat -f /tmp/001_init.sql"
```

---

## 🛠️ Development Workflow

### Local Development (without Docker)

```powershell
# Install dependencies
cd backend/api
npm install

# Create local .env
Copy-Item .env.example .env

# Update DB_HOST in .env to localhost
# DB_HOST=localhost

# Run development server
npm run start:dev

# In another terminal, run PostgreSQL
docker compose up db -d
```

### Hot Reload Development

The Docker setup includes hot-reload by default:

```powershell
# Start in development mode
docker compose up

# Make changes to files in backend/api/src
# Server will automatically reload
```

### View Logs

```powershell
# Follow backend logs
docker logs -f aparat-backend

# Follow database logs
docker logs -f aparat-db

# View all logs
docker compose logs -f
```

### Rebuild After Changes

```powershell
# Rebuild only backend
docker compose up -d --build backend

# Or rebuild everything
docker compose down
docker compose up -d --build
```

---

## 📂 Project Structure

```
integration-modul-aparat/
├── .env                    # Environment variables (create from .env.example)
├── .env.example           # Environment template
├── docker-compose.yml     # Docker services configuration
├── README.md              # This file
├── CONTRIBUTING.md        # Contribution guidelines
│
├── backend/
│   ├── Dockerfile         # Backend container config
│   └── api/              # NestJS application
│       ├── src/
│       │   ├── app.module.ts       # Root module
│       │   ├── app.controller.ts   # Root controller
│       │   ├── main.ts             # Entry point
│       │   ├── auth/               # Authentication module
│       │   ├── common/             # Shared utilities
│       │   ├── constants/          # App constants
│       │   └── users/              # Users module
│       ├── test/                   # E2E tests
│       └── package.json
│
├── migrations/
│   ├── 000_rollback_and_clean.sql  # Rollback script
│   └── 001_init.sql                # Initial schema
│
└── docs/
    └── schema.md                    # Database schema documentation
```

---

## 🔧 Common Issues & Solutions

### Issue: Port Already in Use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=3001
```

### Issue: Docker Build Fails (Network Timeout)

```powershell
# Clean Docker cache
docker builder prune -f
docker system prune -f

# Rebuild with no cache
docker compose build --no-cache
docker compose up -d
```

### Issue: Database Connection Failed

```powershell
# Check if database is running
docker compose ps

# Restart database
docker compose restart db

# Check database logs
docker logs aparat-db
```

### Issue: Migration Fails

```powershell
# Check if database exists
docker compose exec db psql -U postgres -c "\l"

# Recreate database
docker compose exec db psql -U postgres -c "DROP DATABASE IF EXISTS aparat;"
docker compose exec db psql -U postgres -c "CREATE DATABASE aparat;"

# Re-run migration
docker cp migrations/001_init.sql aparat-db:/tmp/
docker compose exec db psql -U postgres -d aparat -f /tmp/001_init.sql
```

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Branching strategy (main, dev, feature/*)
- PR workflow
- Code review process
- Development rules

---

## 📝 API Endpoints

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "aparat-backend",
  "timestamp": "2025-10-31T10:00:00.000Z",
  "uptime": 123
}
```

### Root

```
GET /
```

Response:
```json
{
  "message": "Aparat Backend API - Sprint 1",
  "version": "1.0.0",
  "status": "active",
  "environment": "development"
}
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Team 9 — PRPL**
- Integration Lead: Erwin (Ell Besi Sinaga)

---

## 📞 Support

For issues and questions:
- Create an issue in GitHub
- Contact Integration Lead
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
- Node.js (optional, for local development)

## 🚀 Quick Start

1. Clone the repository
```bash
git clone <repository-url>
cd integration-modul-aparat
```

2. Copy environment file
```bash
cp .env.example .env
```

3. Start the services
```bash
docker compose up -d
```

The API will be available at `http://localhost:3000`

## 🛠️ Development

### Branch Strategy
- `main` - Production/stable releases
- `dev` - Sprint integration branch
- `feature/<task-name>` - Feature development

### Making Changes

1. Create new feature branch from `dev`:
```bash
git checkout dev
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git add .
git commit -m "feat: your change description"
```

3. Push and create PR:
```bash
git push origin feature/your-feature-name
```

4. Submit Pull Request to `dev` branch

### Development Rules
- All services must run through Docker
- Do not commit `node_modules`
- Backend changes require test logs
- Follow the PR review process

## 🧪 Testing

Run tests inside Docker:
```bash
docker compose exec backend npm test
```

## 📦 Project Structure

```
integration-modul-aparat/
├── .github/          # CI/CD workflows
├── backend/          # NestJS API service
│   ├── api/         # API source code
│   └── Dockerfile   # Backend container config
├── docs/            # Documentation
├── migrations/      # Database migrations
└── docker-compose.yml
```

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
