# Coding Standards

- **Language**: TypeScript (strict), Python (typed), Go (formatted), HCL.
- **Formatting**: Prettier (TS/JS/JSON/MD); `gofmt` for Go; `terraform fmt` for HCL.
- **Lint**: `tsc --noEmit` is the gate for TS; ESLint via Next where configured.
- **Commits**: Conventional Commits (`feat:`, `fix:`, …) enforced by commitlint + Husky.
- **Types**: share domain types via `@ai-tos/shared`; never duplicate contracts.
- **Errors**: structured, logged with context; no secrets in logs.
- **Health**: every service exposes `/health`.
- **Secrets**: never in code or env files committed.
- **Tests**: co-located; `test` task must stay green in CI.
