variable "name" {
  type = string
}

variable "environment" {
  type = string
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "dr_region" {
  type    = string
  default = "us-west-2"
}

variable "azs" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "vpc_cidr" {
  type = string
}

variable "public_subnets" {
  type = list(string)
}

variable "private_subnets" {
  type = list(string)
}

variable "database_subnet_ids" {
  type = list(string)
}

variable "one_nat_gateway_per_az" {
  type    = bool
  default = true
}

variable "single_nat_gateway" {
  type    = bool
  default = false
}

variable "db_name" {
  type    = string
  default = "ai_tos"
}

variable "db_username" {
  type    = string
  default = "ai_tos"
}

variable "db_instance_class" {
  type    = string
  default = "db.r6g.large"
}

variable "db_allocated_storage" {
  type    = number
  default = 100
}

variable "db_max_allocated_storage" {
  type    = number
  default = 1000
}

variable "db_max_connections" {
  type    = number
  default = 500
}

variable "db_multi_az" {
  type    = bool
  default = true
}

variable "db_read_replica_count" {
  type    = number
  default = 1
}

variable "db_read_replica_class" {
  type    = string
  default = "db.r6g.large"
}

variable "db_backup_retention" {
  type    = number
  default = 14
}

variable "db_backup_window" {
  type    = string
  default = "03:00-04:00"
}

variable "db_maintenance_window" {
  type    = string
  default = "sun:05:00-sun:06:00"
}

variable "db_performance_insights_retention" {
  type    = number
  default = 7
}

variable "db_monitoring_interval" {
  type    = number
  default = 60
}

variable "db_deletion_protection" {
  type    = bool
  default = true
}

variable "db_skip_final_snapshot" {
  type    = bool
  default = true
}

variable "db_final_snapshot_identifier" {
  type    = string
  default = ""
}

variable "redis_cache_node_type" {
  type    = string
  default = "cache.r6g.large"
}

variable "redis_cache_clusters" {
  type    = number
  default = 2
}

variable "redis_state_node_type" {
  type    = string
  default = "cache.r6g.large"
}

variable "redis_state_clusters" {
  type    = number
  default = 2
}

variable "allowed_ingress_cidrs_state" {
  type    = list(string)
  default = []
}

variable "tags" {
  type = map(string)
  default = {
    Project    = "ai-tos"
    ManagedBy  = "terraform"
    CostCenter = "ai-tos"
  }
}
