# VPC Endpoints module

Creates in-VPC access to AWS APIs so workloads never traverse the NAT/IGW:

- **Gateway endpoints:** S3, DynamoDB (route-table based, no cost).
- **Interface endpoints:** KMS, CloudWatch Logs, ECR (api+dkr), STS, Secrets Manager, SSM.
  Placed in the `app` subnets, fronted by the endpoint security group (HTTPS from VPC CIDR).

Keeping API traffic off the NAT reduces cost and blast radius.
