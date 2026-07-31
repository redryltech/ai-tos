variable "name" {
  type = string
}

variable "monthly_budget_amount" {
  type    = number
  default = 2000
}

variable "budget_email" {
  type = string
}

variable "currency" {
  type    = string
  default = "USD"
}

variable "cost_allocation_tags" {
  type    = list(string)
  default = ["Project", "Environment", "Team", "CostCenter", "Owner"]
}

variable "tags" {
  type    = map(string)
  default = {}
}
