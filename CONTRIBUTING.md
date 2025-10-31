# Contributing to Integration Modul Aparat

Terima kasih telah berkontribusi pada **Integration Modul Aparat**! Dokumen ini memberikan panduan untuk berkontribusi pada proyek Sprint 1.

---

## 🌳 Branching Strategy

### Main Branches

- **`main`** - Production/stable release
- **`dev`** - Integration branch untuk sprint

### Feature Branches

Format: `feature/<task-name>`

**Contoh:**
```bash
feature/migration-aparat
feature/auth-module
feature/aparat-crud
```

**Aturan:**
- Branch dari `dev`
- Nama menggunakan lowercase dan dash (-)
- Deskriptif dan singkat

---

## 🚀 Quick Setup

```powershell
# Clone dan checkout dev
git clone https://github.com/Erwdev/integration-modul-aparat.git
cd integration-modul-aparat
git checkout dev

# Setup environment
Copy-Item .env.example .env

# Start services
docker compose up -d

# Run migration
docker cp migrations/001_init.sql aparat-db:/tmp/
docker exec -it aparat-db bash -c "psql -U postgres -d aparat -f /tmp/001_init.sql"

# Verify
curl http://localhost:3000/health
```

---

## 🔄 Pull Request Workflow

### 1. Create Feature Branch

```powershell
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### 2. Make Changes & Commit

```powershell
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 3. Create PR

- Base: `dev` ← Compare: `feature/your-feature-name`
- Isi deskripsi apa yang dikerjakan
- Screenshot jika ada perubahan UI
- Cara test perubahan

### 4. Review & Merge

- Reviewer: Integration Lead (Erwin)
- Review time: Max 24 jam
- Requirements:
  - ✅ Tests passing
  - ✅ No conflicts
  - ✅ Approved

---

## 💻 Coding Standards

### No Magic Values

```typescript
// ❌ Bad
if (user.role === 'ADMIN') {

// ✅ Good
if (user.role === UserRole.ADMIN) {
```

### Error Handling

```typescript
// ✅ Good
try {
  const data = await this.service.findOne(id);
  if (!data) {
    throw new NotFoundException(`Data tidak ditemukan`);
  }
  return data;
} catch (error) {
  this.logger.error(`Error: ${error.message}`);
  throw error;
}
```

### File Naming

- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- DTOs: `*.dto.ts`
- Entities: `*.entity.ts`
- Tests: `*.spec.ts`

---

## 🧪 Testing

```powershell
# Run tests
docker compose exec backend npm test

# Run with coverage
docker compose exec backend npm run test:cov
```

**Requirements:**
- Minimum 80% line coverage
- All tests passing before PR

---

## 📝 Commit Messages

Format: `<type>: <description>`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `test` - Add tests
- `refactor` - Code refactor
- `chore` - Maintenance

**Examples:**
```bash
feat: add aparat CRUD endpoints
fix: resolve JWT token issue
docs: update README setup instructions
test: add unit tests for controller
```

---

## ⚠️ Development Rules

### Must Do:
- ✅ Use Docker for development
- ✅ Run tests before PR
- ✅ Follow coding standards
- ✅ Update `.env.example` if add new env vars

### Must NOT:
- ❌ Commit `node_modules/`
- ❌ Commit `.env` file
- ❌ Commit passwords/secrets
- ❌ Push to `main` directly

---

## 🆘 Need Help?

1. Check [README.md](README.md)
2. Ask di Discord/Slack
3. Contact Integration Lead

