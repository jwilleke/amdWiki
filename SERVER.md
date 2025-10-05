# amdWiki Server Management

## Quick Start

### Using the Helper Script (Recommended)

```bash
# Start the server (production mode - default)
./server.sh start

# Start in development mode
./server.sh start dev

# Start in production mode (explicit)
./server.sh start prod

# Stop the server
./server.sh stop

# Restart the server
./server.sh restart

# Check server status and environment
./server.sh status

# Show environment and available configs
./server.sh env

# View logs (default: 50 lines)
./server.sh logs

# View more logs
./server.sh logs 100

# Remove PID lock (if server crashed)
./server.sh unlock
```

## Environment Configuration

amdWiki uses different configuration files based on the `NODE_ENV` environment variable:

| Environment | Config File | Use Case |
|-------------|-------------|----------|
| **production** | `config/app-production-config.json` | Production deployment (default) |
| **development** | `config/app-development-config.json` | Local development |
| **test** | `config/app-test-config.json` | Running tests |
| **staging** | `config/app-staging-config.json` | Staging server (if exists) |
| **custom** | `config/app-custom-config.json` | Local overrides (not tracked in git) |

### How Configuration Loading Works

1. **Default Config**: `config/app-default-config.json` is always loaded first (base settings)
2. **Environment Config**: Based on `NODE_ENV`, loads:
   - `config/app-production-config.json` (default)
   - `config/app-development-config.json` (if `NODE_ENV=development`)
   - `config/app-test-config.json` (if `NODE_ENV=test`)
   - etc.
3. **Custom Config**: `config/app-custom-config.json` is loaded last and overrides everything
   - This file is `.gitignore`d for local-only settings
   - Use this for machine-specific overrides (API keys, local ports, etc.)

### Starting with Different Environments

**Method 1: Using `./server.sh` argument (recommended)**
```bash
./server.sh start dev          # Development mode
./server.sh start prod         # Production mode
./server.sh restart dev        # Restart in development mode
```

**Method 2: Using NODE_ENV environment variable**
```bash
NODE_ENV=development ./server.sh start
NODE_ENV=staging ./server.sh start
NODE_ENV=production ./server.sh start
```

**Method 3: Using npm scripts directly**
```bash
npm run start:dev              # Development
npm run start:prod             # Production
npm start                      # Production (default)
```

### Checking Current Environment

```bash
./server.sh env
```

Output:
```
Current Environment Configuration:
  NODE_ENV: production
  Config file: config/app-production-config.json

Available configs:
  config/app-default-config.json
  config/app-development-config.json
  config/app-production-config.json
  config/app-test-config.json
```

## Multiple Instance Prevention

The server uses a PID lock file (`.amdwiki.pid`) to prevent multiple instances from running simultaneously. This ensures:

- ✅ Only one server instance runs at a time
- ✅ Data consistency (no conflicting writes)
- ✅ Predictable behavior (no port conflicts)

### If You Get "Another instance is already running"

1. **Check if server is actually running:**
   ```bash
   ./server.sh status
   # or
   ps aux | grep "node app.js" | grep -v grep
   ```

2. **If server is running but shouldn't be:**
   ```bash
   ./server.sh stop
   ```

3. **If server crashed and lock file is stale:**
   ```bash
   ./server.sh unlock
   ./server.sh start
   ```

## Manual Management

### Using PM2 Directly

```bash
# Start
pm2 start npm --name "amdWiki" -- start

# Stop
pm2 stop amdWiki

# Restart
pm2 restart amdWiki

# View logs
pm2 logs amdWiki

# Delete from PM2
pm2 delete amdWiki
```

### Using npm (Not Recommended for Production)

```bash
# Start (will fail if another instance is running)
npm start

# Stop (Ctrl+C in terminal)
```

## Troubleshooting

### Problem: Server won't start, says another instance is running

**Solution 1:** Check if another instance is actually running
```bash
pm2 list
ps aux | grep "node app.js"
```

**Solution 2:** Stop all instances
```bash
pm2 stop all
pkill -f "node app.js"
```

**Solution 3:** Remove stale PID lock
```bash
./server.sh unlock
```

### Problem: Changes not saving

**Cause:** Multiple server instances were running, saving to different instances.

**Prevention:** Always use `./server.sh` or PM2 to manage the server. The PID lock prevents this issue.

### Problem: Port 3000 already in use

**Cause:** Another application or orphaned Node process is using port 3000.

**Solution:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>
```

## Production Deployment

For production, use PM2 with the ecosystem file:

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Enable PM2 startup on system boot
pm2 startup
```

## Server Logs Location

- **PM2 Logs:** `~/.pm2/logs/`
  - Output: `amdWiki-out.log`
  - Errors: `amdWiki-error.log`

- **Application Logs:** `./logs/` (if configured)

## PID Lock File

- **Location:** `.amdwiki.pid` in the project root
- **Purpose:** Prevents multiple server instances
- **Cleanup:** Automatically removed on clean shutdown
- **Manual Cleanup:** Use `./server.sh unlock` if needed

## Log Locations Summary

  | Type        | Location                         | Purpose                             |
  |-------------|----------------------------------|-------------------------------------|
  | PM2 Output  | ~/.pm2/logs/amdWiki-out.log      | Real-time stdout, startup messages  |
  | PM2 Errors  | ~/.pm2/logs/amdWiki-error.log    | Real-time stderr, plugin errors     |
  | Application | ./logs/app1.log, app2.log, etc.  | Winston logger, detailed operations |
  | Audit       | ./logs/audit.log                 | Security/audit events               |
