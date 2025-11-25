#!/bin/bash
# Restore files after install test

if [ -z "$1" ]; then
  echo "Usage: $0 <backup-directory>"
  echo ""
  echo "Available backups:"
  ls -d .install-test-backup-* 2>/dev/null || echo "  No backups found"
  exit 1
fi

BACKUP_DIR="$1"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ Backup directory not found: $BACKUP_DIR"
  exit 1
fi

echo "🔄 Restoring from $BACKUP_DIR..."

# Restore config
if [ -f "$BACKUP_DIR/app-custom-config.json" ]; then
  cp "$BACKUP_DIR/app-custom-config.json" "config/"
  echo "  ✓ Restored app-custom-config.json"
fi

# Restore users
if [ -f "$BACKUP_DIR/users.json" ]; then
  cp "$BACKUP_DIR/users.json" "users/"
  echo "  ✓ Restored users.json"
fi

# Restore organizations
if [ -f "$BACKUP_DIR/organizations.json" ]; then
  cp "$BACKUP_DIR/organizations.json" "users/"
  echo "  ✓ Restored organizations.json"
fi

# Restore pages
if [ -d "$BACKUP_DIR/pages" ]; then
  rm -rf "pages"
  mv "$BACKUP_DIR/pages" "pages"
  echo "  ✓ Restored pages directory"
fi

echo ""
echo "✅ Files restored successfully"
echo ""
echo "🗑️  Remove backup directory?"
echo "   rm -rf $BACKUP_DIR"
echo ""
