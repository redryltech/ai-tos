# Secrets management (ADR-0009): AWS Secrets Manager + dedicated KMS CMK + rotation.
# Synced into the cluster by External Secrets Operator (Kustomize overlay), NOT a
# static Kubernetes Secret. No secret value is committed to git.

variable "name" { type = string }
variable "kms_key_alias" {
  type    = string
  default = "ai-tos/secrets"
}
# Rotation Lambda ARN is environment-specific and supplied at deploy time (OIDC/CI).
# When empty, rotation resource is not created (placeholder phase).
variable "rotation_lambda_arn" {
  type    = string
  default = ""
}

resource "aws_kms_key" "secrets" {
  description             = "${var.name} secrets encryption (CMK)"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  tags = { Name = var.kms_key_alias }
}

resource "aws_kms_alias" "secrets" {
  name          = "alias/${var.kms_key_alias}"
  target_key_id = aws_kms_key.secrets.key_id
}

resource "aws_secretsmanager_secret" "this" {
  name                    = "${var.name}/app"
  kms_key_id              = aws_kms_key.secrets.arn
  recovery_window_in_days = 0
  tags = { Name = "${var.name}/app" }
}

# Automatic rotation (30 days) once a rotation Lambda is wired (Phase 0B).
resource "aws_secretsmanager_secret_rotation" "this" {
  count               = var.rotation_lambda_arn != "" ? 1 : 0
  secret_id           = aws_secretsmanager_secret.this.id
  rotation_lambda_arn = var.rotation_lambda_arn
  rotation_rules {
    automatically_after_days = 30
  }
}

# Placeholder ONLY. Real values injected via CI/OIDC at deploy time (ADR-0009).
# Least-privilege IAM grants per-service roles secretsmanager:GetSecretValue on
# this specific ARN only.
resource "aws_secretsmanager_secret_version" "this" {
  secret_id = aws_secretsmanager_secret.this.id
  secret_string = jsonencode({
    DATABASE_URL    = "postgresql://ai_tos:CHANGE_ME@localhost:5432/ai_tos"
    REDIS_CACHE_URL = "redis://localhost:6379"
    REDIS_STATE_URL = "redis://localhost:6379"
    JWT_SECRET      = "CHANGE_ME"
  })
}

output "secret_arn" { value = aws_secretsmanager_secret.this.arn }
output "kms_key_arn" { value = aws_kms_key.secrets.arn }
