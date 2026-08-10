variable "name" { type = string }
variable "vpc_id" { type = string }
variable "vpc_cidr" { type = string }
variable "subnet_ids" { type = list(string) }
variable "domain" { type = string }
variable "route53_zone_id" { type = string }

# Internet-facing ALB is the platform edge (wired to public_subnets in root module).
# Ingress 80/443 from the internet is required for that edge; egress is VPC-only to targets.
# tfsec:ignore:aws-ec2-no-public-ingress-sgr Public ALB edge must accept client HTTP(S) from the internet; :80 redirects to :443.
resource "aws_security_group" "alb" {
  name        = "${var.name}-alb-sg"
  description = "AI-TOS ALB security group for ${var.name} (HTTPS edge)"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP redirect to HTTPS"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "To VPC targets only"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }
}

# tfsec:ignore:aws-elb-alb-not-public Internet-facing ALB is intentional platform public edge (public_subnets). Internal ALB would remove that path.
resource "aws_lb" "this" {
  name                       = "${var.name}-alb"
  load_balancer_type         = "application"
  internal                   = false
  subnets                    = var.subnet_ids
  security_groups            = [aws_security_group.alb.id]
  drop_invalid_header_fields = true
}

resource "aws_lb_target_group" "this" {
  name        = "${var.name}-tg"
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path = "/api/health"
  }
}

resource "aws_acm_certificate" "alb" {
  domain_name       = var.domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "alb_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.alb.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.route53_zone_id
}

resource "aws_acm_certificate_validation" "alb" {
  certificate_arn         = aws_acm_certificate.alb.arn
  validation_record_fqdns = [for r in aws_route53_record.alb_cert_validation : r.fqdn]
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.alb.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
}

output "dns_name" { value = aws_lb.this.dns_name }
output "https_listener_arn" { value = aws_lb_listener.https.arn }
