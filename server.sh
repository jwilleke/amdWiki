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
    # STEP 1: Check if server is already running via PID file
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

    # STEP 2: Check if port 3000 is already in use
    if command -v lsof &> /dev/null; then
      PORT_PID=$(lsof -Pi :3000 -sTCP:LISTEN -t 2>/dev/null)
      if [ -n "$PORT_PID" ]; then
        echo "❌ ERROR: Port 3000 in use by PID $PORT_PID"
        echo ""
        echo "This process is preventing amdWiki from starting:"
        lsof -i :3000 2>/dev/null | grep LISTEN || true
        echo ""
        echo "Options:"
        echo "  1. Kill that process: kill -9 $PORT_PID"
        echo "  2. Force cleanup: ./server.sh unlock && ./server.sh start"
        exit 1
      fi
    fi

    # STEP 3: Clean up any orphaned Node processes running app.js
    echo "🧹 Cleaning up any orphaned Node processes..."
    pkill -9 -f "node.*app\.js" 2>/dev/null || true
    sleep 1

    # STEP 4: Clean up any PM2-created PID files (.amdwiki-*.pid) and legacy files
    rm -f "$SCRIPT_DIR"/.amdwiki-*.pid "$SCRIPT_DIR"/server.pid

    # STEP 5: Start via PM2
    echo "🚀 Starting amdWiki in $ENV_NAME mode..."
    echo "   Config: config/app-$ENV_NAME-config.json"
    echo "   Logs: ./data/logs/"
    npx --no -- npx --no -- pm2 start ecosystem.config.js --env $ENV_NAME

    # STEP 6: Write our own PID file with the PM2 process PID
    sleep 1
    PM2_PID=$(npx pm2 pid "$APP_NAME" 2>/dev/null | grep -oE '[0-9]+' | head -1)
    if [ -n "$PM2_PID" ]; then
      echo "$PM2_PID" > "$PID_FILE"
      echo "✅ Server started (PID: $PM2_PID)"
    else
      echo "⚠️  Server may have started but PID detection failed"
    fi

    # STEP 7: Clean up PM2-generated PID files (keep only .amdwiki.pid as source of truth)
    sleep 1
    rm -f "$SCRIPT_DIR"/.amdwiki-*.pid
    ;;

  stop)
    echo "🛑 Stopping $APP_NAME..."

    # Try graceful stop first (5 second timeout)
    npx --no -- pm2 stop "$APP_NAME"
    sleep 2

    # Verify it's actually gone
    if [ -f "$PID_FILE" ]; then
      EXISTING_PID=$(cat "$PID_FILE")
      if ps -p "$EXISTING_PID" > /dev/null 2>&1; then
        echo "⚠️  Process didn't stop gracefully (PID $EXISTING_PID), force killing..."
        kill -9 "$EXISTING_PID" 2>/dev/null || true
        sleep 1
      fi
    fi

    # Clean up PID files (including legacy files)
    rm -f "$PID_FILE" "$SCRIPT_DIR"/.amdwiki-*.pid "$SCRIPT_DIR"/server.pid
    echo "✅ Server stopped"
    ;;

  restart)
    echo "🔄 Restarting $APP_NAME..."

    # Stop gracefully first
    ./server.sh stop
    sleep 2

    # Verify process is gone
    if [ -f "$PID_FILE" ]; then
      REMAINING_PID=$(cat "$PID_FILE")
      if ps -p "$REMAINING_PID" > /dev/null 2>&1; then
        echo "⚠️  Process didn't stop gracefully, force killing PID $REMAINING_PID..."
        kill -9 "$REMAINING_PID" 2>/dev/null || true
        sleep 1
      fi
    fi

    # Clean up any remaining orphaned processes
    pkill -9 -f "node.*app\.js" 2>/dev/null || true
    sleep 1

    # Now start fresh
    if [ -n "$ENV_ARG" ]; then
      echo "   Environment: $ENV_NAME"
      ./server.sh start $ENV_ARG
    else
      ./server.sh start
    fi
    ;;

  status)
    echo "📊 amdWiki Server Status"
    echo "========================"
    echo ""

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
    npx --no -- pm2 list 2>/dev/null | grep -A 20 "$APP_NAME" || echo "   No PM2 processes found"

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
    echo "Node Processes:"
    ps aux | grep "node.*app\.js" | grep -v grep || echo "   None found"
    ;;

  logs)
    npx --no -- pm2 logs "$APP_NAME" --lines ${2:-50}
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
    echo "🔓 Unlocking server..."

    # 1. Delete any PM2 processes
    npx --no -- pm2 delete "$APP_NAME" 2>/dev/null || true

    # 2. Kill orphaned Node processes
    echo "   Killing any orphaned Node processes..."
    pkill -9 -f "node.*app\.js" 2>/dev/null || true

    # 3. Remove all PID files (including legacy)
    echo "   Removing PID lock files..."
    rm -f "$PID_FILE" "$SCRIPT_DIR"/.amdwiki-*.pid "$SCRIPT_DIR"/server.pid

    # 4. Clear PM2 data
    echo "   Clearing PM2 logs..."
    npx --no -- pm2 flush 2>/dev/null || true

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
