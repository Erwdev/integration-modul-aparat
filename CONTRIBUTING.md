# Contribution Guide Sprint 1

## Branching Strategy
- `main` = release stable
- `dev` = integration branch sprint
- Feature development:
  `feature/<task-name>`
  contoh:
  feature/migration-aparat

## PR Workflow
1. Fork branch from `dev`
2. Commit small changes
3. Push to feature branch
4. Submit PR to `dev`
5. Reviewer: Integration Lead (Erwin)

## Development Rules
- Semua bergantung pada Docker
- Jangan commit node_modules
- Semua perubahan backend wajib ada log test running
