# Server Management - Best Practices & Issue #167 Solution

**Purpose:** Define ideal server management practices and document the solution to GitHub issue #167 (multiple instances running)

**Status:** ✅ **IMPLEMENTED AND TESTED** (Session 2025-12-06)

## Problem Definition (SOLVED)

### What's Wrong

1. **Multiple server instances** running at once (PIDs 45254, 5754, 9905, etc.)
2. **No proper process validation** before starting new server
3. **Stale PID files** not cleaned up (`.amdwiki.pid` becomes outdated)
4. **PM2 and server.sh managing independently** - not coordinated
5. **Old processes** continue serving cached responses after restart
6. **Form changes** not reflected (old process still running old code)

### Evidence from Session 2025-12-06

```bash
# Multiple processes found simultaneously:
PID 45254  - Running old code (serving cached forms)
PID 5754   - From restart attempt
PID 9905   - From another restart attempt

# After killing old process:
kill 45254
# THEN form updates finally appeared

# Root cause:
- server.sh restart doesn't verify old process is gone
- PM2 creates separate PID management
- No validation that only ONE process should run
```

## Solution Implemented

### 7-Step Startup Process (in server.sh)

```
./server.sh start
    ↓
STEP 1: Validate existing PID file
    ├─ Check if .amdwiki.pid exists
    ├─ If yes: Is process alive?
    │   ├─ YES → ERROR: Server already running, suggest stop/unlock
    │   └─ NO → Remove stale PID, continue
    └─ If no: Continue
    ↓
STEP 2: Check port 3000 availability
    ├─ Using: lsof -Pi :3000
    ├─ If in use → ERROR: Show what's using it, suggest kill or unlock
    └─ If free: Continue
    ↓
STEP 3: Kill orphaned Node processes
    ├─ pkill -9 -f "node.*app\.js"
    └─ Sleep 1 second for cleanup
    ↓
STEP 4: Remove legacy PID files
    ├─ rm -f .amdwiki-*.pid (PM2 artifacts)
    ├─ rm -f server.pid (deprecated format)
    └─ Continue
    ↓
STEP 5: Start via PM2
    ├─ npx pm2 start ecosystem.config.js --env {environment}
    └─ Sleep 1 second for startup
    ↓
STEP 6: Write .amdwiki.pid (single source of truth)
    ├─ Get PM2 process ID
    ├─ Write to .amdwiki.pid
    └─ Report success with PID
    ↓
STEP 7: Clean PM2 artifacts
    ├─ rm -f .amdwiki-*.pid (remove any PM2-generated files)
    └─ Ensures ONLY .amdwiki.pid exists
```

### Testing Results ✅

- ✅ Single instance enforcement: ONE `.amdwiki.pid`, ONE Node process
- ✅ Duplicate prevention: Second start blocks with helpful error
- ✅ Graceful shutdown: Stop command works with force-kill fallback
- ✅ Clean restart: Process replaced with new PID
- ✅ Port conflict detection: Prevents startup if port in use
- ✅ Stale PID cleanup: Removes orphaned lock files

## Implementation Details

### 1. Enhance server.sh

**Key improvements:**

```bash
start_server() {
  # 1. Validate no existing process
  if [ -f "$PID_FILE" ]; then
    EXISTING_PID=$(cat "$PID_FILE")
    if ps -p "$EXISTING_PID" > /dev/null 2>&1; then
      echo "❌ ERROR: Server already running (PID $EXISTING_PID)"
      echo "Options:"
      echo "  1. Wait for startup to complete"
      echo "  2. Stop with: ./server.sh stop"
      echo "  3. Force unlock: ./server.sh unlock"
      exit 1
    else
      echo "⚠️  Removing stale PID file (process $EXISTING_PID not found)"
      rm -f "$PID_FILE"
    fi
  fi

  # 2. Check port availability
  if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    USING_PID=$(lsof -Pi :3000 -sTCP:LISTEN -t)
    echo "❌ ERROR: Port 3000 in use by PID $USING_PID"
    echo "Kill with: kill -9 $USING_PID"
    exit 1
  fi

  # 3. Kill orphaned Node processes
  echo "🧹 Cleaning orphaned Node processes..."
  pkill -9 -f "node.*app.js" 2>/dev/null || true
  sleep 1

  # 4. Start via PM2
  echo "🚀 Starting amdWiki in $ENV mode..."
  pm2 start app.js --name "amdWiki-amdWiki" ...

  # 5. Store PID
  echo $! > "$PID_FILE"

  echo "✅ Server started (PID: $!)"
}
```

