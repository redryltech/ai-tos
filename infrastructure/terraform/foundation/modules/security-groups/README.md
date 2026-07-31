# Security Groups module

- **`endpoints`** — attached to VPC interface endpoints; HTTPS (443) only from the VPC CIDR.
- **`management`** — placeholder for SSM Session Manager / bastion access; starts with
  **no ingress** (never open 22 to the world).

The VPC default SG is intentionally not used. Workloads get their own tightly-scoped SGs
in later phases (EKS node SG, RDS SG, ALB SG), all default-deny.
