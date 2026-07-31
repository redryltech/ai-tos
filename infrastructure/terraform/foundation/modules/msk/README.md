# MSK (Kafka) module (Phase 0B.4 / ADR-0004, ADR-0016)

Production Amazon MSK foundation.

- **Version:** Kafka 3.6 (stable MSK build). Bump `kafka_version` for upgrades (rolling).
- **Multi-AZ:** `broker_count` >= 3, one broker per AZ (brokers in private subnets).
- **Sizing:** `kafka.m5.large` default; `broker_volume_size` 1 TiB/broker (tune for retention × throughput).
- **Private networking:** brokers in private subnets; SG allows 9094/9096 only from app CIDRs/SGs.
- **Encryption:** KMS at rest; TLS (`client_broker=TLS`, `in_cluster=true`) in transit.
- **Authentication:** **IAM** for clients (least privilege, no static creds) + **SCRAM** for platform
  tooling (topic management). Both enabled.
- **Broker config:** `auto.create.topics.enable=false`, `default.replication.factor=3`,
  `min.insync.replicas=2`, 7-day default retention.
- **HA / scaling:** Multi-AZ failover; scale by raising `broker_count` (and rebalancing partitions)
  or increasing `broker_volume_size` (EBS storage autoscaling). 
- **Upgrades:** minor/patch via `kafka_version`; config changes via new `aws_msk_configuration` revision.
- **Audit:** broker logs to CloudWatch (`/aws/msk/<name>/broker-logs`).
- **Least privilege:** an unattached client IAM policy (cluster + topic `kafka-cluster:*` actions)
  is provided for app/role binding in 0B.5.

No producers/consumers, no Outbox, no monitoring stack (Prometheus/Grafana/Loki) in this phase.
