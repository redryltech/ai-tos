# api — AI-TOS API (Phase 0A)

NestJS 10 REST API. Foundation: health, auth scaffolding, RBAC, audit interceptor.

## Stack
NestJS · TypeScript · REST · Swagger · Helmet · CORS · JWT · RBAC.

## Scripts
- `build` — `tsc -p tsconfig.json` → `dist/`
- `start` — `node dist/main.js` on :4000
- `dev` — watch
- `lint` — eslint
- `typecheck` — tsc --noEmit

## Endpoints
- `GET /api/health` — service health.
- `POST /api/auth/login` — issues a **demo** JWT; disabled in production.

## Configuration
See `.env.example` (`PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `CORS_ORIGIN`).

## Notes
Auth is scaffolding (JWT + RBAC guard/roles). No user store yet. No business logic.
