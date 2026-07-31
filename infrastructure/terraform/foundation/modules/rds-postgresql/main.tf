# Production PostgreSQL 16 platform (Phase 0B.3).
# Multi-AZ, private subnets, KMS-encrypted, PITR, read replicas, Performance Insights,
# Enhanced Monitoring, forced SSL, IAM auth, storage autoscaling. Secrets Manager stores
# the master password via manage_master_user_password (ADR-0009).

locals {
  db_port = 5432
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-subnet-group"
  subnet_ids = var.db_subnet_ids
  tags       = var.tags
}

resource "aws_security_group" "this" {
  name   = "${var.name}-sg"
  vpc_id = var.vpc_id
  tags   = var.tags

  dynamic "ingress" {
    for_each = (length(var.allowed_ingress_cidrs) + length(var.allowed_ingress_sg_ids) > 0) ? [1] : []
    content {
      from_port       = local.db_port
      to_port         = local.db_port
      protocol        = "tcp"
      cidr_blocks     = var.allowed_ingress_cidrs
      security_groups = var.allowed_ingress_sg_ids
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_parameter_group" "this" {
  name   = "${var.name}-pg16"
  family = "postgres16"
  parameter {
    name         = "shared_preload_libraries"
    value        = "pg_stat_statements"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "max_connections"
    value        = tostring(var.max_connections)
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "rds.force_ssl"
    value        = "1"
    apply_method = "immediate"
  }
  parameter {
    name         = "log_min_duration_statement"
    value        = "1000"
    apply_method = "immediate"
  }
  parameter {
    name         = "idle_in_transaction_session_timeout"
    value        = "60000"
    apply_method = "immediate"
  }
  tags = var.tags
}

# PostgreSQL requires no options; group kept for parity / future extensions.
resource "aws_db_option_group" "this" {
  name                 = "${var.name}-og"
  engine_name          = "postgres"
  major_engine_version = "16"
  tags                 = var.tags
}

# Enhanced Monitoring IAM role.
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.name}-rds-monitoring"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringPolicy"
}

resource "aws_db_instance" "this" {
  identifier     = var.name
  engine         = "postgres"
  engine_version = var.engine_version

  instance_class        = var.instance_class
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = var.kms_key_arn

  db_name                     = var.db_name
  port                        = local.db_port
  username                    = var.db_username
  manage_master_user_password = true # master password stored in Secrets Manager

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.this.id]
  parameter_group_name   = aws_db_parameter_group.this.name
  option_group_name      = aws_db_option_group.this.name

  multi_az                            = var.multi_az
  iam_database_authentication_enabled = true # IAM auth readiness (ADR-0009)

  backup_retention_period   = var.backup_retention_period
  backup_window             = var.backup_window
  maintenance_window        = var.maintenance_window
  copy_tags_to_snapshot     = true
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.final_snapshot_identifier
  deletion_protection       = var.deletion_protection

  performance_insights_enabled          = true
  performance_insights_retention_period = var.performance_insights_retention
  monitoring_interval                   = var.monitoring_interval
  monitoring_role_arn                   = aws_iam_role.rds_monitoring.arn
  enabled_cloudwatch_logs_exports       = ["postgresql", "upgrade"]

  auto_minor_version_upgrade  = true
  allow_major_version_upgrade = false
  apply_immediately           = false

  tags = var.tags
}

# Region read replicas (same-region by default; cross-region is a later enhancement).
resource "aws_db_instance" "replica" {
  count = var.read_replica_count

  identifier          = "${var.name}-replica-${count.index + 1}"
  replicate_source_db = aws_db_instance.this.identifier
  instance_class      = var.read_replica_instance_class
  engine              = "postgres"
  engine_version      = var.engine_version

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = var.kms_key_arn

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.this.id]
  parameter_group_name   = aws_db_parameter_group.this.name
  option_group_name      = aws_db_option_group.this.name

  port                                = local.db_port
  multi_az                            = false
  iam_database_authentication_enabled = true

  backup_retention_period               = 0 # replicas are restored from source; no independent backups
  skip_final_snapshot                   = true
  monitoring_interval                   = var.monitoring_interval
  monitoring_role_arn                   = aws_iam_role.rds_monitoring.arn
  performance_insights_enabled          = true
  performance_insights_retention_period = var.performance_insights_retention
  enabled_cloudwatch_logs_exports       = ["postgresql", "upgrade"]

  auto_minor_version_upgrade = true
  apply_immediately          = false

  tags = var.tags
}
