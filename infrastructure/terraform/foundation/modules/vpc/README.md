# VPC module

Creates the environment VPC with a 3-tier subnet model (see `docs/cidr.md` for the plan):

| Tier | Purpose | Route | ELB tag |
|---|---|---|---|
| `public` | NAT, future ingress ALB | IGW | `role/elb=1` |
| `app` (private) | EKS, services, workers | NAT → IGW | `role/internal-elb=1` |
| `data` (private) | RDS, ElastiCache, MSK | local only (no NAT) | — |

- Multi-AZ (3 by default). NAT: 1/AZ (prod) or single (non-prod) via `one_nat_gateway_per_az`.
- DNS hostnames/support enabled.
- `data` tier has **no route to NAT/IGW** — egress only within the VPC (defense in depth).
