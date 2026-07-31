output "cluster_arn" {
  value = aws_msk_cluster.this.arn
}

output "cluster_name" {
  value = aws_msk_cluster.this.cluster_name
}

output "bootstrap_brokers_tls" {
  description = "Comma-separated TLS bootstrap brokers (VPC-internal DNS)."
  value       = aws_msk_cluster.this.bootstrap_brokers_tls
}

output "bootstrap_brokers_sasl_scram" {
  description = "Comma-separated SASL/SCRAM bootstrap brokers."
  value       = aws_msk_cluster.this.bootstrap_brokers_sasl_scram
}

output "zookeeper_connect_string" {
  value = aws_msk_cluster.this.zookeeper_connect_string
}

output "security_group_id" {
  value = aws_security_group.this.id
}

output "scram_secret_arn" {
  value = aws_secretsmanager_secret.scram.arn
}

output "client_iam_policy_arn" {
  value = aws_iam_policy.client.arn
}

output "kms_key_arn" {
  value = var.kms_key_arn
}
