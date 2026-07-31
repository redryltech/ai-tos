# @ai-tos/config

Validated environment configuration (fail-fast via Zod).

## Usage
```ts
import { loadConfig } from '@ai-tos/config';
const config = loadConfig(); // throws on invalid env
```

## Variables (all optional with safe defaults)
`NODE_ENV`, `LOG_LEVEL`, `PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`,
`JWT_EXPIRES_IN`, `CORS_ORIGIN`, `AI_SERVICE_URL`.

## Scripts
- `build`, `lint`, `typecheck`

No business logic. Configuration only.
