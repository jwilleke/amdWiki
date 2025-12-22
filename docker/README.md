# Docker Deployment for amdWiki

This directory contains all Docker-related files for deploying amdWiki in containers.

## Quick Start

```bash
# From project root
./docker/docker-setup.sh

# Start the containers
cd docker
docker-compose up -d

# Access the wiki
open http://localhost:3000
```

## Files in This Directory

- **`Dockerfile`** - Container image definition
- **`docker-compose.yml`** - Container orchestration configuration
- **`.dockerignore`** - Files to exclude from Docker build
- **`.env.example`** - Example environment variables configuration
- **`docker-setup.sh`** - Automated setup script
- **`deploy-remote.sh`** - Remote deployment script
- **`DOCKER.md`** - Comprehensive Docker documentation
- **`DEPLOYMENT.md`** - Production deployment guide

## Documentation

- [**DOCKER.md**](DOCKER.md) - Complete Docker usage guide
- [**DEPLOYMENT.md**](DEPLOYMENT.md) - Production deployment instructions

## Common Commands

All commands should be run from the `docker/` directory:

```bash
cd docker

# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Restart containers
docker-compose restart

# Rebuild and start
docker-compose up -d --build

# Check status
docker-compose ps
```

## Configuration

### Port Configuration

Edit `docker/.env` to change the host port:

```bash
HOST_PORT=3000  # Change to desired port
```

### User Permissions

The container runs as the UID/GID specified in `.env`:

```bash
UID=1000  # Your user ID
GID=1000  # Your group ID
```

Run `./docker-setup.sh` to auto-configure with your current user.

## Directory Structure

```
docker/
├── Dockerfile              # Container definition
├── docker-compose.yml      # Orchestration config
├── .dockerignore          # Build exclusions
├── .env.example           # Environment template
├── docker-setup.sh        # Setup automation
├── deploy-remote.sh       # Remote deployment
├── DOCKER.md              # Usage documentation
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file

../                        # Project root
├── required-pages/        # System pages (IN REPO - required!)
└── data/                  # All instance data (runtime, single volume mount)
    ├── pages/             # Wiki content
    ├── users/             # User accounts
    ├── attachments/       # File attachments
    ├── logs/              # Application logs
    ├── search-index/      # Search index
    ├── backups/           # Backup files
    ├── sessions/          # User sessions
    └── versions/          # Page versions
```

## Environment Variables

Create `.env` from `.env.example`:

```bash
HOST_PORT=3000           # Port on host machine
CONTAINER_PORT=3000      # Port inside container
NODE_ENV=production      # Environment mode
UID=1000                 # User ID for container
GID=1000                 # Group ID for container
```

## Volumes

All instance data is consolidated under a **single volume mount** (`../data:/app/data`):

| Host Path | Container Path | Purpose |
|-----------|---------------|---------|
| `../data` | `/app/data` | All instance data (pages, users, logs, etc.) |
| `../required-pages` | `/app/required-pages` | System templates (read-only) |

The `data/` directory contains:

- `pages/` - Wiki content
- `users/` - User accounts
- `attachments/` - File attachments
- `logs/` - Application logs
- `search-index/` - Search index
- `backups/` - Backup files
- `sessions/` - User sessions
- `versions/` - Page versions

## ConfigurationManager Integration

The Docker setup is fully integrated with amdWiki's ConfigurationManager:

- **NODE_ENV** determines which config file is loaded:
  - `production` → `config/app-production-config.json`
  - `development` → `config/app-development-config.json`
  - `test` → `config/app-test-config.json`

- **Directory paths** in ConfigurationManager (all under `./data/`):
  - `amdwiki.page.provider.filesystem.storagedir` → `./data/pages`
  - `amdwiki.user.provider.storagedir` → `./data/users`
  - `amdwiki.attachment.provider.basic.storagedir` → `./data/attachments`
  - `amdwiki.logging.dir` → `./data/logs`
  - `amdwiki.search.provider.lunr.indexdir` → `./data/search-index`
  - `amdwiki.backup.directory` → `./data/backups`

- **Server configuration**:
  - `amdwiki.server.host` → `0.0.0.0` (for Docker)
  - `amdwiki.server.port` → `3000` (internal)

## Troubleshooting

### Container won't start

```bash
# Check logs
cd docker && docker-compose logs -f

# Check container status
docker-compose ps

# Rebuild from scratch
docker-compose down
docker-compose up -d --build
```

### Permission errors

```bash
# Reconfigure UID/GID
cd ..
./docker/docker-setup.sh

# Or manually set in docker/.env
echo "UID=$(id -u)" >> docker/.env
echo "GID=$(id -g)" >> docker/.env
```

### Port already in use

```bash
# Change port in docker/.env
sed -i 's/HOST_PORT=3000/HOST_PORT=3001/' docker/.env

# Restart
docker-compose down
docker-compose up -d
```

## Remote Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for remote server deployment instructions.

Quick remote deployment:

```bash
cd docker
export REMOTE_USER="username"
export REMOTE_HOST="server-ip"
export REMOTE_PATH="/opt/amdwiki"
./deploy-remote.sh
```

## Support

For more detailed documentation:

- [Docker Guide](DOCKER.md) - Comprehensive Docker documentation
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [ConfigurationManager Docs](../docs/managers/ConfigurationManager-Documentation.md)
- [Main README](../README.md) - Project overview
