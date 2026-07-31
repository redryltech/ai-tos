# ADR-0014: EKS Kubernetes Platform (Phase 0B.2)

- **Status:** Accepted
- **Date:** 2026-07-30
- **Deciders:** Principal Kubernetes/Platform Engineering
- **Phase:** 0B.2 (Kubernetes platform only — no workloads)

## Context

Phase 0B.1 delivered the AWS landing zone (VPC, IAM, KMS, S3, security, Route53). We now need
the Kubernetes platform that will host future AI-TOS services, without deploying any
application, database, Kafka, Redis, monitoring stack, or CI/CD.

## Decision

- **EKS** (managed Kubernetes) as the container platform (ADR path consistent with 0B.1 foundation).
- **Kubernetes 1.29** — current stable; bump deliberately.
- **Private API endpoint only** by default (`cluster_endpoint_private_access=true`,
  `public_endpoint_enabled=false`); public access is allowlisted-CIDR only for break-glass/CI.
- **KMS-encrypted secrets** (`cluster_encryption_config` on `secrets`), full control-plane
  logging (api/audit/authenticator/controllerManager/scheduler).
- **Multi-AZ** control-plane ENIs + node groups across 3 AZs.
- **Managed node groups:** `system` (on-demand, tainted `dedicated=system` for add-ons) and
  `applications` (**On-Demand base + Spot above base**, capacity-optimized) with rolling
  updates via EKS managed node-group mechanics.
- **Add-ons (EKS-managed or IRSA):** CoreDNS, kube-proxy, VPC CNI, EBS CSI driver (managed);
  Metrics Server, Cluster Autoscaler, AWS Load Balancer Controller (IRSA). **Excluded:**
  External Secrets Operator, Argo CD, Prometheus/Grafana/Loki, Kafka, Redis, DBs (later phases).
- **Namespaces:** platform-system, applications, observability, security, staging, production
  (PSS: baseline for all, *restricted* for production).
- **RBAC:** `ai-tos:admins`→cluster-admin, `ai-tos:developers`→scoped dev ClusterRole (no
  Secrets), `ai-tos:viewers`→`view`. Bound to IdC/OIDC groups.
- **Security:** Pod Security Standards (labels), default-deny NetworkPolicies in
  applications/observability/security, VPC CNI IRSA, KMS + CloudTrail audit, images from ECR.
- **Ingress foundation:** AWS Load Balancer Controller (ALB IngressClass) chosen over NGINX —
  native AWS L7/L4, deep VPC/ACM/Route53 integration, no in-cluster LB hop, less to operate.
  No applications are exposed in 0B.2.
- **Storage foundation:** EBS CSI driver + `gp3` (default), `io2-block-express` (perf),
  `sc1-cold` (future); EFS deferred.

## Alternatives considered

- **Self-managed Kubernetes / kops:** *Rejected* — operational burden; EKS is managed control plane.
- **ECS Fargate:** *Rejected* — less flexible for the multi-service, stateful, AI/Go/TS mix.
- **NGINX Ingress:** *Rejected* as the platform default in favor of AWS LB Controller (native,
  fewer moving parts); NGINX can be added per-workload later if needed.
- **All On-Demand nodes:** *Rejected* — Spot for the elasticity tier cuts cost; On-Demand base
  preserves stability.
- **Public API endpoint open:** *Rejected* — private endpoint reduces attack surface.

## Consequences

- Secure, multi-AZ, autoscaling platform ready for workloads in 0B.3+.
- IRSA roles for CA + LB Controller created; manifests in
  `infrastructure/kubernetes/eks-foundation/` consume them.
- Production enforces *restricted* PSS — workloads must be PSS-compliant.
- Operational surface: EKS control plane + add-ons; no app/DB/Kafka/Redis yet.

## Next milestone (Phase 0B.3)
Deploy actual workloads: Helm/Kustomize delivery (ADR-0007), External Secrets Operator
(ADR-0009), application Deployments/Services/Ingresses, observability (ADR-0010), and the
databases/Kafka/Redis from ADRs 0004/0005/0006.

## References
- `infrastructure/terraform/foundation/modules/eks`, `environments/eks`
- `infrastructure/kubernetes/eks-foundation/*`
- ADRs 0004–0013 (especially 0007 delivery, 0009 secrets, 0010 observability)
