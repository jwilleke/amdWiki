# Docker Deployment Guide for amdWiki

This guide explains how to run amdWiki in Docker with proper ConfigurationManager awareness.

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration Overview](#configuration-overview)
- [Building the Image](#building-the-image)
- [Running with Docker](#running-with-docker)
- [Running with Docker Compose](#running-with-docker-compose)
- [Configuration Management](#configuration-management)
- [Volume Mounts](#volume-mounts)
- [Environment Variables](#environment-variables)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Using Setup Script (Easiest)

```bash
# 1. Clone the repository
git clone <repository-url>
cd amdWiki

# 2. Run the automated setup script
./docker/docker-setup.sh

# 3. Start the application
cd docker
docker-compose up -d

# 4. Access the wiki
open http://localhost:3000
```

The `docker-setup.sh` script automatically:

- Creates required directories
- Configures `docker/.env` with your current user's UID/GID
- Optionally creates production config
- Validates Docker installation

### Using Docker Compose (Manual Setup)

```bash
# 1. Clone the repository
git clone <repository-url>
cd amdWiki

# 2. Create required directories
mkdir -p pages data logs sessions

# 3. Configure environment (port and user permissions)
cp docker/.env.example docker/.env

# Set your current user's UID/GID to avoid permission issues (Linux/macOS)
echo "UID=$(id -u)" >> docker/.env
echo "GID=$(id -g)" >> docker/.env

# Optional: Change port if 3000 is in use
# Edit docker/.env and set HOST_PORT=8080

# 4. (Optional) Create production configuration
cp config/app-production-config.example.json config/app-production-config.json
# Edit config/app-production-config.json with your settings

# 5. Start the application
cd docker
docker-compose up -d

# 6. Access the wiki
open http://localhost:3000
```

### Using Docker CLI

```bash
# Build the image
docker build -t amdwiki .

# Run the container
docker run -d \
  --name amdwiki \
  -p 3000:3000 \
  -v $(pwd)/pages:/app/pages \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  amdwiki

# Access the wiki
open http://localhost:3000
```

## Configuration Overview

amdWiki uses the **ConfigurationManager** which implements a hierarchical configuration system. Configuration files are merged in this order (later overrides earlier):

1. `config/app-default-config.json` - Base defaults (always loaded)
2. `config/app-{NODE_ENV}-config.json` - Environment-specific (optional)
3. `config/app-custom-config.json` - Custom overrides (optional)

The `NODE_ENV` environment variable determines which environment config is loaded:

- `production` → loads `app-production-config.json`
- `development` → loads `app-development-config.json`
- `test` → loads `app-test-config.json`

## Building the Image

### Basic Build

```bash
docker build -t amdwiki .
```

### Build with Custom Tag

```bash
docker build -t amdwiki:1.3.2 .
docker build -t mycompany/amdwiki:latest .
```

### Multi-stage Build for Production

The Dockerfile is optimized for production with:

- Node.js 20 Alpine Linux (minimal size)
- Production-only dependencies
- Non-root user execution
- Health checks
- Proper volume configuration

## Running with Docker

### Basic Run

```bash
docker run -d \
  --name amdwiki \
  -p 3000:3000 \
  amdwiki
```

### Run with Different Port

If port 3000 is already in use:

```bash
# Use port 8080 instead
docker run -d \
  --name amdwiki \
  -p 8080:3000 \
  amdwiki

# Let Docker auto-assign a port
docker run -d \
  --name amdwiki \
  -p 3000 \
  amdwiki

# Find the assigned port
docker port amdwiki 3000
```

### Run with Volume Mounts

```bash
docker run -d \
  --name amdwiki \
  -p 3000:3000 \
  -v $(pwd)/pages:/app/pages \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  amdwiki
```

### Run with Custom Configuration

```bash
# Option 1: Mount custom config file
docker run -d \
  --name amdwiki \
  -p 3000:3000 \
  -v $(pwd)/config/app-custom-config.json:/app/config/app-custom-config.json \
  -v $(pwd)/pages:/app/pages \
  amdwiki

# Option 2: Mount entire config directory
docker run -d \
  --name amdwiki \
  -p 3000:3000 \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/pages:/app/pages \
  amdwiki
```

### Run with Different Environment

```bash
# Run in development mode
docker run -d \
  --name amdwiki-dev \
  -p 3000:3000 \
  -e NODE_ENV=development \
  amdwiki

# Run in production mode (default)
docker run -d \
  --name amdwiki-prod \
  -p 3000:3000 \
  -e NODE_ENV=production \
  amdwiki
```

## Running with Docker Compose

The `docker-compose.yml` file provides a complete deployment configuration.

### Port Configuration

By default, amdWiki runs on port 3000. If this port is already in use, you have several options:

#### Option 1: Use .env file (Recommended)

```bash
# Copy the example file
cp .env.example .env

# Edit .env and change HOST_PORT
echo "HOST_PORT=8080" > .env

# Start with the new port
docker-compose up -d

# Access at http://localhost:8080
```

#### Option 2: Use environment variable at runtime

```bash
# Specify port when starting
HOST_PORT=8080 docker-compose up -d

# Access at http://localhost:8080
```

#### Option 3: Let Docker auto-assign a port

```bash
# Set empty HOST_PORT to auto-assign
HOST_PORT= docker-compose up -d

# Find the assigned port
docker-compose port amdwiki 3000
# Output: 0.0.0.0:32768 (example)
```

#### Option 4: Edit docker-compose.yml directly

```yaml
ports:
  - "8080:3000"  # Change 8080 to your desired port
```

### Start Services

```bash
# Start in detached mode
docker-compose up -d

# Start with logs
docker-compose up

# Start and rebuild
docker-compose up -d --build

# Start with custom port
HOST_PORT=8080 docker-compose up -d
```

### Stop Services

```bash
# Stop containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers, and remove volumes
docker-compose down -v
```

### View Logs

```bash
# View logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100
```

### Manage Services

```bash
# Restart service
docker-compose restart

# View running services
docker-compose ps

# Execute command in container
docker-compose exec amdwiki sh
```

## Configuration Management

### Creating Production Configuration

Step 1. Copy the example configuration:

```bash
cp config/app-production-config.example.json config/app-production-config.json
```

Step 2. Edit `config/app-production-config.json`:

```json
{
  "amdwiki.server.host": "0.0.0.0",
  "amdwiki.server.port": 3000,
  "amdwiki.baseURL": "https://your-domain.com",
  "amdwiki.applicationName": "My Wiki",
  "amdwiki.session.secret": "your-secure-random-secret",
  "amdwiki.session.secure": true
}
```

Step 3. Rebuild and restart:

```bash
docker-compose down
docker-compose up -d --build
```

### Key Configuration Properties

#### Server Configuration

```json
{
  "amdwiki.server.host": "0.0.0.0",
  "amdwiki.server.port": 3000
}
```

**Important:** Use `0.0.0.0` for the host in Docker to bind to all interfaces.

#### Base URL

```json
{
  "amdwiki.baseURL": "https://your-domain.com"
}
```

Set this to your actual domain or IP address.

#### Session Security

```json
{
  "amdwiki.session.secret": "CHANGE-THIS-TO-A-SECURE-RANDOM-STRING",
  "amdwiki.session.secure": true,
  "amdwiki.session.httpOnly": true,
  "amdwiki.session.maxAge": 86400000
}
```

**Generate a secure secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Directories

```json
{
  "amdwiki.page.provider.filesystem.storagedir": "./pages",
  "amdwiki.attachment.metadatafile": "./data/attachments/metadata.json",
  "amdwiki.logging.dir": "./logs",
  "amdwiki.directories.data": "./data"
}
```

These paths are mapped to Docker volumes (see next section).

## Volume Mounts

The application requires persistent storage for several directories:

| Host Path | Container Path | Purpose | ConfigurationManager Property |
|-----------|---------------|---------|------------------------------|
| `./pages` | `/app/pages` | Wiki pages | `amdwiki.page.provider.filesystem.storagedir` |
| `./data` | `/app/data` | Attachments, users, versions | `amdwiki.directories.data` |
| `./logs` | `/app/logs` | Application logs | `amdwiki.logging.dir` |
| `./sessions` | `/app/sessions` | Session data | Session file store path |
| `./config` | `/app/config` | Configuration overrides | ConfigurationManager paths |

### Creating Host Directories

**Auto-Creation Behavior:**

- Docker Compose will automatically create missing directories
- However, auto-created directories may have permission issues (especially on Linux)
- **Best practice:** Pre-create directories and configure UID/GID before first run

**Recommended setup:**

```bash
# Create all required directories
mkdir -p pages data logs sessions

# Configure UID/GID to match your user (recommended)
# See "User Permissions (UID/GID)" section below
```

**What gets stored where:**

```bash
pages/          # Wiki page markdown files (user content)
data/           # Attachments, users, versions (application data)
logs/           # Application logs (debugging and monitoring)
sessions/       # Session files (user sessions)
```

### User Permissions (UID/GID)

Why this matters:

- Files created by the container need to match your host user permissions
- Without proper UID/GID configuration, you may get "permission denied" errors
- Or files may be owned by root, making them hard to edit on the host

Solution: Configure UID/GID in .env file

Docker Compose is configured to run as `UID:GID` specified in your `.env` file (default: 1000:1000).

#### Option 1: Auto-configure with your current user (Recommended)

```bash
# Copy example and add your current user's UID/GID
cp .env.example .env
echo "UID=$(id -u)" >> .env
echo "GID=$(id -g)" >> .env

# Start with your user permissions
docker-compose up -d
```

#### Option 2: Manually set UID/GID

```bash
# Find your UID and GID
id -u  # Shows your UID (e.g., 1000 or 501)
id -g  # Shows your GID (e.g., 1000 or 20)

# Edit .env file and set:
# UID=1000
# GID=1000
```

#### Option 3: Set at runtime

```bash
# Override without editing .env
UID=$(id -u) GID=$(id -g) docker-compose up -d
```

#### Common UID/GID values

| Platform | First User | Notes |
|----------|-----------|-------|
| Linux | 1000:1000 | Standard first user |
| macOS | 501:20 | Standard first user |
| Docker default | 1000:1000 | Built-in 'node' user |

#### Troubleshooting Permissions

If you see permission errors:

```bash
# Check current ownership
ls -la pages/ data/ logs/

# Fix ownership to match your .env UID/GID
sudo chown -R $(id -u):$(id -g) pages data logs sessions

# Restart container
docker-compose restart
```

### Using Named Volumes

For better portability, use Docker named volumes:

```yaml
volumes:
  amdwiki-pages:
  amdwiki-data:
  amdwiki-logs:
  amdwiki-sessions:

services:
  amdwiki:
    volumes:
      - amdwiki-pages:/app/pages
      - amdwiki-data:/app/data
      - amdwiki-logs:/app/logs
      - amdwiki-sessions:/app/sessions
```

### Backing Up Volumes

```bash
# Backup pages
docker run --rm \
  -v amdwiki_pages:/data \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/pages-backup.tar.gz -C /data .

# Restore pages
docker run --rm \
  -v amdwiki_pages:/data \
  -v $(pwd)/backup:/backup \
  alpine tar xzf /backup/pages-backup.tar.gz -C /data
```

## Environment Variables

### NODE_ENV

Controls which environment configuration is loaded:

```bash
docker run -e NODE_ENV=production amdwiki
```

Options: `production`, `development`, `test`

### Custom Environment Variables

You can pass environment variables to override configuration:

```bash
docker run \
  -e NODE_ENV=production \
  -e PORT=8080 \
  amdwiki
```

Note: ConfigurationManager properties take precedence over environment variables unless explicitly coded to check environment variables first.

## Security Considerations

### Production Checklist

- [ ] Change `amdwiki.session.secret` to a secure random string
- [ ] Set `amdwiki.session.secure` to `true` (requires HTTPS)
- [ ] Set `amdwiki.server.host` to `0.0.0.0` for Docker
- [ ] Set `amdwiki.baseURL` to your actual domain
- [ ] Keep `amdwiki.translator-reader.allow-html` as `false`
- [ ] Enable HTTPS with reverse proxy (nginx, traefik, etc.)
- [ ] Use strong passwords for user accounts
- [ ] Regularly backup volumes
- [ ] Keep Docker image updated

### Using with Reverse Proxy

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name wiki.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name wiki.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Update `config/app-production-config.json`:

```json
{
  "amdwiki.baseURL": "https://wiki.example.com",
  "amdwiki.session.secure": true
}
```

## Troubleshooting

### Container Won't Start

Check logs:

```bash
docker-compose logs -f
docker logs amdwiki
```

Common issues:

- Port already in use: Change port mapping in `docker-compose.yml`
- Permission errors: Ensure host directories are writable
- Configuration errors: Validate JSON syntax in config files

### Can't Access Wiki

Step 1. Check container is running:

```bash
docker-compose ps
```

Step 2. Check port mapping:

```bash
docker port amdwiki
```

Step 3. Test from within container:

```bash
docker-compose exec amdwiki wget -O- http://localhost:3000
```

Step 4. Check firewall rules on host

### Configuration Not Loading

Step A Check NODE_ENV:

```bash
docker-compose exec amdwiki printenv NODE_ENV
```

Step B Verify config file exists:

```bash
docker-compose exec amdwiki ls -la config/
```

Step C Check config file syntax:

```bash
docker-compose exec amdwiki cat config/app-production-config.json | node -e "console.log(JSON.parse(require('fs').readFileSync(0)))"
```

### Volume Permissions

If you encounter permission errors:

```bash
# Check current user ID
id -u
id -g

# Fix ownership (if needed)
sudo chown -R 1000:1000 pages data logs sessions

# Or run container with specific user
docker run --user 1000:1000 amdwiki
```

### Health Check Failing

Check health status:

```bash
docker inspect --format='{{json .State.Health}}' amdwiki | jq
```

Test manually:

```bash
docker-compose exec amdwiki wget -O- http://localhost:3000/
```

## Advanced Topics

### Building Multi-Architecture Images

```bash
# Enable buildx
docker buildx create --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t mycompany/amdwiki:latest \
  --push .
```

### Using Docker Secrets

For sensitive configuration:

```yaml
services:
  amdwiki:
    secrets:
      - session_secret

secrets:
  session_secret:
    file: ./secrets/session_secret.txt
```

### Resource Limits

Limit CPU and memory:

```yaml
services:
  amdwiki:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Monitoring

Add monitoring with Prometheus:

```yaml
services:
  amdwiki:
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=3000"
```

## References

- [ConfigurationManager Documentation](docs/managers/ConfigurationManager-Documentation.md)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
