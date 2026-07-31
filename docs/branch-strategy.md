# Branch Strategy

- **Trunk-based**: short-lived feature branches off `main`.
- `main` is always releasable and protected (required checks + CODEOWNERS).
- Branch naming: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `release/x.y`.
- PRs require: green CI, conventional description, CODEOWNERS approval.
- Squash-merge to `main`; delete branch after merge.
- Tag `vX.Y.Z` on release (semantic-release).

## Rationale
Trunk-based keeps the monorepo healthy and avoids long-lived divergence across many teams.
