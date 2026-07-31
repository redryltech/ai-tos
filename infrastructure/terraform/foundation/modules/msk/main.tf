# Amazon MSK (Kafka) platform (Phase 0B.4 / ADR-0004).
# Production-ready: Multi-AZ, private subnets, KMS at rest, TLS in transit, IAM + SCRAM auth,
# broker config (RF=3, min.insync=2), CloudWatch broker logs. Topics are managed by the
# kafka-topics module. No producers/consumers/outbox here.

resource "aws_security_group" "this" {
  name   = "${var.name}-msk-sg"
  vpc_id = var.vpc_id
  tags   = var.tags

  # Kafka TLS (9094) + SASL/SCRAM (9096). ZooKeeper (2181) intentionally not opened to clients.
  dynamic "ingress" {
    for_each = (length(var.allowed_ingress_cidrs) + length(var.allowed_ingress_sg_ids) > 0) ? [1] : []
    content {
      from_port       = 9094
      to_port         = 9096
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

resource "aws_cloudwatch_log_group" "msk" {
  name              = "/aws/msk/${var.name}/broker-logs"
  retention_in_days = var.broker_log_retention
  tags              = var.tags
}

resource "aws_msk_configuration" "this" {
  name              = "${var.name}-config"
  kafka_versions    = [var.kafka_version]
  server_properties = <<PROP
auto.create.topics.enable=false
default.replication.factor=3
min.insync.replicas=2
num.partitions=3
log.retention.hours=168
log.cleanup.policy=delete
delete.topic.enable=true
PROP
}

# SCRAM credential (used by platform automation to manage topics; apps use IAM auth).
resource "random_password" "scram" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "scram" {
  name                    = "${var.name}-msk-scram"
  kms_key_id              = var.kms_key_arn
  recovery_window_in_days = 0
  tags                    = var.tags
}

resource "aws_secretsmanager_secret_version" "scram" {
  secret_id = aws_secretsmanager_secret.scram.id
  secret_string = jsonencode({
    username = "ai-tos-admin"
    password = random_password.scram.result
  })
}

resource "aws_msk_cluster" "this" {
  cluster_name           = var.name
  kafka_version          = var.kafka_version
  number_of_broker_nodes = var.broker_count

  broker_node_group_info {
    instance_type   = var.broker_instance_type
    client_subnets  = var.client_subnets
    security_groups = [aws_security_group.this.id]
    storage_info {
      ebs_storage_info {
        volume_size = var.broker_volume_size
      }
    }
  }

  # TLS in transit (via encryption_info); IAM auth for clients + SCRAM for platform tooling.
  client_authentication {
    sasl {
      iam   = true
      scram = true
    }
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
    encryption_at_rest_kms_key_arn = var.kms_key_arn
  }

  configuration_info {
    arn      = aws_msk_configuration.this.arn
    revision = aws_msk_configuration.this.latest_revision
  }

  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = aws_cloudwatch_log_group.msk.name
      }
    }
  }

  enhanced_monitoring = "DEFAULT"
  tags                = var.tags
}

resource "aws_msk_scram_secret_association" "this" {
  cluster_arn     = aws_msk_cluster.this.arn
  secret_arn_list = [aws_secretsmanager_secret.scram.arn]
}

# Least-privilege client IAM policy (unattached — ready for app/role binding in 0B.5).
data "aws_iam_policy_document" "client" {
  statement {
    sid = "ClusterAccess"
    actions = [
      "kafka:GetBootstrapBrokers",
      "kafka:DescribeCluster",
      "kafka:CreateTopic",
      "kafka:DeleteTopic",
      "kafka-cluster:Connect",
      "kafka-cluster:DescribeCluster",
      "kafka-cluster:DescribeTopic",
      "kafka-cluster:CreateTopic",
      "kafka-cluster:AlterTopic",
      "kafka-cluster:ReadData",
      "kafka-cluster:WriteData",
    ]
    resources = [aws_msk_cluster.this.arn, "${aws_msk_cluster.this.arn}/*"]
  }
}

resource "aws_iam_policy" "client" {
  name   = "${var.name}-kafka-client"
  policy = data.aws_iam_policy_document.client.json
  tags   = var.tags
}
