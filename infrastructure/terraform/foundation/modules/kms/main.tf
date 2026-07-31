# Customer-managed KMS keys for the foundation (encryption at rest, BYOK-ready).
locals {
  statements = concat(
    [
      {
        Sid       = "Root"
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${var.account_id}:root" }
        Action    = "kms:*"
        Resource  = "*"
      },
      {
        Sid       = "Terraform"
        Effect    = "Allow"
        Principal = { AWS = var.terraform_role_arn }
        Action    = ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey", "kms:DescribeKey", "kms:CreateAlias", "kms:TagResource"]
        Resource  = "*"
      }
    ],
    length(var.allowed_services) > 0 ? [
      {
        Sid       = "AwsServices"
        Effect    = "Allow"
        Principal = { Service = var.allowed_services }
        Action    = ["kms:GenerateDataKey*", "kms:Decrypt", "kms:DescribeKey"]
        Resource  = "*"
      }
    ] : []
  )
}

resource "aws_kms_key" "this" {
  for_each = var.keys

  description             = "AI-TOS ${each.value} CMK (${var.name})"
  deletion_window_in_days = var.deletion_window_in_days
  enable_key_rotation     = var.enable_key_rotation

  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = local.statements
  })

  tags = merge(var.tags, { Name = "${var.name}-${each.key}" })
}

resource "aws_kms_alias" "this" {
  for_each      = var.keys
  name          = "alias/${var.alias_prefix}-${each.key}"
  target_key_id = aws_kms_key.this[each.key].key_id
}
