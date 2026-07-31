variable "name" {
  description = "EKS cluster name, e.g. ai-tos-prod."
  type        = string
}

variable "cluster_version" {
  description = "Kubernetes version. 1.29 is current EKS default; bump deliberately."
  type        = string
  default     = "1.29"
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for control-plane ENIs and worker nodes (app/data tiers)."
  type        = list(string)
}

variable "public_endpoint_enabled" {
  description = "Enable the public API endpoint. Prefer false (private-only); enable + restrict for break-glass/CI."
  type        = bool
  default     = false
}

variable "public_endpoint_cidrs" {
  description = "CIDR allowlist for the public endpoint (only used if public_endpoint_enabled)."
  type        = list(string)
  default     = []
}

variable "system_node_instance_types" {
  type    = list(string)
  default = ["t3.large"]
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

variable "app_node_instance_types" {
  type    = list(string)
  default = ["m6i.large", "m5.large", "m5d.large"]
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
  description = "On-Demand nodes below this count; remainder is Spot."
  type        = number
  default     = 2
}

variable "app_node_spot_percentage" {
  description = "Percent of capacity (above the on-demand base) provisioned as Spot."
  type        = number
  default     = 70
}

variable "control_plane_log_retention" {
  type    = number
  default = 30
}

variable "tags" {
  type    = map(string)
  default = {}
}
