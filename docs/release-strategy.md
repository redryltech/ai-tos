# Release Strategy

- **Versioning**: Semantic Versioning per deployable; monorepo version file `VERSION`.
- **Automation**: `semantic-release` on `main` derives version from Conventional Commits.
- **Images**: tagged with short git SHA; same image promoted dev → staging → prod.
- **DB**: backward-compatible migrations (expand/contract); `packages/database` migrations are ordered and idempotent.
- **Rollout**: canary in prod (5% → 25% → 100%) with metric gates; auto-rollback on error budget breach (later phases).
- **Hotfixes**: `release/x.y` branch + forward-merge to `main`.

## Quality gates
Every release requires: lint + typecheck + build + test green, security scan clean, docs updated.
