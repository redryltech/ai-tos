output "s3_endpoint_id" {
  value = try(aws_vpc_endpoint.s3[0].id, null)
}

output "dynamodb_endpoint_id" {
  value = try(aws_vpc_endpoint.dynamodb[0].id, null)
}

output "interface_endpoint_ids" {
  value = { for k, v in aws_vpc_endpoint.interface : k => v.id }
}
