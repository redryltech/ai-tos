variable "bootstrap_servers" {
  description = "List of MSK TLS bootstrap broker endpoints."
  type        = list(string)
}

variable "sasl_username" {
  description = "SCRAM username used by platform tooling to manage topics."
  type        = string
}

variable "sasl_password" {
  description = "SCRAM password (from the MSK SCRAM Secrets Manager secret)."
  type        = string
  sensitive   = true
}

variable "topics" {
  description = "Optional overrides/augmentations merged on top of local.default_topics (never replaces it)."
  type = map(object({
    partitions         = number
    replication_factor = number
    retention_ms       = number
    cleanup_policy     = string
    config             = map(string)
  }))
  default = {}
}
