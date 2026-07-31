# Redis State tier (Phase 0B.3 / ADR-0005).
# Stateful platform data: user sessions, rate limiting, platform state.
# AOF persistence ON; NO eviction (sessions must never be dropped).

resource "aws_elasticache_subnet_group" "this" {
  name       = "${var.name}-subnet-group"
  subnet_ids = var.subnet_ids
  tags       = var.tags
}

resource "aws_security_group" "this" {
  name   = "${var.name}-sg"
  vpc_id = var.vpc_id
  tags   = var.tags

  dynamic "ingress" {
    for_each = (length(var.allowed_ingress_cidrs) + length(var.allowed_ingress_sg_ids) > 0) ? [1] : []
    content {
      from_port       = 6379
      to_port         = 6379
      protocol        = "tcp"
      cidr_blocks     = var.allowed_ingress_cidrs
      security_groups = var.allowed_ingress_sg_ids
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# noeviction =拒绝 when full (protect sessions/rate-limit counters); AOF for durability.
resource "aws_elasticache_parameter_group" "this" {
  name   = "${var.name}-pg"
  family = "redis7"
  parameter {
    name  = "maxmemory-policy"
    value = "noeviction"
  }
  parameter {
    name  = "appendonly"
    value = "yes"
  }
  parameter {
    name  = "appendfsync"
    value = "everysec"
  }
  tags = var.tags
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id = var.name
  description          = var.description
  engine               = "redis"
  engine_version       = var.engine_version

  node_type                  = var.node_type
  num_cache_clusters         = var.num_cache_clusters
  automatic_failover_enabled = var.automatic_failover_enabled
  multi_az_enabled           = var.multi_az_enabled

  subnet_group_name    = aws_elasticache_subnet_group.this.name
  security_group_ids   = [aws_security_group.this.id]
  parameter_group_name = aws_elasticache_parameter_group.this.name

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  kms_key_id                 = var.kms_key_arn

  # Durability: keep one snapshot for safety (AOF is the primary durability mechanism).
  snapshot_retention_limit = 1
  snapshot_window          = "03:00-05:00"

  tags = var.tags
}
