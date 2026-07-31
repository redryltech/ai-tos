# IAM foundation — OIDC (GitHub Actions), least-privilege roles, cross-account access,
# Access Analyzer. No long-lived CI keys (ties to ADR-0011).

# --- OIDC provider for GitHub Actions ---
resource "aws_iam_openid_connect_provider" "github" {
  count = var.github_oidc_enabled ? 1 : 0

  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  # GitHub Actions OIDC root CA thumbprint (DigiCert Global Root G2).
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]

  tags = merge(var.tags, { Name = "${var.name}-github-oidc" })
}

# --- Terraform / CI role (OIDC, scoped) ---
resource "aws_iam_role" "terraform" {
  name = "${var.name}-terraform"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github[0].arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = { "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com" }
        StringLike   = { "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo}:*" }
      }
    }]
  })
  tags = merge(var.tags, { Purpose = "terraform-ci" })
}

resource "aws_iam_role_policy_attachment" "terraform" {
  role       = aws_iam_role.terraform.name
  policy_arn = aws_iam_policy.terraform.arn
}

resource "aws_iam_policy" "terraform" {
  name = "${var.name}-terraform"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # Terraform state bucket + lock table + bootstrap KMS
        Sid    = "StateBackend"
        Effect = "Allow"
        Action = [
          "s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket",
          "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem", "dynamodb:DescribeTable",
          "kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey", "kms:DescribeKey"
        ]
        Resource = concat(var.state_backend_arns, ["arn:aws:kms:${var.region}:${var.account_id}:key/*"])
      },
      {
        Sid    = "IamPassRole"
        Effect = "Allow"
        Action = ["iam:PassRole", "iam:GetRole", "iam:CreateRole", "iam:DeleteRole",
          "iam:PutRolePolicy", "iam:DeleteRolePolicy", "iam:AttachRolePolicy", "iam:DetachRolePolicy",
        "iam:GetPolicy", "iam:CreatePolicy", "iam:DeletePolicy", "iam:ListRoles"]
        Resource = ["arn:aws:iam::${var.account_id}:role/${var.name}-*", "arn:aws:iam::${var.account_id}:policy/${var.name}-*"]
      },
      {
        Sid    = "Networking"
        Effect = "Allow"
        Action = [
          "ec2:Describe*", "ec2:CreateTags", "ec2:RevokeSecurityGroupEgress", "ec2:AuthorizeSecurityGroupEgress",
          "ec2:CreateSecurityGroup", "ec2:DeleteSecurityGroup", "ec2:AuthorizeSecurityGroupIngress",
          "ec2:RevokeSecurityGroupIngress", "ec2:CreateVpcEndpoint", "ec2:DeleteVpcEndpoint",
          "ec2:CreateNetworkAcl*", "ec2:ReplaceNetworkAcl*", "ec2:CreateRoute*", "ec2:ReplaceRoute*",
          "ec2:AllocateAddress", "ec2:ReleaseAddress", "ec2:CreateNatGateway", "ec2:DeleteNatGateway"
        ]
        Resource  = "*"
        Condition = { StringEquals = { "aws:ResourceTag/Project" = "ai-tos" } }
      },
      {
        Sid      = "KmsScoped"
        Effect   = "Allow"
        Action   = ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey", "kms:DescribeKey", "kms:CreateAlias", "kms:TagResource"]
        Resource = "arn:aws:kms:${var.region}:${var.account_id}:key/*"
      },
      {
        Sid    = "ServiceEnable"
        Effect = "Allow"
        Action = [
          "cloudtrail:*", "config:*", "guardduty:*", "securityhub:*", "access-analyzer:*",
          "budgets:*", "ce:*", "s3:GetBucket*", "s3:PutBucket*", "s3:PutEncryptionConfiguration",
          "route53:Create*", "route53:Get*", "route53:Change*", "route53:List*", "route53domains:*"
        ]
        Resource = "*"
      }
    ]
  })
}

# --- Break-glass admin (MFA-gated, emergency only) ---
resource "aws_iam_role" "admin" {
  name = "${var.name}-admin"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { AWS = "arn:aws:iam::${var.account_id}:root" }
      Action    = "sts:AssumeRole"
      Condition = { Bool = { "aws:MultiFactorAuthPresent" = "true" } }
    }]
  })
  tags = merge(var.tags, { Purpose = "break-glass" })
}

resource "aws_iam_role_policy_attachment" "admin" {
  role       = aws_iam_role.admin.name
  policy_arn = "arn:aws:iam::aws:policy/jobfunction/AdministratorAccess"
}

# --- Developer read-only role (real access via IAM Identity Center in practice) ---
resource "aws_iam_role" "developer" {
  name = "${var.name}-developer"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { AWS = "arn:aws:iam::${var.account_id}:root" }
      Action    = "sts:AssumeRole"
      Condition = { Bool = { "aws:MultiFactorAuthPresent" = "true" } }
    }]
  })
  tags = merge(var.tags, { Purpose = "developer-readonly" })
}

resource "aws_iam_role_policy_attachment" "developer" {
  role       = aws_iam_role.developer.name
  policy_arn = "arn:aws:iam::aws:policy/jobfunction/ViewOnlyAccess"
}

# --- Cross-account role: Shared Services assumes into this account for centralized mgmt ---
resource "aws_iam_role" "cross_account" {
  name = "${var.name}-shared-services"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { AWS = "arn:aws:iam::${var.shared_services_account_id}:root" }
      Action    = "sts:AssumeRole"
      Condition = { StringEquals = { "sts:ExternalId" = var.cross_account_external_id } }
    }]
  })
  tags = merge(var.tags, { Purpose = "cross-account-mgmt" })
}

resource "aws_iam_role_policy_attachment" "cross_account" {
  role       = aws_iam_role.cross_account.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}

# --- IAM Access Analyzer (ACCOUNT, or ORGANIZATION in the security hub account) ---
resource "aws_accessanalyzer_analyzer" "this" {
  analyzer_name = "${var.name}-access-analyzer"
  type          = var.access_analyzer_type
}
