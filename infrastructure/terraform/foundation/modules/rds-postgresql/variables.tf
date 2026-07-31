variable "name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "db_subnet_ids" {
  description = "Private data-tier subnet IDs for the DB subnet group."
  type        = list(string)
}

variable "allowed_ingress_cidrs" {
  type    = list(string)
  default = []
}

variable "allowed_ingress_sg_ids" {
  type    = list(string)
  default = []
}

variable "kms_key_arn" {
  description = "Customer-managed CMK ARN for encryption at rest."
  type        = string
}

variable "db_name" {
  type    = string
  default = "ai_tos"
}

variable "db_username" {
  type    = string
  default = "ai_tos"
}

variable "engine_version" {
  type    = string
  default = "16.3"
}

variable "instance_class" {
  type    = string
  default = "db.r6g.large"
}

variable "allocated_storage" {
  type    = number
  default = 100
}

variable "max_allocated_storage" {
  description = "Upper bound for storage autoscaling (GiB)."
  type        = number
  default     = 1000
}

variable "max_connections" {
  type    = number
  default = 500
}

variable "multi_az" {
  type    = bool
  default = true
}

variable "read_replica_count" {
  type    = number
  default = 1
}

variable "read_replica_instance_class" {
  type    = string
  default = "db.r6g.large"
}

variable "backup_retention_period" {
  type    = number
  default = 14
}

variable "backup_window" {
  type    = string
  default = "03:00-04:00"
}

variable "maintenance_window" {
  type    = string
  default = "sun:05:00-sun:06:00"
}

variable "performance_insights_retention" {
  type    = number
  default = 7
}

variable "monitoring_interval" {
  type    = number
  default = 60
}

variable "deletion_protection" {
  type    = bool
  default = true
}

variable "skip_final_snapshot" {
  type    = bool
  default = true
}

variable "final_snapshot_identifier" {
  type    = string
  default = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}
