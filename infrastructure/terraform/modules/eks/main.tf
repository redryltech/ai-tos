variable "name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "cluster_version" { type = string }
variable "nodes_instance_type" { type = string }
variable "nodes_min" { type = number }
variable "nodes_max" { type = number }

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.name
  cluster_version = var.cluster_version
  vpc_id          = var.vpc_id
  subnet_ids      = var.subnet_ids

  cluster_endpoint_public_access = true
  enable_irsa                    = true

  eks_managed_node_groups = {
    default = {
      instance_types = [var.nodes_instance_type]
      min_size      = var.nodes_min
      max_size      = var.nodes_max
      desired_size  = var.nodes_min
    }
  }
}

output "cluster_endpoint" { value = module.eks.cluster_endpoint }
output "oidc_provider_url" { value = module.eks.cluster_oidc_issuer_url }
