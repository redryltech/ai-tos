variable "name" { type = string }
variable "services" { type = list(string) }

resource "aws_cloudwatch_log_group" "this" {
  for_each          = toset(var.services)
  name              = "/ai-tos/${var.name}/${each.key}"
  retention_in_days = 30
}

output "log_groups" {
  value = [for s in var.services : "/ai-tos/${var.name}/${s}"]
}