**Integration Lead**: Erwin (Ell Besi Sinaga)
- GitHub: [@Erwdev](https://github.com/Erwdev)

---

**Happy Coding! 🚀**

---

## 🌳 Branching Strategy

### Main Branches

- **`main`** - Production/stable release branch
  - Hanya menerima PR dari `dev` setelah sprint selesai
  - Semua kode di branch ini harus production-ready
  - Protected branch (no direct push)

- **`dev`** - Integration branch untuk sprint aktif
  - Tempat semua feature branch di-merge
  - Harus selalu dalam kondisi buildable
  - Auto-deploy ke staging environment

### Feature Branches

Format penamaan: `feature/<task-name>`

**Contoh:**
```bash
feature/migration-aparat
feature/auth-module
feature/aparat-crud
feature/validation-dto
```

**Aturan:**
- Branch dari `dev`
- Nama menggunakan lowercase dan dash (-)
- Deskriptif dan singkat
- Satu feature = satu branch

---

## 🚀 Development Setup

### 1. Clone Repository

```powershell
git clone https://github.com/Erwdev/integration-modul-aparat.git
cd integration-modul-aparat
```

### 2. Checkout Development Branch

```powershell
git checkout dev
git pull origin dev
```

### 3. Create Feature Branch

```powershell
git checkout -b feature/your-feature-name
```

### 4. Setup Environment

```powershell
# Copy environment file
Copy-Item .env.example .env

# Start Docker services
docker compose up -d

# Run migrations
docker cp migrations/001_init.sql aparat-db:/tmp/
docker compose exec db psql -U postgres -d aparat -f /tmp/001_init.sql
```

### 5. Verify Setup

```powershell
# Check services are running
docker compose ps

# Test API
curl http://localhost:3000/health

# Run tests
docker compose exec backend npm test
```

---

## 🔄 Pull Request Workflow

### 1. Create Feature Branch

```powershell
# Update dev branch
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write clean, readable code
- Follow coding standards (lihat [Coding Standards](#coding-standards))
- Add tests for new features
- Update documentation jika perlu

### 3. Commit Changes

```powershell
# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat: add aparat CRUD endpoints"
```

**Commit message format:** (lihat [Commit Message Guidelines](#commit-message-guidelines))

### 4. Push to Remote

```powershell
# Push feature branch
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Buka GitHub repository
2. Click "New Pull Request"
3. Base: `dev` ← Compare: `feature/your-feature-name`
4. Isi PR template:
   - **Title**: Deskripsi singkat (max 50 chars)
   - **Description**: 
     - Apa yang dikerjakan
     - Kenapa perubahan ini diperlukan
     - Screenshot/GIF (jika UI changes)
   - **Testing**: Cara test perubahan
   - **Checklist**: Centang semua requirements

### 6. PR Review Process

- **Reviewer**: Integration Lead (Erwin)
- **Review Time**: Max 24 jam
- **Required Checks**:
  - ✅ All tests passing
  - ✅ No merge conflicts
  - ✅ Code review approved
  - ✅ CI/CD pipeline success

### 7. Merge Requirements

PR akan di-merge jika:
- Mendapat approval dari reviewer
- Semua CI checks pass
- No merge conflicts dengan `dev`
- Semua comments resolved

---

## 💻 Coding Standards

### TypeScript/NestJS

```typescript
// ✅ Good
export class AparatController {
  constructor(private readonly aparatService: AparatService) {}

  @Get()
  async findAll(): Promise<AparatDto[]> {
    return this.aparatService.findAll();
  }
}

// ❌ Bad
export class AparatController {
  constructor(private aparatService: AparatService) {} // missing readonly

  @Get()
  findAll() { // missing return type & async
    return this.aparatService.findAll();
  }
}
```

### File Naming

- **Controllers**: `*.controller.ts`
- **Services**: `*.service.ts`
- **DTOs**: `*.dto.ts`
- **Entities**: `*.entity.ts`
- **Tests**: `*.spec.ts`

### Import Order

```typescript
// 1. External packages
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// 2. Internal modules
import { AparatService } from './aparat.service';
import { AparatDto } from './dto/aparat.dto';

// 3. Constants/Types
import { APP_CONSTANTS } from '../constants/app.constants';
```

### No Magic Values

```typescript
// ❌ Bad
if (user.role === 'ADMIN') { // magic string

// ✅ Good
if (user.role === UserRole.ADMIN) { // use enum

// ❌ Bad
await app.listen(3000); // magic number

// ✅ Good
const port = configService.get<number>('PORT', 3000);
await app.listen(port);
```

### Error Handling

```typescript
// ✅ Good
try {
  const aparat = await this.aparatService.findOne(id);
  if (!aparat) {
    throw new NotFoundException(`Aparat dengan ID ${id} tidak ditemukan`);
  }
  return aparat;
} catch (error) {
  this.logger.error(`Error finding aparat: ${error.message}`);
  throw error;
}
```

---

## 🧪 Testing Requirements

### Unit Tests

**Wajib** untuk:
- Controllers
- Services
- DTOs (validation)
- Utilities/Helpers

```powershell
# Run unit tests
docker compose exec backend npm test

# Run with coverage
docker compose exec backend npm run test:cov
```

**Coverage Requirements:**
- Minimum 80% line coverage
- Minimum 70% branch coverage

### E2E Tests

**Wajib** untuk:
- API endpoints
- Authentication flows
- Critical business logic

```powershell
# Run E2E tests
docker compose exec backend npm run test:e2e
```

### Test Structure

```typescript
describe('AparatController', () => {
  let controller: AparatController;
  let service: AparatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AparatController],
      providers: [
        {
          provide: AparatService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AparatController>(AparatController);
    service = module.get<AparatService>(AparatService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of aparat', async () => {
      const result = [{ id: '1', nama: 'Test' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });
  });
});
```

### Testing Checklist

Sebelum submit PR, pastikan:
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Coverage tidak turun dari baseline

---

## 📝 Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style (formatting, missing semicolons)
- **refactor**: Code refactoring (no functional changes)
- **test**: Adding/updating tests
- **chore**: Maintenance (dependencies, build config)

### Examples

```bash
# Feature
feat(aparat): add CRUD endpoints for aparat management

# Bug fix
fix(auth): resolve JWT token expiration issue

# Documentation
docs(readme): update setup instructions

# Refactor
refactor(user): extract validation logic to separate service

# Test
test(aparat): add unit tests for aparat controller

# Chore
chore(deps): update @nestjs/core to v10.0.0
```

### Rules

- Subject line max 50 characters
- Use imperative mood ("add" not "added")
- No period at the end
- Body explains what and why (optional)
- Reference issues/PRs in footer (optional)

---

## ⚠️ Development Rules

### 🐳 Docker-First Development

**Semua development HARUS menggunakan Docker:**

```powershell
# ✅ Correct way
docker compose up -d
docker compose exec backend npm test

# ❌ Wrong way (local Node.js)
npm install
npm run start:dev
```

**Alasan:**
- Konsistensi environment antar developer
- Menghindari "works on my machine"
- Match dengan production environment

### 📦 Dependencies

**JANGAN commit:**
- `node_modules/`
- `dist/`
- `.env` (use `.env.example`)
- IDE configs (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)

**DO commit:**
- `package.json`
- `package-lock.json`
- `.env.example`
- Source code (`src/`)
- Tests (`test/`, `*.spec.ts`)
- Documentation (`docs/`, `README.md`)

### ✅ Pre-commit Checklist

Sebelum commit, pastikan:
- [ ] Code di-format dengan Prettier
- [ ] No ESLint errors
- [ ] All tests passing
- [ ] No console.log() atau debug code
- [ ] Environment variables di `.env.example` (not `.env`)
- [ ] Migration scripts tested

### 🧪 Testing Requirements

**Setiap perubahan backend WAJIB:**
1. Run tests: `docker compose exec backend npm test`
2. Include test output/screenshot di PR
3. Update test jika ada breaking changes

```powershell
# Run tests dan save output
docker compose exec backend npm test > test-results.txt

# Attach test-results.txt ke PR
```

### 🔒 Security

**Jangan commit:**
- Passwords, API keys, secrets
- Database credentials (use environment variables)
- Private tokens

**DO:**
- Use environment variables
- Add secrets to `.env.example` sebagai placeholder
- Use `dotenv` untuk load secrets

### 📊 Code Review

**Self-review checklist sebelum submit PR:**
- [ ] Code mengikuti style guide
- [ ] No hardcoded values
- [ ] Error handling complete
- [ ] Logging implemented
- [ ] Documentation updated
- [ ] Tests written and passing
- [ ] No commented-out code
- [ ] No TODO/FIXME without issue reference

---

## 🆘 Getting Help

### Questions?

1. Check [README.md](README.md)
2. Check existing issues
3. Ask di Discord/Slack channel
4. Contact Integration Lead

### Found a Bug?

1. Check existing issues
2. Create new issue dengan template:
   - Deskripsi bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, Docker version)
   - Screenshots/logs

### Need a Feature?

1. Diskusikan dengan team lead
2. Create feature request issue
3. Wait for approval sebelum implement

---

## 📞 Contact

**Integration Lead**: Erwin (Ell Besi Sinaga)
- GitHub: [@Erwdev](https://github.com/Erwdev)

**Team**: Team 9 — PRPL

---

## 📄 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Happy Coding! 🚀**
