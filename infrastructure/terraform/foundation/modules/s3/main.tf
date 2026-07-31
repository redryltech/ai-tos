# Platform S3 buckets: artifact, log archive, backup.
# (The Terraform STATE bucket is created separately by infrastructure/terraform/bootstrap.)
locals {
  buckets = {
    artifact = { key = "s3" }
    log      = { key = "logs" }
    backup   = { key = "backup" }
  }
}

resource "aws_s3_bucket" "this" {
  for_each = local.buckets
  bucket   = "${var.bucket_prefix}-${each.key}"
  tags     = merge(var.tags, { Name = "${var.bucket_prefix}-${each.key}", Purpose = each.key })
}

resource "aws_s3_bucket_versioning" "this" {
  for_each = local.buckets
  bucket   = aws_s3_bucket.this[each.key].id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  for_each = local.buckets
  bucket   = aws_s3_bucket.this[each.key].id
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = var.kms_key_arns[each.value.key]
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  for_each                = local.buckets
  bucket                  = aws_s3_bucket.this[each.key].id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "this" {
  for_each = local.buckets
  bucket   = aws_s3_bucket.this[each.key].id

  rule {
    id     = "transition-and-expire"
    status = "Enabled"
    filter {}

    transition {
      days          = 30
      storage_class = "GLACIER"
    }
    expiration {
      days = each.key == "log" ? 365 : (each.key == "backup" ? 400 : 90)
    }
  }
}

# Server access logging: artifact + backup -> log bucket (log bucket logs to itself if archive).
resource "aws_s3_bucket_logging" "this" {
  for_each      = { for k, v in local.buckets : k => v if k != "log" }
  bucket        = aws_s3_bucket.this[each.key].id
  target_bucket = var.is_log_archive ? aws_s3_bucket.this["log"].id : var.central_log_bucket_name
  target_prefix = "access/${each.key}/"
}

# Central log-archive bucket policy: allow AWS services to deliver logs (scoped to bucket/prefix).
resource "aws_s3_bucket_policy" "log_archive" {
  count  = var.is_log_archive ? 1 : 0
  bucket = aws_s3_bucket.this["log"].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AWSCloudTrailWrite"
        Effect    = "Allow"
        Principal = { Service = "cloudtrail.amazonaws.com" }
        Action    = ["s3:PutObject", "s3:GetBucketAcl"]
        Resource  = ["${aws_s3_bucket.this["log"].arn}", "${aws_s3_bucket.this["log"].arn}/*"]
        Condition = { StringEquals = { "s3:x-amz-acl" = "bucket-owner-full-control" } }
      },
      {
        Sid       = "AWSConfigWrite"
        Effect    = "Allow"
        Principal = { Service = "config.amazonaws.com" }
        Action    = "s3:PutObject"
        Resource  = ["${aws_s3_bucket.this["log"].arn}/config/*"]
      }
    ]
  })
}
