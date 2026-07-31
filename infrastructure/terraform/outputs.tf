output "vpc_id" {
  value = module.vpc.vpc_id
}

output "private_subnet_ids" {
  value = module.vpc.private_subnets
}

output "public_subnet_ids" {
  value = module.vpc.public_subnets
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "db_endpoint" {
  value = module.rds.endpoint
}

output "redis_cache_endpoint" {
  value = module.elasticache.cache_endpoint
}

output "redis_state_endpoint" {
  value = module.elasticache.state_endpoint
}

output "assets_bucket" {
  value = module.s3.bucket
}

output "alb_dns_name" {
  value = module.alb.dns_name
}
