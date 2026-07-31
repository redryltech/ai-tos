# Git Workflow

## Branching (trunk-based)
- `main` is always releasable and protected (required checks + CODEOWNERS).
- Short-lived feature branches off `main`.
- Naming: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `release/x.y`.

## Commits & hooks
- Husky runs `pnpm run lint` on pre-commit and commitlint on `commit-msg`.
- Conventional Commits drive semantic-release versioning.

## Reviews
- PR template required; at least one CODEOWNERS approval.
- CI (lint, typecheck, build, test, Python/Go checks, terraform fmt/validate) must pass.

## Merging & releasing
- Squash-merge to `main`.
- `release.yml` runs semantic-release on `main` → version bump + tag.
- Hotfixes via `release/x.y` branch, forward-merged to `main`.

See `branch-strategy.md` and `release-strategy.md` for details.
