# Bootstrap state backend (ADR-0008) — applied ONCE, then never again.
#
# This module creates the S3 bucket + DynamoDB lock table + KMS key that the
# main terraform configuration's remote backend depends on. It uses LOCAL state
# on purpose (it bootstraps state itself). After applying:
#   1. `aws s3 ls` / `aws dynamodb describe-table` to confirm.
#   2. Run the main config with `terraform init -backend-config=backend-<env>.tfvars`.
# Do NOT tear this down while the main state references it.

terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = { Project = var.project, Purpose = "terraform-state-bootstrap" }
  }
}

variable "aws_region" { type = string, default = "us-east-1" }
variable "project"    { type = string, default = "ai-tos" }
variable "dr_region"  { type = string, default = "us-west-2" }
variable "account_id" { type = string, sensitive = true }

locals {
  bucket = "${var.project}-tfstate-${var.account_id}"
  table  = "${var.project}-tflock"
}

resource "aws_kms_key" "tfstate" {
  description             = "AI-TOS Terraform state encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  tags = { Name = "${local.bucket}-key" }
}

resource "aws_kms_alias" "tfstate" {
  name          = "alias/${local.bucket}"
  target_key_id = aws_kms_key.tfstate.key_id
}

resource "aws_s3_bucket" "tfstate" {
  bucket = local.bucket
  tags   = { Name = local.bucket }
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.tfstate.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket                  = aws_s3_bucket.tfstate.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Disaster recovery: replicate state to a DR region.
resource "aws_s3_bucket_replication_configuration" "tfstate" {
  depends_on = [aws_s3_bucket_versioning.tfstate, aws_s3_bucket_versioning.tfstate_dr]
  bucket     = aws_s3_bucket.tfstate.id
  role       = aws_iam_role.replication.arn
  rule {
    id       = "dr-replicate"
    status   = "Enabled"
    priority = 1
    destination {
      bucket        = aws_s3_bucket.tfstate_dr.arn
      storage_class = "STANDARD"
    }
  }
}

resource "aws_s3_bucket" "tfstate_dr" {
  provider = aws.dr
  bucket   = "${local.bucket}-dr"
  tags     = { Name = "${local.bucket}-dr" }
}

resource "aws_s3_bucket_versioning" "tfstate_dr" {
  provider = aws.dr
  bucket   = aws_s3_bucket.tfstate_dr.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_public_access_block" "tfstate_dr" {
  provider = aws.dr
  bucket                  = aws_s3_bucket.tfstate_dr.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_iam_role" "replication" {
  name = "${local.bucket}-replication"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "s3.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "replication" {
  role = aws_iam_role.replication.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["s3:GetReplicationConfiguration", "s3:ListBucket"], Resource = [aws_s3_bucket.tfstate.arn] },
      { Effect = "Allow", Action = ["s3:GetObjectVersionForReplication", "s3:GetObjectVersionAcl"], Resource = ["${aws_s3_bucket.tfstate.arn}/*"] },
      { Effect = "Allow", Action = ["s3:ReplicateObject", "s3:ReplicateDelete"], Resource = ["${aws_s3_bucket.tfstate_dr.arn}/*"] }
    ]
  })
}

resource "aws_dynamodb_table" "tflock" {
  name         = local.table
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
  point_in_time_recovery { enabled = true }
  tags = { Name = local.table }
}

provider "aws" {
  alias  = "dr"
  region = var.dr_region
}

output "state_bucket"   { value = aws_s3_bucket.tfstate.id }
output "state_bucket_dr" { value = aws_s3_bucket.tfstate_dr.id }
output "lock_table"     { value = aws_dynamodb_table.tflock.name }
output "kms_key_arn"    { value = aws_kms_key.tfstate.arn }
