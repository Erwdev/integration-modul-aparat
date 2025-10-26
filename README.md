# Integration Modul Aparat — Sprint 1

Backend service for **Aparat** module using **NestJS** and **PostgreSQL**, running through **Docker Compose**.
Built by **Team 9 — PRPL**.

## 📋 Requirements

- Docker Desktop
- Git
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