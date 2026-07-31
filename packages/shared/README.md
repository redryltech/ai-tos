# @ai-tos/shared

Cross-cutting domain types and validation schemas shared by every service.

## Contents
- `Role` — RBAC roles (`guest | user | admin | system`).
- `PlatformMode` — platform modes (learn, analysis, paper, …).
- `HealthStatus` / `HealthCheck` — the `/health` contract every service implements.
- `ApiResponse` / `ApiError` — standard API envelope.
- `AuthTokenPayload` — JWT payload shape.
- `DomainEvent<T>` — future event-bus envelope (see ADR-0003).

## Usage
```ts
import type { HealthCheck } from '@ai-tos/shared';
```

## Scripts
- `build` — emit `dist/`
- `lint` — eslint
- `typecheck` — tsc --noEmit

No business logic. Types only.
