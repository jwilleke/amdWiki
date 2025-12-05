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
    # Check if server is already running
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if ps -p "$PID" > /dev/null 2>&1; then
        echo "⚠️  Server already running with PID $PID"
        echo "   Use './server.sh stop' to stop it first, or './server.sh unlock' to force"
        exit 1
      else
        echo "🧹 Cleaning up stale PID file..."
        rm -f "$PID_FILE"
      fi
    fi
    
    # Clean up any PM2-created PID files (.amdwiki-*.pid)
    rm -f "$SCRIPT_DIR"/.amdwiki-*.pid
    
    echo "🚀 Starting amdWiki in $ENV_NAME mode..."
    echo "   Config: config/app-$ENV_NAME-config.json"
    echo "   Logs: ./logs/"
    npx --no -- npx --no -- pm2 start ecosystem.config.js --env $ENV_NAME
    
    # Write our own PID file with the PM2 process PID
    sleep 1
    PM2_PID=$(npx pm2 pid "$APP_NAME" 2>/dev/null | grep -oE '[0-9]+' | head -1)
    if [ -n "$PM2_PID" ]; then
      echo "$PM2_PID" > "$PID_FILE"
    fi
    ;;

  stop)
    echo "🛑 Stopping $APP_NAME..."
    npx --no -- pm2 stop "$APP_NAME"
    # Clean up PID files
    rm -f "$PID_FILE" "$SCRIPT_DIR"/.amdwiki-*.pid
    ;;

  restart)
    echo "🔄 Restarting $APP_NAME..."
    if [ -n "$ENV_ARG" ]; then
      echo "   Environment: $ENV_NAME"
      npx --no -- pm2 restart ecosystem.config.js --env $ENV_NAME --update-env
    else
      npx --no -- pm2 restart "$APP_NAME"
    fi
    ;;

  status)
    npx --no -- pm2 list | grep "$APP_NAME"
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      echo ""
      echo "PID lock file exists: $PID"
    fi
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
    if [ -f "$PID_FILE" ]; then
      echo "🔓 Removing PID lock: $PID_FILE"
      rm -f "$PID_FILE"
      echo "✅ PID lock removed. You can now start the server."
    else
      echo "ℹ️  No PID lock file found."
    fi
    ;;

  *)
    echo "amdWiki Server Management"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|logs|env|unlock} [environment]"
    echo ""
    echo "Commands:"
    echo "  start [env]  - Start the server with PM2"
    echo "                 env: dev, prod (default: production)"
    echo "  stop         - Stop the server"
    echo "  restart [env]- Restart the server"
    echo "  status       - Show server status and PID lock"
    echo "  logs [n]     - Show server logs (n = line count, default: 50)"
    echo "  env          - Show current environment and available configs"
    echo "  unlock       - Remove PID lock file (use if server crashed)"
    echo ""
    echo "Environment Examples:"
    echo "  ./server.sh start          # Production (default)"
    echo "  ./server.sh start dev      # Development"
    echo "  ./server.sh start prod     # Production (explicit)"
    echo "  NODE_ENV=staging ./server.sh start  # Custom environment"
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
