variable "name" {
  type = string
}

variable "region" {
  type = string
}

variable "is_aggregator" {
  description = "True only in the central security/log account (Shared Services)."
  type        = bool
  default     = false
}

variable "create_cloudtrail" {
  description = "Create a CloudTrail here. Set true only in the aggregator (org trail covers all)."
  type        = bool
  default     = true
}

variable "aggregator_region" {
  type    = string
  default = "us-east-1"
}

variable "log_bucket_name" {
  description = "Central log-archive bucket name (local if aggregator, else Shared Services')."
  type        = string
}

variable "kms_key_arn" {
  description = "KMS key ARN for CloudTrail log file encryption (logs key)."
  type        = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
