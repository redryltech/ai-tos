variable "name" {
  type = string
}

variable "oidc_provider_arn" {
  description = "EKS OIDC provider ARN for IRSA."
  type        = string
}

variable "oidc_provider_url" {
  description = "EKS OIDC issuer URL (https://...)."
  type        = string
}

variable "kms_key_arn" {
  description = "Optional CMK for CloudWatch log group. Empty string skips KMS."
  type        = string
  default     = null
}

variable "log_retention_days" {
  type    = number
  default = 30
}

variable "tags" {
  type    = map(string)
  default = {}
}
