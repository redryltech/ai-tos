output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "cluster_ca_certificate" {
  value = module.eks.cluster_certificate_authority_data
}

output "oidc_provider_url" {
  value = module.eks.cluster_oidc_issuer_url
}

output "oidc_provider_arn" {
  value = module.eks.oidc_provider_arn
}

output "cluster_security_group_id" {
  value = module.eks.cluster_security_group_id
}

output "node_security_group_id" {
  value = module.eks.node_security_group_id
}

output "node_iam_role_arn" {
  value = aws_iam_role.node.arn
}

output "cluster_iam_role_arn" {
  value = aws_iam_role.cluster.arn
}

output "kms_key_arn" {
  value = aws_kms_key.eks.arn
}

output "cluster_autoscaler_role_arn" {
  value = aws_iam_role.cluster_autoscaler.arn
}

output "aws_load_balancer_controller_role_arn" {
  value = aws_iam_role.aws_lb_controller.arn
}
