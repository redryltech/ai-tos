variable "name" {
  type    = string
  default = "ai-tos"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "oidc_provider_arn" {
  description = "From environments/eks output oidc_provider_arn."
  type        = string
}

variable "oidc_provider_url" {
  description = "From environments/eks output oidc_provider_url."
  type        = string
}

variable "kms_key_arn" {
  type    = string
  default = null
}

variable "log_retention_days" {
  type    = number
  default = 30
}

variable "tags" {
  type = map(string)
  default = {
    Project     = "ai-tos"
    ManagedBy   = "terraform"
    CostCenter  = "ai-tos"
    Phase       = "0B.6"
  }
}
