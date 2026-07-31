# Folder Explanation

```
ai-tos/
├── apps/
│   ├── web/            Next.js dashboard shell (no trading UI)
│   ├── api/            NestJS REST + RBAC + Swagger + health
│   ├── ai-service/     Python FastAPI; LLM adapter interfaces
│   ├── market-worker/  Go health + consumer skeleton
│   ├── risk-worker/    Go health + consumer skeleton
│   ├── news-worker/    Go health + consumer skeleton
│   └── scheduler/      Go scheduler skeleton
├── packages/
│   ├── shared/         Cross-cutting types + Zod schemas
│   ├── config/         Validated environment config
│   ├── ui/             Component library (Tailwind + cva)
│   ├── sdk/            Typed API client
│   └── database/       pg pool + SQL migrations + seeds
├── infrastructure/
│   ├── terraform/      AWS: VPC/EKS/RDS/ElastiCache/S3/IAM/Secrets/ALB/Route53/CloudWatch
│   ├── docker/         Dockerfiles + docker-compose
│   └── kubernetes/     NS/Deploy/Svc/Ingress/HPA/Probes
├── .github/            Workflows, templates, policies
├── docs/               Architecture, onboarding, ADRs
└── scripts/            bootstrap, dev, migrate
```

Convention: `apps/*` names map to deployments; `packages/*` are published internally via workspace symlinks.
