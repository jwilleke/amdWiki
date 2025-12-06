# Server Management - Best Practices & Issue #167 Solution

**Purpose:** Define ideal server management practices and document the solution to GitHub issue #167 (multiple instances running)

**Issue:** Multiple Node.js server processes running simultaneously despite PID lock mechanism

## Current State (Problem)

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

## Ideal Solution

### Architecture

```
User runs: ./server.sh start
    ↓
Check 1: Does .amdwiki.pid exist?
    ├─ YES → Is process in PID file alive?
    │   ├─ YES → Error: "Server already running (PID XXXX)"
    │   │         Suggestion: ./server.sh stop or ./server.sh unlock
    │   └─ NO → Remove stale .amdwiki.pid, continue
    └─ NO → Continue
    ↓
Check 2: Is port 3000 in use?
    ├─ YES → Error: "Port 3000 in use by PID XXXX"
    │         Kill with: kill -9 XXXX
    └─ NO → Continue
    ↓
Check 3: Check for orphaned node processes
    └─ Kill any stale: pkill -f "node.*app.js"
    ↓
Start server via PM2
    ↓
Write PID to .amdwiki.pid
    ↓
Return control with clear status message
```

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
