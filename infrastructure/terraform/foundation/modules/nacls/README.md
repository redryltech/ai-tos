# NACLs module

Three stateless NACLs, one per subnet tier:

- **public** — allows 80/443 from internet; egress to app tier + ephemeral.
- **app** — allows 443 from VPC; egress to NAT (80/443), to data tier (5432/6379/9092), + ephemeral.
- **data** — allows only 5432/6379/9092/443 **from the VPC CIDR**; egress only within VPC
  (no NAT route → data tier cannot reach the internet).

NACLs are a secondary control; Security Groups enforce the real boundary. Tune rule
numbers/ports per environment before apply.
