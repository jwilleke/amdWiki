#!/bin/bash
# Test script for installation system
# Simulates first-run by temporarily moving existing files

echo "🧪 Testing Installation System"
echo "=============================="
echo ""

# Backup existing files
BACKUP_DIR=".install-test-backup-$(date +%s)"
mkdir -p "$BACKUP_DIR"

echo "📦 Backing up existing files to $BACKUP_DIR..."

# Backup config
if [ -f "config/app-custom-config.json" ]; then
  cp "config/app-custom-config.json" "$BACKUP_DIR/"
  rm "config/app-custom-config.json"
  echo "  ✓ Backed up and removed app-custom-config.json"
fi

# Backup users
if [ -f "users/users.json" ]; then
  cp "users/users.json" "$BACKUP_DIR/"
  rm "users/users.json"
  echo "  ✓ Backed up and removed users.json"
fi

# Backup organizations
if [ -f "users/organizations.json" ]; then
  cp "users/organizations.json" "$BACKUP_DIR/"
  rm "users/organizations.json"
  echo "  ✓ Backed up and removed organizations.json"
fi

# Backup pages directory
if [ -d "pages" ]; then
  mv "pages" "$BACKUP_DIR/pages"
  mkdir "pages"
  echo "  ✓ Backed up and cleared pages directory"
fi

echo ""
echo "✅ First-run environment simulated"
echo ""
echo "🚀 Start the server with: ./server.sh start dev"
echo "🌐 Navigate to: http://localhost:3000"
echo "📝 You should be redirected to: http://localhost:3000/install"
echo ""
echo "⚠️  To restore your files after testing:"
echo "   ./scripts/restore-install-test.sh $BACKUP_DIR"
echo ""
