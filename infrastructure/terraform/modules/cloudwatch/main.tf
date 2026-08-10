variable "name" { type = string }
variable "services" { type = list(string) }

data "aws_caller_identity" "current" {}

resource "aws_kms_key" "logs" {
  description             = "${var.name} CloudWatch Logs CMK"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "Root"
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root" }
        Action    = "kms:*"
        Resource  = "*"
      },
      {
        Sid       = "CloudWatchLogs"
        Effect    = "Allow"
        Principal = { Service = "logs.amazonaws.com" }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_kms_alias" "logs" {
  name          = "alias/${var.name}-cloudwatch-logs"
  target_key_id = aws_kms_key.logs.key_id
}

resource "aws_cloudwatch_log_group" "this" {
  for_each          = toset(var.services)
  name              = "/ai-tos/${var.name}/${each.key}"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.logs.arn
}

output "log_groups" {
  value = [for s in var.services : "/ai-tos/${var.name}/${s}"]
}
