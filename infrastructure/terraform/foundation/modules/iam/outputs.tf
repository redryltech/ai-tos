output "terraform_role_arn" {
  value = aws_iam_role.terraform.arn
}

output "terraform_role_name" {
  value = aws_iam_role.terraform.name
}

output "admin_role_arn" {
  value = aws_iam_role.admin.arn
}

output "developer_role_arn" {
  value = aws_iam_role.developer.arn
}

output "cross_account_role_arn" {
  value = aws_iam_role.cross_account.arn
}

output "github_oidc_provider_arn" {
  value = try(aws_iam_openid_connect_provider.github[0].arn, null)
}
