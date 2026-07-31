# ADR-0002: TS package module system (CommonJS)

## Status
Accepted (Phase 0)

## Context
NestJS (API) requires CommonJS + decorator metadata. Shared packages imported by both NestJS (CJS) and Next.js (ESM).

## Decision
All TypeScript `packages/*` compile to **CommonJS** (`module: CommonJS`, `moduleResolution: Node`). Next.js (ESM) consumes them fine via interop.

## Alternatives considered
- Pure ESM everywhere: breaks NestJS `require()` of ESM packages without extra tooling.
- Per-package mixed: high cognitive overhead.

## Consequences
- NestJS DI + decorators work out of the box.
- No ESM/CJS interop surprises.
- `database` migrate scripts use `__dirname` (CJS), not `import.meta`.
