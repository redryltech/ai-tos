output "amp_workspace_id" {
  value = aws_prometheus_workspace.this.id
}

output "amp_workspace_arn" {
  value = aws_prometheus_workspace.this.arn
}

output "amp_prometheus_endpoint" {
  value = aws_prometheus_workspace.this.prometheus_endpoint
}

output "amp_remote_write_url" {
  value = "${aws_prometheus_workspace.this.prometheus_endpoint}api/v1/remote_write"
}

output "prometheus_role_arn" {
  value = aws_iam_role.prometheus.arn
}

output "otel_collector_role_arn" {
  value = aws_iam_role.otel_collector.arn
}

output "grafana_role_arn" {
  value = aws_iam_role.grafana.arn
}
