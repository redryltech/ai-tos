variable "name" { type = string }
variable "oidc_url" { type = string }

# IRSA-style workload role (illustrative). Replace <account_id> and validate
# the OIDC provider URL before applying in a real environment.
resource "aws_iam_role" "workload" {
  name = "${var.name}-workload"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "arn:aws:iam::<account_id>:oidc-provider/${var.oidc_url}"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${var.oidc_url}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}

output "workload_role_arn" { value = aws_iam_role.workload.arn }
