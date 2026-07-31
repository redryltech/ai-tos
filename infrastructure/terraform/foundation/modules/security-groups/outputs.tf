output "endpoints_sg_id" {
  value = aws_security_group.endpoints.id
}

output "management_sg_id" {
  value = aws_security_group.management.id
}
