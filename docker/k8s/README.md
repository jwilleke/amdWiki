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

## Container Image

The pre-built image is available from GitHub Container Registry. Update `deployment.yaml` to use it:

```yaml
image: ghcr.io/jwilleke/amdwiki:latest
```

See [DOCKER.md - Pre-built Image from GHCR](../DOCKER.md#pre-built-image-from-ghcr) for all available tags.

## Manifest Files

| File | Purpose |
| --- | --- |
| `deployment.yaml` | Pod deployment with health checks and resource limits |
| `service.yaml` | ClusterIP service (port 80 -> 3000) |
| `configmap.yaml` | Custom configuration (app-custom-config.json) |
| `pvc.yaml` | Persistent storage (10Gi default) |
| `secrets.yaml.example` | Template for secrets (session secret) |
| `ingress.yaml` | NGINX Ingress with optional TLS |

## Headless Installation

For automated Kubernetes deployments that skip the interactive installation wizard, enable headless installation mode.

### ConfigMap with Headless Mode

Add `HEADLESS_INSTALL: "true"` to your ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: amdwiki-env
  namespace: amdwiki
data:
  HEADLESS_INSTALL: "true"
  AMDWIKI_HOST: "0.0.0.0"
  AMDWIKI_PORT: "3000"
  AMDWIKI_APP_NAME: "My Company Wiki"
  AMDWIKI_BASE_URL: "https://wiki.example.com"
```

### Deployment with Headless Install

Reference the ConfigMap in your deployment:

```yaml
spec:
  containers:
  - name: amdwiki
    image: amdwiki:latest
    envFrom:
    - configMapRef:
        name: amdwiki-env
    - secretRef:
        name: amdwiki-secrets
```

### What Headless Install Does

When `HEADLESS_INSTALL=true`:

- Copies required startup pages to `data/pages/`
- Copies example configs to `data/config/`
- Creates `.install-complete` marker
- Uses default admin credentials (`admin` / `admin123`)
- App is immediately ready - no wizard required

### First Login

After deployment, login with default credentials:

- **Username:** `admin`
- **Password:** `admin123`

**Important:** Change the admin password immediately after first login. The wiki displays a security warning until you do.

### Session Secret

For production, always set a secure session secret via Kubernetes Secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: amdwiki-secrets
  namespace: amdwiki
type: Opaque
stringData:
  AMDWIKI_SESSION_SECRET: "your-secure-random-secret-here"
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

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
