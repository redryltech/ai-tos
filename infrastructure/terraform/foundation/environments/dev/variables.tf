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

variable "domain" {
  type = string
}

variable "account_id" {
  type = string
}

variable "shared_services_account_id" {
  type = string
}

variable "is_aggregator" {
  type    = bool
  default = false
}

variable "is_log_archive" {
  type    = bool
  default = false
}

variable "create_cloudtrail" {
  type    = bool
  default = true
}

variable "access_analyzer_type" {
  type    = string
  default = "ACCOUNT"
}

variable "org_id" {
  type    = string
  default = ""
}

variable "central_log_bucket_name" {
  type    = string
  default = ""
}

variable "cross_account_external_id" {
  type      = string
  sensitive = true
}

variable "budget_amount" {
  type    = number
  default = 1500
}

variable "budget_email" {
  type = string
}

variable "tags" {
  type = map(string)
  default = {
    Project    = "ai-tos"
    ManagedBy  = "terraform"
    CostCenter = "ai-tos"
  }
}
