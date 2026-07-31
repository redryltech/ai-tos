variable "name" {
  type = string
}

variable "environment" {
  type = string
}

variable "region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "domain" {
  type = string
}

variable "account_id" {
  type = string
}

variable "shared_services_account_id" {
  type = string
}

variable "is_aggregator" {
  type    = bool
  default = false
}

variable "create_cloudtrail" {
  type    = bool
  default = true
}

variable "is_log_archive" {
  type    = bool
  default = false
}

variable "org_id" {
  type    = string
  default = ""
}

variable "central_log_bucket_name" {
  type    = string
  default = ""
}

variable "central_log_bucket_arn" {
  type    = string
  default = ""
}

variable "state_backend_arns" {
  type    = list(string)
  default = []
}

variable "cross_account_external_id" {
  type      = string
  sensitive = true
}

variable "github_oidc_enabled" {
  type    = bool
  default = true
}

variable "github_org" {
  type    = string
  default = "ai-tos"
}

variable "github_repo" {
  type    = string
  default = "ai-tos"
}

variable "access_analyzer_type" {
  type    = string
  default = "ACCOUNT"
}

variable "bucket_prefix" {
  type = string
}

variable "budget_amount" {
  type    = number
  default = 2000
}

variable "budget_email" {
  type = string
}

variable "cost_allocation_tags" {
  type    = list(string)
  default = ["Project", "Environment", "Team", "CostCenter", "Owner"]
}

variable "kms_keys" {
  type = map(string)
  default = {
    s3      = "s3"
    logs    = "logs"
    backup  = "backup"
    secrets = "secrets"
  }
}

variable "kms_alias_prefix" {
  type    = string
  default = "ai-tos"
}

variable "kms_allowed_services" {
  description = "Services allowed kms:GenerateDataKey* on the foundation keys (CloudTrail/Config)."
  type        = list(string)
  default     = ["cloudtrail.amazonaws.com", "config.amazonaws.com"]
}

variable "tags" {
  type    = map(string)
  default = {}
}
