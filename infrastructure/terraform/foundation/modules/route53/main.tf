# DNS — public hosted zone (internet-facing) + private hosted zone (internal VPC resolution).
resource "aws_route53_zone" "public" {
  name = var.domain
  tags = merge(var.tags, { Name = var.domain, Visibility = "public" })
}

resource "aws_route53_zone" "private" {
  name = "internal.${var.domain}"
  vpc {
    vpc_id     = var.vpc_id
    vpc_region = var.vpc_region
  }
  tags = merge(var.tags, { Name = "internal.${var.domain}", Visibility = "private" })
}
