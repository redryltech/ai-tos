# Local Setup Guide

Two options: Docker Compose (recommended) or native.

## Docker Compose (recommended)
```bash
docker compose -f infrastructure/docker/docker-compose.yml up --build
```
- Postgres :5432, Redis :6379, API :4000, Web :3000, AI :8000, workers :4100–4400.
- API auto-runs migrations? No — run `pnpm --filter @ai-tos/database run migrate` once, or rely on compose healthchecks.

## Native
1. Start Postgres + Redis (Docker or local).
2. `pnpm install`
3. `pnpm --filter @ai-tos/database run migrate`
4. `pnpm --filter @ai-tos/api run start &`
5. `pnpm --filter @ai-tos/web run dev &`

## Verify
- `curl localhost:4000/api/health` → `{"status":"ok",...}`
- Open `http://localhost:3000` → dashboard shell.
