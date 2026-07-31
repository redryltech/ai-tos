variable "name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "client_subnets" {
  description = "Private subnet IDs for broker nodes (spread across AZs)."
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
  type = string
}

variable "kafka_version" {
  type    = string
  default = "3.6.0"
}

variable "broker_count" {
  description = "Brokers across AZs (>=3 for Multi-AZ HA)."
  type        = number
  default     = 3
}

variable "broker_instance_type" {
  description = "MSK broker instance type. Size for throughput + partition count."
  type        = string
  default     = "kafka.m5.large"
}

variable "broker_volume_size" {
  description = "EBS GiB per broker. Sized for retention x throughput."
  type        = number
  default     = 1000
}

variable "broker_log_retention" {
  type    = number
  default = 30
}

variable "tags" {
  type    = map(string)
  default = {}
}
