# Contribution Guide

## Before you start
- Read `architecture.md`, `folder-explanation.md`, and `coding-standards.md`.
- Use the Dev Container (`.devcontainer`) for a ready environment.

## Workflow
1. Sync `main`; create a branch: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.
2. Make changes; keep each commit focused.
3. `pnpm run lint` and `pnpm run typecheck` must pass locally.
4. Open a PR using the template; CI must be green; CODEOWNERS approval required.
5. Squash-merge to `main`; delete the branch.

## Commit messages
Conventional Commits, enforced by commitlint + Husky:
`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`, `revert:`.

## Package vs app
- Add shared code to `packages/*`; never duplicate the contract in `@ai-tos/shared`.
- Each `apps/*` is independently deployable and failure-isolated.
- No business logic in Phase 0A.

## Tests
Co-locate tests; keep the `test` task green in CI.
