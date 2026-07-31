# On-Call Alert Routing & Severity Taxonomy (Phase 0B.8)

Aligned with Alertmanager routes (Phase 0B.6) and ADR-0010.

## Severity

| Severity | Meaning | Response | Ack SLO |
|---|---|---|---|
| **critical** | User-facing outage or data-risk | Page primary on-call | 5 min |
| **warning** | Degraded / approaching SLO burn | Ticket + chat; escalate if sustained | 30 min |
| **info** | Informational / capacity | Business hours | Next day |

## Example mappings

| Alert | Severity |
|---|---|
| HighErrorRate, PostgresDown, RedisDown, KafkaDLQDepth | critical |
| HighP99Latency, PodRestarting | warning |
| Backup job succeeded / rotation notice | info |

## Routing

1. Alertmanager → severity receivers (`critical` / `warning` / `default`).
2. Wire webhook/PagerDuty/Opsgenie URLs in Environment secrets (not in git).
3. Inhibit warnings when matching critical fires (already in alertmanager config).

## Handoff

- Primary ↔ secondary weekly rotation.
- Escalate to platform owner after 2 unanswered pages.
- Post-incident: link runbook used (`rpo-rto.md` / drill / restore).
