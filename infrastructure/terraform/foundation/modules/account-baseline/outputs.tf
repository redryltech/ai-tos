output "public_zone_id" {
  value = module.route53.public_zone_id
}

output "terraform_role_arn" {
  value = module.iam.terraform_role_arn
}

output "admin_role_arn" {
  value = module.iam.admin_role_arn
}

output "cross_account_role_arn" {
  value = module.iam.cross_account_role_arn
}

output "kms_key_arns" {
  value = module.kms.key_arns
}

output "bucket_arns" {
  value = module.s3.bucket_arns
}

output "log_bucket_arn" {
  value = module.s3.log_bucket_arn
}

output "log_bucket_name" {
  value = module.s3.log_bucket_name
}

output "cloudtrail_arn" {
  value = module.security.cloudtrail_arn
}

output "guardduty_detector_id" {
  value = module.security.guardduty_detector_id
}

output "budget_name" {
  value = module.cost.budget_name
}
