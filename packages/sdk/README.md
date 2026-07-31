# @ai-tos/sdk

Typed client for the AI-TOS API.

## Usage
```ts
import { createClient } from '@ai-tos/sdk';
const api = createClient('http://localhost:4000');
const health = await api.health();
```

## Scripts
- `build`, `lint`, `typecheck`

Phase 0A: `health()` only. Expanded per service later.
