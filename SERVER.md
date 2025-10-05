# amdWiki Server Management

## Quick Start

### Using the Helper Script (Recommended)

```bash
# Start the server
./server.sh start

# Stop the server
./server.sh stop

# Restart the server
./server.sh restart

# Check server status
./server.sh status

# View logs (default: 50 lines)
./server.sh logs

# View more logs
./server.sh logs 100

# Remove PID lock (if server crashed)
./server.sh unlock
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
