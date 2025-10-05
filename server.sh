#!/bin/bash
# amdWiki Server Management Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.amdwiki.pid"

case "${1:-}" in
  start)
    echo "🚀 Starting amdWiki..."
    pm2 start npm --name "amdWiki" -- start
    ;;

  stop)
    echo "🛑 Stopping amdWiki..."
    pm2 stop amdWiki
    ;;

  restart)
    echo "🔄 Restarting amdWiki..."
    pm2 restart amdWiki
    ;;

  status)
    pm2 list | grep amdWiki
    ;;

  logs)
    pm2 logs amdWiki --lines ${2:-50}
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
    echo "Usage: $0 {start|stop|restart|status|logs|unlock}"
    echo ""
    echo "Commands:"
    echo "  start    - Start the server with PM2"
    echo "  stop     - Stop the server"
    echo "  restart  - Restart the server"
    echo "  status   - Show server status"
    echo "  logs     - Show server logs (add number for line count, e.g., 'logs 100')"
    echo "  unlock   - Remove PID lock file (use if server crashed)"
    exit 1
    ;;
esac
