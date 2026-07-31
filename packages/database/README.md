# @ai-tos/database

Database access, migrations, and seeds.

## Contents
- `getPool()` / `query()` — shared `pg` connection pool.
- `src/scripts/migrate.ts` — ordered, idempotent SQL migrations.
- `src/scripts/seed.ts` — seed runner.
- `migrations/` — SQL (TimescaleDB-ready).
- `seeds/` — seed SQL.

## Usage
```bash
pnpm --filter @ai-tos/database run migrate
pnpm --filter @ai-tos/database run seed
```

## Scripts
- `build`, `lint`, `typecheck`, `migrate`, `seed`

No business logic — schema + access only.
