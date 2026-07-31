variable "name" {
  type = string
}

variable "description" {
  type    = string
  default = "AI-TOS Redis state tier"
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
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

variable "node_type" {
  type    = string
  default = "cache.r6g.large"
}

variable "num_cache_clusters" {
  type    = number
  default = 2
}

variable "automatic_failover_enabled" {
  type    = bool
  default = true
}

variable "multi_az_enabled" {
  type    = bool
  default = true
}

variable "engine_version" {
  type    = string
  default = "7.1"
}

variable "tags" {
  type    = map(string)
  default = {}
}
