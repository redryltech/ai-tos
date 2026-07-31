variable "organization_feature_set" {
  type    = string
  default = "ALL"
}

variable "management_account_id" {
  type = string
}

variable "shared_services_account_id" {
  description = "Account that centralizes logging, backups, security tooling (acts as Security/Audit hub)."
  type        = string
}

variable "allowed_regions" {
  type    = list(string)
  default = ["us-east-1", "us-west-2"]
}

variable "accounts" {
  type = list(object({
    name  = string
    email = string
    ou    = string # SharedServices | Dev | Staging | Prod
  }))
  default = [
    { name = "ai-tos-shared-services", email = "aws-shared-services@ai-tos.example.com", ou = "SharedServices" },
    { name = "ai-tos-dev", email = "aws-dev@ai-tos.example.com", ou = "Dev" },
    { name = "ai-tos-staging", email = "aws-staging@ai-tos.example.com", ou = "Staging" },
    { name = "ai-tos-prod", email = "aws-prod@ai-tos.example.com", ou = "Prod" },
  ]
}

variable "tags" {
  type    = map(string)
  default = {}
}
