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

# --- Network foundation for the cluster ---
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

# --- EKS platform (cluster + node groups + IRSA + add-on IAM) ---
module "eks" {
  source = "../../modules/eks"

  name                        = var.name
  cluster_version             = var.cluster_version
  vpc_id                      = module.vpc.vpc_id
  private_subnet_ids          = module.vpc.private_subnet_ids
  public_endpoint_enabled     = var.public_endpoint_enabled
  public_endpoint_cidrs       = var.public_endpoint_cidrs
  system_node_min             = var.system_node_min
  system_node_max             = var.system_node_max
  system_node_desired         = var.system_node_desired
  app_node_min                = var.app_node_min
  app_node_max                = var.app_node_max
  app_node_desired            = var.app_node_desired
  app_node_on_demand_base     = var.app_node_on_demand_base
  app_node_spot_percentage    = var.app_node_spot_percentage
  control_plane_log_retention = var.control_plane_log_retention
  tags                        = var.tags
}
