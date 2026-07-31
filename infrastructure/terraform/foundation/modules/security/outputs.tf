output "cloudtrail_arn" {
  value = try(aws_cloudtrail.this[0].arn, null)
}

output "config_recorder_name" {
  value = aws_config_configuration_recorder.this.name
}

output "guardduty_detector_id" {
  value = aws_guardduty_detector.this.id
}

output "config_aggregator_name" {
  value = try(aws_config_configuration_aggregator.org[0].name, null)
}
