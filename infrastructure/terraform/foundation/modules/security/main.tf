# Security foundation: CloudTrail, AWS Config, GuardDuty, Security Hub, IAM Access Analyzer.
# The account with is_aggregator=true (Shared Services) centralizes org trail + Config
# aggregator + Security Hub. Other accounts are members.

# --- AWS Config recorder + delivery channel ---
resource "aws_iam_role" "config" {
  name = "${var.name}-config"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "config.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "config" {
  role       = aws_iam_role.config.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWS_ConfigRole"
}

# Role for the Config aggregator (reads config across the organization).
resource "aws_iam_role" "config_aggregator" {
  count = var.is_aggregator ? 1 : 0
  name  = "${var.name}-config-aggregator"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "config.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "config_aggregator" {
  count      = var.is_aggregator ? 1 : 0
  role       = aws_iam_role.config_aggregator[0].name
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AWS_ConfigRole"
}

resource "aws_config_configuration_recorder" "this" {
  name     = "${var.name}-recorder"
  role_arn = aws_iam_role.config.arn
  recording_group {
    all_supported                 = true
    include_global_resource_types = true
  }
}

resource "aws_config_delivery_channel" "this" {
  name           = "${var.name}-delivery"
  s3_bucket_name = var.log_bucket_name
  s3_key_prefix  = "config"
  depends_on     = [aws_config_configuration_recorder.this]
}

resource "aws_config_configuration_aggregator" "org" {
  count = var.is_aggregator ? 1 : 0
  name  = "${var.name}-aggregator"
  organization_aggregation_source {
    all_regions = false
    regions     = [var.aggregator_region]
    role_arn    = aws_iam_role.config_aggregator[0].arn
  }
}

# --- CloudTrail ---
# The aggregator account creates the org-wide trail (covers every account). Members skip
# their own trail to avoid duplicate logging / cross-account delivery complexity.
resource "aws_cloudtrail" "this" {
  count = var.create_cloudtrail ? 1 : 0

  name                          = "${var.name}-trail"
  is_organization_trail         = var.is_aggregator
  s3_bucket_name                = var.log_bucket_name
  s3_key_prefix                 = "cloudtrail"
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true
  kms_key_id                    = var.kms_key_arn
  tags                          = var.tags
}

# --- GuardDuty ---
resource "aws_guardduty_detector" "this" {
  enable = true
  datasources {
    s3_logs {
      enable = true
    }
  }
  tags = var.tags
}

# --- Security Hub ---
resource "aws_securityhub_account" "this" {}

resource "aws_securityhub_standards_subscription" "baselines" {
  for_each      = toset(local.security_hub_standards)
  standards_arn = each.key
  depends_on    = [aws_securityhub_account.this]
}

locals {
  security_hub_standards = [
    "arn:aws:securityhub:${var.region}::standards/aws-foundational-security-best-practices/v/1.0.0",
    "arn:aws:securityhub:${var.region}::standards/cis-aws-foundations-benchmark/v/1.2.0"
  ]
}
