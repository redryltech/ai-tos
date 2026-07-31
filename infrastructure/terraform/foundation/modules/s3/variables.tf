variable "bucket_prefix" {
  description = "e.g. ai-tos-prod"
  type        = string
}

variable "kms_key_arns" {
  description = "Map of purpose -> KMS key ARN (s3/logs/backup)."
  type        = map(string)
}

variable "is_log_archive" {
  description = "True in the central log account; attaches the cross-account delivery policy and self-logs."
  type        = bool
  default     = false
}

variable "org_id" {
  description = "AWS Organizations ID (for the log-archive bucket policy)."
  type        = string
  default     = ""
}

variable "central_log_bucket_name" {
  description = "Central log bucket name (used by non-archive accounts for access logging)."
  type        = string
  default     = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}
