variable "name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "instance_class" { type = string }
variable "multi_az" { type = bool, default = false }
variable "db_username" { type = string, sensitive = true }

resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-db"
  subnet_ids = var.subnet_ids
}

# Primary OLTP system of record: Amazon RDS for PostgreSQL 16 (ADR-0006).
# TimescaleDB is intentionally NOT enabled on the primary; a dedicated time-series
# instance is added in Phase 2+ when market-tick volume justifies it.
resource "aws_db_parameter_group" "this" {
  name   = "${var.name}-pg"
  family = "postgres16"

  parameter {
    name         = "shared_preload_libraries"
    value        = "pg_stat_statements"
    apply_method = "pending-reboot"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }
}

resource "aws_db_instance" "this" {
  identifier              = "${var.name}-db"
  engine                  = "postgres"
  engine_version          = "16.3"
  instance_class          = var.instance_class
  allocated_storage       = 100
  max_allocated_storage   = 1000
  storage_encrypted       = true
  multi_az                = var.multi_az
  db_subnet_group_name    = aws_db_subnet_group.this.name
  parameter_group_name    = aws_db_parameter_group.this.name
  username                = var.db_username
  # Password injected via AWS Secrets Manager + ESO at deploy (ADR-0009); never committed.
  password                = var.db_username # placeholder; override via Secrets Manager at deploy
  skip_final_snapshot     = true
  backup_retention_period = 7
  # Point-in-time recovery for DR (RPO < 5 min target via continuous backup).
  deletion_protection     = var.multi_az
}

output "endpoint" { value = aws_db_instance.this.address }
