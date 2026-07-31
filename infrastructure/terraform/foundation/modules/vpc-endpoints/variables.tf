variable "name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "region" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "private_route_table_ids" {
  type = list(string)
}

variable "public_route_table_ids" {
  type    = list(string)
  default = []
}

variable "endpoint_sg_id" {
  description = "Security group attached to interface endpoints (HTTPS from VPC)."
  type        = string
}

variable "interface_services" {
  type    = list(string)
  default = ["kms", "logs", "ecr.api", "ecr.dkr", "sts", "secretsmanager", "ssm"]
}

variable "create_s3_gateway" {
  type    = bool
  default = true
}

variable "create_dynamodb_gateway" {
  type    = bool
  default = true
}

variable "tags" {
  type    = map(string)
  default = {}
}
