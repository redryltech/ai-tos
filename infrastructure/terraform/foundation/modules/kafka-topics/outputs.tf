output "topic_names" {
  value = [for k in sort(keys(kafka_topic.this)) : k]
}

output "topic_details" {
  description = "Map of topic name -> {partitions, replication_factor, retention_ms, cleanup_policy}."
  value = {
    for k, v in kafka_topic.this : k => {
      partitions         = v.partitions
      replication_factor = v.replication_factor
      retention_ms       = v.config["retention.ms"]
      cleanup_policy     = v.config["cleanup.policy"]
    }
  }
}
