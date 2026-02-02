#!/bin/bash
# amdWiki Server Management Script
#
# Environment Configuration:
# - Default: Production (config/app-production-config.json)
# - Set NODE_ENV to change: development, test, staging, production
#
# Examples:
#   ./server.sh start              # Uses production config
#   ./server.sh start dev          # Uses development config
#   NODE_ENV=staging ./server.sh start  # Uses staging config

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.amdwiki.pid"

# Generate unique PM2 app name from directory name
DIR_NAME=$(basename "$SCRIPT_DIR")
APP_NAME="amdWiki-$DIR_NAME"

# Function to ensure PM2 daemon is healthy (only one running)
ensure_single_pm2_daemon() {
  local daemon_count=$(pgrep -f "PM2.*God Daemon" | wc -l | tr -d ' ')
  if [ "$daemon_count" -gt 1 ]; then
    echo "⚠️  Multiple PM2 daemons detected ($daemon_count). Killing all..."
    pkill -9 -f "PM2.*God Daemon" 2>/dev/null || true
    sleep 1
    echo "   Restarting PM2 daemon..."
  fi
}

# Function to kill all amdWiki processes (nuclear option)
kill_all_amdwiki() {
  # 1. Stop via PM2 by name (graceful attempt)
  npx --no pm2 stop "$APP_NAME" 2>/dev/null || true
  npx --no pm2 delete "$APP_NAME" 2>/dev/null || true

  # 2. Fallback: stop/delete ALL PM2 apps (handles name mismatch)
  #    This is safe because server.sh manages a single-app PM2 instance
  npx --no pm2 stop all 2>/dev/null || true
  npx --no pm2 delete all 2>/dev/null || true

  # 3. Now kill any node processes running app.js from this directory
  #    (PM2 can no longer respawn since all apps are deleted)
  local app_pids=$(pgrep -f "node.*$SCRIPT_DIR/app\.js" 2>/dev/null || true)
  if [ -n "$app_pids" ]; then
    echo "   Killing app.js processes: $app_pids"
    echo "$app_pids" | xargs kill -9 2>/dev/null || true
  fi

  # 4. Kill any process on port 3000 that's ours
  if command -v lsof &> /dev/null; then
    local port_pid=$(lsof -Pi :3000 -sTCP:LISTEN -t 2>/dev/null)
    if [ -n "$port_pid" ]; then
      local proc_cmd=$(ps -p "$port_pid" -o args= 2>/dev/null || true)
      if echo "$proc_cmd" | grep -q "$SCRIPT_DIR"; then
        echo "   Killing port 3000 holder: $port_pid"
        kill -9 "$port_pid" 2>/dev/null || true
      fi
    fi
  fi

  # 5. Remove all PID files
  rm -f "$PID_FILE" "$SCRIPT_DIR"/.amdwiki-*.pid "$SCRIPT_DIR"/server.pid
}

# Determine environment from second argument or NODE_ENV
ENV_ARG="${2:-}"
if [ -n "$ENV_ARG" ]; then
  case "$ENV_ARG" in
    dev|development)
      NPM_SCRIPT="start:dev"
      ENV_NAME="development"
      ;;
    prod|production)
      NPM_SCRIPT="start:prod"
      ENV_NAME="production"
      ;;
    test)
      NPM_SCRIPT="test"
      ENV_NAME="test"
      ;;
    *)
      NPM_SCRIPT="start"
      ENV_NAME="${NODE_ENV:-production}"
      ;;
  esac
else
  NPM_SCRIPT="start"
  ENV_NAME="${NODE_ENV:-production}"
fi

