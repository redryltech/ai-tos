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
  region = var.region
  default_tags {
    tags = var.tags
  }
}

provider "aws" {
  alias  = "dr"
  region = var.dr_region
  default_tags {
    tags = merge(var.tags, { Region = var.dr_region })
  }
}

data "aws_caller_identity" "current" {}

locals {
  # The Terraform CI role (account-baseline) — granted in the KMS key policy.
  terraform_role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/ai-tos-${var.environment}-terraform"
}

# --- Network foundation ---
module "vpc" {
  source = "../../modules/vpc"

  name                   = "${var.name}-vpc"
  cidr                   = var.vpc_cidr
  azs                    = var.azs
  public_subnets         = var.public_subnets
  private_subnets        = var.private_subnets
  database_subnets       = var.database_subnet_ids
  one_nat_gateway_per_az = var.one_nat_gateway_per_az
  single_nat_gateway     = var.single_nat_gateway
  tags                   = var.tags
}

# --- KMS (data keys) ---
module "kms" {
  source = "../../modules/kms"

  name               = var.name
  account_id         = data.aws_caller_identity.current.account_id
  region             = var.region
  terraform_role_arn = local.terraform_role_arn
  keys = {
    s3       = "s3"
    logs     = "logs"
    backup   = "backup"
    secrets  = "secrets"
    database = "database"
    redis    = "redis"
  }
  alias_prefix     = "ai-tos"
  allowed_services = ["cloudtrail.amazonaws.com", "config.amazonaws.com"]
  tags             = var.tags
}

# --- PostgreSQL 16 ---
module "rds_postgresql" {
  source = "../../modules/rds-postgresql"

  name                           = "${var.name}-pg"
  environment                    = var.environment
  vpc_id                         = module.vpc.vpc_id
  db_subnet_ids                  = module.vpc.database_subnet_ids
  allowed_ingress_cidrs          = [var.vpc_cidr]
  kms_key_arn                    = module.kms.key_arns["database"]
  db_name                        = var.db_name
  db_username                    = var.db_username
  instance_class                 = var.db_instance_class
  allocated_storage              = var.db_allocated_storage
  max_allocated_storage          = var.db_max_allocated_storage
  max_connections                = var.db_max_connections
  multi_az                       = var.db_multi_az
  read_replica_count             = var.db_read_replica_count
  read_replica_instance_class    = var.db_read_replica_class
  backup_retention_period        = var.db_backup_retention
  backup_window                  = var.db_backup_window
  maintenance_window             = var.db_maintenance_window
  performance_insights_retention = var.db_performance_insights_retention
  monitoring_interval            = var.db_monitoring_interval
  deletion_protection            = var.db_deletion_protection
  skip_final_snapshot            = var.db_skip_final_snapshot
  final_snapshot_identifier      = var.db_final_snapshot_identifier
  tags                           = var.tags
}

# --- Redis Cache tier ---
module "redis_cache" {
  source = "../../modules/redis-cache"

  name                       = "${var.name}-redis-cache"
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.private_subnet_ids
  allowed_ingress_cidrs      = [var.vpc_cidr]
  kms_key_arn                = module.kms.key_arns["redis"]
  node_type                  = var.redis_cache_node_type
  num_cache_clusters         = var.redis_cache_clusters
  automatic_failover_enabled = true
  multi_az_enabled           = true
  tags                       = var.tags
}

# --- Redis State tier ---
module "redis_state" {
  source = "../../modules/redis-state"

  name                       = "${var.name}-redis-state"
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.private_subnet_ids
  allowed_ingress_cidrs      = var.allowed_ingress_cidrs_state
  kms_key_arn                = module.kms.key_arns["redis"]
  node_type                  = var.redis_state_node_type
  num_cache_clusters         = var.redis_state_clusters
  automatic_failover_enabled = true
  multi_az_enabled           = true
  tags                       = var.tags
}
