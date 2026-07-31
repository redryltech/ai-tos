terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }

  # Remote state (ADR-0008): S3 + DynamoDB locking.
  # `bucket` and `region` are intentionally OMITTED here (HCL forbids variables in
  # the backend block). Supply them per environment at init:
  #   terraform init -backend-config=backend-<env>.tfvars
  # where backend-<env>.tfvars contains bucket/region (git-ignored, OIDC-injected).
  # The state bucket, DynamoDB lock table, and KMS key are created once by
  # infrastructure/terraform/bootstrap (see ADR-0008).
  backend "s3" {
    key            = "ai-tos/terraform.tfstate"
    dynamodb_table = "ai-tos-tflock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
    }
  }
}

module "vpc" {
  source             = "./modules/vpc"
  name               = "${var.project}-${var.environment}"
  cidr               = var.vpc_cidr
  azs                = var.azs
  private_subnets    = var.private_subnets
  public_subnets     = var.public_subnets
  enable_nat_gateway = true
}

module "eks" {
  source             = "./modules/eks"
  name               = "${var.project}-${var.environment}"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnets
  cluster_version    = var.eks_version
  nodes_instance_type = var.eks_node_instance_type
  nodes_min          = var.eks_nodes_min
  nodes_max          = var.eks_nodes_max
}

module "rds" {
  source            = "./modules/rds"
  name              = "${var.project}-${var.environment}"
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnets
  instance_class    = var.rds_instance_class
  multi_az          = var.environment == "prod"
  db_username       = var.db_username
}

module "elasticache" {
  source          = "./modules/elasticache"
  name            = "${var.project}-${var.environment}"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  cache_node_type = var.elasticache_node_type
  state_node_type = var.elasticache_node_type
}

module "s3" {
  source = "./modules/s3"
  name   = "${var.project}-${var.environment}"
}

module "iam" {
  source    = "./modules/iam"
  name      = "${var.project}-${var.environment}"
  oidc_url  = module.eks.oidc_provider_url
}

module "secrets" {
  source             = "./modules/secrets"
  name               = "${var.project}-${var.environment}"
  kms_key_alias      = "${var.project}/${var.environment}/secrets"
  rotation_lambda_arn = var.secrets_rotation_lambda_arn
}

module "alb" {
  source    = "./modules/alb"
  name      = "${var.project}-${var.environment}"
  vpc_id    = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnets
}

module "route53" {
  source = "./modules/route53"
  domain = var.domain
}

module "cloudwatch" {
  source   = "./modules/cloudwatch"
  name     = "${var.project}-${var.environment}"
  services = ["api", "web", "ai-service", "market-worker", "risk-worker", "news-worker", "scheduler"]
}
