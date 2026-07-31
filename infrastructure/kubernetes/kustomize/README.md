# Kustomize layout (ADR-0007)

Replaces the old raw `kubectl apply -f` manifests (now in `legacy/`, reference only).

```
kubernetes/
  helm/ai-tos/        # packaging: Chart.yaml, values.yaml, templates/
  kustomize/
    base/             # renders the Helm chart (helmCharts) — shared across envs
    overlays/
      dev/            # dev.ai-tos.example.com, 1 replica
      staging/        # staging.ai-tos.example.com, parity
      prod/           # ai-tos.example.com, scaled, pinned image tag
  legacy/             # original raw manifests (not applied)
```

## Render & apply (via Argo CD in Phase 0B)
```bash
# Preview
kustomize build --enable-helm kustomize/overlays/dev

# Or hand-apply
kubectl apply -k kustomize/overlays/dev
```

## Cluster add-ons (installed once, environment-scoped)
The chart assumes these CRDs/controllers exist in the cluster (installed via Argo CD
app-of-apps or upstream Helm, NOT per overlay):
- **External Secrets Operator** + `ClusterSecretStore` `aws-secrets-manager` (IRSA/OIDC) — ADR-0009
- **Ingress NGINX** (IngressClass `nginx`) + **Cert-Manager** (TLS) — ADR-0007
- **Metrics Server / Prometheus Operator** (powers the HPA + ServiceMonitors) — ADR-0010

## Promotion
`dev` → `staging` → `prod` is a git change (overlay), reconciled by Argo CD. Rollbacks are
`helm rollback` / Argo CD history.
