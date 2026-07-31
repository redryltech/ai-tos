# EKS Foundation Manifests (Phase 0B.2)

Platform-only Kubernetes resources applied **after** the EKS cluster exists (see
`infrastructure/terraform/foundation/modules/eks` + `environments/eks`). No workloads here.

## Apply order
```bash
# 1. Namespaces + Pod Security Standards
kubectl apply -f namespaces.yaml
kubectl apply -f pod-security-standards.yaml

# 2. RBAC
kubectl apply -f rbac.yaml

# 3. Network Policies (baseline default-deny)
kubectl apply -f network-policies.yaml

# 4. Storage foundation
kubectl apply -f storage-classes.yaml

# 5. Add-ons (fill IRSA role ARNs + cluster/region placeholders first)
#    export LB_ARN=$(terraform -chdir=../../../terraform/foundation/environments/eks output -raw aws_load_balancer_controller_role_arn)
#    export CA_ARN=$(terraform ... output -raw cluster_autoscaler_role_arn)
#    sed -i "s|<AWS_LOAD_BALANCER_CONTROLLER_ROLE_ARN>|$LB_ARN|" aws-load-balancer-controller.yaml
kubectl apply -f aws-load-balancer-controller.yaml
kubectl apply -f cluster-autoscaler.yaml
kubectl apply -f metrics-server.yaml
```

## Notes
- Enable the EKS managed add-ons **CoreDNS**, **kube-proxy**, **VPC CNI**, **EBS CSI driver**
  (via console/CLI or `aws eks create-addon`) — they are managed by EKS, not these manifests.
- VPC CNI uses IRSA (enabled in the cluster); EBS CSI driver provides the StorageClasses here.
- `<CLUSTER_NAME>` / `<AWS_REGION>` / IRSA role-ARN placeholders come from Terraform outputs.
- AWS Load Balancer Controller installs the `alb` IngressClass — applications create Ingresses
  in later phases; no application is exposed in 0B.2.
- External Secrets Operator, Argo CD, Prometheus/Grafana/Loki, Kafka, Redis, DBs are **not**
  part of this phase (per scope).
