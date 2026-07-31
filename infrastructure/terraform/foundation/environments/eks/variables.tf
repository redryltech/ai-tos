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

variable "database_subnets" {
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

variable "cluster_version" {
  type    = string
  default = "1.29"
}

variable "public_endpoint_enabled" {
  type    = bool
  default = false
}

variable "public_endpoint_cidrs" {
  type    = list(string)
  default = []
}

variable "system_node_min" {
  type    = number
  default = 1
}

variable "system_node_max" {
  type    = number
  default = 3
}

variable "system_node_desired" {
  type    = number
  default = 2
}

variable "app_node_min" {
  type    = number
  default = 2
}

variable "app_node_max" {
  type    = number
  default = 10
}

variable "app_node_desired" {
  type    = number
  default = 3
}

variable "app_node_on_demand_base" {
  type    = number
  default = 2
}

variable "app_node_spot_percentage" {
  type    = number
  default = 70
}

variable "control_plane_log_retention" {
  type    = number
  default = 30
}

variable "tags" {
  type = map(string)
  default = {
    Project    = "ai-tos"
    ManagedBy  = "terraform"
    CostCenter = "ai-tos"
  }
}
