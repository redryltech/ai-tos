# Developer Onboarding

## Prerequisites
- Node 20+, pnpm (`corepack enable`)
- Docker (for local stack)
- Python 3.11+ (ai-service)
- Go 1.22+ (workers)
- Terraform 1.7+ (infra)

## First run
```bash
corepack enable
pnpm install
pnpm --filter @ai-tos/database run migrate   # needs a Postgres at DATABASE_URL
pnpm --filter @ai-tos/api run start          # API on :4000
pnpm --filter @ai-tos/web run dev            # Web on :3000
# OR one command for everything:
make dev
```

## Useful commands
- `pnpm run build` — build all workspaces (Turbo, cached)
- `pnpm run typecheck` — type-check all
- `pnpm run lint` — lint all
- `make bootstrap` — install + lint + typecheck on a fresh clone

## Where to start reading
1. `docs/architecture.md`
2. `packages/shared/src/index.ts` (the contracts)
3. `apps/api/src/modules/health` (the simplest service)
