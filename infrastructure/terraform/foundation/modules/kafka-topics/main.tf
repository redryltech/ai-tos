# Kafka topic configuration (Phase 0B.4). Topics as code via the Kafka provider.
# Naming/partition/replication/retention/cleanup conventions are centralized in
# local.default_topics; callers may override/augment via var.topics (merged, never replaced).
# No producers/consumers — these are the platform topics only.

terraform {
  required_providers {
    kafka = {
      source  = "Mongey/kafka"
      version = "~> 0.5"
    }
  }
}

provider "kafka" {
  bootstrap_servers = var.bootstrap_servers
  tls_enabled       = true
  sasl_username     = var.sasl_username
  sasl_password     = var.sasl_password
  sasl_mechanism    = "scram-sha512"
}

locals {
  # Platform topic defaults: <domain>.<entity>.<event> + .dlq / .retry per domain.
  default_topics = {
    # --- market.* (high throughput, short retention) ---
    "market.events" = {
      partitions = 12, replication_factor = 3, retention_ms = 604800000, cleanup_policy = "delete", config = {}
    }
    "market.dlq" = {
      partitions = 12, replication_factor = 3, retention_ms = 2592000000, cleanup_policy = "delete", config = {}
    }
    "market.retry" = {
      partitions = 12, replication_factor = 3, retention_ms = 604800000, cleanup_policy = "delete", config = {}
    }
    # --- portfolio.* ---
    "portfolio.events" = {
      partitions = 6, replication_factor = 3, retention_ms = 1209600000, cleanup_policy = "delete", config = {}
    }
    "portfolio.dlq" = {
      partitions = 6, replication_factor = 3, retention_ms = 2592000000, cleanup_policy = "delete", config = {}
    }
    "portfolio.retry" = {
      partitions = 6, replication_factor = 3, retention_ms = 604800000, cleanup_policy = "delete", config = {}
    }
    # --- risk.* ---
    "risk.events" = {
      partitions = 12, replication_factor = 3, retention_ms = 1209600000, cleanup_policy = "delete", config = {}
    }
    "risk.dlq" = {
      partitions = 12, replication_factor = 3, retention_ms = 2592000000, cleanup_policy = "delete", config = {}
    }
    "risk.retry" = {
      partitions = 12, replication_factor = 3, retention_ms = 604800000, cleanup_policy = "delete", config = {}
    }
    # --- audit.* (long retention) ---
    "audit.events" = {
      partitions = 6, replication_factor = 3, retention_ms = 7776000000, cleanup_policy = "delete", config = {}
    }
    "audit.dlq" = {
      partitions = 6, replication_factor = 3, retention_ms = 31536000000, cleanup_policy = "delete", config = {}
    }
    # --- notification.* ---
    "notification.events" = {
      partitions = 6, replication_factor = 3, retention_ms = 1209600000, cleanup_policy = "delete", config = {}
    }
    "notification.dlq" = {
      partitions = 6, replication_factor = 3, retention_ms = 2592000000, cleanup_policy = "delete", config = {}
    }
    # --- system.* (platform/infra events) ---
    "system.events" = {
      partitions = 3, replication_factor = 3, retention_ms = 2592000000, cleanup_policy = "delete", config = {}
    }
    "system.dlq" = {
      partitions = 3, replication_factor = 3, retention_ms = 7776000000, cleanup_policy = "delete", config = {}
    }
  }
}

resource "kafka_topic" "this" {
  for_each = merge(local.default_topics, var.topics)

  name               = each.key
  partitions         = each.value.partitions
  replication_factor = each.value.replication_factor

  config = merge({
    "retention.ms"   = tostring(each.value.retention_ms)
    "cleanup.policy" = each.value.cleanup_policy
  }, each.value.config)
}