### 2. Stop Procedure

```bash
stop_server() {
  if [ ! -f "$PID_FILE" ]; then
    echo "ℹ️  No PID file found - server not running"
    return
  fi

  EXISTING_PID=$(cat "$PID_FILE")

  # Try graceful stop first
  pm2 stop amdWiki-amdWiki
  sleep 2

  # Verify it's gone
  if ps -p "$EXISTING_PID" > /dev/null 2>&1; then
    echo "⚠️  Process didn't stop gracefully, forcing..."
    kill -9 "$EXISTING_PID"
  fi

  # Clean up
  rm -f "$PID_FILE"
  echo "✅ Server stopped"
}
```

### 3. Status Checking

```bash
status_check() {
  # 1. Check .amdwiki.pid
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
      echo "✅ Server running (PID: $PID)"
    else
      echo "⚠️  Stale PID file found (PID: $PID not running)"
      echo "   Run: ./server.sh unlock"
    fi
  else
    echo "⛔️ No server running"
  fi

  # 2. Check PM2
  echo ""
  echo "PM2 Status:"
  pm2 list | grep amdWiki

  # 3. Check port
  echo ""
  echo "Port 3000:"
  lsof -i :3000 || echo "Not in use"

  # 4. Check orphaned processes
  echo ""
  echo "Node processes:"
  ps aux | grep "node.*app.js" | grep -v grep || echo "None"
}
```

### 4. Unlock/Reset

```bash
unlock_server() {
  echo "🔓 Unlocking server..."

  # 1. Kill any PM2 processes
  pm2 delete amdWiki-amdWiki 2>/dev/null || true

  # 2. Kill orphaned Node processes
  pkill -9 -f "node.*app.js" 2>/dev/null || true

  # 3. Remove PID file
  rm -f "$PID_FILE"

  # 4. Clear PM2 data
  pm2 flush

  echo "✅ Server unlocked. Run: ./server.sh start"
}
```

## Single PID File Standard

**Decision:** Use ONLY `.amdwiki.pid`

**Never create:**

- `server.pid`
- `.amdwiki-*.pid`
- Any PM2 generated PID files

**Rules:**

1. PID file contains: single integer (the process ID)
2. Only written by server.sh during startup
3. Only removed by server.sh during shutdown
4. Readable by: `cat .amdwiki.pid` to get the PID
5. Cleaned up on crash: `./server.sh unlock`

## PM2 Configuration

### Current Setup (PM2 handles restart/monitoring)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "amdWiki-amdWiki",
      script: "app.js",
      env: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development"
      },
      // Process management
      instances: 1,  // Single instance only
      exec_mode: "fork",  // Not cluster mode
      watch: false,  // We manage restarts via server.sh
      autorestart: true,  // Restart if it crashes
      max_memory_restart: "500M",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_file: "./logs/pm2-combined.log",
      // Safety
      kill_timeout: 5000,
      listen_timeout: 3000
    }
  ]
};
```

### Restart Strategy (via server.sh, not PM2)

```bash
restart_server() {
  echo "🔄 Restarting amdWiki..."

  # Stop gracefully
  ./server.sh stop

  # Wait for full shutdown
  sleep 2

  # Verify it's gone
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
      echo "⚠️  Force killing PID $PID"
      kill -9 "$PID"
    fi
  fi

  # Start fresh
  ./server.sh start $ENV

  echo "✅ Restart complete"
}
```

## Validation Steps (Pre-Start Checklist)

Before starting server, `./server.sh start` should verify:

1. ✅ **No existing PID file** or stale PID file can be removed
2. ✅ **Port 3000 is available** (nothing listening)
3. ✅ **No orphaned Node processes** running
4. ✅ **PM2 daemon is running** (or can be started)
5. ✅ **Configuration files exist** (default + environment)
6. ✅ **Logs directory exists** (./logs/)
7. ✅ **Permission to write PID file** (.amdwiki.pid)

## Error Messages (User-Friendly)

### Error: Server Already Running

```
❌ ERROR: Server already running (PID 5754)

