variable "domain" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "vpc_region" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
