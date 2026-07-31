# Production Operational Documentation (Phase 0B.9)

## Daily

- Review Grafana platform-health + critical Alertmanager silence list
- Confirm overnight backup-validate / CI greens

## Weekly

- Run or review `platform-ops.yml` (backup-validate + dr-verify)
- Rotate on-call; skim DLQ depth / restart warnings

## Monthly

- Execute one item from `backup-restore.md` in staging
- Review RPO/RTO targets vs last drill wall-clocks

## Quarterly

- Full Multi-AZ drill (`multi-az-failure-drill.md`)
- Production change-freeze calendar alignment

## Incident quick links

| Situation | Start here |
|---|---|
| Data loss / DB down | `rpo-rto.md` → RDS PITR |
| AZ outage | `multi-az-failure-drill.md` + smoke |
| Bad deploy | Argo CD / Helm rollback; smoke |
| Alert storm | `on-call-alerting.md` inhibit rules |

## Maintenance windows

Prefer staging first; production requires Environment approval (Phase 0B.7). Use `platform-maintain.sh` only on workstations/CI agents, not as a prod mutate tool.
