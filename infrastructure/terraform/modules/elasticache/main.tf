variable "name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "cache_node_type" { type = string, default = "cache.r6g.large" }
variable "state_node_type" { type = string, default = "cache.r6g.large" }

resource "aws_elasticache_subnet_group" "this" {
  name       = "${var.name}-cache"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "this" {
  name   = "${var.name}-cache-sg"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}

# redis-cache: volatile data-plane (app cache, computed indicators, semantic LLM
# cache, ephemeral pub/sub). No persistence; evict freely. (ADR-0005)
resource "aws_elasticache_replication_group" "cache" {
  replication_group_id       = "${var.name}-cache"
  description                = "AI-TOS redis-cache (volatile)"
  node_type                  = var.cache_node_type
  port                       = 6379
  subnet_group_name          = aws_elasticache_subnet_group.this.name
  security_group_ids         = [aws_security_group.this.id]
  automatic_failover_enabled = true
  multi_az_enabled           = true
  engine                     = "redis"
  engine_version             = "7.1"
  # Volatile policy: evict LRU, no AOF/RDB persistence.
  at_rest_encryption_enabled  = true
  transit_encryption_enabled  = true
}

# redis-state: security-sensitive state (user sessions, rate-limit counters).
# AOF enabled; session keys use noeviction (ADR-0005).
resource "aws_elasticache_replication_group" "state" {
  replication_group_id       = "${var.name}-state"
  description                = "AI-TOS redis-state (sessions + rate limiting)"
  node_type                  = var.state_node_type
  port                       = 6379
  subnet_group_name          = aws_elasticache_subnet_group.this.name
  security_group_ids         = [aws_security_group.this.id]
  automatic_failover_enabled = true
  multi_az_enabled           = true
  engine                     = "redis"
  engine_version             = "7.1"
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
}

output "cache_endpoint" { value = aws_elasticache_replication_group.cache.primary_endpoint_address }
output "state_endpoint" { value = aws_elasticache_replication_group.state.primary_endpoint_address }
