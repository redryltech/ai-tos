terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = var.tags
  }
}

# Phase 0B.6 — AMP + IRSA (OIDC values come from Phase 0B.2 EKS outputs).
module "observability" {
  source = "../../modules/observability"

  name               = var.name
  oidc_provider_arn  = var.oidc_provider_arn
  oidc_provider_url  = var.oidc_provider_url
  kms_key_arn        = var.kms_key_arn
  log_retention_days = var.log_retention_days
  tags               = var.tags
}

output "amp_workspace_id" {
  value = module.observability.amp_workspace_id
}

output "amp_remote_write_url" {
  value = module.observability.amp_remote_write_url
}

output "prometheus_role_arn" {
  value = module.observability.prometheus_role_arn
}

output "otel_collector_role_arn" {
  value = module.observability.otel_collector_role_arn
}

output "grafana_role_arn" {
  value = module.observability.grafana_role_arn
}
