# ADR-0001: Monorepo tooling (pnpm + Turbo)

## Status
Accepted (Phase 0)

## Context
We need many independently deployable services + shared libs, with fast, cached builds and one install.

## Decision
Use a pnpm workspace with Turbo for task orchestration. `apps/*` are deployables; `packages/*` are shared libs.

## Alternatives considered
- Lerna: superseded by Turborepo for caching.
- Nx: more features but heavier; revisit if graph/remote-cache needs grow.
- Polyrepo: better isolation but painful shared-type synchronization.

## Consequences
- Single `pnpm install`; `turbo run build` respects dependency order.
- Shared packages consumed via workspace symlinks; contracts live in `@ai-tos/shared`.
