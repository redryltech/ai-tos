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

variable "kafka_version" {
  type    = string
  default = "3.6.0"
}

variable "broker_count" {
  type    = number
  default = 3
}

variable "broker_instance_type" {
  type    = string
  default = "kafka.m5.large"
}

variable "broker_volume_size" {
  type    = number
  default = 1000
}

variable "scram_username" {
  type    = string
  default = "ai-tos-admin"
}

variable "scram_password" {
  description = "SCRAM password from the MSK SCRAM Secrets Manager secret (populated at apply)."
  type        = string
  sensitive   = true
  default     = "REPLACE_WITH_SCRAM_SECRET_VALUE"
}

variable "topics" {
  description = "Optional override of the topic map (defaults live in the kafka-topics module)."
  type = map(object({
    partitions         = number
    replication_factor = number
    retention_ms       = number
    cleanup_policy     = string
    config             = map(string)
  }))
  default = {}
}

variable "tags" {
  type = map(string)
  default = {
    Project    = "ai-tos"
    ManagedBy  = "terraform"
    CostCenter = "ai-tos"
  }
}
