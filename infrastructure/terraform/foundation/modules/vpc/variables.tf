variable "name" {
  type = string
}

variable "cidr" {
  type = string
}

variable "azs" {
  type = list(string)
}

# One CIDR block per AZ, per tier (length must match length(azs)).
variable "public_subnets" {
  type = list(string)
}

variable "private_subnets" {
  description = "App tier (EKS, services, workers)."
  type        = list(string)
}

variable "database_subnets" {
  description = "Data tier (RDS, ElastiCache, MSK)."
  type        = list(string)
}

variable "enable_nat_gateway" {
  type    = bool
  default = true
}

variable "single_nat_gateway" {
  type    = bool
  default = false
}

variable "one_nat_gateway_per_az" {
  type    = bool
  default = true
}

variable "enable_dns_hostnames" {
  type    = bool
  default = true
}

variable "enable_dns_support" {
  type    = bool
  default = true
}

variable "tags" {
  type    = map(string)
  default = {}
}
