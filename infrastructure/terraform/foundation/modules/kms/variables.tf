variable "name" {
  type = string
}

variable "account_id" {
  type = string
}

variable "region" {
  type = string
}

variable "terraform_role_arn" {
  type = string
}

variable "keys" {
  description = "Map of key-purpose -> alias suffix, e.g. { s3 = 's3', logs = 'logs', backup = 'backup', secrets = 'secrets' }."
  type        = map(string)
  default = {
    s3      = "s3"
    logs    = "logs"
    backup  = "backup"
    secrets = "secrets"
  }
}

variable "alias_prefix" {
  type    = string
  default = "ai-tos"
}

variable "deletion_window_in_days" {
  type    = number
  default = 30
}

variable "enable_key_rotation" {
  type    = bool
  default = true
}

variable "allowed_services" {
  description = "AWS service principals allowed kms:GenerateDataKey* on these keys (e.g. CloudTrail/Config)."
  type        = list(string)
  default     = []
}

variable "tags" {
  type    = map(string)
  default = {}
}
