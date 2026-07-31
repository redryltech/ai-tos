# web — AI-TOS Dashboard (Phase 0A)

Next.js 14 (App Router) dashboard **shell**. No trading UI.

## Stack
Next.js · React · TypeScript · Tailwind · Shadcn-style UI lib · React Query · RHF · Zod.

## Scripts
- `dev` — `next dev` on :3000
- `build` — `next build`
- `start` — `next start`
- `lint` — `next lint`
- `typecheck` — `tsc --noEmit`

## Health
Calls `GET /api/health` from the API and shows status (see `HealthCard`).

## Configuration
`NEXT_PUBLIC_API_URL` (default `http://localhost:4000`). See `.env.example`.

## Notes
Foundation only: empty dashboard, login shell, theming. No business logic.
