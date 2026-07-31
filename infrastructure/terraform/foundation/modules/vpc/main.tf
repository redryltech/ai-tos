# VPC foundation — public / private-app / private-data tiers across 3 AZs.
# Built on terraform-aws-modules/vpc for correctness; adds explicit tier tagging.
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = var.name
  cidr = var.cidr
  azs  = var.azs

  # Three tiers:
  public_subnets   = var.public_subnets   # IGW-facing: NAT, future ALB ingress
  private_subnets  = var.private_subnets  # app tier: EKS, services, workers
  database_subnets = var.database_subnets # data tier: RDS, ElastiCache, MSK (later phases)

  enable_nat_gateway     = var.enable_nat_gateway
  single_nat_gateway     = var.single_nat_gateway
  one_nat_gateway_per_az = var.one_nat_gateway_per_az

  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = var.enable_dns_support

  # Subnet role tags (ALB / internal LB / future K8s + data tier).
  public_subnet_tags = {
    "ai-tos.net/tier"        = "public"
    "kubernetes.io/role/elb" = "1"
  }
  private_subnet_tags = {
    "ai-tos.net/tier"                 = "app"
    "kubernetes.io/role/internal-elb" = "1"
  }
  database_subnet_tags = {
    "ai-tos.net/tier" = "data"
  }

  tags = var.tags
}
