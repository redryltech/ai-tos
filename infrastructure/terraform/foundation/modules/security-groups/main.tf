# Security Groups — the primary network boundary. Default-deny by design.
# (The VPC's default SG is left unused; workloads get purpose-built SGs.)

# Fronts the VPC interface endpoints: HTTPS only, from within the VPC.
resource "aws_security_group" "endpoints" {
  name        = "${var.name}-vpc-endpoints"
  description = "VPC interface endpoint access (HTTPS from VPC only)"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTPS from VPC"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    description = "VPC-local only (endpoint ENIs do not need internet egress)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = merge(var.tags, { Name = "${var.name}-vpc-endpoints" })
}

# Management/bastion SG (placeholder). No ingress by default — open only via SSM
# Session Manager or a hardened bastion, never 22 from 0.0.0.0/0.
resource "aws_security_group" "management" {
  name        = "${var.name}-management"
  description = "Management access (SSM/bastion). No ingress until explicitly opened."
  vpc_id      = var.vpc_id

  tags = merge(var.tags, { Name = "${var.name}-management" })
}
