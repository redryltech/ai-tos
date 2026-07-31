# EKS Platform Architecture — Diagrams (Phase 0B.2)

Mermaid diagrams for the AI-TOS Kubernetes platform. No workloads are shown (platform only).

## E1 — Cluster architecture
```mermaid
flowchart TB
  subgraph AZs["3 AZs (private subnets)"]
    CP[Control plane ENIs\nprivate subnets]
    NG1[system node group\non-demand, tainted]
    NG2[applications node group\non-demand base + Spot]
  end
  CP -->|private endpoint| K8S[EKS Control Plane\nKMS-encrypted secrets\nfull control-plane logs]
  K8S --> NG1 & NG2
  NG1 -. IRSA .-> CA[Cluster Autoscaler]
  NG2 -. IRSA .-> LB[AWS LB Controller]
  VPCN[VPC CNI + CoreDNS + kube-proxy\nEKS managed add-ons]
```

## E2 — Node groups & capacity
```mermaid
flowchart LR
  subgraph System["system node group"]
    S1[t3.large on-demand x2] -->|taint dedicated=system| ADDONS[CoreDNS, Metrics, LB Ctrl, CA]
  end
  subgraph App["applications node group"]
    A1[on-demand base x2] --> WL[app pods]
    A2[spot x up to 8] --> WL
  end
  CA -->|scale| App
```

## E3 — Namespaces
```mermaid
flowchart TB
  NS[Namespaces]
  NS --> platform-system["platform-system\n(PSA baseline)"]
  NS --> applications["applications\n(PSA baseline)"]
  NS --> observability["observability\n(PSA baseline)"]
  NS --> security["security\n(PSA baseline)"]
  NS --> staging["staging\n(PSA baseline)"]
  NS --> production["production\n(PSA RESTRICTED)"]
```

## E4 — Networking & ingress foundation
```mermaid
flowchart TB
  IGW[Internet GW] --> ALB[ALB (AWS LB Controller)\nprovisions per Ingress later]
  ALB --> SVC[Service / pod in applications]
  APP[application pods] -->|egress| NAT[NAT GW]
  APP -->|DNS| COREDNS[CoreDNS]
  VPCN[VPC CNI] -->|pod ENI in private subnets| APP
  NP[default-deny NetworkPolicy\napplications/observability/security]
  IRSA[IRSA: CA + LB Controller\nassume AWS roles]
  KMS[KMS: secrets encryption at rest]
```

## E5 — Autoscaling flow
```mermaid
flowchart LR
  PODS[pods pending] --> CA[Cluster Autoscaler\nIRSA]
  CA --> ASG[Auto Scaling Group\nmanaged node group]
  ASG --> NODES[new nodes join]
  NODES --> SCHED[Scheduler places pods]
```
