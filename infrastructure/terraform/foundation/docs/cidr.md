# CIDR & Subnet Plan (Phase 0B.1)

Non-overlapping `/16` VPCs per account so VPC peering / Transit Gateway / Disaster Recovery
never collide. Within each VPC: 3 AZs, 3 tiers (public / app / data), each tier a set of `/20`s.

## Primary region (us-east-1)

| Account | VPC CIDR | Public (/20) | App / private (/20) | Data / private (/20) |
|---|---|---|---|---|
| Shared Services | `10.0.0.0/16` | .0 .16 .32 | .64 .80 .96 | .128 .144 .160 |
| Dev | `10.10.0.0/16` | .0 .16 .32 | .64 .80 .96 | .128 .144 .160 |
| Staging | `10.20.0.0/16` | .0 .16 .32 | .64 .80 .96 | .128 .144 .160 |
| Prod | `10.30.0.0/16` | .0 .16 .32 | .64 .80 .96 | .128 .144 .160 |

Example (Prod): public `10.30.0.0/20` / `10.30.16.0/20` / `10.30.32.0/20`;
app `10.30.64.0/20` / `10.30.80.0/20` / `10.30.96.0/20`;
data `10.30.128.0/20` / `10.30.144.0/20` / `10.30.160.0/20`.

## DR region (us-west-2) — distinct ranges (no overlap with primary)

| Account | DR VPC CIDR |
|---|---|
| Shared Services | `10.60.0.0/16` |
| Dev | `10.70.0.0/16` |
| Staging | `10.80.0.0/16` |
| Prod | `10.90.0.0/16` |

(DR VPC provisioning + state-bucket CRR are part of the DR milestone; the `dr` provider alias
is wired in each environment for that work.)

## Routing summary
- **public** → IGW (0.0.0.0/0).
- **app** → NAT (0.0.0.0/0); receives ALB traffic from public; reaches data tier internally.
- **data** → **no route to NAT/IGW**; only internal VPC CIDR (defense in depth for DB/Redis/Kafka).

## Growth headroom
Each `/16` holds 16 `/20` tiers × 3 = 9 used; ample room for additional AZs, a `redshift`/
`elasticache` tier, or Transit Gateway subnet tier without renumbering.
