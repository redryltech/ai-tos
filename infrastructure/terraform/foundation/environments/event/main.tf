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

# --- KMS (data + event keys) ---
module "kms" {
  source = "../../modules/kms"

  name               = var.name
  account_id         = data.aws_caller_identity.current.account_id
  region             = var.region
  terraform_role_arn = local.terraform_role_arn
  keys = {
    s3      = "s3"
    logs    = "logs"
    backup  = "backup"
    secrets = "secrets"
    kafka   = "kafka"
  }
  alias_prefix     = "ai-tos"
  allowed_services = ["cloudtrail.amazonaws.com", "config.amazonaws.com"]
  tags             = var.tags
}

# --- Amazon MSK (Kafka) ---
module "msk" {
  source = "../../modules/msk"

  name                  = "${var.name}-msk"
  vpc_id                = module.vpc.vpc_id
  client_subnets        = module.vpc.private_subnet_ids
  allowed_ingress_cidrs = [var.vpc_cidr]
  kms_key_arn           = module.kms.key_arns["kafka"]
  kafka_version         = var.kafka_version
  broker_count          = var.broker_count
  broker_instance_type  = var.broker_instance_type
  broker_volume_size    = var.broker_volume_size
  tags                  = var.tags
}

# --- Topic configuration (topics as code) ---
module "kafka_topics" {
  source = "../../modules/kafka-topics"

  bootstrap_servers = split(",", module.msk.bootstrap_brokers_tls)
  sasl_username     = var.scram_username
  sasl_password     = var.scram_password
  topics            = var.topics
}