case "${1:-}" in
  start)
    # STEP 1: Ensure only one PM2 daemon is running
    ensure_single_pm2_daemon

    # STEP 2: Check if server is already running via PID file
    if [ -f "$PID_FILE" ]; then
      EXISTING_PID=$(cat "$PID_FILE")
      if ps -p "$EXISTING_PID" > /dev/null 2>&1; then
        echo "❌ ERROR: Server already running (PID $EXISTING_PID)"
        echo ""
        echo "Options:"
        echo "  1. Wait for startup to complete"
        echo "  2. Stop with: ./server.sh stop"
        echo "  3. Force unlock: ./server.sh unlock"
        exit 1
      else
        echo "🧹 Removing stale PID file (process $EXISTING_PID not found)..."
        rm -f "$PID_FILE"
      fi
    fi

    # STEP 3: Check if port 3000 is already in use
    if command -v lsof &> /dev/null; then
      PORT_PID=$(lsof -Pi :3000 -sTCP:LISTEN -t 2>/dev/null)
      if [ -n "$PORT_PID" ]; then
        # Check if it's OUR process (from this directory)
        PORT_CMD=$(ps -p "$PORT_PID" -o args= 2>/dev/null || true)
        if echo "$PORT_CMD" | grep -q "$SCRIPT_DIR"; then
          echo "⚠️  Found orphaned amdWiki on port 3000 (PID $PORT_PID), killing..."
          kill -9 "$PORT_PID" 2>/dev/null || true
          sleep 1
        else
          echo "❌ ERROR: Port 3000 in use by another process (PID $PORT_PID)"
          echo ""
          echo "This process is preventing amdWiki from starting:"
          lsof -i :3000 2>/dev/null | grep LISTEN || true
          echo ""
          echo "Options:"
          echo "  1. Kill that process: kill -9 $PORT_PID"
          echo "  2. Use a different port (not yet supported)"
          exit 1
        fi
      fi
    fi

    # STEP 4: Clean up any orphaned Node processes running app.js FROM THIS DIRECTORY
    echo "🧹 Cleaning up any orphaned Node processes..."
    pgrep -f "node.*$SCRIPT_DIR/app\.js" 2>/dev/null | xargs kill -9 2>/dev/null || true
    sleep 1

    # STEP 5: Clean up any PM2-created PID files (.amdwiki-*.pid) and legacy files
    rm -f "$SCRIPT_DIR"/.amdwiki-*.pid "$SCRIPT_DIR"/server.pid

    # STEP 6: Delete any existing PM2 app entry (prevents duplicates)
    npx --no pm2 delete "$APP_NAME" 2>/dev/null || true

    # STEP 7: Start via PM2
    echo "🚀 Starting amdWiki in $ENV_NAME mode..."
    echo "   Config: config/app-$ENV_NAME-config.json"
    echo "   Logs: ./data/logs/"
    npx --no pm2 start ecosystem.config.js --env $ENV_NAME

    # STEP 8: Wait for server to start and verify it's running
    echo "   Waiting for server to start..."
    MAX_WAIT=30
    WAIT_COUNT=0
    while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
      sleep 1
      WAIT_COUNT=$((WAIT_COUNT + 1))

      # Check if PM2 shows the app as online
      PM2_STATUS=$(npx --no pm2 show "$APP_NAME" 2>/dev/null | grep -E "^\s*status" | awk '{print $NF}' || true)
      if [ "$PM2_STATUS" = "online" ]; then
        break
      fi

      # Check if app crashed
      if [ "$PM2_STATUS" = "errored" ] || [ "$PM2_STATUS" = "stopped" ]; then
        echo "❌ ERROR: Server failed to start (status: $PM2_STATUS)"
        echo "   Check logs: npx pm2 logs $APP_NAME --lines 50"
        rm -f "$PID_FILE"
        exit 1
      fi

      # Show progress every 5 seconds
      if [ $((WAIT_COUNT % 5)) -eq 0 ]; then
        echo "   Still waiting... ($WAIT_COUNT/$MAX_WAIT seconds)"
      fi
    done

    # STEP 9: Verify server started and write PID file
    PM2_PID=$(npx --no pm2 pid "$APP_NAME" 2>/dev/null | grep -oE '[0-9]+' | head -1)
    if [ -n "$PM2_PID" ] && [ "$PM2_PID" != "0" ]; then
      # Verify the process is actually running
      if ps -p "$PM2_PID" > /dev/null 2>&1; then
        echo "$PM2_PID" > "$PID_FILE"
        echo "✅ Server started (PID: $PM2_PID)"
      else
        echo "❌ ERROR: PID $PM2_PID reported but process not found"
        rm -f "$PID_FILE"
        exit 1
      fi
    else
      echo "❌ ERROR: Server failed to start - no PID detected"
      echo "   Check logs: npx pm2 logs $APP_NAME --lines 50"
      rm -f "$PID_FILE"
      exit 1
    fi

    # STEP 10: Clean up PM2-generated PID files (keep only .amdwiki.pid as source of truth)
    rm -f "$SCRIPT_DIR"/.amdwiki-*.pid
    ;;

  stop)
    echo "🛑 Stopping $APP_NAME..."

    # Use the comprehensive kill function
    kill_all_amdwiki
    sleep 1

    # Verify nothing is left on port 3000 (retry up to 3 times for PM2 race condition)
    STOP_ATTEMPTS=0
    while [ $STOP_ATTEMPTS -lt 3 ]; do
      if command -v lsof &> /dev/null; then
        PORT_PID=$(lsof -Pi :3000 -sTCP:LISTEN -t 2>/dev/null)
        if [ -n "$PORT_PID" ]; then
          PORT_CMD=$(ps -p "$PORT_PID" -o args= 2>/dev/null || true)
          if echo "$PORT_CMD" | grep -q "$SCRIPT_DIR"; then
            echo "⚠️  Process still on port 3000 (PID $PORT_PID), retrying stop..."
            kill -9 "$PORT_PID" 2>/dev/null || true
            npx --no pm2 delete all 2>/dev/null || true
            sleep 1
            STOP_ATTEMPTS=$((STOP_ATTEMPTS + 1))
            continue
          fi
        fi
      fi
      break
    done

    # Final check
    if command -v lsof &> /dev/null; then
      PORT_PID=$(lsof -Pi :3000 -sTCP:LISTEN -t 2>/dev/null)
      if [ -n "$PORT_PID" ]; then
        PORT_CMD=$(ps -p "$PORT_PID" -o args= 2>/dev/null || true)
        if echo "$PORT_CMD" | grep -q "$SCRIPT_DIR"; then
          echo "❌ ERROR: Failed to stop server after 3 attempts (PID $PORT_PID)"
          echo "   Try: ./server.sh unlock"
          exit 1
        fi
      fi
    fi

    echo "✅ Server stopped"
    ;;

  restart)
    echo "🔄 Restarting $APP_NAME..."

    # Stop everything
    "$0" stop
    sleep 2

    # Start fresh
    if [ -n "$ENV_ARG" ]; then
      "$0" start "$ENV_ARG"
    else
      "$0" start
    fi
    ;;

  status)
    echo "📊 amdWiki Server Status"
    echo "========================"
    echo ""

    # Check for multiple PM2 daemons (common issue)
    DAEMON_COUNT=$(pgrep -f "PM2.*God Daemon" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$DAEMON_COUNT" -gt 1 ]; then
      echo "⚠️  WARNING: $DAEMON_COUNT PM2 daemons running (should be 1)"
      echo "    Run: ./server.sh unlock"
      echo ""
    elif [ "$DAEMON_COUNT" -eq 0 ]; then
      echo "ℹ️  PM2 daemon not running"
      echo ""
    fi

    # Check PID file
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if ps -p "$PID" > /dev/null 2>&1; then
        echo "✅ PID Lock: Valid (PID $PID is running)"
      else
        echo "⚠️  PID Lock: Stale (PID $PID not running)"
        echo "    Run: ./server.sh unlock"
      fi
    else
      echo "❌ PID Lock: Not found (server likely not running)"
    fi

    echo ""
    echo "PM2 Status:"
    npx --no pm2 list 2>/dev/null | grep -E "(id|$APP_NAME)" || echo "   No PM2 processes found"

    echo ""
    echo "Port 3000:"
    if command -v lsof &> /dev/null; then
      if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -i :3000 | grep LISTEN || echo "   Port in use (process unknown)"
      else
        echo "   Port available"
      fi
    else
      echo "   (lsof not available - install to check port status)"
    fi

    echo ""
    echo "Node Processes (this project):"
    ps aux | grep "$SCRIPT_DIR/app\.js" | grep -v grep || echo "   None found"

    # Check for PID file duplicates
    PID_COUNT=$(ls -1 "$SCRIPT_DIR"/.amdwiki*.pid 2>/dev/null | wc -l | tr -d ' ')
    if [ "$PID_COUNT" -gt 1 ]; then
      echo ""
      echo "⚠️  WARNING: Multiple PID files found:"
      ls -la "$SCRIPT_DIR"/.amdwiki*.pid 2>/dev/null
    fi
    ;;

  logs)
    npx --no pm2 logs "$APP_NAME" --lines ${2:-50}
    ;;

  env)
    echo "Current Environment Configuration:"
    echo "  NODE_ENV: ${NODE_ENV:-production}"
    echo "  Config file: config/app-${NODE_ENV:-production}-config.json"
    echo ""
    echo "Available configs:"
    ls -1 config/app-*-config.json 2>/dev/null | sed 's/^/  /'
    ;;

  unlock)
    echo "🔓 Unlocking server (nuclear cleanup)..."

    # 1. Kill all amdWiki processes
    echo "   Stopping all amdWiki processes..."
    kill_all_amdwiki

    # 2. Delete all PM2 apps and kill daemons
    DAEMON_COUNT=$(pgrep -f "PM2.*God Daemon" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$DAEMON_COUNT" -gt 0 ]; then
      echo "   Killing $DAEMON_COUNT PM2 daemon(s)..."
      npx --no pm2 delete all 2>/dev/null || true
      npx --no pm2 kill 2>/dev/null || true
      pkill -9 -f "PM2.*God Daemon" 2>/dev/null || true
    fi

    # 3. Kill any remaining node processes from this directory
    echo "   Killing any remaining Node processes..."
    pgrep -f "node.*$SCRIPT_DIR" 2>/dev/null | xargs kill -9 2>/dev/null || true

    # 4. Clear PM2 logs
    echo "   Clearing PM2 logs..."
    npx --no pm2 flush 2>/dev/null || true

    sleep 1
    echo "✅ Server unlocked. Run: ./server.sh start"
    ;;

  *)
    echo "amdWiki Server Management"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|logs|env|unlock} [environment]"
    echo ""
    echo "Commands:"
    echo "  start [env]  - Start server (validates: no existing process, port available)"
    echo "                 env: dev, prod (default: production)"
    echo "  stop         - Stop server gracefully (with force-kill fallback)"
    echo "  restart [env]- Restart server (full stop → start cycle)"
    echo "  status       - Show comprehensive server status"
    echo "                 • PID lock validity"
    echo "                 • PM2 process list"
    echo "                 • Port 3000 availability"
    echo "                 • Node processes"
    echo "  logs [n]     - Show server logs (n = line count, default: 50)"
    echo "  env          - Show current environment and available configs"
    echo "  unlock       - Force unlock server (clears PM2, kills processes, removes locks)"
    echo "                 Use if server crashed or stuck"
    echo ""
    echo "Process Management:"
    echo "  • Single instance guaranteed via .amdwiki.pid lock"
    echo "  • Automatic cleanup of orphaned Node processes on start"
    echo "  • Port conflict detection before startup"
    echo "  • Graceful stop with force-kill fallback"
    echo ""
    echo "Environment Examples:"
    echo "  ./server.sh start          # Production (default)"
    echo "  ./server.sh start dev      # Development"
    echo "  ./server.sh restart prod   # Restart production"
    echo "  NODE_ENV=staging ./server.sh start  # Custom environment"
    echo ""
    echo "Troubleshooting:"
    echo "  Server won't start:"
    echo "    1. Check status: ./server.sh status"
    echo "    2. Force unlock: ./server.sh unlock"
    echo "    3. Then start:   ./server.sh start"
    echo ""
    echo "  Multiple processes running:"
    echo "    ./server.sh unlock  # Clears all locks and processes"
    echo ""
    echo "Config Files (loaded based on NODE_ENV):"
    echo "  config/app-development-config.json  - Development settings"
    echo "  config/app-production-config.json   - Production settings"
    echo "  config/app-staging-config.json      - Staging settings (if exists)"
    echo "  config/app-test-config.json         - Test settings (if exists)"
    echo "  config/app-custom-config.json       - Custom overrides (not tracked)"
    exit 1
    ;;
esac
