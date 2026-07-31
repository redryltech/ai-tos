terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
  # Remote state is enabled at the repo root (ADR-0008). Supply per-env backend at init:
  #   terraform init -backend-config="bucket=ai-tos-tfstate-<account_id>" -backend-config="region=us-east-1"
}

provider "aws" {
  region = var.region
  default_tags {
    tags = var.tags
  }
}

# DR provider — reserved for future DR resources (replicated log/backup buckets, DR VPC).
provider "aws" {
  alias  = "dr"
  region = var.dr_region
  default_tags {
    tags = merge(var.tags, { Region = var.dr_region })
  }
}

# --- Network foundation ---
module "vpc" {
  source = "../../modules/vpc"

  name                   = "${var.name}-vpc"
  cidr                   = var.vpc_cidr
  azs                    = var.azs
  public_subnets         = var.public_subnets
  private_subnets        = var.private_subnets
  database_subnets       = var.database_subnets
  one_nat_gateway_per_az = var.one_nat_gateway_per_az
  single_nat_gateway     = var.single_nat_gateway
  tags                   = var.tags
}

module "vpc_endpoints" {
  source = "../../modules/vpc-endpoints"

  name                    = "${var.name}-vpce"
  vpc_id                  = module.vpc.vpc_id
  region                  = var.region
  private_subnet_ids      = module.vpc.private_subnet_ids
  private_route_table_ids = module.vpc.private_route_table_ids
  public_route_table_ids  = module.vpc.public_route_table_ids
  endpoint_sg_id          = module.security_groups.endpoints_sg_id
  tags                    = var.tags
}

module "nacls" {
  source = "../../modules/nacls"

  name              = var.name
  vpc_id            = module.vpc.vpc_id
  vpc_cidr          = var.vpc_cidr
  public_subnet_ids = module.vpc.public_subnet_ids
  app_subnet_ids    = module.vpc.private_subnet_ids
  data_subnet_ids   = module.vpc.database_subnet_ids
  tags              = var.tags
}

module "security_groups" {
  source = "../../modules/security-groups"

  name     = var.name
  vpc_id   = module.vpc.vpc_id
  vpc_cidr = var.vpc_cidr
  tags     = var.tags
}

# --- Account platform baseline (Route53, IAM, KMS, S3, Security, Cost) ---
module "baseline" {
  source = "../../modules/account-baseline"

  name                       = var.name
  environment                = var.environment
  region                     = var.region
  vpc_id                     = module.vpc.vpc_id
  vpc_cidr                   = var.vpc_cidr
  domain                     = var.domain
  account_id                 = var.account_id
  shared_services_account_id = var.shared_services_account_id
  is_aggregator              = var.is_aggregator
  is_log_archive             = var.is_log_archive
  create_cloudtrail          = var.create_cloudtrail
  access_analyzer_type       = var.access_analyzer_type
  org_id                     = var.org_id
  central_log_bucket_name    = var.central_log_bucket_name
  cross_account_external_id  = var.cross_account_external_id
  bucket_prefix              = var.name
  budget_amount              = var.budget_amount
  budget_email               = var.budget_email
  tags                       = var.tags
}
