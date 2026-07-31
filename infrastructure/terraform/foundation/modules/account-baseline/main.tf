# account-baseline — composes the per-account platform services:
# Route53, IAM, KMS, S3, Security, Cost.
# (VPC + endpoints + NACLs + SGs are wired by the environment root, since they need
#  subnet CIDRs that this module doesn't own.)

module "route53" {
  source     = "../route53"
  domain     = var.domain
  vpc_id     = var.vpc_id
  vpc_region = var.region
  tags       = var.tags
}

module "iam" {
  source                     = "../iam"
  name                       = var.name
  account_id                 = var.account_id
  region                     = var.region
  shared_services_account_id = var.shared_services_account_id
  github_oidc_enabled        = var.github_oidc_enabled
  github_org                 = var.github_org
  github_repo                = var.github_repo
  cross_account_external_id  = var.cross_account_external_id
  access_analyzer_type       = var.access_analyzer_type
  state_backend_arns         = var.state_backend_arns
  tags                       = var.tags
}

module "kms" {
  source             = "../kms"
  name               = var.name
  account_id         = var.account_id
  region             = var.region
  terraform_role_arn = module.iam.terraform_role_arn
  keys               = var.kms_keys
  alias_prefix       = var.kms_alias_prefix
  allowed_services   = var.kms_allowed_services
  tags               = var.tags
}

module "s3" {
  source                  = "../s3"
  bucket_prefix           = var.bucket_prefix
  kms_key_arns            = module.kms.key_arns
  is_log_archive          = var.is_log_archive
  org_id                  = var.org_id
  central_log_bucket_name = var.central_log_bucket_name
  tags                    = var.tags
}

module "security" {
  source            = "../security"
  name              = var.name
  region            = var.region
  is_aggregator     = var.is_aggregator
  create_cloudtrail = var.create_cloudtrail
  aggregator_region = var.region
  log_bucket_name   = var.is_log_archive ? module.s3.log_bucket_name : var.central_log_bucket_name
  kms_key_arn       = module.kms.key_arns["logs"]
  tags              = var.tags
}

module "cost" {
  source                = "../cost"
  name                  = var.name
  monthly_budget_amount = var.budget_amount
  budget_email          = var.budget_email
  cost_allocation_tags  = var.cost_allocation_tags
  tags                  = var.tags
}
