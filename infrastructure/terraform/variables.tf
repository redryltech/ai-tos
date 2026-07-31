variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "project" {
  type    = string
  default = "ai-tos"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "azs" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "private_subnets" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  type    = list(string)
  default = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "eks_version" {
  type    = string
  default = "1.29"
}

variable "eks_node_instance_type" {
  type    = string
  default = "m6i.large"
}

variable "eks_nodes_min" {
  type    = number
  default = 2
}

variable "eks_nodes_max" {
  type    = number
  default = 10
}

variable "rds_instance_class" {
  type    = string
  default = "db.r6g.large"
}

variable "db_username" {
  type      = string
  default   = "ai_tos"
  sensitive = true
}

variable "elasticache_node_type" {
  type    = string
  default = "cache.r6g.large"
}

variable "domain" {
  type    = string
  default = "ai-tos.example.com"
}

variable "secrets_rotation_lambda_arn" {
  type    = string
  default = ""
}