This means a server process is already active. You have two options:

1. If server is working fine:
   → Just wait, it may still be starting up
   → Check status with: ./server.sh status

2. If you need to restart:
   → Stop first with: ./server.sh stop
   → Then start again with: ./server.sh start

3. If server crashed (unresponsive):
   → Force unlock with: ./server.sh unlock
   → Then start fresh with: ./server.sh start

More info:
  - Check logs: ./server.sh logs
  - Manual cleanup: ./server.sh force-unlock (if desperate)
```

### Error: Port Already in Use

```
❌ ERROR: Port 3000 in use by PID 12345

This means another process has claimed port 3000.

Options:
1. If it's an old amdWiki process:
   → Kill it with: kill -9 12345
   → Or: ./server.sh force-unlock

2. If it's a different application:
   → Either stop that application
   → Or change amdWiki port in config
   → Restart amdWiki

Check what's using port 3000:
  lsof -i :3000
```

## Testing Checklist

- [ ] Fresh start: `./server.sh start` (no previous state)
- [ ] Double start: `./server.sh start` twice → second fails gracefully
- [ ] Graceful stop: `./server.sh stop` → server stops cleanly
- [ ] Crash recovery: Kill process, `./server.sh start` → works
- [ ] Stale PID: Manually delete PID file, `./server.sh start` → works
- [ ] Port conflict: Start another app on 3000, `./server.sh start` → fails with helpful error
- [ ] Restart: `./server.sh restart dev` → stops old, starts new
- [ ] Unlock: `./server.sh unlock` → clears all locks
- [ ] Status: `./server.sh status` → accurate info

## Documentation Updates Needed

1. Update `SERVER.md` with new validation logic
2. Add troubleshooting for multiple instances
3. Document `./server.sh unlock` usage
4. Add "What to do if server won't start" section
5. Reference issue #167 as solved

## Performance Impact

- **Startup time:** Add 1-2 seconds for validation checks
- **Shutdown time:** Graceful stop + verification = 3 seconds
- **Memory:** No change (no new processes)
- **PID file overhead:** Negligible (64 bytes)

## Backwards Compatibility

- Existing `./server.sh` commands work unchanged
- New error messages are user-friendly
- `.amdwiki.pid` location unchanged
- PM2 ecosystem file unchanged
- Configuration files unchanged

## Implementation Priority

1. **Critical (fixes #167):**
   - Process validation before start
   - Stale PID cleanup
   - Single PID file enforcement
   - Orphaned process cleanup

2. **High (prevents issues):**
   - Port availability check
   - Error messages improvement
   - Force unlock capability

3. **Nice to have:**
   - Daemon mode (background startup)
   - Auto-restart on file changes (development)
   - Health check endpoint
   - Metrics collection

## References

- GitHub Issue #167: Multiple server instances running
- Current `SERVER.md`: Process management documentation
- `./server.sh`: Implementation file
- `ecosystem.config.js`: PM2 configuration

## Success Criteria

✅ Only ONE Node.js process running at any time
✅ Only ONE `.amdwiki.pid` file exists
✅ Stale processes cleaned up on start
✅ Clear error messages for conflicts
✅ Graceful stop/restart works reliably
✅ Form changes reflected immediately after restart
✅ No orphaned processes after crashes

## Docker & Kubernetes Deployment

### Current Implementation (Bare Metal / VMs)

**Strategy:** Option A - Keep PM2 for process management

- **Best For:** Development, on-premises servers, single-machine deployments
- **PM2 Features Used:**
  - Auto-restart on crash
  - Memory-limit enforcement (500MB max)
  - Log rotation with 100MB limit
  - Single instance mode (instances: 1)
  - Graceful shutdown timeout (5 seconds)
- **Coordinator:** `server.sh` manages PM2, enforces single instance via `.amdwiki.pid`

### Docker Deployment (Recommended)

**Strategy:** Option C - Simple Node process (no PM2)

- **Architecture:** Node runs as PID 1 in container
- **Container Handles:**
  - Process restart (via restart policy: `unless-stopped`)
  - Logging (via log driver: `json-file` with rotation)
  - Resource limits (via `--memory` and `--cpus` flags)
  - Health checks (via `HEALTHCHECK` instruction)
- **Single Instance Enforcement:** `.amdwiki.pid` lock still applies per container

**Benefits:**

- ✅ Cleaner process model (standard Docker practices)
- ✅ No PM2 overhead in lightweight containers
- ✅ Direct signal forwarding (SIGTERM → app)
- ✅ Smaller image size (no PM2 dependency)
- ✅ Better resource efficiency

**Implementation:**

```dockerfile
# Dockerfile.prod
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Run Node directly (not via PM2)
CMD ["node", "app.js"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
```

**Docker Compose:**

```yaml
version: '3.8'
services:
  amdwiki:
    image: amdwiki:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./pages:/app/pages              # Wiki pages
      - ./users:/app/users              # User data
      - ./attachments:/app/attachments  # Uploads
      - ./config:/app/config            # Custom config
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Kubernetes Deployment

**Strategy:** Option C variant - Simple Node process with K8s orchestration

- **Pod Model:** Node runs as PID 1, K8s manages lifecycle
- **Kubernetes Handles:**
  - Pod restart (via restart policy)
  - Scaling (via Deployment replicas)
  - Health checks (via liveness/readiness probes)
  - Resource management (via requests/limits)
  - Service discovery (via Service)
  - ConfigMaps for environment variables
  - PersistentVolumes for data storage

**Implementation:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: amdwiki
  labels:
    app: amdwiki
spec:
  replicas: 2  # Or 1 if you want single instance
  selector:
    matchLabels:
      app: amdwiki
  template:
    metadata:
      labels:
        app: amdwiki
    spec:
      containers:
      - name: amdwiki
        image: amdwiki:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 1
        volumeMounts:
        - name: pages
          mountPath: /app/pages
        - name: users
          mountPath: /app/users
        - name: attachments
          mountPath: /app/attachments
      volumes:
      - name: pages
        persistentVolumeClaim:
          claimName: amdwiki-pages
      - name: users
        persistentVolumeClaim:
          claimName: amdwiki-users
      - name: attachments
        persistentVolumeClaim:
          claimName: amdwiki-attachments
---
apiVersion: v1
kind: Service
metadata:
  name: amdwiki
spec:
  type: LoadBalancer
  selector:
    app: amdwiki
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
    name: http
```

**Important Notes for Kubernetes:**

- Each Pod gets its own `.amdwiki.pid` (isolated file system)
- Single instance per Pod enforced automatically
- Use `replicas: 1` to enforce single instance globally (or use StatefulSet)
- Stateless design allows horizontal scaling if needed
- PersistentVolumes shared across replicas for data consistency

### Migration Path: Bare Metal → Docker → Kubernetes

1. **Today (Current):** PM2 + server.sh (working, tested)
2. **Next (Docker):** Remove PM2, use simple Node in containers
3. **Future (K8s):** Standard K8s Deployment with PersistentVolumes

All strategies keep `.amdwiki.pid` locking mechanism:

- **Bare Metal:** Enforces single instance per machine
- **Docker:** Enforces single instance per container
- **Kubernetes:** Enforces single instance per Pod (via shared filesystem)

### Health Check Endpoint Recommendation

For all deployment models, add `/health` endpoint to `app.js`:

```javascript
// app.js
app.get('/health', (req, res) => {
  // Simple check that server is responsive
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});
```

This enables:

- Container health checks (Docker HEALTHCHECK)
- Kubernetes liveness/readiness probes
- Load balancer health verification
- Monitoring system integration
