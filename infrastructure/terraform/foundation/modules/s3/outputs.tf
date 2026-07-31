output "bucket_names" {
  value = { for k, v in aws_s3_bucket.this : k => v.id }
}

output "bucket_arns" {
  value = { for k, v in aws_s3_bucket.this : k => v.arn }
}

output "log_bucket_arn" {
  value = aws_s3_bucket.this["log"].arn
}

output "log_bucket_name" {
  value = aws_s3_bucket.this["log"].id
}
