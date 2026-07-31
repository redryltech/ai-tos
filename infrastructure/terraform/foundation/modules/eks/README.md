# EKS module (Phase 0B.2)

Production-grade EKS cluster + managed node groups + IRSA + add-on IAM.

- **Cluster:** private endpoint (public disabled by default, allowlist when enabled),
  multi-AZ (control-plane ENIs in private subnets), KMS-encrypted secrets, full control-plane
  logging, `kube-proxy`/`CoreDNS`/`VPC CNI` managed by EKS.
- **Node groups:** `system` (on-demand, tainted for platform add-ons) and `applications`
  (mixed On-Demand base + Spot above base for cost). Both use a shared node IAM role with
  `AmazonEKSWorkerNodePolicy` + `AmazonEKS_CNI_Policy` + ECR read-only + EBS CSI.
- **IRSA:** `cluster-autoscaler` and `aws-load-balancer-controller` roles (consumed by the
  manifests in `infrastructure/kubernetes/eks-foundation/`).
- **KMS:** dedicated CMK for Kubernetes secrets (separate from the tfstate key).

The cluster runs **no application workloads** — namespaces/RBAC/add-ons are applied via the
YAML in `infrastructure/kubernetes/eks-foundation/` after the cluster exists.
