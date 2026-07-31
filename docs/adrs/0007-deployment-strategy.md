# ADR-0007: Kubernetes delivery — Helm charts + Kustomize overlays (GitOps)

- **Status:** Accepted
- **Date:** 2026-07-30
- **Deciders:** CTO / Architecture Review Board
- **Phase:** 0A (foundation decision; charts scaffolded now, applied in Phase 0B)

## Context

Phase 0A shipped raw `infrastructure/kubernetes/*.yaml` applied via `kubectl apply -f`.
The board (verdict: ⚠ APPROVED WITH CHANGES, Priority 4) requires replacing hand-rolled
manifests with a maintainable, environment-aware packaging strategy before Phase 0B.

## Decision

**Helm charts** package each application (one umbrella `ai-tos` chart with per-service
templates, or per-app subcharts). **Kustomize overlays** provide per-environment
(`dev`/`staging`/`prod`) differences (image tags, replica counts, resources, domain,
ingress class, secret sourcing). Delivery is **GitOps** via Argo CD.

Why this combination:
- **Helm** gives templating, `values.yaml`, release lifecycle, OCI chart registries, and
  one-command rollback — impossible with raw YAML.
- **Kustomize** layers environment patches *without* template logic, works natively with
  `kubectl`/`kustomize`/`kubectl kustomize`, and is ideal for cross-cutting cluster
  add-ons (External Secrets Operator, Ingress NGINX, Cert-Manager, Metrics Server,
  HorizontalPodAutoscaler, NetworkPolicies).
- **Argo CD** continuously reconciles the Kustomize-rendered manifests from git to the
  cluster, with `app-of-apps` for multi-env promotion.

Layout (`infrastructure/kubernetes/`):
```
helm/ai-tos/        # Chart.yaml, values.yaml, templates/ (ns, configmap, deployments, hpa, ingress, externalsecret)
kustomize/
  base/             # references the Helm chart output (helm template) or raw bases
  overlays/{dev,staging,prod}/   # env-specific patches + cluster add-on installs
legacy/             # original raw manifests, retained for reference, not applied
```

## Alternatives considered

- **Raw kubectl YAML** — *Rejected* (current state): no templating, no versioning, no
  rollback, env duplication, error-prone `sed`/`envsubst`.
- **Helm only** — viable, but env diffs become giant `values` files; Kustomize is cleaner
  for per-env patches and cluster add-ons.
- **Kustomize only** — viable, but lacks release management/rollback and package
  distribution; Helm's chart lifecycle is valuable.
- **CDK8s / Pulumi for K8s** — overkill for our needs; keep K8s declarative.

## Consequences

- Environment promotion is a git change, not a redeploy script.
- Rollbacks are first-class (`helm rollback` / Argo CD history).
- Cluster add-ons (ESO, Cert-Manager, Ingress) are managed declaratively.
- Slight learning curve; charts must be linted/versioned (Phase 0B CI).

## References

- ADR-0009 (External Secrets Operator in overlays), ADR-0008 (Terraform owns the cluster),
  `docs/review-board-changes.md` Priority 4, `docs/deployment.md`.
