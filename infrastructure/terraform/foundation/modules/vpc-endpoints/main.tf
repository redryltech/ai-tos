# VPC Interface + Gateway endpoints — keep traffic to AWS APIs inside the VPC
# (no NAT egress for S3/KMS/Logs/ECR/STS/Secrets Manager/SSM). Reduces data exfil risk
# and NAT cost.

resource "aws_vpc_endpoint" "s3" {
  count = var.create_s3_gateway ? 1 : 0

  vpc_id            = var.vpc_id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = concat(var.private_route_table_ids, var.public_route_table_ids)

  tags = merge(var.tags, { Name = "${var.name}-s3" })
}

resource "aws_vpc_endpoint" "dynamodb" {
  count = var.create_dynamodb_gateway ? 1 : 0

  vpc_id            = var.vpc_id
  service_name      = "com.amazonaws.${var.region}.dynamodb"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = concat(var.private_route_table_ids, var.public_route_table_ids)

  tags = merge(var.tags, { Name = "${var.name}-dynamodb" })
}

resource "aws_vpc_endpoint" "interface" {
  for_each = toset(var.interface_services)

  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${var.region}.${each.key}"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = var.private_subnet_ids
  security_group_ids  = [var.endpoint_sg_id]
  private_dns_enabled = true

  tags = merge(var.tags, { Name = "${var.name}-${each.key}" })
}
