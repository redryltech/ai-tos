# AI-TOS Observability Platform (Phase 0B.6) — ADR-0010

Cluster add-ons for metrics, logs, traces, dashboards, and alerts.
Namespace: `observability` (created in Phase 0B.2).

## Components

| Component | Role |
|---|---|
| OpenTelemetry Collector | DaemonSet agent + Gateway; OTLP in → Tempo / Prometheus / Loki |
| Prometheus | Scrape + rules; remote-write receiver; AMP path via IRSA |
| Alertmanager | Severity-tiered routing |
| Loki | Structured log aggregation (30d retention) |
| Tempo | Distributed traces (7d retention) |
| Grafana | Datasources + dashboards-as-code |

## Apply

```bash
# Ensure observability namespace exists (eks-foundation)
kubectl apply -f ../eks-foundation/namespaces.yaml

# Fill IRSA placeholders from Terraform outputs, then:
kubectl apply -k .
# or: kustomize build . | kubectl apply -f -
```

## Terraform

Amazon Managed Prometheus workspace + IRSA roles:

```bash
cd ../../terraform/foundation/environments/observability
terraform init
terraform validate
terraform plan -var-file=terraform.tfvars
```

Replace `<PROMETHEUS_ROLE_ARN>` and `<OTEL_COLLECTOR_ROLE_ARN>` in manifests with outputs.

## Service instrumentation baseline

Apps export OTLP to `otel-collector.observability.svc.cluster.local:4317` via Helm config:

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_SERVICE_NAME`
- `OTEL_RESOURCE_ATTRIBUTES`

## Validation

```bash
kubectl -n observability get deploy,ds,svc
helm template ai-tos ../helm/ai-tos -f ../helm/ai-tos/values.yaml >/dev/null
```
