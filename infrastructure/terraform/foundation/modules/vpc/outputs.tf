output "vpc_id" {
  value = module.vpc.vpc_id
}

output "vpc_cidr" {
  value = module.vpc.vpc_cidr_block
}

output "public_subnet_ids" {
  value = module.vpc.public_subnets
}

output "private_subnet_ids" {
  description = "App tier subnet IDs."
  value       = module.vpc.private_subnets
}

output "database_subnet_ids" {
  description = "Data tier subnet IDs."
  value       = module.vpc.database_subnets
}

output "public_route_table_ids" {
  value = module.vpc.public_route_table_ids
}

output "private_route_table_ids" {
  value = module.vpc.private_route_table_ids
}

output "database_route_table_ids" {
  value = module.vpc.database_route_table_ids
}

output "nat_public_ips" {
  value = module.vpc.nat_public_ips
}

output "internet_gateway_arn" {
  value = module.vpc.igw_arn
}
