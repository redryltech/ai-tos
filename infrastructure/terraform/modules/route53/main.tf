variable "domain" { type = string }

# Hosted zone only. Per-service records (api., app.) are added where the
# ALB/ingress DNS is known (see modules/alb or kubernetes ingress).
resource "aws_route53_zone" "this" {
  name = var.domain
}

output "zone_id" { value = aws_route53_zone.this.zone_id }
