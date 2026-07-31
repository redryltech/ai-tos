variable "name" {
  description = "Account short name, e.g. ai-tos-prod."
  type        = string
}

variable "account_id" {
  type = string
}

variable "region" {
  type = string
}

variable "shared_services_account_id" {
  type = string
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

variable "cross_account_external_id" {
  type      = string
  sensitive = true
}

variable "access_analyzer_type" {
  type    = string
  default = "ACCOUNT" # set to ORGANIZATION in the security hub account
}

variable "state_backend_arns" {
  description = "ARNs of the Terraform state bucket + lock table (from bootstrap)."
  type        = list(string)
  default     = []
}

variable "tags" {
  type    = map(string)
  default = {}
}
