# amdWiki Kubernetes Deployment

Deploy amdWiki to Kubernetes.

## Quick Start

```bash
# Create namespace (optional)
kubectl create namespace amdwiki

# Create secrets first
kubectl create secret generic amdwiki-secrets \
  --from-literal=session-secret=$(openssl rand -base64 32) \
  -n amdwiki

# Deploy all manifests
kubectl apply -f pvc.yaml -n amdwiki
kubectl apply -f configmap.yaml -n amdwiki
kubectl apply -f deployment.yaml -n amdwiki
kubectl apply -f service.yaml -n amdwiki

# Optional: Deploy ingress
kubectl apply -f ingress.yaml -n amdwiki
```

## Manifest Files

| File | Purpose |
| --- | --- |
| `deployment.yaml` | Pod deployment with health checks and resource limits |
| `service.yaml` | ClusterIP service (port 80 -> 3000) |
| `configmap.yaml` | Custom configuration (app-custom-config.json) |
| `pvc.yaml` | Persistent storage (10Gi default) |
| `secrets.yaml.example` | Template for secrets (session secret) |
| `ingress.yaml` | NGINX Ingress with optional TLS |

## Configuration

Edit `configmap.yaml` to customize:

```json
{
  "amdwiki.server.host": "0.0.0.0",
  "amdwiki.baseURL": "https://wiki.example.com",
  "amdwiki.applicationName": "My Wiki",
  "amdwiki.session.secure": true
}
```

## Storage

Default: 10Gi PVC with ReadWriteOnce access.

For multi-replica scaling, use ReadWriteMany (RWX) with shared storage (NFS, EFS, etc.):

```yaml
spec:
  accessModes:
    - ReadWriteMany
```

## Secrets

Create from command line:

```bash
kubectl create secret generic amdwiki-secrets \
  --from-literal=session-secret=$(openssl rand -base64 32)
```

Or copy and edit the example:

```bash
cp secrets.yaml.example secrets.yaml
# Edit secrets.yaml with base64-encoded values
kubectl apply -f secrets.yaml
```

## Ingress

The ingress manifest requires:

- NGINX Ingress Controller (or similar)
- Optional: cert-manager for TLS

Install NGINX Ingress:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

## Monitoring

Check pod status:

```bash
kubectl get pods -l app=amdwiki -n amdwiki
kubectl logs -l app=amdwiki -n amdwiki
kubectl describe pod -l app=amdwiki -n amdwiki
```

## Scaling

For single-instance (default):

```yaml
spec:
  replicas: 1
```

For multi-instance (requires RWX storage):

```yaml
spec:
  replicas: 3
```

## Troubleshooting

**Pod not starting:**

```bash
kubectl describe pod -l app=amdwiki
kubectl logs -l app=amdwiki --previous
```

**PVC not binding:**

```bash
kubectl get pvc
kubectl describe pvc amdwiki-data-pvc
```

**Ingress not working:**

```bash
kubectl get ingress
kubectl describe ingress amdwiki
```
