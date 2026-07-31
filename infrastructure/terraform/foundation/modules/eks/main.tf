# Amazon EKS platform (Phase 0B.2) — cluster + managed node groups + IRSA + add-on IAM.
# Built on terraform-aws-modules/eks. The cluster runs ONLY the platform; no workloads are
# deployed here (namespaces/RBAC/add-ons live in infrastructure/kubernetes/eks-foundation).

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

locals {
  # OIDC issuer host (no scheme) used in IRSA trust conditions.
  oidc = replace(module.eks.cluster_oidc_issuer_url, "https://", "")

  # Managed node groups — one for platform/system, one for application workloads.
  node_groups = {
    system = {
      name           = "system"
      instance_types = var.system_node_instance_types
      min_size       = var.system_node_min
      max_size       = var.system_node_max
      desired_size   = var.system_node_desired
      iam_role_arn   = aws_iam_role.node.arn
      labels = {
        "ai-tos.io/node-class" = "system"
      }
      taints = [{
        key    = "dedicated"
        value  = "system"
        effect = "NO_SCHEDULE"
      }]
    }
    applications = {
      name           = "applications"
      instance_types = var.app_node_instance_types
      min_size       = var.app_node_min
      max_size       = var.app_node_max
      desired_size   = var.app_node_desired
      iam_role_arn   = aws_iam_role.node.arn
      # Mixed On-Demand (base) + Spot (above base) for cost-efficient scaling.
      capacity_type = "ON_DEMAND"
      instances_distribution = {
        on_demand_base_capacity                  = var.app_node_on_demand_base
        on_demand_percentage_above_base_capacity = 100 - var.app_node_spot_percentage
        spot_allocation_strategy                 = "capacity-optimized"
      }
      labels = {
        "ai-tos.io/node-class" = "applications"
      }
    }
  }
}

# --- KMS: encrypt Kubernetes secrets at rest (not the tfstate key) ---
resource "aws_kms_key" "eks" {
  description             = "AI-TOS EKS secrets encryption (${var.name})"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "Root"
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root" }
        Action    = "kms:*"
        Resource  = "*"
      },
      {
        Sid       = "EKS"
        Effect    = "Allow"
        Principal = { Service = "eks.amazonaws.com" }
        Action    = ["kms:Encrypt", "kms:Decrypt", "kms:DescribeKey", "kms:GenerateDataKey"]
        Resource  = "*"
      }
    ]
  })
  tags = var.tags
}

resource "aws_kms_alias" "eks" {
  name          = "alias/${var.name}-eks-secrets"
  target_key_id = aws_kms_key.eks.key_id
}

# --- EKS cluster ---
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.name
  cluster_version = var.cluster_version

  vpc_id     = var.vpc_id
  subnet_ids = var.private_subnet_ids

  # Private endpoint only; public access limited to approved CIDRs (break-glass/CI).
  cluster_endpoint_private_access      = true
  cluster_endpoint_public_access       = var.public_endpoint_enabled
  cluster_endpoint_public_access_cidrs = var.public_endpoint_cidrs

  # Control-plane ENIs in private subnets (HA across AZs).
  control_plane_subnet_ids = var.private_subnet_ids

  cluster_enabled_log_types = [
    "api", "audit", "authenticator", "controllerManager", "scheduler"
  ]
  cloudwatch_log_group_retention_in_days = var.control_plane_log_retention

  cluster_encryption_config = {
    provider_key_arn = aws_kms_key.eks.arn
    resources        = ["secrets"]
  }

  enable_irsa = true

  # terraform-aws-modules creates the cluster + node IAM roles (AmazonEKSWorkerNodePolicy,
  # CNI, ECR readonly). VPC CNI uses its own IRSA (add-on manifest).
  create_iam_role = false
  iam_role_arn    = aws_iam_role.cluster.arn

  # Node IAM role created by the module; attach required policies.
  eks_managed_node_groups = local.node_groups

  tags = var.tags
}

# EKS cluster IAM role (control plane).
resource "aws_iam_role" "cluster" {
  name = "${var.name}-cluster"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "cluster_A" {
  role       = aws_iam_role.cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}
resource "aws_iam_role_policy_attachment" "cluster_B" {
  role       = aws_iam_role.cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
}

# --- Node IAM role + managed policies (uses a single role for both groups) ---
resource "aws_iam_role" "node" {
  name = "${var.name}-node"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  tags = var.tags
}
resource "aws_iam_role_policy_attachment" "node_A" {
  role       = aws_iam_role.node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}
resource "aws_iam_role_policy_attachment" "node_B" {
  role       = aws_iam_role.node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}
resource "aws_iam_role_policy_attachment" "node_C" {
  role       = aws_iam_role.node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}
resource "aws_iam_role_policy_attachment" "node_D" {
  role       = aws_iam_role.node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEBSCSIDriverPolicy"
}

# --- IRSA: Cluster Autoscaler ---
resource "aws_iam_role" "cluster_autoscaler" {
  name = "${var.name}-cluster-autoscaler"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = module.eks.oidc_provider_arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${local.oidc}:aud" = "sts.amazonaws.com"
          "${local.oidc}:sub" = "system:serviceaccount:kube-system:cluster-autoscaler"
        }
      }
    }]
  })
  tags = var.tags
}
resource "aws_iam_policy" "cluster_autoscaler" {
  name = "${var.name}-cluster-autoscaler"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "autoscaling:DescribeAutoScalingGroups",
        "autoscaling:DescribeAutoScalingInstances",
        "autoscaling:DescribeLaunchConfigurations",
        "autoscaling:DescribeScalingActivities",
        "autoscaling:DescribeTags",
        "autoscaling:SetDesiredCapacity",
        "autoscaling:TerminateInstanceInAutoScalingGroup",
        "ec2:DescribeLaunchTemplateVersions"
      ]
      Resource = "*"
    }]
  })
}
resource "aws_iam_role_policy_attachment" "cluster_autoscaler" {
  role       = aws_iam_role.cluster_autoscaler.name
  policy_arn = aws_iam_policy.cluster_autoscaler.arn
}

# --- IRSA: AWS Load Balancer Controller (ingress foundation) ---
resource "aws_iam_role" "aws_lb_controller" {
  name = "${var.name}-aws-load-balancer-controller"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = module.eks.oidc_provider_arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${local.oidc}:aud" = "sts.amazonaws.com"
          "${local.oidc}:sub" = "system:serviceaccount:kube-system:aws-load-balancer-controller"
        }
      }
    }]
  })
  tags = var.tags
}
resource "aws_iam_role_policy_attachment" "aws_lb_controller" {
  role       = aws_iam_role.aws_lb_controller.name
  policy_arn = "arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess"
}
