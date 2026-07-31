# Amazon Managed Prometheus + IRSA for observability stack (Phase 0B.6 / ADR-0010).

locals {
  oidc_host = replace(var.oidc_provider_url, "https://", "")
}

resource "aws_prometheus_workspace" "this" {
  alias = "${var.name}-amp"
  tags  = var.tags

  logging_configuration {
    log_group_arn = "${aws_cloudwatch_log_group.amp.arn}:*"
  }
}

resource "aws_cloudwatch_log_group" "amp" {
  name              = "/ai-tos/${var.name}/amp"
  retention_in_days = var.log_retention_days
  kms_key_id        = var.kms_key_arn == null ? null : var.kms_key_arn
  tags              = var.tags
}

# --- IRSA: Prometheus remote-write to AMP ---
resource "aws_iam_role" "prometheus" {
  name = "${var.name}-prometheus"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = var.oidc_provider_arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${local.oidc_host}:aud" = "sts.amazonaws.com"
          "${local.oidc_host}:sub" = "system:serviceaccount:observability:prometheus"
        }
      }
    }]
  })
  tags = var.tags
}

resource "aws_iam_policy" "prometheus_remote_write" {
  name = "${var.name}-prometheus-remote-write"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "aps:RemoteWrite",
        "aps:GetSeries",
        "aps:GetLabels",
        "aps:GetMetricMetadata"
      ]
      Resource = aws_prometheus_workspace.this.arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "prometheus" {
  role       = aws_iam_role.prometheus.name
  policy_arn = aws_iam_policy.prometheus_remote_write.arn
}

# --- IRSA: OTel Collector (AMP remote-write + optional X-Ray) ---
resource "aws_iam_role" "otel_collector" {
  name = "${var.name}-otel-collector"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = var.oidc_provider_arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${local.oidc_host}:aud" = "sts.amazonaws.com"
          "${local.oidc_host}:sub" = "system:serviceaccount:observability:otel-collector"
        }
      }
    }]
  })
  tags = var.tags
}

resource "aws_iam_policy" "otel_collector" {
  name = "${var.name}-otel-collector"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "aps:RemoteWrite",
          "aps:GetSeries",
          "aps:GetLabels",
          "aps:GetMetricMetadata"
        ]
        Resource = aws_prometheus_workspace.this.arn
      },
      {
        Effect = "Allow"
        Action = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords",
          "xray:GetSamplingRules",
          "xray:GetSamplingTargets"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "${aws_cloudwatch_log_group.amp.arn}:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "otel_collector" {
  role       = aws_iam_role.otel_collector.name
  policy_arn = aws_iam_policy.otel_collector.arn
}

# Grafana IRSA (read AMP via query APIs)
resource "aws_iam_role" "grafana" {
  name = "${var.name}-grafana"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = var.oidc_provider_arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${local.oidc_host}:aud" = "sts.amazonaws.com"
          "${local.oidc_host}:sub" = "system:serviceaccount:observability:grafana"
        }
      }
    }]
  })
  tags = var.tags
}

resource "aws_iam_policy" "grafana" {
  name = "${var.name}-grafana-amp-query"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "aps:QueryMetrics",
        "aps:GetSeries",
        "aps:GetLabels",
        "aps:GetMetricMetadata"
      ]
      Resource = aws_prometheus_workspace.this.arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "grafana" {
  role       = aws_iam_role.grafana.name
  policy_arn = aws_iam_policy.grafana.arn
}
