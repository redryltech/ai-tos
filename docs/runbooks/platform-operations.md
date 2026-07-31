# Platform Operations & DR Automation (Phase 0B.9)

Extends Phase 0B.8 runbooks with scheduled validation and maintenance automation.

## Automation

| Script / Workflow | Purpose |
|---|---|
| `scripts/backup-validate.sh` | Verify RDS snapshots, Redis window, S3 versioning |
| `scripts/dr-verify.sh` | Retention/CRR checks + restore dry-run + optional smoke |
| `scripts/platform-maintain.sh` | Local/dev maintenance helpers |
| `.github/workflows/platform-ops.yml` | Weekly staging backup + DR verify (OIDC) |

## Required staging variables

`AI_TOS_RDS_INSTANCE_ID`, `AI_TOS_REDIS_STATE_ID`, `AI_TOS_BACKUP_BUCKET`, `TF_STATE_BUCKET`, smoke URLs (see `.github/environments.md`).

## Manual ops

```bash
bash scripts/backup-validate.sh
DR_DRY_RUN=true bash scripts/dr-verify.sh
bash scripts/platform-maintain.sh help
```

## Related runbooks

- `docs/runbooks/rpo-rto.md`
- `docs/runbooks/backup-restore.md`
- `docs/runbooks/multi-az-failure-drill.md`
- `docs/runbooks/on-call-alerting.md`
- `docs/runbooks/production-operations.md`
