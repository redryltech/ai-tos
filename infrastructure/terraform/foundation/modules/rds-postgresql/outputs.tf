output "identifier" {
  value = aws_db_instance.this.identifier
}

output "endpoint" {
  value = aws_db_instance.this.address
}

output "port" {
  value = aws_db_instance.this.port
}

output "arn" {
  value = aws_db_instance.this.arn
}

output "resource_id" {
  value = aws_db_instance.this.resource_id
}

output "master_user_secret_arn" {
  description = "Secrets Manager secret ARN holding the managed master password (ADR-0009)."
  value       = aws_db_instance.this.master_user_secret[0].secret_arn
}

output "security_group_id" {
  value = aws_security_group.this.id
}

output "parameter_group_name" {
  value = aws_db_parameter_group.this.name
}

output "replica_endpoints" {
  value = aws_db_instance.replica[*].endpoint
}
