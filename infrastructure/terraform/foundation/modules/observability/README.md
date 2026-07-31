# Observability Terraform module (Phase 0B.6)

Creates Amazon Managed Prometheus (AMP) and IRSA roles for Prometheus, OTel Collector, and Grafana.

## Inputs

| Name | Description |
|---|---|
| `name` | Name prefix |
| `oidc_provider_arn` | EKS OIDC provider ARN |
| `oidc_provider_url` | EKS OIDC issuer URL |
| `kms_key_arn` | Optional CMK for AMP log group |

## Outputs

`amp_remote_write_url`, `prometheus_role_arn`, `otel_collector_role_arn`, `grafana_role_arn`

Wire role ARNs into `infrastructure/kubernetes/observability` ServiceAccount annotations.
