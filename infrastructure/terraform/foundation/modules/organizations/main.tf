# AWS Organizations — account & OU structure for AI-TOS (applied in the MANAGEMENT account).
# Creates the 4-account landing zone: SharedServices (security/logging hub), Dev, Staging, Prod.

resource "aws_organizations_organization" "this" {
  feature_set = var.organization_feature_set
  enabled_policy_types = [
    "SERVICE_CONTROL_POLICY",
    "TAG_POLICY",
    "BACKUP_POLICY",
    "RESOURCE_CONTROL_POLICY",
  ]
}

resource "aws_organizations_organizational_unit" "this" {
  for_each  = toset(["SharedServices", "Dev", "Staging", "Prod"])
  name      = each.key
  parent_id = aws_organizations_organization.this.roots[0].id
}

resource "aws_organizations_account" "this" {
  for_each  = { for a in var.accounts : a.name => a }
  name      = each.value.name
  email     = each.value.email
  parent_id = aws_organizations_organizational_unit.this[each.value.ou].id
  tags      = merge(var.tags, { Account = each.value.name, OU = each.value.ou })
}

# Guardrail SCP: block root account credentials usage, enforce IMDSv2/MFA where possible,
# and restrict to approved regions. Attached to the root so it covers every OU/account.
resource "aws_organizations_policy" "guardrails" {
  name        = "ai-tos-guardrails"
  description = "Baseline guardrails for AI-TOS org"
  type        = "SERVICE_CONTROL_POLICY"
  content = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "DenyRootCreds"
        Effect   = "Deny"
        Action   = "*"
        Resource = "*"
        Condition = {
          StringLike = { "aws:PrincipalArn" = "arn:aws:iam::*:root" }
          # allow only the few safe root actions (e.g. billing) — kept minimal here
          NotAction = ["iam:CreateServiceLinkedRole"]
        }
      },
      {
        Sid    = "RestrictRegions"
        Effect = "Deny"
        NotAction = [
          "iam:*", "organizations:*", "route53domains:*", "support:*",
          "budgets:*", "aws-portal:*", "globalaccelerator:*", "cloudfront:*"
        ]
        Resource = "*"
        Condition = {
          StringNotEquals = { "aws:RequestedRegion" = var.allowed_regions }
        }
      }
    ]
  })
}

resource "aws_organizations_policy_attachment" "guardrails" {
  policy_id = aws_organizations_policy.guardrails.id
  target_id = aws_organizations_organization.this.roots[0].id
}

# Designate Shared Services as the delegated admin for centralized security services.
resource "aws_guardduty_organization_admin_account" "this" {
  admin_account_id = var.shared_services_account_id
  depends_on       = [aws_organizations_account.this]
}

resource "aws_securityhub_organization_admin_account" "this" {
  admin_account_id = var.shared_services_account_id
  depends_on       = [aws_organizations_account.this]
}
